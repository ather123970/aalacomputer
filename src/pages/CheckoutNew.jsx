// src/pages/CheckoutNew.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation, useParams } from 'react-router-dom'
import { ShoppingCart, Package, CreditCard, CheckCircle, ArrowLeft, Mail, Wallet, DollarSign, AlertCircle } from 'lucide-react'
import SmartImage from '../components/SmartImage'

const DEFAULT_WH_NUMBER = '+923125066195'
import { API_CONFIG } from '../config/api'
const API_CART = API_CONFIG.BASE_URL.replace(/\/+$/, '') + '/v1/cart'

const CheckoutNew = () => {
  const [pending, setPending] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null) // 'cod' or 'online'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  })
  const [formErrors, setFormErrors] = useState({})
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
        let items = []
        if (Array.isArray(cartItems)) items = cartItems
        else if (cartItems && Array.isArray(cartItems.items)) items = cartItems.items

        if (items && items.length > 0) {
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
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get('orderId')
    if (orderId || routeParams.id) {
      setLoading(true)
      const targetId = orderId || routeParams.id
      ;(async () => {
        try {
          const r = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders/${encodeURIComponent(targetId)}`, { credentials: 'include' })
          if (r.ok) {
            const j = await r.json()
            if (j && j.ok && j.order) {
              setPending(j.order)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.error('Failed to fetch order by id', e)
        }
        fetchCartFromBackend().then(() => console.debug('[checkout] cart fallback done')).finally(() => setLoading(false))
      })()
    } else {
      fetchCartFromBackend().finally(() => setLoading(false))
    }

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

  const validateForm = () => {
    const errors = {}
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.zipCode.trim()) errors.zipCode = 'Zip code is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const sendOrderEmail = async (orderDetails, paymentType) => {
    try {
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/send-order-email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderDetails,
          paymentType,
          customerEmail: formData.email,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          customerCity: formData.city,
          customerZipCode: formData.zipCode
        })
      })
      
      if (!response.ok) {
        console.warn('Email sending failed, but order will proceed')
      }
    } catch (e) {
      console.error('Failed to send email:', e)
    }
  }

  const handleCashOnDelivery = async () => {
    if (!validateForm()) return

    setProcessing(true)

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

      // Persist order to backend
      const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: pending.items, 
          total: pending.total,
          paymentMethod: 'cash_on_delivery',
          customerInfo: formData
        })
      })

      if (!res.ok) throw new Error('Server rejected order')

      const orderData = await res.json()

      // Send email notification
      await sendOrderEmail({
        orderId: pending.id,
        items: pending.items,
        total: pending.total,
        orderDate: new Date().toLocaleString()
      }, 'Cash on Delivery')

      // Show success message
      alert(`✅ Order placed successfully!\n\nOrder ID: ${pending.id}\n\nYou will receive a confirmation email at ${formData.email}`)

      setTimeout(() => {
        setProcessing(false)
        navigate('/profile')
      }, 1000)
    } catch (e) {
      console.error('Failed to place order:', e)
      alert('❌ Failed to place order. Please try again.')
      setProcessing(false)
    }
  }

  const handlePayOnline = async () => {
    if (!validateForm()) return

    setProcessing(true)

    try {
      // Persist order to backend with pending payment status
      const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: pending.items, 
          total: pending.total,
          paymentMethod: 'online_payment',
          paymentStatus: 'pending',
          customerInfo: formData
        })
      })

      if (!res.ok) throw new Error('Server rejected order')

      const orderData = await res.json()

      // Send email notification with payment message
      const itemsText = pending.items.map(it => `${it.name} x${it.qty}`).join(', ')
      const totalAmount = pending.total.toFixed(0)

      await sendOrderEmail({
        orderId: pending.id,
        items: pending.items,
        total: pending.total,
        orderDate: new Date().toLocaleString(),
        paymentMessage: `I'm going to send you money for ${itemsText} that ${totalAmount} PKR. Please place my order.`
      }, 'Online Payment')

      // Show message with payment details
      alert(`✅ Order created successfully!\n\nOrder ID: ${pending.id}\n\nPayment Message:\n"I'm going to send you money for ${itemsText} that ${totalAmount} PKR. Please place my order."\n\nYou will receive a confirmation email at ${formData.email}`)

      // Clear cart
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

      setTimeout(() => {
        setProcessing(false)
        navigate('/profile')
      }, 1000)
    } catch (e) {
      console.error('Failed to create order:', e)
      alert('❌ Failed to create order. Please try again.')
      setProcessing(false)
    }
  }

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
            <span className="font-semibold text-blue-400">"Proceed to Checkout"</span> first.
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

  return (
    <div className="min-h-screen bg-panel text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Cart</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-gray-400">Choose your payment method and enter delivery details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="p-6 border border-gray-700 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Order Summary</h2>
              </div>
              <div className="space-y-3">
                {pending.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-white font-medium">{it.name}</p>
                      <p className="text-sm text-gray-400">Qty: {it.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">PKR {(it.qty * it.price).toFixed(0)}</p>
                      <p className="text-xs text-gray-400">@ PKR {it.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-400">PKR {pending.total.toFixed(0)}</span>
              </div>
            </div>

            {/* Delivery Information Form */}
            <div className="p-6 border border-gray-700 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      formErrors.fullName ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Karachi"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      formErrors.city ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.city && <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none ${
                      formErrors.address ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.address && <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>}
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g., 75500"
                    className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      formErrors.zipCode ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {formErrors.zipCode && <p className="text-red-400 text-sm mt-1">{formErrors.zipCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

            {/* Cash on Delivery Option */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'cod'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-600'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">Cash on Delivery</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Pay when your order arrives. We'll send you order details via email.
                  </p>
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-400">✓ Order details will be sent to your email</p>
                    <p className="text-xs text-green-400">✓ Pay upon delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Online Option */}
            <div
              onClick={() => setPaymentMethod('online')}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'online'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-600'
                }`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Pay Online</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Send payment first, then we'll process your order.
                  </p>
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-xs text-purple-400">✓ Payment message will be sent to your email</p>
                    <p className="text-xs text-purple-400">✓ Send payment via your preferred method</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-400 font-medium">Order Confirmation</p>
                  <p className="text-xs text-blue-300 mt-1">
                    A confirmation email will be sent to the email address you provide.
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={() => {
                if (paymentMethod === 'cod') {
                  handleCashOnDelivery()
                } else if (paymentMethod === 'online') {
                  handlePayOnline()
                }
              }}
              disabled={!paymentMethod || processing}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                paymentMethod && !processing
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Create Order (Pay Online)'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutNew
