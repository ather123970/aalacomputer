// backend/index.cjs
// Load environment variables from .env when present (optional)
try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }

// Global crash handlers
process.on('uncaughtException', (err) => {
  console.error('[global] uncaughtException', err && (err.stack || err.message || err));
});
process.on('unhandledRejection', (reason, p) => {
  console.error('[global] unhandledRejection', reason && (reason.stack || reason));
});

const crypto = require('crypto');
// Optional verification hash helper
let hash = null;
try {
  const userId = (typeof process !== 'undefined' && process.env && process.env.STARTUP_USER_ID) ? String(process.env.STARTUP_USER_ID) : null;
  const secret = (typeof process !== 'undefined' && process.env && process.env.SECRET) ? process.env.SECRET : process.env && process.env.secret;
  if (userId && secret) {
    hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');
  }
} catch (e) {
  hash = null;
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Trust proxy for X-Forwarded-* headers
app.set('trust proxy', true);

// --- Middlewares (place early) ---
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  const origin = req.headers && req.headers.origin;
  const host = req.headers && req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  console.log('[server] request', req.method, req.url, 'origin=', origin || '-', 'host=', host || '-', 'proto=', proto || '-');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// --- Data dir and helpers ---
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

// --- Utility functions (unchanged logic) ---
function normalize(s) {
  if (!s) return '';
  return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseBudget(text) {
  if (!text) return null;
  const s = String(text || '').toLowerCase();
  let m = s.match(/(under|below|less than|budget|<=|<)\s*([0-9,.]+)\s*(k|m)?\s*(rs|pkr)?/i);
  if (!m) m = s.match(/([0-9,.]+)\s*(k|m)?\s*(rs|pkr)/i);
  if (!m) return null;
  let n = Number(String(m[2]).replace(/[,]/g, '')) || 0;
  const mult = (m[3] || '').toLowerCase() === 'k' ? 1000 : ((m[3] || '').toLowerCase() === 'm' ? 1000000 : 1);
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
} catch (e) {}

/* --- Routers mounting (ESM fallback handled with import()) --- */
let ProductModel = null;
try {
  ProductModel = require(path.join(__dirname, 'models', 'Product.js'));
} catch (e) {
  ProductModel = null;
}

let AdminModel = null;
try {
  AdminModel = require(path.join(__dirname, 'models', 'Admin.js'));
} catch (e) {
  AdminModel = null;
}

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev_jwt_secret_change_this';

// Helper functions for data files
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

// Try to mount optional ESM routers (auth.js, orders.js) if present
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

/* --- Simple in-memory cart / API routes --- */
const CART = [];

app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.post('/api/ask', (req, res) => {
  return res.status(404).json({ error: 'AI assistant removed from this server' });
});

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

app.delete('/api/v1/cart/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id || '');
    const idx = CART.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Item not found' });
    CART.splice(idx, 1);
    return res.json({ ok: true, cart: CART });
  } catch (e) {
    console.error('Cart DELETE error', e && (e.stack || e.message || e));
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/* --- Admin endpoints and other routes kept intact (omitted here for brevity in this message) --- */
/* NOTE: in your repo file the full admin/product routes should remain exactly as they were. */
/* They were present earlier in your file and will work unchanged. */

/* --- Serve frontend (static) AFTER all API routes --- */
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: send index.html for any other route (so React Router works)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

/* --- Start server (connect DB first) --- */
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uni804043_db_user:P5AYVn4VkHqlQbjz@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

    if (MONGO_URI) {
      if (mongoose) {
        try {
          mongoose.set('bufferCommands', false);
        } catch (e) { /* ignore */ }
        await mongoose.connect(MONGO_URI, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });
        console.log('[db] MongoDB connected');
      } else {
        console.warn('[db] mongoose not available; skipping connect');
      }
    } else {
      console.log('[db] No MONGO_URI configured; skipping DB connect');
    }

    await ensureAdminUser();

    if (process.env.VERCEL) {
      console.log('[server] Running on Vercel – no manual listen');
    } else {
      app.listen(PORT, '0.0.0.0', () => console.log(`[server] Listening on port ${PORT}`));
    }
  } catch (e) {
    console.error('Failed to start server:', (e && e.message) || e);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  module.exports = app;
}

