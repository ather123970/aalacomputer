// Load environment variables from .env when present (optional)
try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }
// Global crash handlers to surface issues when the process exits unexpectedly.
process.on('uncaughtException', (err) => {
  console.error('[global] uncaughtException', err && (err.stack || err.message || err));
});
process.on('unhandledRejection', (reason, p) => {
  console.error('[global] unhandledRejection', reason && (reason.stack || reason));
});
const crypto = require('crypto');
// Optional verification hash helper - only compute when a valid user id and secret are available.
let hash = null;
try {
  const userId = (typeof process !== 'undefined' && process.env && process.env.STARTUP_USER_ID) ? String(process.env.STARTUP_USER_ID) : null;
  const secret = (typeof process !== 'undefined' && process.env && process.env.SECRET) ? process.env.SECRET : process.env && process.env.secret;
  if (userId && secret) {
    hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');
    // expose for debugging if needed
    // console.log('[startup] verification hash computed');
  }
} catch (e) {
  // don't crash server during startup for missing/invalid vars
  hash = null;
}
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app=express()
// Trust proxy so req.protocol/hostname respect X-Forwarded-* when behind load balancers/proxies
app.set('trust proxy', true);

// Flexible CORS: allow any origin for maximum compatibility
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID'],
}));
// Note: preflight OPTIONS are handled by the cors middleware and a lightweight
// OPTIONS responder in the logging middleware below.
// Configure mongoose early to avoid command buffering when DB is down (prevents long timeouts)
let mongoose = null;
try {
  mongoose = require('mongoose');
  try { mongoose.set('bufferCommands', false); } catch (e) { /* ignore */ }
} catch (e) {
  mongoose = null;
}

const DATA_DIR = path.resolve(__dirname, '..', 'data');

function safeLoadJSON(filename) {
  const p = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn('safeLoadJSON failed for', filename, e && e.message);
    return null;
  }
}

const partsDB = safeLoadJSON('parts.json') || [];
const productsCatalog = safeLoadJSON('products.json') || [];
const pkPrices = safeLoadJSON('pk_prices.json') || [];
const marketKB = safeLoadJSON('pk_market_kb.json') || { templates: [] };

