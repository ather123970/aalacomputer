import { withCors } from '../_lib/cors.js';
import { hasMongo, readJSON, writeJSON } from '../_lib/storage.js';
import { getDbModels } from '../_lib/db.js';

function getSessionId(req) {
  return (req.headers['x-session-id'] || req.headers['session-id'] || req.cookies?.sessionId || null);
}

export default async function handler(req, res) {
  withCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // If no MONGO_URI configured, instruct the deployer to set one for production
  if (!hasMongo()) {
    // fall back to file-based behavior for local dev
    if (req.method === 'GET') {
      const cart = await readJSON('cart', []);
      return res.status(200).json(cart);
    }
    if (req.method === 'POST') {
      const payload = req.body;
      let cart = await readJSON('cart', []) || [];
      if (Array.isArray(payload)) cart = payload;
      else if (payload && payload.id) {
        const idx = cart.findIndex(i => String(i.id) === String(payload.id));
        if (idx === -1) cart.unshift({ ...payload, qty: payload.qty || 1 });
        else cart[idx] = { ...cart[idx], qty: (cart[idx].qty || 1) + (payload.qty || 1) };
      } else return res.status(400).json({ message: 'Invalid payload' });
      await writeJSON('cart', cart);
      return res.status(200).json({ ok: true, cart });
    }
    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id || null;
      if (!id) return res.status(400).json({ message: 'id required' });
      let cart = await readJSON('cart', []) || [];
      cart = cart.filter(i => String(i.id) !== String(id));
      await writeJSON('cart', cart);
      return res.status(200).json({ ok: true, cart });
    }
    res.setHeader('Allow', 'GET,POST,DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mongoose-backed behavior
  try {
    const { Cart } = await getDbModels();
    const sessionId = getSessionId(req);
    const userId = null; // If you implement auth, extract user id from JWT/cookie here

    if (req.method === 'GET') {
      const q = sessionId ? { sessionId } : (userId ? { userId } : {});
      const doc = await Cart.findOne(q).lean().exec();
      return res.status(200).json(doc ? doc.items || [] : []);
    }

    if (req.method === 'POST') {
      const payload = req.body;
      if (!payload) return res.status(400).json({ message: 'Invalid payload' });
      const q = sessionId ? { sessionId } : (userId ? { userId } : { sessionId: null });
      let cartDoc = await Cart.findOne(q).exec();
      if (!cartDoc) cartDoc = new Cart({ sessionId: sessionId || null, userId: userId || null, items: [] });
      if (Array.isArray(payload)) {
        cartDoc.items = payload.map(i => ({ id: String(i.id), name: i.name, price: Number(i.price || 0), img: i.img || '', qty: Number(i.qty || 1) }));
      } else if (payload && payload.id) {
        const idx = cartDoc.items.findIndex(it => String(it.id) === String(payload.id));
        if (idx === -1) cartDoc.items.unshift({ id: String(payload.id), name: payload.name || payload.Name || 'Item', price: Number(payload.price || 0), img: payload.img || '', qty: Number(payload.qty || 1) });
        else cartDoc.items[idx].qty = Number(payload.qty || cartDoc.items[idx].qty || 1);
      }
      await cartDoc.save();
      return res.status(200).json({ ok: true, cart: cartDoc.items });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id || null;
      if (!id) return res.status(400).json({ message: 'id required' });
      const q = sessionId ? { sessionId } : (userId ? { userId } : {});
      const cartDoc = await Cart.findOne(q).exec();
      if (!cartDoc) return res.status(404).json({ ok: false, message: 'cart not found' });
      cartDoc.items = cartDoc.items.filter(it => String(it.id) !== String(id));
      await cartDoc.save();
      return res.status(200).json({ ok: true, cart: cartDoc.items });
    }

    res.setHeader('Allow', 'GET,POST,DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error('cart mdb error', e && (e.stack || e.message));
    return res.status(500).json({ message: 'Server error: ' + String(e && (e.message || e)) });
  }
}
