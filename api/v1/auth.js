import { readJSON, writeJSON, hasMongo } from '../_lib/storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { withCors } from '../_lib/cors.js';
import { getDbModels } from '../_lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

export default async function handler(req, res) {
  withCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST' && req.url.endsWith('/register')) {
    const { name = '', email, password, phone } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const low = String(email).toLowerCase();
    if (hasMongo()) {
      const { User } = await getDbModels();
      const existing = await User.findOne({ email: low }).lean().exec();
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      const hashed = await bcrypt.hash(password, 10);
      const u = new User({ name, email: low, password: hashed, phone });
      await u.save();
      const token = jwt.sign({ id: u._id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ accessToken: token, user: { id: u._id, name: u.name, email: u.email } });
    }
    const users = await readJSON('users', []) || [];
    if (users.find(u => String(u.email).toLowerCase() === low)) return res.status(409).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: `u_${Date.now()}`, name, email: low, password: hashed, phone };
    users.push(newUser);
    await writeJSON('users', users);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ accessToken: token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  }

  if (req.method === 'POST' && req.url.endsWith('/login')) {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (hasMongo()) {
      const { User } = await getDbModels();
      const u = await User.findOne({ email: String(email).toLowerCase() }).exec();
      if (!u) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(String(password), String(u.password || ''));
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: u._id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ accessToken: token, user: { id: u._id, name: u.name, email: u.email } });
    }
    const users = await readJSON('users', []) || [];
    const user = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(password), String(user.password || ''));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ accessToken: token, user: { id: user.id, name: user.name, email: user.email } });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
