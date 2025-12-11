import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, MapPin, User, Wallet, MessageCircle, CheckCircle, AlertCircle, Loader, ArrowLeft, Package, DollarSign, Upload, ChevronDown, Copy, Check, CreditCard, Smartphone, Building2, Eye, EyeOff } from 'lucide-react'
import emailjs from '@emailjs/browser'
import Navbar from '../nav'
import SmartImage from '../components/SmartImage'
import { API_CONFIG } from '../config/api'
import '../styles/CheckoutPage.css'

// Initialize EmailJS
emailjs.init('Y_CyOsWzg0DHn4Spg')

const BANK_DETAILS = [
  {
    id: 'ubl',
    bank: 'United Bank Limited (UBL)',
    accountHolder: 'AALA COMPUTER',
    accountNumber: '247845033',
    iban: 'PK90UNIL0109000247845033',
    raast: '03333437829',
    branchCode: '0150'
  },
  {
    id: 'meezan',
    bank: 'Meezan Bank',
    accountHolder: 'ISMAIL ARIF',
    accountNumber: '01340108628191',
    iban: 'PK88MEZN0001340108628191',
    branchCode: ''
  }
]

const PAYMENT_METHODS = {
  COD: {
    id: 'cod',
    name: 'Cash on Delivery',
    desc: 'Pay when you receive',
    icon: '💵'
  },
  ONLINE: {
    id: 'online',
    name: 'Bank Transfer',
    desc: 'Direct bank transfer',
    icon: '🏦'
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [whatsappNumber, setWhatsappNumber] = useState('+923125066195')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  })

  const [paymentProof, setPaymentProof] = useState(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [trackingId, setTrackingId] = useState(null)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aala_cart')
      if (stored) {
        const items = JSON.parse(stored)
        setCartItems(items)
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setLoading(false)
    }

    // Fetch WhatsApp number from backend config
    fetchWhatsAppNumber()
  }, [])

  const fetchWhatsAppNumber = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace(/\/+$/, '')}/api/v1/config`)
      if (response.ok) {
        const data = await response.json()
        if (data.whatsapp) {
          setWhatsappNumber(data.whatsapp)
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp number:', err)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)
  }

  const calculateTax = () => {
    if (selectedPayment === 'cod') {
      return calculateSubtotal() * 0.04 // 4% tax for COD
    }
    return 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone number'
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }

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

  const handlePaymentProofUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProof(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result)
      }
      reader.readAsDataURL(file)
      if (formErrors.paymentProof) {
        setFormErrors(prev => ({ ...prev, paymentProof: '' }))
      }
    }
  }

  const removePaymentProof = () => {
    setPaymentProof(null)
    setPaymentProofPreview(null)
  }

  const sendOrderEmail = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const subtotal = calculateSubtotal()
      const tax = calculateTax()
      const total = calculateTotal()
      const paymentMethod = PAYMENT_METHODS[selectedPayment.toUpperCase()] || PAYMENT_METHODS.COD

      // First, create order in database to get tracking ID
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '')
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.name,
          qty: item.qty || 1,
          price: item.price,
          img: item.img || item.image || ''
        })),
        total: total,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        paymentMethod: paymentMethod.id,
        status: 'order_placed'
      }

      // Create order in MongoDB
      const orderResponse = await fetch(`${base}/api/order-tracking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      let createdTrackingId = null
      if (orderResponse.ok) {
        const orderResult = await orderResponse.json()
        createdTrackingId = orderResult.order?.trackingId
        console.log('Order created with tracking ID:', createdTrackingId)
      }

      // Format items for email
      const orderItemsText = cartItems.map((item, idx) => {
        const itemTotal = item.price * (item.qty || 1)
        return `${idx + 1}. ${item.name}\n   Price: Rs. ${item.price.toLocaleString()}\n   Qty: ${item.qty || 1}\n   Total: Rs. ${itemTotal.toLocaleString()}`
      }).join('\n\n')

      // Get first product image for email
      const productImageURL = cartItems.length > 0 ? (cartItems[0].img || cartItems[0].image || '') : ''

      // Prepare email template variables - matching your format
      const templateParams = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        order_items: orderItemsText,
        subtotal: `Rs. ${subtotal.toLocaleString()}`,
        shipping: 'Free',
        tax: selectedPayment === 'cod' ? `Rs. ${tax.toFixed(2)} (4% COD)` : 'Included',
        total_amount: `Rs. ${total.toLocaleString()}`,
        product_image: productImageURL,
        payment_method: paymentMethod.name,
        payment_image: '',
        tracking_id: createdTrackingId || 'N/A'
      }

      console.log('Sending email with params:', templateParams)

      // Send email via EmailJS
      const response = await emailjs.send(
        'service_r03n3pg',
        'template_7ih5zyg',
        templateParams,
        'Y_CyOsWzg0DHn4Spg'
      )

      if (response.status === 200 || response.ok) {
        console.log('Email sent successfully:', response)

        // Update product stock for each item in order
        try {
          for (const item of cartItems) {
            const productId = item.id || item._id
            const qty = item.qty || 1

            // Fetch current product
            const productResponse = await fetch(`${base}/api/product/${productId}`, {
              cache: 'no-store'
            })

            if (productResponse.ok) {
              const product = await productResponse.json()
              const currentStock = product.stock || 0
              const newStock = Math.max(0, currentStock - qty)

              // Update product stock
              await fetch(`${base}/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  stock: newStock,
                  sold: (product.sold || 0) + qty
                })
              })

              console.log(`Updated stock for ${item.name}: ${currentStock} → ${newStock}`)
            }
          }
        } catch (err) {
          console.error('Failed to update product stock:', err)
        }

        // Clear cart
        localStorage.removeItem('aala_cart')

        // Save tracking ID for display
        if (createdTrackingId) {
          setTrackingId(createdTrackingId)

          // Copy to clipboard
          navigator.clipboard.writeText(createdTrackingId).then(() => {
            console.log('Tracking ID copied to clipboard:', createdTrackingId)
          }).catch(err => {
            console.error('Failed to copy tracking ID:', err)
          })
        }

        // Show success message
        setOrderPlaced(true)

        // Auto-redirect to tracking page after 2 seconds
        if (createdTrackingId) {
          setTimeout(() => {
            navigate(`/track-order?id=${createdTrackingId}`)
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Error sending email:', err)
      alert('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-container">
          <div className="max-w-2xl mx-auto">
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}>
              {/* Animated checkmark */}
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    opacity: 0.3
                  }}></div>
                  <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justificationContent: 'center'
                  }}>
                    <CheckCircle style={{ width: '60px', height: '60px', color: 'white' }} />
                  </div>
                </div>
              </div>

              {/* Main heading */}
              <h1 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                Order Placed Successfully! 🎉
              </h1>

              {/* Subheading */}
              <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem' }}>
                Thank you for your purchase!
              </p>

              {/* Tracking ID Display */}
              {trackingId && (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '1.5rem',
                  border: '2px solid #bfdbfe'
                }}>
                  <p style={{ color: '#475569', fontWeight: 600, marginBottom: '1rem' }}>
                    Your Order Tracking ID
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <code style={{
                      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                      fontWeight: 700,
                      color: '#3b82f6',
                      background: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6',
                      fontFamily: 'monospace'
                    }}>
                      {trackingId}
                    </code>
                    <Check style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#22c55e', marginTop: '1rem', fontWeight: 600 }}>
                    ✓ Copied to clipboard!
                  </p>
                </div>
              )}

              {/* Redirect message */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Loader style={{ width: '20px', height: '20px', color: '#3b82f6' }} className="spinner" />
                  <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
                    Redirecting to tracking page...
                  </p>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  You'll be redirected in 2 seconds
                </p>
              </div>

              {/* Manual track button */}
              {trackingId && (
                <button
                  onClick={() => navigate(`/track-order?id=${trackingId}`)}
                  style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Package size={20} />
                  Track Your Order Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-12 text-center shadow-lg">
            <ShoppingCart className="w-20 h-20 text-blue-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products before checking out</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and choose your payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Customer Information */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Karachi"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                  />
                  {formErrors.city && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {formErrors.city}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                  />
                  {formErrors.address && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {formErrors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-blue-600" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${selectedPayment === method.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-blue-200 bg-white hover:border-blue-400'
                      }`}
                  >
                    <div className="text-4xl mb-3">{method.icon}</div>
                    <h3 className={`font-bold mb-1 text-lg ${selectedPayment === method.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>{method.name}</h3>
                    <p className={`text-sm ${selectedPayment === method.id ? 'text-blue-700' : 'text-gray-600'
                      }`}>{method.desc}</p>
                  </button>
                ))}
              </div>

              {/* Bank Transfer Details */}
              {selectedPayment === 'online' && (
                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-xl space-y-6">
                  <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
                    <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-white" />
                      Send your payment to these bank accounts:
                    </p>

                    {BANK_DETAILS.map((bank, idx) => (
                      <div key={idx} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                        <h4 className="font-bold text-white mb-3 text-base">{bank.bank}</h4>
                        <div className="space-y-2 text-sm text-white bg-blue-600 bg-opacity-30 p-3 rounded-lg">
                          <p><span className="font-semibold text-white">Account Holder:</span> {bank.accountHolder}</p>
                          <p><span className="font-semibold text-white">Account Number:</span> {bank.accountNumber}</p>
                          <p><span className="font-semibold text-white">IBAN:</span> {bank.iban}</p>
                          {bank.raast && <p><span className="font-semibold text-white">RAAST:</span> {bank.raast}</p>}
                          {bank.branchCode && <p><span className="font-semibold text-white">Branch Code:</span> {bank.branchCode}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-white text-sm flex items-start gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
                  <span>Your order details will be sent to your email and our admin email. We'll confirm your order shortly.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-4 lg:p-6 lg:sticky lg:top-24 shadow-lg text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Package className="w-6 h-6" />
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-4 border-b border-blue-400">
                    {item.img || item.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-blue-400">
                        <SmartImage
                          src={item.img || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-blue-400 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-sm text-blue-100">Qty: {item.qty || 1}</p>
                      <p className="text-white font-bold">Rs. {(item.price * (item.qty || 1)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-blue-400 my-6"></div>

              {/* Total */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-blue-100">
                  <span>Subtotal:</span>
                  <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>Shipping:</span>
                  <span className="text-green-200">Free</span>
                </div>
                {selectedPayment === 'cod' && (
                  <div className="flex justify-between text-yellow-200">
                    <span>Tax (4% COD):</span>
                    <span>Rs. {calculateTax().toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="bg-white/20 backdrop-blur rounded-lg p-4 mb-6 border border-white/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-white">Rs. {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={sendOrderEmail}
                disabled={submitting}
                className={`w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${submitting
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 active:scale-95 shadow-md'
                  }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-blue-100 text-center mt-4">
                By placing an order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
