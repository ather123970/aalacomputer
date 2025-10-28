// src/pages/Checkout.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation, useParams } from 'react-router-dom'

const DEFAULT_WH_NUMBER = '+923125066195'
import { API_BASE } from '../config'
const API_CART = API_BASE.replace(/\/+$/, '') + '/v1/cart'

const Checkout = () => {
  const [pending, setPending] = useState(null)
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const routeParams = useParams()
  const [loading, setLoading] = useState(true)
  const justPlaced = location && location.state && location.state.justPlaced

  // Fetch pending order either from localStorage or backend MongoDB
  const fetchCartFromBackend = async () => {
    try {
      const res = await fetch(API_CART, { credentials: 'include' })
      if (res.ok) {
        const cartItems = await res.json()
        // backend may return an array of items or an object with { items, total, id }
        let items = []
        if (Array.isArray(cartItems)) items = cartItems
        else if (cartItems && Array.isArray(cartItems.items)) items = cartItems.items

        if (items && items.length > 0) {
          // normalize to pending shape expected by this component
          const pendingObj = Array.isArray(cartItems)
            ? {
                items: items.map(it => ({ id: it.id || it._id || it.sku || it.name, name: it.name || it.Name || '', price: Number(it.price || it.p || 0), qty: Number(it.qty || 1), img: it.img || it.image || '' })),
                total: items.reduce((acc, it) => acc + (Number(it.price || it.p || 0) * (Number(it.qty || 1))), 0),
                id: (typeof cartItems.id === 'string' && cartItems.id) || `DB-${Date.now()}`,
                createdAt: (cartItems && cartItems.createdAt) || new Date().toISOString()
              }
            : cartItems

          setPending(pendingObj)
        } else {
          setPending(null)
        }
      } else {
        setPending(null)
      }
    } catch (e) {
      console.error('Failed to fetch cart from backend:', e)
      setPending(null)
    }
  }

  useEffect(() => {
    // If orderId provided in query, fetch that order; otherwise load cart
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get('orderId')
    if (orderId || routeParams.id) {
      setLoading(true)
      const targetId = orderId || routeParams.id
      ;(async () => {
        try {
          console.debug('[checkout] fetching order by id', targetId)
          const r = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders/${encodeURIComponent(targetId)}`, { credentials: 'include' })
          console.debug('[checkout] orders/:id status', r.status)
          if (r.ok) {
            const j = await r.json()
            console.debug('[checkout] orders/:id body', j)
            if (j && j.ok && j.order) {
              setPending(j.order)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.error('Failed to fetch order by id', e)
        }
        // fallback to cart
        console.debug('[checkout] falling back to cart fetch')
        fetchCartFromBackend().then(() => console.debug('[checkout] cart fallback done')).finally(() => setLoading(false))
      })()
    } else {
      // Always prefer backend cart (DB). Build a pending order from DB cart items.
      fetchCartFromBackend().finally(() => setLoading(false))
    }
    

    // Load WhatsApp number from config API
    ;(async () => {
      try {
        const r = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/config`, { credentials: 'include' })
        if (r.ok) {
          const j = await r.json()
          if (j.whatsapp) window.__WH_NUMBER = j.whatsapp
        }
      } catch (e) {}
    })()
  }, [location.search, routeParams.id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center">
        <div className="text-gray-400">Loading order...</div>
      </div>
    )
  }

  if (!pending) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-semibold text-white mb-2">No pending order</h2>
        <p className="text-gray-400 max-w-md">
          Add items to your cart and click{' '}
          <span className="font-semibold">“Place Full Order”</span> first.
        </p>
      </div>
    )
  }

  const confirmOrder = () => {
    setProcessing(true)

    let msg = `New order from Aala Computers!\nOrder ID: ${pending.id}\nDate: ${new Date(
      pending.createdAt
    ).toLocaleString()}\n\nItems:\n`

    pending.items.forEach(it => {
      msg += `- ${it.name} x${it.qty} @ PKR${it.price} = PKR${(
        it.qty * it.price
      ).toFixed(0)}\n`
    })
    msg += `\nTotal: PKR ${pending.total.toFixed(0)}\n\nPlease confirm availability and next steps.`

    const encoded = encodeURIComponent(msg)
    const wh = window.__WH_NUMBER || DEFAULT_WH_NUMBER
    const waUrl = `https://wa.me/${wh.replace('+', '')}?text=${encoded}`

    ;(async function run() {
      try {
        // Clear backend cart
        try {
          await Promise.all(
            (pending.items || []).map(it =>
              fetch(`${API_CART}/${encodeURIComponent(it.id)}`, {
                method: 'DELETE',
                credentials: 'include'
              }).catch(() => {})
            )
          )
        } catch (e) {
          console.warn('Failed to clear backend cart', e)
        }

        // Persist order to backend orders collection
        const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: pending.items, total: pending.total })
        })
        if (!res.ok) throw new Error('Server rejected order')

      } catch (e) {
        console.error('Failed to persist order to backend', e)
      } finally {
        // Open WhatsApp link and navigate
        window.open(waUrl, '_blank')
        setTimeout(() => {
          setProcessing(false)
          navigate('/profile')
        }, 600)
      }
    })()
  }
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto text-white">
      {justPlaced && (
        <div className="mb-4 p-3 bg-green-500 text-white rounded shadow-md">Order placed — please confirm via WhatsApp.</div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Confirm your Order
      </h1>

      <div className="mb-5 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
        <div className="text-xs sm:text-sm text-gray-400">Order ID: {pending.id}</div>
        <div className="font-semibold text-sm sm:text-base">
          Placed: {new Date(pending.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="space-y-4">
        {pending.items.map((it, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-700 rounded-lg bg-gray-800/40"
          >
            <img
              src={it.img}
              alt={it.name}
              className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="font-semibold text-lg">{it.name}</div>
              <div className="text-gray-400 text-sm">Qty: {it.qty}</div>
            </div>
            <div className="font-semibold text-lg sm:text-right">
              PKR:{(it.price * it.qty).toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <div className="text-gray-400 text-sm">Subtotal</div>
          <div className="text-2xl font-bold">PKR:{pending.total.toFixed(0)}</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition text-sm sm:text-base"
          >
            Back to Cart
          </button>

          <button
            onClick={confirmOrder}
            disabled={processing}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition shadow-sm ${
              processing
                ? 'bg-green-700 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {processing ? 'Processing...' : 'Confirm & Send via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
