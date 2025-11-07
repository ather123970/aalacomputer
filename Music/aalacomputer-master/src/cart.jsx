import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './nav'
import { ShoppingCart, Trash2, Plus, Minus, TrendingUp, Zap, Clock, Gift, MessageCircle } from 'lucide-react'
import SmartImage from './components/SmartImage'

import { API_BASE } from './config'
const BASE = API_BASE
const API_CART = `${BASE.replace(/\/+$/, '')}/api/v1/cart`
const DEFAULT_WH_NUMBER = '+923125066195'

const idKey = item => (item.id || item._id || item.sku || item.name || '').toString()

// Smart product bundle recommendations - Enhanced with more combinations
const PRODUCT_BUNDLES = {
  gpu: [
    { id: 'bundle_gpu_cpu', name: 'High-Performance Processor', desc: 'Unlock your GPU\'s full potential', discount: 15, category: 'Processors', price: 85000, icon: '🖥️' },
    { id: 'bundle_gpu_psu', name: 'Premium PSU 850W Gold', desc: 'Power your beast safely', discount: 12, category: 'Power Supplies', price: 25000, icon: '⚡' }
  ],
  processor: [
    { id: 'bundle_cpu_mobo', name: 'Compatible Motherboard', desc: 'Perfect match for your CPU', discount: 18, category: 'Motherboards', price: 45000, icon: '🔌' },
    { id: 'bundle_cpu_ram', name: 'DDR4 16GB RGB RAM', desc: 'Maximize CPU performance', discount: 10, category: 'RAM', price: 18000, icon: '💾' }
  ],
  motherboard: [
    { id: 'bundle_mobo_case', name: 'Premium ATX PC Case', desc: 'Perfect fit with airflow', discount: 15, category: 'PC Cases', price: 22000, icon: '📦' },
    { id: 'bundle_mobo_ram', name: 'DDR4/DDR5 RAM 16GB', desc: 'Boost overall performance', discount: 12, category: 'RAM', price: 18000, icon: '💾' }
  ],
  ram: [
    { id: 'bundle_ram_ssd', name: 'NVMe SSD 1TB Gen4', desc: 'Lightning fast storage', discount: 20, category: 'Storage', price: 28000, icon: '💿' },
    { id: 'bundle_ram_cooler', name: 'RGB CPU Cooler', desc: 'Match your RAM aesthetics', discount: 10, category: 'CPU Coolers', price: 12000, icon: '❄️' }
  ],
  monitor: [
    { id: 'bundle_monitor_gpu', name: 'Gaming GPU RTX Series', desc: 'Max out those frames!', discount: 15, category: 'Graphics Cards', price: 145000, icon: '🎮' },
    { id: 'bundle_monitor_mount', name: 'Monitor Arm Mount', desc: 'Ergonomic desk setup', discount: 8, category: 'Cables & Accessories', price: 8000, icon: '🖥️' }
  ],
  case: [
    { id: 'bundle_case_fans', name: 'RGB Case Fans 3-Pack', desc: 'Optimal cooling & aesthetics', discount: 12, category: 'CPU Coolers', price: 9000, icon: '🌀' },
    { id: 'bundle_case_psu', name: 'Modular PSU 650W', desc: 'Clean cable management', discount: 10, category: 'Power Supplies', price: 18000, icon: '⚡' }
  ],
  keyboard: [
    { id: 'bundle_kb_mouse', name: 'Gaming Mouse RGB', desc: 'Complete your setup', discount: 15, category: 'Mouse', price: 7500, icon: '🖱️' },
    { id: 'bundle_kb_pad', name: 'XXL Gaming Mousepad', desc: 'Desk-sized comfort', discount: 8, category: 'Peripherals', price: 3500, icon: '📏' }
  ],
  mouse: [
    { id: 'bundle_mouse_pad', name: 'Extended Gaming Mousepad', desc: 'Perfect surface for precision', discount: 10, category: 'Peripherals', price: 3000, icon: '📏' },
    { id: 'bundle_mouse_kb', name: 'Mechanical Keyboard RGB', desc: 'Complete combo setup', discount: 12, category: 'Keyboards', price: 12500, icon: '⌨️' }
  ],
  laptop: [
    { id: 'bundle_laptop_mouse', name: 'Wireless Gaming Mouse', desc: 'Essential laptop companion', discount: 10, category: 'Mouse', price: 6500, icon: '🖱️' },
    { id: 'bundle_laptop_bag', name: 'Premium Laptop Bag', desc: 'Protect your investment', discount: 15, category: 'Cables & Accessories', price: 4500, icon: '💼' }
  ],
  headset: [
    { id: 'bundle_hs_mic', name: 'USB Microphone', desc: 'Crystal clear voice', discount: 12, category: 'Peripherals', price: 12000, icon: '🎤' },
    { id: 'bundle_hs_stand', name: 'Headset Stand RGB', desc: 'Store in style', discount: 10, category: 'Cables & Accessories', price: 4500, icon: '🎧' }
  ],
  storage: [
    { id: 'bundle_ssd_ram', name: 'DDR4 16GB RAM', desc: 'Speed up everything', discount: 12, category: 'RAM', price: 18000, icon: '💾' },
    { id: 'bundle_ssd_case', name: 'External SSD Enclosure', desc: 'Portable storage solution', discount: 8, category: 'Cables & Accessories', price: 2500, icon: '📦' }
  ]
}

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
    fetchAllProducts() // Fetch real products from database
  }, [])

  // ✅ Fetch all products from database for real bundle recommendations
  const fetchAllProducts = async () => {
    try {
      // Fetch with high limit to get all products for recommendations
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/products?limit=1000`)
      if (response.ok) {
        const data = await response.json()
        // API returns paginated response: { products: [...], total, page, ... }
        const products = data.products || data || []
        setAllProducts(products)
        console.log('✅ Loaded', products.length, 'real products for bundles')
        // Debug: Show sample product with image path
        if (products.length > 0) {
          console.log('📦 Sample product:', {
            name: products[0].Name || products[0].name || products[0].title,
            img: products[0].img,
            imageUrl: products[0].imageUrl,
            category: products[0].category
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

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

  // ✅ Find real products from database by category
  const findRealProducts = (targetCategory, limit = 2) => {
    if (!allProducts || allProducts.length === 0) return []
    
    const categoryLower = targetCategory.toLowerCase()
    const matches = allProducts.filter(product => {
      const productCategory = (product.category || '').toLowerCase()
      const productName = (product.name || product.title || '').toLowerCase()
      
      // Match by category or name
      if (productCategory.includes(categoryLower)) return true
      if (categoryLower === 'processor' && (productName.includes('ryzen') || productName.includes('intel') || productName.includes('cpu'))) return true
      if (categoryLower === 'graphics cards' && (productName.includes('rtx') || productName.includes('rx') || productName.includes('gpu'))) return true
      if (categoryLower === 'ram' && (productName.includes('ddr') || productName.includes('memory'))) return true
      if (categoryLower === 'storage' && (productName.includes('ssd') || productName.includes('hdd') || productName.includes('nvme'))) return true
      if (categoryLower === 'mouse' && productName.includes('mouse')) return true
      if (categoryLower === 'keyboards' && productName.includes('keyboard')) return true
      
      return false
    })
    
    // Shuffle and limit
    const selected = matches.sort(() => 0.5 - Math.random()).slice(0, limit)
    
    // Debug: Log selected products with image paths
    if (selected.length > 0) {
      console.log(`🔍 Found ${selected.length} products for "${targetCategory}":`, 
        selected.map(p => ({ 
          name: p.name || p.title, 
          img: p.img || p.imageUrl,
          category: p.category 
        }))
      )
    }
    
    return selected
  }

  // ✅ Recalculate total and detect smart recommendations - USING REAL PRODUCTS
  useEffect(() => {
    const t = data.reduce(
      (acc, item) => acc + (Number(item.price) * (quantities[item.id] ?? item.qty ?? 1)),
      0
    )
    setTotal(t)
    
    if (allProducts.length === 0) return // Wait for products to load
    
    // Smart product detection - Find REAL products from DB
    const realBundles = []
    
    data.forEach(item => {
      const category = (item.type || item.category || '').toLowerCase()
      const name = (item.name || '').toLowerCase()
      
      // GPU / Graphics Card detection → Show Processor + PSU
      if (category.includes('gpu') || category.includes('graphics') || name.includes('rtx') || name.includes('rx')) {
        const processors = findRealProducts('Processors', 1)
        const psus = findRealProducts('Power Supplies', 1)
        if (processors[0]) realBundles.push({ ...processors[0], discount: 15, icon: '🖥️' })
        if (psus[0]) realBundles.push({ ...psus[0], discount: 12, icon: '⚡' })
      }
      
      // Processor / CPU detection → Show Motherboard + RAM
      if (category.includes('processor') || category.includes('cpu') || name.includes('ryzen') || name.includes('intel')) {
        const mobos = findRealProducts('Motherboards', 1)
        const rams = findRealProducts('RAM', 1)
        if (mobos[0]) realBundles.push({ ...mobos[0], discount: 18, icon: '🔌' })
        if (rams[0]) realBundles.push({ ...rams[0], discount: 10, icon: '💾' })
      }
      
      // Motherboard detection → Show Case + RAM
      if (category.includes('motherboard') || category.includes('mobo') || name.includes('motherboard')) {
        const cases = findRealProducts('PC Cases', 1)
        const rams = findRealProducts('RAM', 1)
        if (cases[0]) realBundles.push({ ...cases[0], discount: 15, icon: '📦' })
        if (rams[0]) realBundles.push({ ...rams[0], discount: 12, icon: '💾' })
      }
      
      // RAM detection → Show SSD + Cooler
      if (category.includes('ram') || category.includes('memory') || name.includes('ddr')) {
        const ssds = findRealProducts('Storage', 1)
        const coolers = findRealProducts('CPU Coolers', 1)
        if (ssds[0]) realBundles.push({ ...ssds[0], discount: 20, icon: '💿' })
        if (coolers[0]) realBundles.push({ ...coolers[0], discount: 10, icon: '❄️' })
      }
      
      // Monitor detection → Show GPU + Accessories
      if (category.includes('monitor') || category.includes('display') || name.includes('monitor')) {
        const gpus = findRealProducts('Graphics Cards', 1)
        const accessories = findRealProducts('Cables & Accessories', 1)
        if (gpus[0]) realBundles.push({ ...gpus[0], discount: 15, icon: '🎮' })
        if (accessories[0]) realBundles.push({ ...accessories[0], discount: 8, icon: '🔌' })
      }
      
      // Keyboard detection → Show Mouse + Mousepad
      if (category.includes('keyboard') || name.includes('keyboard')) {
        const mice = findRealProducts('Mouse', 1)
        const peripherals = findRealProducts('Peripherals', 1)
        if (mice[0]) realBundles.push({ ...mice[0], discount: 15, icon: '🖱️' })
        if (peripherals[0]) realBundles.push({ ...peripherals[0], discount: 8, icon: '📏' })
      }
      
      // Mouse detection → Show Keyboard + Mousepad
      if (category.includes('mouse') || name.includes('mouse')) {
        const keyboards = findRealProducts('Keyboards', 1)
        const peripherals = findRealProducts('Peripherals', 1)
        if (keyboards[0]) realBundles.push({ ...keyboards[0], discount: 12, icon: '⌨️' })
        if (peripherals[0]) realBundles.push({ ...peripherals[0], discount: 10, icon: '📏' })
      }
      
      // Laptop detection → Show Mouse + Accessories
      if (category.includes('laptop') || category.includes('notebook') || name.includes('laptop')) {
        const mice = findRealProducts('Mouse', 1)
        const accessories = findRealProducts('Cables & Accessories', 1)
        if (mice[0]) realBundles.push({ ...mice[0], discount: 10, icon: '🖱️' })
        if (accessories[0]) realBundles.push({ ...accessories[0], discount: 15, icon: '💼' })
      }
      
      // Headset detection → Show Microphone + Accessories
      if (category.includes('headset') || category.includes('headphone') || name.includes('headset')) {
        const peripherals = findRealProducts('Peripherals', 2)
        if (peripherals[0]) realBundles.push({ ...peripherals[0], discount: 12, icon: '🎤' })
        if (peripherals[1]) realBundles.push({ ...peripherals[1], discount: 10, icon: '🎧' })
      }
    })
    
    // Remove duplicates (avoid showing products already in cart)
    const filtered = realBundles.filter(bundle => 
      !data.find(cartItem => cartItem.id === bundle.id || cartItem._id === bundle._id)
    )
    
    // Remove duplicate recommendations
    const unique = filtered.filter((rec, idx, arr) => 
      arr.findIndex(r => (r.id || r._id) === (rec.id || rec._id)) === idx
    )
    
    // Group into pairs (2 products per bundle deal)
    const bundlePairs = []
    for (let i = 0; i < unique.length; i += 2) {
      if (i + 1 < unique.length) {
        bundlePairs.push({
          id: `pair_${i}_${unique[i].id}_${unique[i + 1].id}`,
          product1: unique[i],
          product2: unique[i + 1]
        })
      } else {
        // If odd number, create single product bundle
        bundlePairs.push({
          id: `pair_${i}_${unique[i].id}`,
          product1: unique[i],
          product2: null
        })
      }
    }
    
    setRecommendations(bundlePairs.slice(0, 2)) // Max 2 bundle pairs
  }, [data, quantities, allProducts])

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

  // ✅ Add single recommended product to cart (+ button) - REAL PRODUCT
  const addRecommendedProduct = (product) => {
    const originalPrice = Number(product.price || 0)
    const discountedPrice = Math.round(originalPrice * (1 - (product.discount || 0) / 100))
    
    const newItem = {
      id: product.id || product._id,
      name: product.Name || product.name || product.title || 'Product',
      price: discountedPrice,
      img: product.img || product.imageUrl || '/placeholder.png',
      imageUrl: product.img || product.imageUrl || '/placeholder.png',
      spec: product.description || (Array.isArray(product.Spec) ? product.Spec.join(', ') : product.Spec) || 'Quality product',
      category: product.category || 'Product',
      type: product.category || 'Product',
      qty: 1
    }
    
    // Check if already in cart
    const itemId = product.id || product._id
    const existing = data.find(item => (item.id || item._id) === itemId)
    let updatedCart
    
    if (existing) {
      // Increase quantity
      updatedCart = data.map(item => 
        (item.id || item._id) === itemId ? { ...item, qty: (item.qty || 1) + 1 } : item
      )
      const newQ = { ...quantities, [itemId]: (quantities[itemId] || 1) + 1 }
      setQuantities(newQ)
    } else {
      // Add new item
      updatedCart = [...data, newItem]
      setQuantities({ ...quantities, [itemId]: 1 })
    }
    
    setData(updatedCart)
    saveCart(updatedCart)
    
    // Show success feedback
    const savings = Math.round(originalPrice * ((product.discount || 0) / 100))
    const message = `✅ ${newItem.name} added to cart!\n💰 You saved PKR ${savings.toLocaleString()} (${product.discount}% OFF)`
    alert(message)
  }

  // ✅ Add COMPLETE bundle (both products) to cart - REAL PRODUCTS
  const addCompleteBundle = (product1, product2) => {
    let updatedCart = [...data]
    let newQuantities = { ...quantities }
    
    // Add product 1
    if (product1) {
      const price1 = Math.round((product1.price || 0) * (1 - (product1.discount || 0) / 100))
      const id1 = product1.id || product1._id
      
      const existing1 = updatedCart.find(item => (item.id || item._id) === id1)
      if (existing1) {
        updatedCart = updatedCart.map(item => 
          (item.id || item._id) === id1 ? { ...item, qty: (item.qty || 1) + 1 } : item
        )
        newQuantities[id1] = (newQuantities[id1] || 1) + 1
      } else {
        updatedCart.push({
          id: id1,
          name: product1.Name || product1.name || product1.title || 'Product',
          price: price1,
          img: product1.img || product1.imageUrl || '/placeholder.png',
          imageUrl: product1.img || product1.imageUrl || '/placeholder.png',
          spec: product1.description || (Array.isArray(product1.Spec) ? product1.Spec.join(', ') : product1.Spec) || 'Quality product',
          category: product1.category || 'Product',
          type: product1.category || 'Product',
          qty: 1
        })
        newQuantities[id1] = 1
      }
    }
    
    // Add product 2
    if (product2) {
      const price2 = Math.round((product2.price || 0) * (1 - (product2.discount || 0) / 100))
      const id2 = product2.id || product2._id
      
      const existing2 = updatedCart.find(item => (item.id || item._id) === id2)
      if (existing2) {
        updatedCart = updatedCart.map(item => 
          (item.id || item._id) === id2 ? { ...item, qty: (item.qty || 1) + 1 } : item
        )
        newQuantities[id2] = (newQuantities[id2] || 1) + 1
      } else {
        updatedCart.push({
          id: id2,
          name: product2.Name || product2.name || product2.title || 'Product',
          price: price2,
          img: product2.img || product2.imageUrl || '/placeholder.png',
          imageUrl: product2.img || product2.imageUrl || '/placeholder.png',
          spec: product2.description || (Array.isArray(product2.Spec) ? product2.Spec.join(', ') : product2.Spec) || 'Quality product',
          category: product2.category || 'Product',
          type: product2.category || 'Product',
          qty: 1
        })
        newQuantities[id2] = 1
      }
    }
    
    setData(updatedCart)
    setQuantities(newQuantities)
    saveCart(updatedCart)
    
    // Calculate total savings
    const totalSavings = (product1 ? Math.round((product1.price || 0) * ((product1.discount || 0) / 100)) : 0) +
                        (product2 ? Math.round((product2.price || 0) * ((product2.discount || 0) / 100)) : 0)
    
    const message = `🎉 Complete Bundle Added!\n💰 Total Savings: PKR ${totalSavings.toLocaleString()}`
    alert(message)
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

  // ✅ Place Order - DIRECT TO WHATSAPP
  const placeOrder = async () => {
    if (!data.length || placing) return
    setPlacing(true)

    try {
      // Create order message
      const orderId = `ORD-${Date.now()}`
      let msg = `🛒 *New Order from Aala Computers*\n\n`
      msg += `📋 *Order ID:* ${orderId}\n`
      msg += `📅 *Date:* ${new Date().toLocaleString()}\n\n`
      msg += `*Items:*\n`
      msg += `━━━━━━━━━━━━━━━━\n`
      
      data.forEach((item, idx) => {
        const qty = quantities[item.id] || item.qty || 1
        const itemTotal = item.price * qty
        msg += `${idx + 1}. ${item.name}\n`
        msg += `   Qty: ${qty} × PKR ${item.price.toLocaleString()}\n`
        msg += `   Subtotal: PKR ${itemTotal.toLocaleString()}\n\n`
      })
      
      msg += `━━━━━━━━━━━━━━━━\n`
      msg += `💰 *Total: PKR ${total.toLocaleString()}*\n\n`
      msg += `Please confirm availability and delivery details. Thank you! 🙏`

      // Save to DB in background
      try {
        await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId,
            items: data.map(it => ({ 
              id: it.id, 
              name: it.name, 
              price: it.price, 
              qty: quantities[it.id] || it.qty || 1 
            })), 
            total 
          })
        })
      } catch (e) {
        console.error('Failed to save order to DB:', e)
      }

      // Clear cart
      localStorage.removeItem('aala_cart')
      setData([])
      setQuantities({})

      // Open WhatsApp
      const encodedMsg = encodeURIComponent(msg)
      const whatsappUrl = `https://wa.me/${DEFAULT_WH_NUMBER.replace('+', '')}?text=${encodedMsg}`
      window.open(whatsappUrl, '_blank')

      // Show success and redirect
      setTimeout(() => {
        alert('✅ Order sent! Check WhatsApp to complete your purchase.')
        navigate('/products')
      }, 1000)
    } catch (err) {
      console.error('Order failed:', err)
      alert('❌ Failed to process order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Shopping Cart
              </h1>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Secure checkout • Items saved in your cart
            </p>
          </div>

          {data.length === 0 ? (
            <div className="text-center mt-20 bg-white rounded-3xl p-12 border-2 border-blue-100 shadow-xl">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 text-lg">Start building your dream PC setup today!</p>
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse Products
              </button>
            </div>
          ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items - Left Column */}
              <div className="lg:col-span-2 space-y-4">
                {data.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border-2 border-blue-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gradient-to-br from-blue-50 to-white rounded-xl flex items-center justify-center p-3 border border-blue-100">
                        <SmartImage 
                          src={item.img || item.imageUrl} 
                          alt={item.name} 
                          product={item}
                          className="w-full h-full object-contain" 
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 break-words line-clamp-2">{item.name}</h3>
                        <p className="text-gray-600 text-xs mb-2 sm:mb-3 line-clamp-2">{item.spec || 'Premium quality product'}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-1">
                            <button 
                              onClick={() => changeQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-blue-100 text-blue-600 font-bold transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-bold text-gray-900 w-12 text-center">
                              {quantities[item.id] ?? item.qty ?? 1}
                            </span>
                            <button 
                              onClick={() => changeQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-blue-100 text-blue-600 font-bold transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Price</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">
                          PKR {(Number(item.price || 0) * (quantities[item.id] ?? item.qty ?? 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Summary & Recommendations */}
              <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-4">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({data.length} items)</span>
                      <span className="font-semibold">PKR {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="border-t-2 border-blue-100 pt-3 flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span ref={totalRef} className="font-bold text-blue-600 text-2xl">PKR {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={placing || !data.length}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                      placing 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 active:scale-95'
                    } text-white`}
                  >
                    {placing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Checkout via WhatsApp</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    🔒 Secure checkout • Order will be sent via WhatsApp
                  </p>
                </div>

                {/* Smart Recommendations with Urgency - RED/WHITE/BLUE THEME */}
                {recommendations.length > 0 && (
                  <div className="relative bg-gradient-to-br from-white via-red-50 to-blue-50 rounded-2xl p-1 shadow-2xl border-2 border-red-500 overflow-hidden">
                    {/* Animated Floating Banner */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2 px-4 overflow-hidden">
                      <div className="flex items-center justify-center gap-2 animate-pulse">
                        <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
                        <p className="text-sm font-bold tracking-wide animate-marquee whitespace-nowrap">
                          🔥 GRAB IT BEFORE IT'S GONE! 🔥 LIMITED STOCK ALERT! 🔥 GRAB IT BEFORE IT'S GONE! 🔥
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 mt-10">
                      <div className="flex items-center gap-2 mb-4 justify-center">
                        <Gift className="w-6 h-6 text-red-600" />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent">
                          Complete Your Setup!
                        </h3>
                      </div>
                      
                      <div className="space-y-6">
                        {recommendations.map((bundle, idx) => (
                          <div key={bundle.id} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 sm:p-6 border-2 border-red-200 shadow-xl">
                            {/* Bundle Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                                <h4 className="text-lg sm:text-xl font-bold text-gray-900">Bundle Deal #{idx + 1}</h4>
                              </div>
                              <div className="bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm animate-pulse whitespace-nowrap">
                                LIMITED TIME
                              </div>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                              {/* Product 1 */}
                              {bundle.product1 && (
                                <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-200 sm:border-2 relative flex flex-col">
                                  {/* Individual + Button */}
                                  <button
                                    onClick={() => addRecommendedProduct(bundle.product1)}
                                    className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 z-10"
                                    title="Add this item only"
                                  >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>

                                  {/* Product Image */}
                                  <div className="w-full h-20 sm:h-28 bg-gradient-to-br from-blue-100 to-blue-50 rounded-md sm:rounded-lg flex items-center justify-center mb-1 sm:mb-2 p-1 sm:p-2 flex-shrink-0">
                                    <SmartImage
                                      src={bundle.product1.img || bundle.product1.imageUrl}
                                      alt={bundle.product1.name || bundle.product1.title}
                                      product={bundle.product1}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>

                                  {/* Product Info */}
                                  <h5 className="font-bold text-gray-900 text-[10px] sm:text-xs mb-0.5 sm:mb-1 pr-6 sm:pr-8 break-words line-clamp-2">{bundle.product1.Name || bundle.product1.name || bundle.product1.title}</h5>
                                  <p className="text-gray-600 text-[9px] sm:text-xs mb-1 sm:mb-2 line-clamp-1 flex-shrink-0 hidden sm:block">{bundle.product1.description || (Array.isArray(bundle.product1.Spec) ? bundle.product1.Spec.slice(0, 2).join(', ') : bundle.product1.Spec) || 'Quality product'}</p>
                                  
                                  {/* Pricing */}
                                  <div className="flex flex-wrap items-center gap-1 mb-0.5 sm:mb-1">
                                    <span className="text-gray-400 line-through text-[9px] sm:text-xs">
                                      PKR {bundle.product1.price.toLocaleString()}
                                    </span>
                                    <span className="bg-red-600 text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded">
                                      {bundle.product1.discount}% OFF
                                    </span>
                                  </div>
                                  <div className="text-red-600 font-bold text-xs sm:text-sm">
                                    PKR {Math.round(bundle.product1.price * (1 - bundle.product1.discount / 100)).toLocaleString()}
                                  </div>
                                </div>
                              )}

                              {/* Product 2 */}
                              {bundle.product2 && (
                                <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-200 sm:border-2 relative flex flex-col">
                                  {/* Individual + Button */}
                                  <button
                                    onClick={() => addRecommendedProduct(bundle.product2)}
                                    className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 z-10"
                                    title="Add this item only"
                                  >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>

                                  {/* Product Image */}
                                  <div className="w-full h-20 sm:h-28 bg-gradient-to-br from-red-100 to-red-50 rounded-md sm:rounded-lg flex items-center justify-center mb-1 sm:mb-2 p-1 sm:p-2 flex-shrink-0">
                                    <SmartImage
                                      src={bundle.product2.img || bundle.product2.imageUrl}
                                      alt={bundle.product2.name || bundle.product2.title}
                                      product={bundle.product2}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>

                                  {/* Product Info */}
                                  <h5 className="font-bold text-gray-900 text-[10px] sm:text-xs mb-0.5 sm:mb-1 pr-6 sm:pr-8 break-words line-clamp-2">{bundle.product2.Name || bundle.product2.name || bundle.product2.title}</h5>
                                  <p className="text-gray-600 text-[9px] sm:text-xs mb-1 sm:mb-2 line-clamp-1 flex-shrink-0 hidden sm:block">{bundle.product2.description || (Array.isArray(bundle.product2.Spec) ? bundle.product2.Spec.slice(0, 2).join(', ') : bundle.product2.Spec) || 'Quality product'}</p>
                                  
                                  {/* Pricing */}
                                  <div className="flex flex-wrap items-center gap-1 mb-0.5 sm:mb-1">
                                    <span className="text-gray-400 line-through text-[9px] sm:text-xs">
                                      PKR {bundle.product2.price.toLocaleString()}
                                    </span>
                                    <span className="bg-red-600 text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded">
                                      {bundle.product2.discount}% OFF
                                    </span>
                                  </div>
                                  <div className="text-red-600 font-bold text-xs sm:text-sm">
                                    PKR {Math.round(bundle.product2.price * (1 - bundle.product2.discount / 100)).toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Complete Bundle Button */}
                            <div className="border-t border-red-200 sm:border-t-2 pt-2 sm:pt-3">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                                <div className="w-full sm:w-auto">
                                  <p className="text-[10px] sm:text-xs text-gray-600">Bundle Savings:</p>
                                  <p className="text-sm sm:text-lg font-bold text-green-600">
                                    PKR {(
                                      (bundle.product1 ? Math.round(bundle.product1.price * (bundle.product1.discount / 100)) : 0) +
                                      (bundle.product2 ? Math.round(bundle.product2.price * (bundle.product2.discount / 100)) : 0)
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => addCompleteBundle(bundle.product1, bundle.product2)}
                                  className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                >
                                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span className="whitespace-nowrap">Add Bundle</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Urgency Footer */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-red-100 via-white to-blue-100 rounded-lg border-2 border-red-300">
                        <div className="flex items-center justify-center gap-3 text-red-700">
                          <Clock className="w-5 h-5 animate-bounce" />
                          <p className="font-bold text-sm">
                            ⏰ HURRY! Offer expires in <span className="text-red-600 text-lg">24 hours</span> • 
                            <span className="text-blue-600 ml-2">🔥 Only {Math.floor(Math.random() * 10) + 3} left in stock!</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="bg-white rounded-2xl border border-blue-100 p-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">✓</p>
                      <p className="text-xs text-gray-600 mt-1">Secure Payment</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">🚚</p>
                      <p className="text-xs text-gray-600 mt-1">Fast Delivery</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">💯</p>
                      <p className="text-xs text-gray-600 mt-1">Warranty</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">⭐</p>
                      <p className="text-xs text-gray-600 mt-1">Quality Products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </>
  )
}
