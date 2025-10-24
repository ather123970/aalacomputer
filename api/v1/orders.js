import { readJSON, writeJSON, hasMongo } from '../_lib/storage.js';
import { withCors } from '../_lib/cors.js';
import { getDbModels } from '../_lib/db.js';

export default async function handler(req, res) {
  withCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!hasMongo()) {
    if (req.method === 'GET') {
      const orders = await readJSON('orders', []);
      return res.status(200).json(orders);
    }
    if (req.method === 'POST') {
      try {
        const { items, total } = req.body || {};
        if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' });
        const existing = await readJSON('orders', []) || [];
        const newOrder = { id: 'local_' + Date.now(), createdAt: new Date().toISOString(), items, total };
        existing.unshift(newOrder);
        await writeJSON('orders', existing);
        return res.status(200).json({ ok: true, order: newOrder });
      } catch (e) {
        console.error('orders POST error', e);
        return res.status(500).json({ message: 'Failed to create order' });
      }
    }
    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { Order } = await getDbModels();
    if (req.method === 'GET') {
      const docs = await Order.find({}).lean().sort({ createdAt: -1 }).exec();
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      const { items, total } = req.body || {};
      if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' });
      const doc = new Order({ items, total: Number(total || 0) });
      await doc.save();
      return res.status(200).json({ ok: true, order: doc.toObject() });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error('orders mdb error', e && (e.stack || e.message));
    return res.status(500).json({ message: 'Server error' });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ message: 'Method not allowed' });
}