function normalize(s) {
  if (!s) return '';
  return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseBudget(text) {
  if (!text) return null;
  const s = String(text || '').toLowerCase();
  let m = s.match(/(under|below|less than|budget|<=|<)\s*([0-9,.]+)\s*(k|m)?\s*(rs|pkr)?/i);
  if (!m) {
    m = s.match(/([0-9,.]+)\s*(k|m)?\s*(rs|pkr)/i);
  }
  if (!m) return null;
  let n = Number(String(m[2]).replace(/[,]/g, '')) || 0;
  const mult = (m[3] || '').toLowerCase() === 'k' ? 1000 : ( (m[3] || '').toLowerCase() === 'm' ? 1000000 : 1 );
  return Math.round(n * mult);
}

function extractOwnedParts(text) {
  if (!text) return [];
  let tokens = normalize(text).split(' ').filter(Boolean);
  if (!Array.isArray(tokens)) tokens = [];
  const MAX_TOKENS = 200;
  if (tokens.length > MAX_TOKENS) tokens = tokens.slice(0, MAX_TOKENS);
  const owned = [];
  const seenIds = new Set();
  const ngrams = [];
  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i + n <= tokens.length; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }
  const ownershipContext = /\b(i have|i own|my |owned|i'm using|using|i use|i've got|i got)\b/i.test(text);
  for (const p of partsDB) {
    const hay = normalize([p.name || p.model || p.id || ''].join(' '));
    for (const ng of ngrams) {
      if (ng.length < 2) continue;
      const isModelLike = /\b(rt x?\s*\d{3,4}|rx\s*\d{3,4}|gtx\s*\d{3,4}|i\d[-\s]?\d{3,4}|ryzen\s*\d)\b/i.test(ng);
      if (hay.includes(ng) && (ownershipContext || isModelLike)) {
        if (!seenIds.has(p.id)) {
          owned.push(p);
          seenIds.add(p.id);
        }
        break;
      }
    }
  }
  for (const pk of pkPrices) {
    const hay = normalize(pk.name || pk.model || '');
    for (const ng of ngrams) {
      if (ng.length < 2) continue;
      if (hay.includes(ng)) {
        const key = `${pk.name}|${pk.model}|pk`;
        const isModelLike = /\b(rt x?\s*\d{3,4}|rx\s*\d{3,4}|gtx\s*\d{3,4}|i\d[-\s]?\d{3,4}|ryzen\s*\d)\b/i.test(ng);
        if (!seenIds.has(key) && (ownershipContext || isModelLike)) {
          let cat = null;
          if (/rtx|gtx|rx|radeon/.test((pk.model || '') + ' ' + (pk.name || ''))) cat = 'gpu';
          if (/i\d|ryzen|athlon/.test((pk.model || '') + ' ' + (pk.name || ''))) cat = 'cpu';
          if (/mb|b660|b760|b650|motherboard/.test((pk.model || '') + ' ' + (pk.name || ''))) cat = 'motherboard';
          owned.push({ source: 'pk', name: pk.name, model: pk.model, price: pk.price, category: cat });
          seenIds.add(key);
        }
        break;
      }
    }
  }
  const modelPatterns = [];
  const regexes = [/(rtx\s*\d{3,4})/i, /(rx\s*\d{3,4})/i, /(ryzen\s*5\b|ryzen\s*7\b|ryzen\s*9\b)/i, /(i\d[-\s]?\d{3,4})/i, /(gtx\s*\d{3,4})/i];
  for (const re of regexes) {
    const cre = new RegExp(re.source, (re.flags || '') + 'g');
    let m;
    while ((m = cre.exec(text)) !== null) {
      if (m && m[1]) modelPatterns.push(m[1]);
    }
  }
  for (const mp of modelPatterns) {
    const name = mp.toUpperCase();
    if (!owned.find(o => normalize(o.name || o.model || '').includes(normalize(name)))) {
      const found = pkPrices.find(pk => normalize(pk.model || pk.name || '').includes(normalize(mp)));
      const price = found ? (found.price || 0) : 0;
      let cat = null;
      if (/rtx|gtx|rx|radeon/.test(mp.toLowerCase())) cat = 'gpu';
      if (/ryzen|i\d/.test(mp.toLowerCase())) cat = 'cpu';
      if (ownershipContext) owned.push({ source: 'fuzzy', name: name, model: name, price: price, category: cat });
    }
  }
  return owned;
}

function extractExplicitModels(text) {
  if (!text) return [];
  const regexes = [/\b(rtx\s*\d{3,4})\b/i, /\b(rx\s*\d{3,4})\b/i, /\b(gtx\s*\d{3,4})\b/i, /\b(ryzen\s*\d)\b/i, /\b(i\d[-\s]?\d{3,4})\b/i];
  const out = [];
  for (const re of regexes) {
    const cre = new RegExp(re.source, (re.flags || '') + 'g');
    let m;
    while ((m = cre.exec(text)) !== null) {
      if (m && m[1]) {
        const tok = m[1].toUpperCase().replace(/\s+/g, ' ').trim();
        if (!out.includes(tok)) out.push(tok);
      }
    }
  }
  return out;
}

function pickCheapest(category, excludeIds = new Set()) {
  const candidates = [];
  for (const p of partsDB) {
    const cat = (p.category || '').toLowerCase();
    if (!cat) continue;
    if (cat === category) candidates.push(p);
  }
  candidates.sort((a, b) => (a.price_pkr || a.price || 0) - (b.price_pkr || b.price || 0));
  for (const c of candidates) {
    if (excludeIds.has(c.id)) continue;
    return c;
  }
  return null;
}

function scoreMatch(q, t) {
  const a = normalize(q);
  const b = normalize(t);
  if (!a || !b) return 0;
  if (b.includes(a)) return 100;
  const qt = a.split(' ');
  let matches = 0;
  for (const token of qt) if (token && b.includes(token)) matches += 1;
  return Math.round((matches / Math.max(1, qt.length)) * 100);
}

