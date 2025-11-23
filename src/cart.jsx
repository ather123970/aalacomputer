import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './nav'
import { ShoppingCart, Trash2, Plus, Minus, TrendingUp, Zap, Clock, Gift, MessageCircle, Star, Cpu, Monitor, HardDrive, Mouse, Keyboard, Eye, ShoppingBag, Package, Flame } from 'lucide-react'
import SmartImage from './components/SmartImage'

import { API_CONFIG } from './config/api'
const BASE = API_CONFIG.BASE_URL
const API_CART = `${BASE.replace(/\/+$/, '')}/api/v1/cart`
const DEFAULT_WH_NUMBER = '+923125066195'

// Urgency data (simulated real-time stats)
const getUrgencyStats = () => ({
  viewing: Math.floor(Math.random() * 20) + 10, // 10-30 viewers
  bought: Math.floor(Math.random() * 40) + 20, // 20-60 bought
  left: Math.floor(Math.random() * 20) + 15 // 15-35 left
})

// Smart product combinations based on categories
const PRODUCT_COMBINATIONS = {
  'cpu': ['motherboard', 'ram', 'cooler'],
  'processor': ['motherboard', 'ram', 'cooler'],
  'motherboard': ['cpu', 'processor', 'ram'],
  'gpu': ['monitor', 'cpu', 'processor'],
  'graphics': ['monitor', 'cpu', 'processor'],
  'ram': ['cpu', 'processor', 'motherboard'],
  'memory': ['cpu', 'processor', 'motherboard'],
  'ssd': ['motherboard', 'cpu', 'processor'],
  'hdd': ['motherboard', 'cpu', 'processor'],
  'monitor': ['gpu', 'graphics', 'keyboard', 'mouse'],
  'display': ['gpu', 'graphics', 'keyboard', 'mouse'],
  'keyboard': ['mouse', 'monitor', 'headset'],
  'mouse': ['keyboard', 'monitor', 'mousepad'],
  'headset': ['keyboard', 'mouse'],
  'speaker': ['keyboard', 'mouse']
}

const idKey = item => (item.id || item._id || item.sku || item.name || '').toString()

