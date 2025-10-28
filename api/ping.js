import { withCors } from './_lib/cors.js';

export default function handler(req, res) {
  withCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(200).json({ ok: true, ts: Date.now() });
}
