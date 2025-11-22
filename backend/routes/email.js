// backend/routes/email.js
const express = require('express');
const router = express.Router();

// EmailJS configuration - You'll need to set these in .env
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_COD = process.env.EMAILJS_TEMPLATE_ID_COD;
const EMAILJS_TEMPLATE_ID_ONLINE = process.env.EMAILJS_TEMPLATE_ID_ONLINE;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aalacomputers.com';

// Send order email via EmailJS
router.post('/send-order-email', async (req, res) => {
  try {
    const {
      orderId,
      items,
      total,
      orderDate,
      paymentType,
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerZipCode,
      paymentMessage
    } = req.body;

    // Validate required fields
    if (!customerEmail || !orderId || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format items for email
    const itemsText = items
      .map(item => `${item.name} x${item.qty} @ PKR ${item.price} = PKR ${(item.qty * item.price).toFixed(0)}`)
      .join('\n');

    // Prepare email data
    const emailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: paymentType === 'Cash on Delivery' ? EMAILJS_TEMPLATE_ID_COD : EMAILJS_TEMPLATE_ID_ONLINE,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: customerEmail,
        admin_email: ADMIN_EMAIL,
        order_id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_city: customerCity,
        customer_zip: customerZipCode,
        items: itemsText,
        total_amount: total.toFixed(0),
        order_date: orderDate,
        payment_type: paymentType,
        payment_message: paymentMessage || '',
        order_details: `
Order ID: ${orderId}
Date: ${orderDate}
Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Address: ${customerAddress}, ${customerCity} ${customerZipCode}

Items:
${itemsText}

Total: PKR ${total.toFixed(0)}
Payment Method: ${paymentType}
${paymentMessage ? `\nPayment Message: ${paymentMessage}` : ''}
        `
      }
    };

    // Send via EmailJS API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      console.error('EmailJS error:', await response.text());
      // Don't fail the order if email fails
      return res.status(200).json({ 
        success: true, 
        message: 'Order processed. Email notification may have failed but order is saved.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Order email sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail the order if email fails
    res.status(200).json({ 
      success: true, 
      message: 'Order processed. Email notification failed but order is saved.' 
    });
  }
});

module.exports = router;
