import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, MapPin, User, Wallet, MessageCircle, CheckCircle, AlertCircle, Loader, ArrowLeft, Package, DollarSign, Upload, ChevronDown, Copy, Check, CreditCard, Smartphone, Building2, Eye, EyeOff } from 'lucide-react'
import Navbar from '../nav'
import SmartImage from '../components/SmartImage'
import { API_BASE } from '../config'

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
    name: 'Pay Online',
    desc: 'Bank Transfer',
    icon: '🏦'
  }
}

const ONLINE_PAYMENT_METHODS = {
  JAZZCASH: {
    id: 'jazzcash',
    name: 'JazzCash',
    desc: 'Mobile wallet payment',
    icon: '📱'
  },
  EASYPAISA: {
    id: 'easypaisa',
    name: 'EasyPaisa',
    desc: 'Mobile wallet payment',
    icon: '💳'
  },
  BANK: {
    id: 'bank',
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

  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState('bank')
  const [paymentProof, setPaymentProof] = useState(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [showBankDetails, setShowBankDetails] = useState(false)

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
      const response = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/v1/config`)
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)
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

    // Validate payment proof for online payments
    if (selectedPayment === 'online' && !paymentProof) {
      errors.paymentProof = 'Payment proof is required for online payments'
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

  const formatOrderDetails = () => {
    const total = calculateTotal()
    const paymentMethod = PAYMENT_METHODS[selectedPayment.toUpperCase()] || PAYMENT_METHODS.COD
    
    let message = `*🛒 NEW ORDER FROM AALA COMPUTER*\n\n`
    message += `*Customer Details:*\n`
    message += `👤 Name: ${formData.fullName}\n`
    message += `📧 Email: ${formData.email}\n`
    message += `📱 Phone: ${formData.phone}\n`
    message += `📍 Address: ${formData.address}, ${formData.city}\n\n`
    
    message += `*Order Items:*\n`
    cartItems.forEach((item, idx) => {
      const itemTotal = item.price * (item.qty || 1)
      message += `${idx + 1}. ${item.name}\n`
      message += `   💰 Price: Rs. ${item.price.toLocaleString()}\n`
      message += `   📦 Qty: ${item.qty || 1}\n`
      message += `   ✓ Total: Rs. ${itemTotal.toLocaleString()}\n\n`
    })
    
    message += `*Order Summary:*\n`
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`
    message += `💵 Total Amount: Rs. ${total.toLocaleString()}\n`
    message += `💳 Payment Method: ${paymentMethod.name}\n`
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `✅ Order Status: PENDING\n`
    message += `🕐 Timestamp: ${new Date().toLocaleString()}\n`
    
    return message
  }

  const sendToWhatsApp = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const total = calculateTotal()
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty || 1,
          image: item.img || item.image
        })),
        total: total,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        paymentMethod: selectedPayment,
        onlinePaymentMethod: selectedPayment === 'online' ? selectedOnlineMethod : null,
        message: formatOrderDetails()
      }

      // Send order to backend first
      try {
        const response = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/v1/send-whatsapp-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Order saved to backend:', result)
        }
      } catch (err) {
        console.error('Failed to save order to backend:', err)
      }

      // Open WhatsApp with formatted message
      const message = formatOrderDetails()
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodedMessage}`
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank')

      // Clear cart
      localStorage.removeItem('aala_cart')
      
      // Show success message
      setOrderPlaced(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (err) {
      console.error('Error placing order:', err)
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
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-lg">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold text-green-700 mb-4">Order Placed Successfully! ✅</h1>
            <p className="text-xl text-gray-700 mb-4">
              Your order has been sent to WhatsApp. Our team will contact you shortly to confirm.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Redirecting to home page in 3 seconds...
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md"
            >
              Back to Home
            </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
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
                    className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
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

            {/* Payment Method */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-blue-400" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <h3 className="font-bold text-white mb-1">{method.name}</h3>
                    <p className="text-sm text-gray-400">{method.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Your order details will be sent to WhatsApp. Our team will confirm and process your order shortly.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-900/30 to-slate-800/50 border border-blue-500/30 rounded-2xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-400" />
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-700">
                    {item.img || item.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                        <SmartImage
                          src={item.img || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-sm text-gray-400">Qty: {item.qty || 1}</p>
                      <p className="text-blue-400 font-bold">Rs. {(item.price * (item.qty || 1)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-slate-600 my-6"></div>

              {/* Total */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>Included</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-white">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={sendToWhatsApp}
                disabled={submitting}
                className={`w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  submitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:scale-95'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Place Order via WhatsApp
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By placing an order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
