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

// Flexible CORS: echo origin dynamically and allow credentials so cookies/auth headers work.
// This avoids hardcoding origins and supports HTTP and HTTPS across hosting platforms.
app.use(cors({
  origin: true,
  credentials: true,
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
  'https://aalacomputer.com',
  'https://aalacomputerkarachi2124.netlify.app/',
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

// Cart POST - maintain simple in-memory cart behavior (dev)
app.post('/api/v1/cart', (req, res) => {
  const payload = req.body;
  if (!payload) return res.status(400).json({ error: 'no data' });

  const normalizeItem = (item) => ({
    id: item.id ?? item._id ?? item.name ?? Math.random().toString(36),
    name: item.name ?? item.Name ?? 'Unnamed',
    price: Number(item.price ?? item.p ?? 0) || 0,
    img: item.img ?? item.image ?? '',
    spec: item.spec ?? item.specs ?? item.desc ?? item.description ?? '',
    qty: Number(item.qty ?? 1)
  });

  const upsert = (item) => {
    const existing = CART.find(c => c.id === item.id);
    if (existing) {
      existing.qty = item.qty;
      existing.price = item.price;
      existing.name = item.name;
      existing.img = item.img;
      existing.spec = item.spec;
    } else {
      CART.push(item);
    }
  };

  if (Array.isArray(payload)) {
    payload.map(normalizeItem).forEach(upsert);
  } else {
    upsert(normalizeItem(payload));
  }

  return res.json({ ok: true, cart: CART, cartCount: CART.length });
});

app.get('/api/v1/cart', (req, res) => res.json(CART));

// Delete item from in-memory cart
app.delete('/api/v1/cart/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id || '')
    const idx = CART.findIndex(c => String(c.id) === String(id))
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Item not found' })
    CART.splice(idx, 1)
    return res.json({ ok: true, cart: CART })
  } catch (e) {
    console.error('Cart DELETE error', e && (e.stack || e.message || e))
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
});

// /api/chat endpoint removed

// --- Admin endpoints (simple password-protected via shared secret) ---
// Attempt to use mongoose Product model when available
let ProductModel = null;
try {
  // require dynamically to avoid ESM/CJS mismatches at top
  ProductModel = require(path.join(__dirname, 'models', 'Product.js'));
} catch (e) {
  ProductModel = null;
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
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev_jwt_secret_change_this';

// helper: read/write admin file fallback
function readAdminFile() {
  return readDataFile('admin.json') || null;
}

function writeAdminFile(obj) {
  return writeDataFile('admin.json', obj);
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'aalacomputeradmin@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'karachi123';
  try {
    if (AdminModel && mongoose.connection.readyState === 1) {
      const count = await AdminModel.countDocuments();
      if (count === 0) {
        const hash = await bcrypt.hash(password, 10);
        await new AdminModel({ email, passwordHash: hash, name: 'Site Admin' }).save();
        console.log('[admin] default admin created in DB:', email);
      }
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

// Admin login: POST /api/admin/login { username, password }
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ ok: false, error: 'username and password required' });

    // Try DB first
    try {
      if (AdminModel && mongoose.connection.readyState === 1) {
        const admin = await AdminModel.findOne({ email: String(username).toLowerCase() }).lean();
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
    if (String(adm.email).toLowerCase() !== String(username).toLowerCase()) return res.status(401).json({ ok: false, error: 'invalid credentials' });
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
  if (!auth) return false;
  const parts = String(auth || '').split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // truthy admin payload
  } catch (e) {
    return false;
  }
}

// List products
app.get('/api/admin/products', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  // If mongoose available, use DB
  try {
    if (ProductModel && require('mongoose').connection.readyState === 1) {
      ProductModel.find({}).lean().sort({ createdAt: -1 }).then((docs) => res.json({ ok: true, products: docs })).catch(err => { console.error('product find failed', err); res.status(500).json({ ok: false, error: 'db error' }); });
      return;
    }
  } catch (e) { /* fallback to file */ }
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
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.findOneAndUpdate({ id: String(id) }, { $set: { ...payload, updatedAt: new Date() } }, { new: true, upsert: false }).lean().then(doc => {
        if (!doc) return res.status(404).json({ ok: false, error: 'product not found' });
        return res.json({ ok: true, product: doc });
      }).catch(err => { console.error('product update failed', err); res.status(500).json({ ok: false, error: 'db error' }); });
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
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const payload = req.body || {};
  try {
    const mongoose = require('mongoose');
    if (ProductModel && mongoose.connection.readyState === 1) {
      const id = payload.id || (`p_${Date.now()}`);
      const doc = new ProductModel({ id, ...payload });
      await doc.save();
      return res.json({ ok: true, product: doc.toObject() });
    }
    const prods = readDataFile('products.json') || [];
    // basic id generation if not provided
    const id = payload.id || (`p_${Date.now()}`);
    const newProd = { id, ...(payload || {}) };
    prods.unshift(newProd);
    const ok = writeDataFile('products.json', prods);
    if (!ok) return res.status(500).json({ ok: false, error: 'failed to save' });
    return res.json({ ok: true, product: newProd });
  } catch (e) {
    console.error('create product failed', e && e.message);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
});

// Delete product
app.delete('/api/admin/products/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const id = req.params.id;
  try {
    const mongoose = require('mongoose');
    if (ProductModel && mongoose.connection.readyState === 1) {
      ProductModel.deleteOne({ id: String(id) }).then((r)=>{ if (r.deletedCount===0) return res.status(404).json({ ok:false, error:'product not found' }); return res.json({ ok: true }); }).catch(err=>{ console.error('product delete failed', err); res.status(500).json({ ok: false, error: 'db error' }); });
      return;
    }
    const prods = readDataFile('products.json') || [];
    const idx = prods.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'product not found' });
    prods.splice(idx, 1);
    const ok = writeDataFile('products.json', prods);
    if (!ok) return res.status(500).json({ ok: false, error: 'failed to save' });
    return res.json({ ok: true });
  } catch (e) {
    console.error('delete product failed', e && e.message);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
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
          const orders = readDataFile('orders') || [];
          totalOrders = orders.length;
          const salesCount = {};
          for (const o of orders) {
            const items = o.items || [];
            for (const it of items) {
              const pid = it.id || it.productId || it.id;
              if (!pid) continue;
              salesCount[pid] = (salesCount[pid] || 0) + (it.qty || 1);
              totalSales += (it.qty || 1);
            }
          }
          topSelling = Object.keys(salesCount).map(k => ({ id: k, sold: salesCount[k] })).sort((a,b) => b.sold - a.sold).slice(0,10);
        }
      } catch (e) {
        const orders = readDataFile('orders') || [];
        totalOrders = orders.length;
        const salesCount = {};
        for (const o of orders) {
          const items = o.items || [];
          for (const it of items) {
            const pid = it.id || it.productId || it.id;
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
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const MONGO_URI =
      process.env.MONGO_URI ||
      process.env.MONGO ||
      'mongodb://127.0.0.1:27017/Aalacomputer';

    if (MONGO_URI) {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(MONGO_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[db] MongoDB connected');
    } else {
      console.log('[db] No MONGO_URI configured; skipping DB connect');
    }

    await ensureAdminUser();

    // Only listen when running locally
    if (process.env.VERCEL) {
      console.log('[server] Running on Vercel – no manual listen');
    } else {
      app.listen(PORT, '0.0.0.0', () =>
        console.log(`[server] Listening on port ${PORT}`)
      );
    }
  } catch (e) {
    console.error('Failed to start server:', e.message);
    process.exit(1);
  }
}

// Vercel imports the app, so we must export it
if (require.main === module) {
  startServer();
} else {
  module.exports = app;
}