export default function Cart() {
  const [data, setData] = useState([])
  const [quantities, setQuantities] = useState({})
  const [total, setTotal] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [allProducts, setAllProducts] = useState([]) // Real products from DB
  const totalRef = useRef(null)
  const navigate = useNavigate()

  // ✅ Load cart from localStorage (NOT from DB until checkout)
  const getCart = () => {
    try {
      const stored = localStorage.getItem('aala_cart')
      if (stored) {
        const items = JSON.parse(stored)
        setData(items)
        const q = {}
        items.forEach(it => (q[it.id] = it.qty || 1))
        setQuantities(q)
      }
    } catch (err) {
      console.error('Cart load error:', err)
    }
  }

  useEffect(() => { 
    getCart()
    loadAllProducts() // Load products for recommendations
  }, [])

  // Refresh cart when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getCart()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Load all products for recommendations
  const loadAllProducts = async () => {
    try {
      const response = await fetch(`${BASE.replace(/\/+$/, '')}/api/products?limit=100`)
      if (response.ok) {
        const data = await response.json()
        const products = Array.isArray(data) ? data : (data.products || [])
        setAllProducts(products)
      }
    } catch (err) {
      console.error('Failed to load products for recommendations:', err)
    }
  }

  // Generate smart recommendations based on cart items
  const generateRecommendations = () => {
    if (!data.length || !allProducts.length) return []
    
    const cartCategories = data.map(item => {
      const category = (item.category || item.name || '').toLowerCase()
      return Object.keys(PRODUCT_COMBINATIONS).find(key => category.includes(key)) || category
    })
    
    const recommendedCategories = new Set()
    cartCategories.forEach(category => {
      const combinations = PRODUCT_COMBINATIONS[category] || []
      combinations.forEach(rec => recommendedCategories.add(rec))
    })
    
    // Filter products that match recommended categories and aren't in cart
    const cartIds = new Set(data.map(item => item.id))
    const recommendations = allProducts.filter(product => {
      if (cartIds.has(product.id || product._id)) return false
      
      const productCategory = (product.category || product.name || '').toLowerCase()
      return Array.from(recommendedCategories).some(rec => productCategory.includes(rec))
    }).slice(0, 4) // Limit to 4 recommendations
    
    return recommendations
  }

  // Update recommendations when cart changes (limit to 2 products for bundle)
  useEffect(() => {
    const recs = generateRecommendations().slice(0, 2)
    setRecommendations(recs)
  }, [data, allProducts])

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
        saveCart(merged); // Save to localStorage only
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

  // ✅ Save to localStorage ONLY (not DB until checkout)
  const saveCart = (updatedCart) => {
    try {
      localStorage.setItem('aala_cart', JSON.stringify(updatedCart))
    } catch (err) {
      console.error('Save cart error:', err)
    }
  }

  // ✅ Save cart to DB (called ONLY when placing order)
  const saveCartToDB = async (cartItems) => {
    try {
      await fetch(API_CART, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cartItems)
      })
    } catch (err) {
      console.error('Save cart to DB error:', err)
    }
  }

  // ✅ Change quantity (+ / -)
  const changeQuantity = (id, delta) => {
    const newCart = data.map(it =>
      it.id === id ? { ...it, qty: Math.max(1, (it.qty || 1) + delta) } : it
    )
    setData(newCart)
    const newQ = { ...quantities, [id]: Math.max(1, (quantities[id] || 1) + delta) }
    setQuantities(newQ)
    saveCart(newCart) // Save to localStorage only
  }

  // ✅ Remove item (from localStorage only)
  const removeItem = (id) => {
    const filtered = data.filter(it => it.id !== id)
    setData(filtered)
    const { [id]: _, ...rest } = quantities
    setQuantities(rest)
    saveCart(filtered) // Save to localStorage only
  }

  // ✅ Add to cart from outside pages (localStorage only)
  useEffect(() => {
    window.addToCart = item => {
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
      saveCart(updatedCart) // Save to localStorage only
    }
    return () => delete window.addToCart
  }, [data, quantities])

  // ✅ Place Order - SAVES TO DB ON CHECKOUT
  const placeOrder = async () => {
    if (!data.length || placing) return
    setPlacing(true)

    if (totalRef.current) {
      totalRef.current.classList.add('animate-pulse')
      setTimeout(() => totalRef.current.classList.remove('animate-pulse'), 800)
    }

    // 🎯 STEP 1: Save cart to DB (first time DB is touched)
    console.log('💾 Saving cart to database...')
    try {
      await saveCartToDB(data)
      console.log('✅ Cart saved to database successfully')
    } catch (e) {
      console.error('❌ Failed to save cart to DB:', e)
    }

    // 🎯 STEP 2: Create order on server
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
        console.log('✅ Order created successfully')
      } else {
        console.error('❌ Order create failed', res.status)
      }
    } catch (e) {
      console.error('❌ Order create error', e)
    }

    // 🎯 STEP 3: Clear localStorage and state
    localStorage.removeItem('aala_cart')
    console.log('✅ LocalStorage cart cleared')

    setData([])
    setQuantities({})
    setPlacing(false)

    // Navigate to checkout with server order id when available
    if (createdOrder && (createdOrder.id || createdOrder._id)) {
      const oid = createdOrder.id || createdOrder._id
      navigate(`/orders/${encodeURIComponent(oid)}`, { state: { justPlaced: true } })
    } else {
      alert('Failed to create order on server. Please try again.')
    }
  }

  const [urgencyStats, setUrgencyStats] = useState(getUrgencyStats())

  // Update urgency stats every 30 seconds to simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setUrgencyStats(getUrgencyStats())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // WhatsApp handler
  const openWhatsApp = () => {
    const message = `Hi! I'm interested in the items in my cart:\n${data.map((item, i) => `${i + 1}. ${item.name} (x${quantities[item.id] ?? item.qty ?? 1})`).join('\n')}\n\nTotal: PKR ${total.toLocaleString()}`
    window.open(`https://wa.me/${DEFAULT_WH_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                  <p className="text-sm text-gray-500">{data.length} {data.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {data.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add some products to start building your dream setup.</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {data.map(item => {
                  const itemStats = getUrgencyStats()
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      {/* Urgency Badge */}
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          <Flame className="w-4 h-4" />
                          <span>{itemStats.viewing} viewing</span>
                          <span>•</span>
                          <span>{itemStats.bought} bought</span>
                          <span>•</span>
                          <span>{itemStats.left} left</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <SmartImage 
                            src={item.img || item.imageUrl || item.image || '/placeholder.png'} 
                            alt={item.name || item.title || 'Product'} 
                            product={item}
                            className="w-32 h-32 object-contain rounded-lg bg-gray-50 p-2"
                            fallback="/placeholder.png"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{item.spec || 'High quality product'}</p>
                          
                          <div className="flex items-center gap-1 mb-3">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-gray-500 text-sm ml-2">(4.8)</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                              <button 
                                className="bg-white hover:bg-gray-50 border border-gray-300 p-2 rounded-md transition-colors" 
                                onClick={() => changeQuantity(item.id, -1)}
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>
                              <span className="text-lg font-semibold w-12 text-center text-gray-900">
                                {quantities[item.id] ?? item.qty ?? 1}
                              </span>
                              <button 
                                className="bg-white hover:bg-gray-50 border border-gray-300 p-2 rounded-md transition-colors" 
                                onClick={() => changeQuantity(item.id, 1)}
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>

                            <div className="flex-1">
                              <div className="text-xl font-bold text-gray-900">
                                PKR {(Number(item.price || 0) * (quantities[item.id] ?? item.qty ?? 1)).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                PKR {Number(item.price || 0).toLocaleString()} each
                              </div>
                            </div>

                            <button 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" 
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Complete Your Setup Section - Redesigned */}
                {recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-md border-2 border-blue-200 p-6 mt-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900">Complete Your Setup!</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Bundle Deal #1</h3>
                      <p className="text-sm text-gray-600">LIMITED TIME</p>
                    </div>

                    {/* Bundle Deal Urgency */}
                    <div className="flex justify-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                        <Flame className="w-4 h-4" />
                        <span>{urgencyStats.viewing} viewing</span>
                        <span>•</span>
                        <span>{urgencyStats.bought} bought</span>
                        <span>•</span>
                        <span>{urgencyStats.left} left</span>
                      </div>
                    </div>

                    {/* Products - Responsive Layout */}
                    <div className="space-y-4 mb-6">
                      {recommendations.map((product, idx) => (
                        <div key={product.id || product._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Product Image - Responsive */}
                            <div className="w-full sm:w-32 h-32 flex-shrink-0">
                              <SmartImage 
                                src={product.img || product.imageUrl || product.image || '/placeholder.png'} 
                                alt={product.name || product.title || 'Bundle Product'} 
                                product={product}
                                className="w-full h-full object-contain rounded-lg bg-gray-50 p-2"
                                fallback="/placeholder.png"
                              />
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">
                                {product.name || product.title}
                              </h4>
                              <p className="text-gray-500 text-sm mb-2">{product.category || 'CPU/Cooler'}</p>
                              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                                <span className="text-lg font-bold text-green-600">
                                  PKR {(Number(product.price || 0) * 0.9).toLocaleString()}
                                </span>
                                <span className="text-gray-400 text-sm line-through">
                                  PKR {Number(product.price || 0).toLocaleString()}
                                </span>
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  10% OFF
                                </span>
                              </div>
                              
                              {/* Individual Add Button */}
                              <button
                                onClick={() => {
                                  const cartItem = {
                                    id: product.id || product._id,
                                    name: product.name || product.title,
                                    price: Number(product.price || 0) * 0.9,
                                    img: product.img || product.imageUrl || '/placeholder.svg',
                                    spec: product.description || '',
                                    qty: 1
                                  };
                                  if (window.addToCart) window.addToCart(cartItem);
                                }}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Complete Bundle Button */}
                    <button 
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-xl"
                      onClick={() => {
                        recommendations.forEach(product => {
                          const cartItem = {
                            id: product.id || product._id,
                            name: product.name || product.title,
                            price: Number(product.price || 0) * 0.9,
                            img: product.img || product.imageUrl || '/placeholder.svg',
                            spec: product.description || '',
                            qty: 1
                          };
                          if (window.addToCart) window.addToCart(cartItem);
                        });
                      }}
                    >
                      <Gift className="w-6 h-6" />
                      Add Complete Bundle
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({data.length} items)</span>
                      <span className="font-semibold text-gray-900">PKR {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span ref={totalRef} className="text-2xl font-bold text-blue-600">
                        PKR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Place Full Order
                  </button>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="bg-green-100 p-1.5 rounded">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <span>Free shipping on all orders</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="bg-blue-100 p-1.5 rounded">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>Express delivery available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="bg-purple-100 p-1.5 rounded">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <span>100% authentic products</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
