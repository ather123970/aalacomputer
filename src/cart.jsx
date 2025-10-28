import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './nav'

import { API_BASE } from './config'
const BASE = API_BASE
const API_CART = `${BASE.replace(/\/+$/, '')}/api/v1/cart`

const idKey = item => (item.id || item._id || item.sku || item.name || '').toString()

export default function Cart() {
  const [data, setData] = useState([])
  const [quantities, setQuantities] = useState({})
  const [total, setTotal] = useState(0)
  const [placing, setPlacing] = useState(false)
  const totalRef = useRef(null)
  const navigate = useNavigate()

  // ✅ Load user cart from backend
  const getCart = async () => {
    try {
      const res = await fetch(API_CART, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch cart')
      const items = await res.json()
      setData(items)
      const q = {}
      items.forEach(it => (q[it.id] = it.qty || 1))
      setQuantities(q)
    } catch (err) {
      console.error('Cart load error:', err)
    }
  }

  useEffect(() => { getCart() }, [])

  // Merge any localStorage cart fallback (used when network unavailable) on mount
  useEffect(() => {
    // listen for programmatic cart updates (from AI fallback or other pages)
    function onCartUpdated(e) {
      try {
        const incoming = (e && e.detail && e.detail.cart) || [];
        if (!Array.isArray(incoming) || !incoming.length) return;
        const merged = [...(data || [])];
        for (const it of incoming) {
          const key = idKey(it);
          const idx = merged.findIndex(m => String(m.id) === String(key));
          if (idx !== -1) merged[idx].qty = Math.max(1, (merged[idx].qty || 1) + (it.qty || 1));
          else merged.push({ id: key, name: it.name || key, price: Number(it.price || 0), img: it.img || '', spec: it.spec || '', qty: Number(it.qty || 1) });
        }
        setData(merged);
        const q = {};
        merged.forEach(it => (q[it.id] = it.qty || 1));
        setQuantities(q);
        saveCart(merged).catch(() => {});
      } catch (err) { console.error('onCartUpdated handler error', err); }
    }
    window.addEventListener('cart:updated', onCartUpdated);
    return () => window.removeEventListener('cart:updated', onCartUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Recalculate total whenever data or quantities change
  useEffect(() => {
    const t = data.reduce(
      (acc, item) => acc + (Number(item.price) * (quantities[item.id] ?? item.qty ?? 1)),
      0
    )
    setTotal(t)
  }, [data, quantities])

  // ✅ Save to DB
  const saveCart = async updatedCart => {
    try {
      await fetch(API_CART, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedCart)
      })
    } catch (err) {
      console.error('Save cart error:', err)
    }
  }

  // ✅ Change quantity (+ / -)
  const changeQuantity = async (id, delta) => {
    const newCart = data.map(it =>
      it.id === id ? { ...it, qty: Math.max(1, (it.qty || 1) + delta) } : it
    )
    setData(newCart)
    const newQ = { ...quantities, [id]: Math.max(1, (quantities[id] || 1) + delta) }
    setQuantities(newQ)
    await saveCart(newCart)
  }

  // ✅ Remove item
  const removeItem = async id => {
    const filtered = data.filter(it => it.id !== id)
    setData(filtered)
    const { [id]: _, ...rest } = quantities
    setQuantities(rest)
    try {
      await fetch(`${API_CART}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Remove item error:', err)
    }
  }

  // ✅ Add to cart from outside pages
  useEffect(() => {
    window.addToCart = async item => {
      const key = idKey(item)
      if (!key) return
      const found = data.find(p => p.id === key)
      let updatedCart
      if (found) {
        updatedCart = data.map(p =>
          p.id === key ? { ...p, qty: (p.qty || 1) + Number(item.qty || 1) } : p
        )
      } else {
        const newItem = {
          id: key,
          name: item.name ?? key,
          price: Number(item.price || 0),
          img: item.img || '',
          spec: item.spec || '',
          qty: Number(item.qty || 1)
        }
        updatedCart = [...data, newItem]
      }
      setData(updatedCart)
      const q = { ...quantities, [key]: (quantities[key] || 0) + Number(item.qty || 1) }
      setQuantities(q)
      await saveCart(updatedCart)
    }
    return () => delete window.addToCart
  }, [data, quantities])

  // ✅ Place Order (fixed clickable)
  const placeOrder = async () => {
    if (!data.length || placing) return
    setPlacing(true)

    if (totalRef.current) {
      totalRef.current.classList.add('animate-pulse')
      setTimeout(() => totalRef.current.classList.remove('animate-pulse'), 800)
    }

    // We now rely on backend cart persistence for all users; no client-side pendingOrder

    // Create order on server
    let createdOrder = null
    try {
      const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data.map(it => ({ id: it.id, name: it.name, price: it.price, qty: it.qty || quantities[it.id] || 1 })), total })
      })
      if (res.ok) {
        const j = await res.json()
        createdOrder = (j && j.order) || null
      } else {
        console.error('Order create failed', res.status)
      }
    } catch (e) {
      console.error('Order create error', e)
    }

    // Clear backend cart regardless of order create result
    try {
      await Promise.all(
        data.map(it =>
          fetch(`${API_CART}?id=${encodeURIComponent(it.id)}`, {
            method: 'DELETE',
            credentials: 'include'
          })
        )
      )
    } catch (err) {
      console.error('Clear cart error:', err)
    }

    setData([])
    setQuantities({})
    setPlacing(false)

    // Navigate to checkout with server order id when available
    if (createdOrder && (createdOrder.id || createdOrder._id)) {
      const oid = createdOrder.id || createdOrder._id
      // navigate to the more semantic route and mark as justPlaced for UX
      navigate(`/orders/${encodeURIComponent(oid)}`, { state: { justPlaced: true } })
    } else {
      // order creation failed — keep user on cart and show a message
      alert('Failed to create order on server. Please try again.')
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen text-white p-6 md:px-20">
        <h1 className="text-4xl font-bold mb-8">🛒 Your Cart</h1>

        {data.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-xl mb-2">Your cart is empty.</p>
            <p className="text-sm text-gray-500">Add some products to start building your dream setup.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {data.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-gray-900 rounded-2xl border border-gray-800">
                  <img src={item.img || '/placeholder.png'} alt={item.name} className="w-32 h-32 object-contain rounded-xl bg-gray-800" />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-semibold mb-1">{item.name}</h2>
                    <p className="text-gray-400 text-sm">{item.spec || 'High quality product'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="bg-blue-500 px-3 py-1 rounded" onClick={() => changeQuantity(item.id, -1)}>-</button>
                    <p className="text-lg font-semibold w-8 text-center">{quantities[item.id] ?? item.qty ?? 1}</p>
                    <button className="bg-blue-500 px-3 py-1 rounded" onClick={() => changeQuantity(item.id, 1)}>+</button>
                  </div>

                  <div className="text-lg font-bold text-blue-400">
                    PKR {(Number(item.price || 0) * (quantities[item.id] ?? item.qty ?? 1)).toLocaleString()}
                  </div>

                  <button className="text-xs text-red-400 hover:underline" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-gray-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between border-t border-gray-800">
              <div>
                <p className="text-sm text-gray-400">Estimated Total</p>
                <p ref={totalRef} className="text-3xl font-bold text-blue-400 mt-1">PKR {total.toLocaleString()}</p>
              </div>
              <button
                onClick={placeOrder}
                disabled={placing || !data.length}
                className={`bg-blue-600 mt-4 sm:mt-0 px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${placing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {placing ? 'Placing...' : 'Place Full Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