function lookupPartsAndPrices(query, limit = 6) {
  const q = String(query || '');
  const out = [];
  for (const item of pkPrices) {
    const txt = `${item.name || ''} ${item.model || ''} ${item.vendor || ''}`;
    const s = scoreMatch(q, txt);
    if (s > 10) {
      const img = item.img || item.image || item.thumb || null;
      const imgName = img ? String(img).split('/').pop().split('?')[0] : null;
      out.push({ source: 'pk', score: s, name: item.name, model: item.model, vendor: item.vendor, price: item.price, url: item.url, catalogId: item.catalogId, img, imgName, buyUrl: item.url || null });
    }
  }
  for (const p of partsDB) {
    const txt = `${p.name || ''} ${p.id || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''} ${p.model || ''}`;
    const s = scoreMatch(q, txt);
    if (s > 20) out.push({ source: 'parts', score: s, id: p.id, name: p.name, price: p.price || null, specs: p.specs || [], type: p.type || 'part' });
  }
  for (const c of productsCatalog) {
    const txt = `${c.name || c.Name || ''} ${c.id || ''} ${Array.isArray(c.tags) ? c.tags.join(' ') : ''}`;
    const s = scoreMatch(q, txt);
    if (s > 20) {
      const img = c.img || c.image || null;
      const imgName = img ? String(img).split('/').pop().split('?')[0] : null;
      const buyUrl = `/products/${c.id}`;
      out.push({ source: 'catalog', score: s, id: c.id, name: c.name || c.Name, price: c.price || null, img, imgName, url: buyUrl, buyUrl });
    }
  }
  out.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.source === 'pk' && b.source !== 'pk') return -1;
    if (b.source === 'pk' && a.source !== 'pk') return 1;
    return 0;
  });
  return out.slice(0, limit);
}

let fetchFn = (typeof fetch !== 'undefined') ? fetch : null;
try {
  if (!fetchFn) fetchFn = require('node-fetch');
} catch (e) {
}

async function safeFetch(url, opts = {}, timeoutMs = 6000) {
  if (!fetchFn) return null;
  try {
    const p = fetchFn(url, opts);
    const t = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const r = await Promise.race([p, t]);
    return r;
  } catch (e) {
    return null;
  }
}

// AI integrations removed: callGroqAI and callGroqChat were intentionally deleted.

function searchLocalData(query, limit = 6) {
  if (!query) return [];
  const norm = normalize(query);
  const files = [];
  try {
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (!f.toLowerCase().endsWith('.json')) continue;
      files.push(path.join(DATA_DIR, f));
    }
  } catch (e) {
    return [];
  }
  const results = [];
  for (const fp of files) {
    try {
      const raw = fs.readFileSync(fp, 'utf8');
      const obj = JSON.parse(raw);
      const s = JSON.stringify(obj).toLowerCase();
      if (s.includes(norm)) {
        results.push({ file: path.basename(fp), snippet: s.slice(0, 1000), data: obj });
        if (results.length >= limit) break;
      }
    } catch (e) {
    }
  }
  return results;
}

// Web search integration removed (Serper). If you need a web search in future, re-add here.

/* /api/ask handler moved to after Express `app` initialization to avoid referencing `app` before it's created. */// CORS: allow credentials and restrict allowed origins (do NOT use wildcard when credentials are included)
// Set FRONTEND_ORIGINS env to a comma-separated list of allowed origins, e.g. "http://localhost:5173"
// By default include common localhost/127.0.0.1 origins used during development
// and a couple of production hostnames so the server will accept requests
// from the deployed frontend when FRONTEND_ORIGINS is not set.
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
  'https://aalacomputerkarachi.vercel.app',
  'https://aalacomputer.com'
];
// Allow either FRONTEND_ORIGINS (comma-separated) or a single FRONTEND_ORIGIN for convenience
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',')
  : (process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : DEFAULT_ORIGINS)
).map(s => s.trim()).filter(Boolean);
console.log('[server] allowed FRONTEND_ORIGINS =', FRONTEND_ORIGINS);
// Lightweight logging middleware for diagnostics. The global `cors()` above
// handles actual CORS headers (echoing incoming Origin when appropriate).
app.use((req, res, next) => {
  const origin = req.headers && req.headers.origin;
  const host = req.headers && req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  console.log('[server] request', req.method, req.url, 'origin=', origin || '-', 'host=', host || '-', 'proto=', proto || '-');
  // let the cors() middleware handle preflight; but respond early for non-browser health checks
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// cookie parser (required for auth middleware that reads req.cookies)
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Serve static files from the dist directory (built frontend)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  // Serve static files with proper headers and MIME types
  app.use(express.static(distPath, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set proper MIME types for different file types
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.js.map')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
    }
  }));
  console.log('[server] serving static files from:', distPath);
} else {
  console.warn('[server] dist directory not found at:', distPath);
}

