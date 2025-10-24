import { withCors } from '../_lib/cors.js';

export default function handler(req, res) {
  // apply CORS headers using existing helper
  withCors(req, res);

  const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '').split(',').map(s => (s || '').trim()).filter(Boolean);
  const ALLOW_ANY_ORIGIN = String(process.env.ALLOW_ANY_ORIGIN || '').toLowerCase() === 'true';
  const origin = req.headers && (req.headers.origin || req.headers.host) || null;

  return res.json({ ok: true, originSeen: origin, FRONTEND_ORIGINS: FRONTEND_ORIGINS, ALLOW_ANY_ORIGIN });
}
