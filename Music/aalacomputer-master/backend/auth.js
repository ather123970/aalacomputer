const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const User = require('./models/User.js');
const mongoose = require('mongoose');
const { generateToken, authMiddleware } = require('./middleware.js');

const router = express.Router();

const COOKIE_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? { httpOnly: true, secure: true, sameSite: 'none', path: '/' }
    : { httpOnly: true, secure: false, sameSite: 'lax', path: '/' };

// Register
router.post('/register', async (req, res) => {
  try {
    const { name = '', email, password, phone } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    // Try DB create when connected, otherwise fallback to file users.json for local dev
    try {
      if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
        const existing = await User.findOne({ email: String(email).toLowerCase() });
        if (existing) return res.status(409).json({ message: 'Email already in use' });
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email: String(email).toLowerCase(), password: hashed, phone });
        const token = generateToken({ id: user._id, email: user.email, name: user.name });
        res.cookie('token', token, COOKIE_OPTIONS);
        return res.status(201).json({ accessToken: token, user: { id: user._id, name: user.name, email: user.email } });
      }
    } catch (dbErr) {
      console.warn('[auth/register] DB create failed or DB not connected', dbErr && (dbErr.stack || dbErr.message || dbErr));
    }

    // File fallback: write to data/users.json for local development
    try {
      const dataDir = path.resolve(__dirname, '..', 'data');
      const usersPath = path.join(dataDir, 'users.json');
      let users = [];
      if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8') || '[]');
      }
      const lowEmail = String(email).toLowerCase();
      if (users.find(u => String(u.email).toLowerCase() === lowEmail)) return res.status(409).json({ message: 'Email already in use' });
      const hashed = await bcrypt.hash(password, 10);
      const newUser = { id: `u_${Date.now()}`, name, email: lowEmail, password: hashed, phone };
      users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
      const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.status(201).json({ accessToken: token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (fileErr) {
      console.error('[auth/register] file fallback failed', fileErr && (fileErr.stack || fileErr.message || fileErr));
      if (process.env.NODE_ENV !== 'production') return res.status(500).json({ message: 'Server error', details: String(fileErr && (fileErr.stack || fileErr.message)) });
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    // richer logging for debugging
    console.error('Register error:', err && (err.stack || err.message || err));
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', details: String(err && (err.stack || err.message)) });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log('[auth/login] request body email=', email ? String(email).toLowerCase() : null);
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    let user = null;
    // Only attempt DB lookup if mongoose is connected. If not connected, skip to file fallback to avoid
    // Mongoose buffering timeouts (which cause 500 errors when the DB is down).
    try {
      if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
        user = await User.findOne({ email: String(email).toLowerCase() });
        console.log('[auth/login] DB lookup ok, user=', !!user);
      } else {
        console.log('[auth/login] skipping DB lookup - mongoose not connected (readyState=', mongoose && mongoose.connection && mongoose.connection.readyState, ')');
      }
    } catch (dbErr) {
      console.warn('[auth] User.findOne failed (DB issue?)', dbErr && (dbErr.stack || dbErr.message || dbErr));
      // fallthrough to file-based fallback below
    }

    if (user && user.password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
      const token = generateToken({ id: user._id, email: user.email, name: user.name });
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.json({ accessToken: token, user: { id: user._id, name: user.name, email: user.email } });
    }

    // If DB didn't yield a user (or DB unreachable), attempt a safe file fallback for local dev
    try {
      const dataDir = path.resolve(__dirname, '..', 'data');
      const adminPath = path.join(dataDir, 'admin.json');
      console.log('[auth/login] checking admin file fallback at', adminPath);
      if (fs.existsSync(adminPath)) {
        const raw = fs.readFileSync(adminPath, 'utf8');
        const adm = JSON.parse(raw || '{}');
        console.log('[auth/login] admin file found, email=', adm && adm.email);
        if (adm && adm.email && String(adm.email).toLowerCase() === String(email).toLowerCase()) {
          const ok = await bcrypt.compare(String(password || ''), String(adm.passwordHash || ''));
          console.log('[auth/login] file fallback password ok=', ok);
          if (ok) {
            const fakeUser = { _id: 'file-admin', email: adm.email, name: adm.name || 'Admin' };
            const token = generateToken({ id: fakeUser._id, email: fakeUser.email, name: fakeUser.name });
            // ensure CORS credentials header in case client expects cookies
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.cookie('token', token, COOKIE_OPTIONS);
            return res.json({ accessToken: token, user: { id: fakeUser._id, name: fakeUser.name, email: fakeUser.email } });
          }
        }
      } else {
        console.log('[auth/login] admin file not present at', adminPath);
      }
    } catch (fileErr) {
      console.warn('[auth] file fallback failed', fileErr && (fileErr.stack || fileErr.message || fileErr));
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err && (err.stack || err.message || err));
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', details: String(err && (err.stack || err.message)) });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Handle file-based admin user
    if (req.user?.id === 'file-admin') {
      return res.json({ 
        user: { 
          id: 'file-admin', 
          name: 'Admin', 
          email: req.user.email, 
          phone: null 
        } 
      });
    }
    
    // Handle regular MongoDB users
    const user = await User.findById(req.user?.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error('Me error:', err && (err.stack || err.message || err));
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', details: String(err && (err.stack || err.message)) });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err && (err.stack || err.message || err));
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', details: String(err && (err.stack || err.message)) });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