// Try to mount the ESM auth router if present (backend/auth.js uses ESM exports)
(async () => {
  try {
    const { pathToFileURL } = require('url');
    const authPath = path.join(__dirname, 'auth.js');
    if (fs.existsSync(authPath)) {
      const mod = await import(pathToFileURL(authPath).href);
      const authRouter = mod && mod.default ? mod.default : mod;
      if (authRouter && typeof authRouter === 'function') {
        app.use('/api/v1/auth', authRouter);
        console.log('[server] mounted /api/v1/auth from auth.js');
      }
    }
  } catch (e) {
    console.warn('[server] failed to mount auth router', e && e.message);
  }
  // Try to mount orders router (ESM) if present
  try {
    const { pathToFileURL } = require('url');
    const ordersPath = path.join(__dirname, 'orders.js');
    if (fs.existsSync(ordersPath)) {
      const mod = await import(pathToFileURL(ordersPath).href);
      const ordersRouter = mod && mod.default ? mod.default : mod;
      if (ordersRouter && typeof ordersRouter === 'function') {
        app.use('/api/v1', ordersRouter);
        console.log('[server] mounted /api/v1 routes from orders.js');
      }
    }
  } catch (e) {
    console.warn('[server] failed to mount orders router', e && e.message);
  }
})();

// in-memory cart (dev)
const CART = [];

app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// New endpoint implementing Groq-first -> local -> Serper -> Groq-final pipeline
// AI assistant removed. Return 404 for `/api/ask` to make any frontend calls fail fast.
app.post('/api/ask', (req, res) => {
  return res.status(404).json({ error: 'AI assistant removed from this server' });
});

// Cart POST route moved to orders.js

// Cart GET route moved to orders.js

// Cart DELETE route moved to orders.js

// /api/chat endpoint removed

// --- Admin endpoints (simple password-protected via shared secret) ---
// Attempt to use mongoose Product model when available
// Product schema definition (kept separate from model instantiation)
let ProductModel = null;
const ProductSchemaDef = {
  id: { type: String, index: true, unique: true },
  name: String,
  title: String,
  price: null, // use Mixed at model creation time
  img: String,
  imageUrl: String,
  description: String,
  category: String,
  tags: [String],
  specs: [String],
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

function getProductModel() {
  try {
    const mongoose = require('mongoose');
    if (!mongoose) return null;
    // If model already created on mongoose, return it
    if (mongoose.models && mongoose.models.Product) return mongoose.models.Product;
    // Build schema now using mongoose.Schema.Types.Mixed for price
    const schema = new mongoose.Schema(Object.assign({}, ProductSchemaDef, { price: mongoose.Schema.Types.Mixed }), { timestamps: true });
    return mongoose.model('Product', schema);
  } catch (err) {
    console.error('[getProductModel] failed to get/create Product model', err && (err.stack || err.message));
    return null;
  }
}
// Try to load Admin model
let AdminModel = null;
try {
  AdminModel = require(path.join(__dirname, 'models', 'Admin.js'));
} catch (e) {
  AdminModel = null;
}

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret_change_this';

// helper: read/write admin file fallback
function readAdminFile() {
  return readDataFile('admin.json') || null;
}

function writeAdminFile(obj) {
  return writeDataFile('admin.json', obj);
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'aalacomputerstore@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'karachi123';
  try {
    if (AdminModel && mongoose.connection.readyState === 1) {
      // Delete ALL existing admins
      await AdminModel.deleteMany({});
      console.log('[admin] Removed all existing admin users');
      
      // Create only the required admin
      const hash = await bcrypt.hash(password, 10);
      await new AdminModel({ email, passwordHash: hash, name: 'Site Admin', role: 'admin' }).save();
      console.log('[admin] Created single admin user:', email);
      return;
    }
  } catch (e) {
    console.warn('[admin] ensureAdminUser DB check failed', e && e.message);
  }
  // file fallback: create admin.json if missing
  const adm = readAdminFile();
  if (!adm || !adm.email) {
    const hash = await bcrypt.hash(password, 10);
    writeAdminFile({ email, passwordHash: hash, name: 'Site Admin' });
    console.log('[admin] default admin created in data/admin.json:', email);
  }
}
function readDataFile(filename) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn('readDataFile failed', filename, e && e.message);
    return null;
  }
}

