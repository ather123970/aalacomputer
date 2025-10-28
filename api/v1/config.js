import { readJSON } from '../_lib/storage.js';
import { withCors } from '../_lib/cors.js';

export default async function handler(req, res) {
  withCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+923125066195';
  return res.status(200).json({ whatsapp: WHATSAPP_NUMBER });
}
