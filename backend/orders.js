import express from 'express'
import Order from './models/Order.js'
import { authMiddleware } from './middleware.js'
import { readJSON, writeJSON } from './utils/storage.js'

const router = express.Router()

// Expose some runtime config for the frontend (non-sensitive)
router.get('/config', (req, res) => {
  const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+923125066195'
  res.json({ whatsapp: WHATSAPP_NUMBER })
})

// Get cart - return persisted cart (demo storage) or empty array
router.get('/cart', async (req, res) => {
  try {
    const cart = await readJSON('cart', [])
    return res.json(cart)
  } catch (e) {
    console.error('Failed to read cart', e)
    return res.json([])
  }
})

// Update cart - replace stored cart with posted array (or single item push)
router.post('/cart', async (req, res) => {
  const payload = req.body
  try {
    // If payload is an array, set it; if it's single product, push on top
    let cart = await readJSON('cart', [])
    if (Array.isArray(payload)) {
      cart = payload
    } else if (payload && payload.id) {
      // dedupe by id: increase qty if exists, otherwise push
      const idx = cart.findIndex(i => i.id === payload.id)
      if (idx === -1) cart.unshift({ ...payload, qty: payload.qty || 1 })
      else cart[idx] = { ...cart[idx], qty: (cart[idx].qty || 1) + (payload.qty || 1) }
    } else {
      return res.status(400).json({ message: 'Invalid payload' })
    }
    await writeJSON('cart', cart)
    return res.json({ ok: true, cart })
  } catch (e) {
    console.error('Failed to update cart', e)
    return res.status(500).json({ message: 'Failed to update cart' })
  }
})

// Create order - allow authenticated users, but also accept unauthenticated orders and persist to storage as fallback
router.post('/orders', async (req, res) => {
  const { items, total } = req.body || {}
  if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' })
  try {
    // If user is authenticated, create in DB
    const authHeader = req.headers.authorization || req.cookies?.token
    if (authHeader) {
      try {
        // reuse authMiddleware behavior: attempts to create order when token valid
        // but to avoid double-verifying, attempt DB write if possible
        const order = await Order.create({ userId: null, items, total })
        return res.json({ ok: true, order })
      } catch (dbErr) {
        console.warn('DB write failed, falling back to storage', dbErr)
      }
    }

    // Fallback: write to storage list of orders
    const existing = await readJSON('orders', [])
    const newOrder = { id: 'local_' + Date.now(), createdAt: new Date().toISOString(), items, total }
    existing.unshift(newOrder)
    await writeJSON('orders', existing)
    return res.json({ ok: true, order: newOrder })
  } catch (e) {
    console.error('Failed to create order', e)
    return res.status(500).json({ message: 'Failed to create order' })
  }
})

// Get orders for authenticated user or local stored orders
router.get('/orders', async (req, res) => {
  try {
    // if token provided and valid, return DB orders (not implemented fully)
    const stored = await readJSON('orders', [])
    return res.json(stored)
  } catch (e) {
    console.error('Failed to read orders', e)
    return res.json([])
  }
})

// Get single order by id (DB or storage fallback)
router.get('/orders/:id', async (req, res) => {
  const id = req.params.id
  try {
    // Try DB lookup first
    try {
      if (Order && typeof Order.findById === 'function') {
        const dbOrder = await Order.findById(id).lean().exec()
        if (dbOrder) return res.json({ ok: true, order: dbOrder })
      }
    } catch (dbErr) {
      // continue to storage fallback
    }

    // Fallback: read from storage file
    const stored = await readJSON('orders', [])
    const found = (stored || []).find(o => String(o.id) === String(id) || String(o._id) === String(id))
    if (found) return res.json({ ok: true, order: found })
    return res.status(404).json({ ok: false, message: 'Order not found' })
  } catch (e) {
    console.error('Failed to read order', e)
    return res.status(500).json({ ok: false, message: 'Failed to read order' })
  }
})

// Delete item from cart
router.delete('/cart/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id || '')
    let cart = await readJSON('cart', [])
    const idx = cart.findIndex(c => String(c.id) === String(id))
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Item not found' })
    cart.splice(idx, 1)
    await writeJSON('cart', cart)
    return res.json({ ok: true, cart })
  } catch (e) {
    console.error('Failed to delete cart item', e)
    return res.status(500).json({ ok: false, message: 'Failed to delete item' })
  }
})

export default router