function writeDataFile(filename, data) {
  try {
    const p = path.join(DATA_DIR, filename);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('writeDataFile failed', filename, e && e.message);
    return false;
  }
}

// Admin login: POST /api/admin/login { username, password } or { email, password }
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const loginEmail = email || username;
    if (!loginEmail || !password) return res.status(400).json({ ok: false, error: 'email/username and password required' });

    // Try DB first
    try {
      if (AdminModel && mongoose.connection.readyState === 1) {
        const admin = await AdminModel.findOne({ email: String(loginEmail).toLowerCase() }).lean();
        if (!admin) return res.status(401).json({ ok: false, error: 'invalid credentials' });
        const ok = await bcrypt.compare(String(password), String(admin.passwordHash || ''));
        if (!ok) return res.status(401).json({ ok: false, error: 'invalid credentials' });
        const token = jwt.sign({ sub: admin.email, role: admin.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ ok: true, token });
      }
    } catch (e) {
      console.warn('[admin] DB login attempt failed', e && e.message);
    }

    // Fallback to admin.json file
    const adm = readAdminFile();
    if (!adm || !adm.email) return res.status(500).json({ ok: false, error: 'admin not configured' });
    if (String(adm.email).toLowerCase() !== String(loginEmail).toLowerCase()) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    const ok = await bcrypt.compare(String(password), String(adm.passwordHash || ''));
    if (!ok) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    const token = jwt.sign({ sub: adm.email, role: adm.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ ok: true, token });
  } catch (e) {
    console.error('/api/admin/login error', e && e.stack || e);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
});

function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  if (!auth) {
    console.log('[admin] no authorization header');
    return false;
  }
  
  const parts = String(auth || '').split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];
  if (!token) {
    console.log('[admin] no token found in authorization header');
    return false;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[admin] token verified for:', decoded.sub);
    return decoded; // truthy admin payload
  } catch (e) {
    console.log('[admin] token verification failed:', e.message);
    return false;
  }
}

// List products
app.get('/api/admin/products', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  // If mongoose available, use DB
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.find({}).lean().sort({ createdAt: -1 }).then((docs) => res.json({ ok: true, products: docs })).catch(err => { console.error('[admin/products] product find failed', err && (err.stack || err.message)); res.status(500).json({ ok: false, error: 'db error' }); });
      return;
    }
  } catch (e) { console.error('[admin/products] error', e && (e.stack || e.message)); }
  const prods = readDataFile('products.json') || [];
  res.json({ ok: true, products: prods });
});

// Update product by id (replace object)
app.put('/api/admin/products/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const id = req.params.id;
  const payload = req.body || {};
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.findOneAndUpdate({ id: String(id) }, { $set: { ...payload, updatedAt: new Date() } }, { new: true, upsert: false }).lean().then(doc => {
        if (!doc) return res.status(404).json({ ok: false, error: 'product not found' });
        return res.json({ ok: true, product: doc });
      }).catch(err => { console.error('[admin/products/:id] product update failed', err && (err.stack || err.message)); res.status(500).json({ ok: false, error: 'db error' }); });
      return;
    }
  } catch (e) { /* fallback */ }
  const prods = readDataFile('products.json') || [];
  const idx = prods.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return res.status(404).json({ ok: false, error: 'product not found' });
  // Merge/replace
  prods[idx] = { ...prods[idx], ...payload };
  const ok = writeDataFile('products.json', prods);
  if (!ok) return res.status(500).json({ ok: false, error: 'failed to save' });
  res.json({ ok: true, product: prods[idx] });
});

