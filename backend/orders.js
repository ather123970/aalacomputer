const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Order = require('./models/Order.js');
const { authMiddleware } = require('./middleware.js');
const { readJSON, writeJSON } = require('./utils/storage.js');

const router = express.Router();

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

function getCartKey(req) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;
    if (!token) return 'cart';
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.id) return `cart:${decoded.id}`;
  } catch (e) {
    // ignore - fall back to global cart
  }
  return 'cart';
}

// Expose some runtime config for the frontend (non-sensitive)
router.get('/config', (req, res) => {
  const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+923125066195';
  res.json({ whatsapp: WHATSAPP_NUMBER });
});

// Send order details via WhatsApp (frontend handles the actual WhatsApp link)
// This endpoint just logs the order and returns confirmation
router.post('/send-whatsapp-order', async (req, res) => {
  try {
    const { items, total, customer, paymentMethod, message } = req.body;
    
    if (!items || !customer) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    // Log the order for admin reference
    console.log('[WhatsApp Order] New order received:', {
      customerName: customer.name,
      customerPhone: customer.phone,
      totalAmount: total,
      paymentMethod: paymentMethod,
      itemCount: items.length,
      timestamp: new Date().toISOString()
    });

    // Save order to storage
    const existing = await readJSON('orders', []);
    const newOrder = {
      id: 'whatsapp_' + Date.now(),
      createdAt: new Date().toISOString(),
      items: items,
      total: total,
      customer: customer,
      paymentMethod: paymentMethod,
      status: 'pending',
      source: 'whatsapp'
    };
    existing.unshift(newOrder);
    await writeJSON('orders', existing);

    return res.json({
      ok: true,
      message: 'Order received. Our team will contact you shortly.',
      orderId: newOrder.id
    });
  } catch (e) {
    console.error('Failed to process WhatsApp order:', e);
    return res.status(500).json({ ok: false, message: 'Failed to process order' });
  }
});

// Get cart - return persisted cart (demo storage) or empty array
router.get('/cart', async (req, res) => {
  try {
    const key = getCartKey(req);
    const cart = await readJSON(key, []);
    return res.json(cart);
  } catch (e) {
    console.error('Failed to read cart', e);
    return res.json([]);
  }
});

// Update cart - replace stored cart with posted array (or single item push)
router.post('/cart', async (req, res) => {
  const payload = req.body;
  try {
    const key = getCartKey(req);
    // If payload is an array, set it; if it's single product, push on top
    let cart = await readJSON(key, []);
    if (Array.isArray(payload)) {
      cart = payload;
    } else if (payload && payload.id) {
      // dedupe by id: increase qty if exists, otherwise push
      const idx = cart.findIndex(i => String(i.id) === String(payload.id));
      if (idx === -1) cart.unshift({ ...payload, qty: payload.qty || 1 });
      else cart[idx] = { ...cart[idx], qty: (cart[idx].qty || 1) + (payload.qty || 1) };
    } else {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    await writeJSON(key, cart);
    return res.json({ ok: true, cart });
  } catch (e) {
    console.error('Failed to update cart', e);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Create order - allow authenticated users, but also accept unauthenticated orders and persist to storage as fallback
router.post('/orders', async (req, res) => {
  const { items, total } = req.body || {};
  if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' });
  try {
    // If user is authenticated, create in DB
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (authHeader) {
      try {
        // reuse authMiddleware behavior: attempts to create order when token valid
        // but to avoid double-verifying, attempt DB write if possible
        const order = await Order.create({ userId: null, items, total });
        return res.json({ ok: true, order });
      } catch (dbErr) {
        console.warn('DB write failed, falling back to storage', dbErr);
      }
    }

    // Fallback: write to storage list of orders
    const existing = await readJSON('orders', []);
    const newOrder = { id: 'local_' + Date.now(), createdAt: new Date().toISOString(), items, total };
    existing.unshift(newOrder);
    await writeJSON('orders', existing);
    return res.json({ ok: true, order: newOrder });
  } catch (e) {
    console.error('Failed to create order', e);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get orders for authenticated user or local stored orders
router.get('/orders', async (req, res) => {
  try {
    // if token provided and valid, return DB orders (not implemented fully)
    const stored = await readJSON('orders', []);
    return res.json(stored);
  } catch (e) {
    console.error('Failed to read orders', e);
    return res.json([]);
  }
});

// Get single order by id (DB or storage fallback)
router.get('/orders/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // Try DB lookup first
    try {
      if (Order && typeof Order.findById === 'function') {
        const dbOrder = await Order.findById(id).lean().exec();
        if (dbOrder) return res.json({ ok: true, order: dbOrder });
      }
    } catch (dbErr) {
      // continue to storage fallback
    }

    // Fallback: read from storage file
    const stored = await readJSON('orders', []);
    const found = (stored || []).find(o => String(o.id) === String(id) || String(o._id) === String(id));
    if (found) return res.json({ ok: true, order: found });
    return res.status(404).json({ ok: false, message: 'Order not found' });
  } catch (e) {
    console.error('Failed to read order', e);
    return res.status(500).json({ ok: false, message: 'Failed to read order' });
  }
});

// Delete item from cart
// DELETE by path param (e.g. /cart/:id)
router.delete('/cart/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id || '');
    if (!id) return res.status(400).json({ ok: false, message: 'Missing id' });
    const key = getCartKey(req);
    let cart = await readJSON(key, []);
    const idx = cart.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Item not found' });
    cart.splice(idx, 1);
    await writeJSON(key, cart);
    return res.json({ ok: true, cart });
  } catch (e) {
    console.error('Failed to delete cart item', e);
    return res.status(500).json({ ok: false, message: 'Failed to delete item' });
  }
});

// DELETE by query param or body (e.g. /cart?id=... or DELETE /cart with JSON body { id })
router.delete('/cart', async (req, res) => {
  try {
    const id = decodeURIComponent(req.query.id || req.body?.id || '');
    if (!id) return res.status(400).json({ ok: false, message: 'Missing id' });
    const key = getCartKey(req);
    let cart = await readJSON(key, []);
    const idx = cart.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Item not found' });
    cart.splice(idx, 1);
    await writeJSON(key, cart);
    return res.json({ ok: true, cart });
  } catch (e) {
    console.error('Failed to delete cart item', e);
    return res.status(500).json({ ok: false, message: 'Failed to delete item' });
  }
});

module.exports = router;
