// src/pages/Checkout.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation, useParams } from 'react-router-dom'
import { ShoppingCart, Package, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react'
import SmartImage from '../components/SmartImage'

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 text-lg">Loading your order...</div>
        </div>
      </div>
    )
  }

  if (!pending) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 max-w-md">
          <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No pending order</h2>
          <p className="text-gray-400 mb-6">
            Add items to your cart and click{' '}
            <span className="font-semibold text-blue-400">"Place Full Order"</span> first.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            Browse Products
          </button>
        </div>
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
    <div className="min-h-screen bg-panel text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Cart</span>
        </button>

        {/* Success Message */}
        {justPlaced && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white rounded-xl flex items-center gap-3 shadow-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="font-semibold">Order placed — please confirm via WhatsApp.</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Confirm Your Order
          </h1>
          <p className="text-gray-400">Review your items and complete your purchase</p>
        </div>

        {/* Order Info Card */}
        <div className="mb-6 p-6 border border-gray-700 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Order Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order ID</div>
              <div className="font-mono text-sm text-blue-400">{pending.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</div>
              <div className="text-sm">{new Date(pending.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Order Items ({pending.items.length})</h2>
          </div>
          <div className="space-y-3">
            {pending.items.map((it, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 hover:border-gray-600 transition-all group shadow-lg hover:shadow-xl"
              >
                {/* Product Image - Improved sizing */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 h-32 sm:w-28 sm:h-28 bg-gray-900 rounded-lg p-3 flex items-center justify-center">
                    <SmartImage
                      src={it.img}
                      alt={it.name}
                      product={{ ...it, category: it.type || 'Product' }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    x{it.qty}
                  </div>
                </div>
                
                {/* Product Details - Improved layout */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="font-semibold text-base sm:text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {it.name}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-400">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-gray-500">Qty:</span>
                      <span className="font-medium text-white">{it.qty}</span>
                    </div>
                    <div className="hidden sm:block text-gray-600">•</div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium text-white">PKR {it.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Subtotal - Enhanced display */}
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subtotal</div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    PKR {(it.price * it.qty).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Actions */}
        <div className="sticky bottom-0 bg-panel/95 backdrop-blur-lg border-t border-gray-700 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 mt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Total */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Order Total</div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  PKR {pending.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-2">{pending.items.length} item(s)</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:min-w-[300px]">
                <button
                  onClick={confirmOrder}
                  disabled={processing}
                  className={`px-6 py-4 rounded-xl text-base font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${
                    processing
                      ? 'bg-green-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02] active:scale-[0.98]'
                  } text-white`}
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>Confirm & Send via WhatsApp</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to WhatsApp to complete your order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