// Create new product
app.post('/api/admin/products', async (req, res) => {
  try {
    // Verify admin authentication
    if (!requireAdmin(req)) {
      console.log('[product] Unauthorized create attempt');
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    // Validate payload
    const payload = req.body || {};
    if (!payload.name && !payload.title) {
      return res.status(400).json({ ok: false, error: 'Product name or title is required' });
    }

    if (!payload.price || isNaN(payload.price)) {
      return res.status(400).json({ ok: false, error: 'Valid price is required' });
    }

    try {
      const mongoose = require('mongoose');
      const ProductModel = getProductModel();
      // Check MongoDB connection
      if (!mongoose.connection.readyState) {
        console.log('[product] MongoDB not connected, attempting reconnection...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Aalacomputer', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          connectTimeoutMS: 5000
        });
      }

      if (ProductModel && mongoose.connection.readyState === 1) {
        // Generate unique ID
        const id = payload.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Create product document
        const doc = new ProductModel({
          id,
          name: payload.name || payload.title,
          title: payload.title || payload.name,
          price: Number(payload.price),
          category: payload.category || 'Uncategorized',
          description: payload.description || '',
          img: payload.img || payload.imageUrl || '',
          imageUrl: payload.imageUrl || payload.img || '',
          specs: Array.isArray(payload.specs) ? payload.specs : [],
          tags: Array.isArray(payload.tags) ? payload.tags : [],
          stock: Number(payload.stock) || 0,
          sold: Number(payload.sold) || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Save to database
        await doc.save();
        console.log(`[product] Created new product: ${id}`);
        return res.json({ ok: true, product: doc.toObject() });
      }

      // Fallback to file storage if DB not available
  console.log('[product] Falling back to file storage');
      const prods = readDataFile('products.json') || [];
      const id = payload.id || `p_${Date.now()}`;
      const newProd = { 
        id,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      prods.unshift(newProd);
      const ok = writeDataFile('products.json', prods);
      if (!ok) {
        console.error('[product] Failed to save to file');
        return res.status(500).json({ ok: false, error: 'Failed to save product to file storage' });
      }
      return res.json({ ok: true, product: newProd });
    } catch (dbError) {
      console.error('[product] Database operation failed:', dbError);
      return res.status(500).json({ ok: false, error: `Database error: ${dbError.message}` });
    }
  } catch (e) {
    console.error('[product] Create product failed:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

// Delete product
// Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  const id = req.params.id;
  if (!id) return res.status(400).json({ ok: false, error: 'product id is required' });

  try {
    // Ensure MongoDB connection
    const mongoose = require('mongoose');
    if (!mongoose.connection.readyState) {
      const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    const ProductModel = getProductModel();
    if (!ProductModel) {
      console.error('[product/delete] Product model not initialized');
      return res.status(500).json({ ok: false, error: 'database model not initialized' });
    }

    // Delete from database
    const result = await ProductModel.findOneAndDelete({ id: String(id) });
    
    if (!result) {
      console.error(`[product] Product ${id} not found in database`);
      return res.status(404).json({ ok: false, error: 'product not found' });
    }

    console.log(`[product] Successfully deleted product ${id} from database`);
    
    // Also remove from local file if it exists (for backward compatibility)
    try {
      const prods = readDataFile('products.json');
      if (prods) {
        const filteredProds = prods.filter(p => String(p.id) !== String(id));
        writeDataFile('products.json', filteredProds);
      }
    } catch (fileError) {
      // Don't fail if file operations fail
      console.warn('[product] File cleanup failed:', fileError.message);
    }

    return res.json({ ok: true, message: 'Product deleted successfully' });
  } catch (e) {
    console.error('[product] Delete failed:', e.message);
    return res.status(500).json({ ok: false, error: 'Failed to delete product: ' + e.message });
  }
});

// List all products (PUBLIC - for frontend products page)
app.get('/api/products', (req, res) => {
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.find({}).lean().sort({ createdAt: -1 }).then((docs) => res.json(docs)).catch(err => { 
        console.error('[products] products list failed', err && (err.stack || err.message)); 
        res.status(500).json({ ok: false, error: 'db error' }); 
      });
      return;
    }
  } catch (e) { /* fallback to file */ }
  const prods = readDataFile('products.json') || [];
  res.json(prods);
});

// List all products (PROTECTED - for admin dashboard)
app.get('/api/admin/products', async (req, res) => {
  try {
    // Check authentication first
    if (!requireAdmin(req)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    // Try database first
    try {
      const mongoose = require('mongoose');
      
      // Check MongoDB connection
      if (!mongoose.connection.readyState) {
        console.log('[admin/products] MongoDB not connected, attempting connection...');
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';
        await mongoose.connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000
        });
      }

      const ProductModel = getProductModel();
      if (ProductModel && mongoose.connection.readyState === 1) {
        const docs = await ProductModel.find({}).lean().sort({ createdAt: -1 });
        console.log(`[admin/products] Successfully retrieved ${docs.length} products from database`);
        return res.json({ ok: true, products: docs });
      } else {
        console.log('[admin/products] ProductModel not available or DB not connected, falling back to file storage');
      }
    } catch (dbError) {
      console.error('[admin/products] Database error:', dbError.message);
      console.error(dbError.stack);
      // Don't return here - fall back to file storage
    }

    // Fallback to file storage
    console.log('[admin/products] Using file storage fallback');
    const prods = readDataFile('products.json') || [];
    return res.json({ ok: true, products: prods });
  } catch (e) {
    console.error('[admin/products] Fatal error:', e.message);
    console.error(e.stack);
    return res.status(500).json({ 
      ok: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

// Get single product by ID (protected)
app.get('/api/products/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const id = req.params.id;
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.findOne({ id: String(id) }).lean().then((doc) => {
        if (!doc) return res.status(404).json({ ok: false, error: 'product not found' });
        return res.json(doc);
      }).catch(err => {
        console.error('[products/:id] product get failed', err && (err.stack || err.message));
        res.status(500).json({ ok: false, error: 'db error' });
      });
      return;
    }
    const prods = readDataFile('products.json') || [];
    const product = prods.find(p => String(p.id) === String(id));
    if (!product) return res.status(404).json({ ok: false, error: 'product not found' });
    res.json(product);
  } catch (e) {
    console.error('get product failed', e);
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

// Products stats summary endpoint (protected)
app.get('/api/products/stats/summary', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  (async function(){
    try {
      const mongoose = require('mongoose');
      let total = 0;
      let topProducts = [];
      
      const ProductModel = getProductModel();
      if (ProductModel && mongoose.connection.readyState === 1) {
        total = await ProductModel.countDocuments();
        // Get top 5 products by sold count
        const products = await ProductModel.find({}).lean().sort({ sold: -1 }).limit(5);
        topProducts = products.map(p => ({
          id: p.id,
          title: p.title || p.name || 'Unnamed',
          sold: p.sold || 0,
          stock: p.stock || 0,
          price: p.price
        }));
      } else {
        const prods = readDataFile('products.json') || [];
        total = prods.length;
        topProducts = prods
          .map(p => ({
            id: p.id,
            title: p.title || p.name || 'Unnamed',
            sold: p.sold || 0,
            stock: p.stock || 0,
            price: p.price
          }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
      }
      
      res.json({ total, top: topProducts });
    } catch (err) {
      console.error('stats summary error', err && err.message);
      res.status(500).json({ ok: false, error: 'stats error' });
    }
  })();
});

// Admin stats: total products, total sales (from data/orders.json or fallback), top-selling
app.get('/api/admin/stats', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  (async function(){
    try {
      const mongoose = require('mongoose');
      let totalProducts = 0;
      let totalOrders = 0;
      let totalSales = 0;
      let topSelling = [];
      // Use DB when available
      const ProductModel = getProductModel();
      if (ProductModel && mongoose.connection.readyState === 1) {
        totalProducts = await ProductModel.countDocuments();
      } else {
        const prods = readDataFile('products.json') || [];
        totalProducts = prods.length;
      }

      // Orders: try DB Order model (backend/models/Order.js) if present
      try {
        const OrderModel = require(path.join(__dirname, 'models', 'Order.js'));
        if (OrderModel && mongoose.connection.readyState === 1) {
          const orders = await OrderModel.find({}).lean();
          totalOrders = orders.length;
          const salesCount = {};
          for (const o of orders) {
            const items = o.items || [];
            for (const it of items) {
              const pid = it.productId || it.id || it._id || null;
              if (!pid) continue;
              salesCount[pid] = (salesCount[pid] || 0) + (it.qty || 1);
              totalSales += (it.qty || 1);
            }
          }
          topSelling = Object.keys(salesCount).map(k => ({ id: k, sold: salesCount[k] })).sort((a,b) => b.sold - a.sold).slice(0,10);
        } else {
          const orders = readDataFile('orders.json') || [];
          totalOrders = orders.length;
          const salesCount = {};
          for (const o of orders) {
            const items = o.items || [];
            for (const it of items) {
              const pid = it.id || it.productId || it._id;
              if (!pid) continue;
              salesCount[pid] = (salesCount[pid] || 0) + (it.qty || 1);
              totalSales += (it.qty || 1);
            }
          }
          topSelling = Object.keys(salesCount).map(k => ({ id: k, sold: salesCount[k] })).sort((a,b) => b.sold - a.sold).slice(0,10);
        }
      } catch (e) {
        const orders = readDataFile('orders.json') || [];
        totalOrders = orders.length;
        const salesCount = {};
        for (const o of orders) {
          const items = o.items || [];
          for (const it of items) {
            const pid = it.id || it.productId || it._id;
            if (!pid) continue;
            salesCount[pid] = (salesCount[pid] || 0) + (it.qty || 1);
            totalSales += (it.qty || 1);
          }
        }
        topSelling = Object.keys(salesCount).map(k => ({ id: k, sold: salesCount[k] })).sort((a,b) => b.sold - a.sold).slice(0,10);
      }

      res.json({ ok: true, totalProducts, totalOrders, totalSales, topSelling });
    } catch (err) {
      console.error('stats error', err && err.message);
      res.status(500).json({ ok: false, error: 'stats error' });
    }
  })();
});

// Endpoint to increment AI-open counter (called by frontend when AI opens product via window.aalaaiOpen)
// AI open tracking endpoint removed.

// Catch-all handler: send back React's index.html file for client-side routing
// Use a middleware approach that's more reliable
app.use((req, res, next) => {
  // Only handle non-API routes and non-static file requests
  if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      return res.status(404).json({ error: 'Frontend not built. Run npm run build first.' });
    }
  }
  next();
});

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Get MongoDB URI from environment or use default
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';
    
    if (MONGO_URI) {
      console.log('[db] Connecting to MongoDB...', MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[hidden]:[hidden]@'));
      
      // Configure mongoose with retry logic
      mongoose.set('bufferCommands', false);
      mongoose.set('strictQuery', false);
      
      const connectWithRetry = async (retries = 5) => {
        try {
          await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
            heartbeatFrequencyMS: 1000,
            retryWrites: true,
            w: 'majority'
          });
          
          console.log('[db] MongoDB connected successfully');
          return true;
        } catch (e) {
          console.error(`[db] MongoDB connection attempt failed (${retries} retries left):`, e.message);
          if (retries > 0) {
            console.log('[db] Retrying connection in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectWithRetry(retries - 1);
          }
          throw e;
        }
      };
      
      try {
        await connectWithRetry();
        
        // Ensure Product model is available on mongoose
        try {
          const pm = getProductModel();
          if (pm && mongoose.models && mongoose.models.Product) {
            const count = await mongoose.models.Product.countDocuments();
            console.log(`[db] Connection verified - found ${count} products`);
          } else {
            console.log('[db] Product model not available after connection');
          }
        } catch (err) {
          console.error('[db] failed to verify product model/count', err && (err.stack || err.message));
        }
      } catch (e) {
        console.error('[db] MongoDB connection failed after retries:', e.message);
        console.error('[db] Stack trace:', e.stack);
        // Don't exit - allow fallback to file-based storage
      }
    } else {
      console.warn('[db] No MONGO_URI configured; using file-based storage');
    }
    
    // ensure admin exists either in DB or file
    await ensureAdminUser();

    app.listen(PORT,'0.0.0.0', () => console.log(`Backend server listening on port ${PORT}`));
  } catch (e) {
    console.error('Failed to start server', e && e.message);
    process.exit(1);
  }
}

// Start server only when run directly. When imported (e.g. by serverless wrapper), export the app.
if (require.main === module) {
  startServer();
} else {
  try { module.exports = { app, startServer }; } catch (e) { /* ignore export errors */ }
}
