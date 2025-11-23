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
const compression = require('compression');
const app=express()
// Trust proxy so req.protocol/hostname respect X-Forwarded-* when behind load balancers/proxies
app.set('trust proxy', true);

// Enable gzip compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, 6 is default)
}));

// CORS Configuration - Allow localhost for development, specific domains for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  // Allow proxy URLs from IDE preview
  /^http:\/\/127\.0\.0\.1:\d+$/, // Match any port on 127.0.0.1
  /^http:\/\/localhost:\d+$/, // Match any port on localhost
  'https://aalacomputer.com',
  'https://www.aalacomputer.com',
  'https://aalacomputerkarachi.vercel.app',
  'https://aalacomputer.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list (string match)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Check if origin matches any regex pattern
    for (const pattern of allowedOrigins) {
      if (pattern instanceof RegExp && pattern.test(origin)) {
        callback(null, true);
        return;
      }
    }
    
    // Origin not allowed
    callback(new Error('CORS not allowed for this origin: ' + origin));
  },
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

// ===== MOVED STATIC FILE SERVING TO AFTER API ROUTES =====
// This prevents index.html from being served for /api/* routes

// Serve images directory - support multiple folders
// Priority: images > public/fallback > public > zah_images (empty)
const zahImagesPath = path.join(__dirname, '..', 'zah_images');
const imagesPath = path.join(__dirname, '..', 'images');
const publicPath = path.join(__dirname, '..', 'public');
const publicImagesPath = path.join(publicPath, 'images');
const publicFallbackPath = path.join(publicPath, 'fallback');

// Image serving configuration with proper CORS and headers
const imageServeOptions = {
  maxAge: '1h', // Cache images for 1 hour (allow faster updates)
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    // Set proper content types
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
};

// PRIORITY 1: Serve from images folder (LOCAL IMAGES - HIGHEST PRIORITY)
console.log('[server] Checking for images folder at:', imagesPath);
if (fs.existsSync(imagesPath)) {
  const imageCount = fs.readdirSync(imagesPath).length;
  app.use('/images', express.static(imagesPath, imageServeOptions));
  console.log(`[server] ✅ serving /images from images/ (${imageCount} files)`);
} else {
  console.log('[server] ⚠️ images folder not found');
}

// PRIORITY 2: Serve from public/fallback (FALLBACK IMAGES)
console.log('[server] Checking for public/fallback at:', publicFallbackPath);
if (fs.existsSync(publicFallbackPath)) {
  const fallbackCount = fs.readdirSync(publicFallbackPath).length;
  app.use('/fallback', express.static(publicFallbackPath, imageServeOptions));
  console.log(`[server] ✅ serving /fallback from public/fallback/ (${fallbackCount} files)`);
}

// PRIORITY 3: Serve from dist/images (from build output)
const distImagesPath = path.join(__dirname, '..', 'dist', 'images');
console.log('[server] Checking for dist/images at:', distImagesPath);
if (fs.existsSync(distImagesPath)) {
  const imageCount = fs.readdirSync(distImagesPath).length;
  if (imageCount > 0) {
    app.use('/dist-images', express.static(distImagesPath, imageServeOptions));
    console.log(`[server] ✅ serving /dist-images from dist/images (${imageCount} files)`);
  }
} else {
  console.log('[server] ⚠️ dist/images not found');
}

// PRIORITY 4: Serve from zah_images (if it has files)
console.log('[server] Checking for zah_images at:', zahImagesPath);
if (fs.existsSync(zahImagesPath)) {
  const zahCount = fs.readdirSync(zahImagesPath).length;
  if (zahCount > 0) {
    app.use('/zah-images', express.static(zahImagesPath, imageServeOptions));
    console.log(`[server] ✅ serving /zah-images from zah_images (${zahCount} files)`);
  } else {
    console.log('[server] ⚠️ zah_images folder is empty');
  }
}

// Serve public folder for fallback images and static assets
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, imageServeOptions));
  console.log('[server] ✅ serving static files from public/');
}

// Also serve /uploads directory if it exists
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath, imageServeOptions));
  console.log('[server] ✅ serving /uploads from:', uploadsPath);
}

// ===== TEST ENDPOINTS FOR IMAGE SERVING =====
// Test endpoint to check available images
app.get('/api/test-images', (req, res) => {
  const imageDirectories = [];
  
  if (fs.existsSync(zahImagesPath)) {
    const files = fs.readdirSync(zahImagesPath).slice(0, 10);
    const totalCount = fs.readdirSync(zahImagesPath).length;
    imageDirectories.push({
      path: '/images (from zah_images)',
      absolutePath: zahImagesPath,
      exists: true,
      totalFiles: totalCount,
      sampleFiles: files.map(f => `/images/${f}`)
    });
  } else {
    imageDirectories.push({
      path: '/images (from zah_images)',
      absolutePath: zahImagesPath,
      exists: false,
      error: 'Directory not found'
    });
  }
  
  if (fs.existsSync(imagesPath)) {
    const files = fs.readdirSync(imagesPath).slice(0, 10);
    const totalCount = fs.readdirSync(imagesPath).length;
    imageDirectories.push({
      path: '/images (from images folder)',
      absolutePath: imagesPath,
      exists: true,
      totalFiles: totalCount,
      sampleFiles: files.map(f => `/images/${f}`)
    });
  } else {
    imageDirectories.push({
      path: '/images (from images folder)',
      absolutePath: imagesPath,
      exists: false,
      error: 'Directory not found'
    });
  }
  
  if (fs.existsSync(publicPath)) {
    imageDirectories.push({
      path: '/public',
      absolutePath: publicPath,
      exists: true,
      note: 'Static assets served from public/'
    });
  }
  
  if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath).slice(0, 10);
    const totalCount = fs.readdirSync(uploadsPath).length;
    imageDirectories.push({
      path: '/uploads',
      absolutePath: uploadsPath,
      exists: true,
      totalFiles: totalCount,
      sampleFiles: files.map(f => `/uploads/${f}`)
    });
  }
  
  // Check if dist directory exists
  const distPath = path.join(__dirname, '..', 'dist');
  const distExists = fs.existsSync(distPath);
  
  res.json({
    ok: true,
    message: 'Image serving status in production',
    environment: process.env.NODE_ENV || 'development',
    directories: imageDirectories,
    distDirectory: {
      path: distPath,
      exists: distExists
    },
    testUrls: [
      '/images/placeholder.png',
      '/placeholder.svg',
      '/fallback/cpu.svg'
    ]
  });
});

// Try to mount the auth router (now CommonJS)
try {
  const authPath = path.join(__dirname, 'auth.js');
  if (fs.existsSync(authPath)) {
    const authRouter = require('./auth.js');
    if (authRouter && typeof authRouter === 'function') {
      app.use('/api/v1/auth', authRouter);
      console.log('[server] mounted /api/v1/auth from auth.js');
    }
  }
} catch (e) {
  console.warn('[server] failed to mount auth router', e && e.message);
}

// Try to mount orders router (now CommonJS)
try {
  const ordersPath = path.join(__dirname, 'orders.js');
  if (fs.existsSync(ordersPath)) {
    const ordersRouter = require('./orders.js');
    if (ordersRouter && typeof ordersRouter === 'function') {
      app.use('/api/v1', ordersRouter);
      console.log('[server] mounted /api/v1 routes from orders.js');
    }
  }
} catch (e) {
  console.warn('[server] failed to mount orders router', e && e.message);
}

// in-memory cart (dev)
const CART = [];

app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Image proxy endpoint to handle external images with proper headers
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    console.log('[image-proxy] Fetching:', imageUrl);
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://zahcomputers.pk/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.log('[image-proxy] Failed to fetch:', response.status, response.statusText);
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();
    
    // Set appropriate headers
    res.set({
      'Content-Type': contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour (faster updates)
      'Access-Control-Allow-Origin': '*'
    });
    
    console.log('[image-proxy] Successfully proxied image, size:', buffer.length);
    res.send(buffer);
    
  } catch (error) {
    console.error('[image-proxy] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Diagnostic endpoint to verify deployment version
app.get('/api/deployment-version', (req, res) => {
  res.json({
    version: '2025-01-04-v2',
    timestamp: new Date().toISOString(),
    proxyEndpoint: 'fixed',
    middlewareOrder: 'API routes before static files',
    commit: '607d862+'
  });
});

// Helper function to find local image by product name
function findLocalImageForProduct(productName) {
  if (!productName) return null;
  
  const zahImagesPath = path.join(__dirname, '..', 'zah_images');
  const distImagesPath = path.join(__dirname, '..', 'dist', 'images');
  
  const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedProductName = normalizeText(productName);
  
  // Check both directories
  const searchDirs = [distImagesPath, zahImagesPath].filter(dir => fs.existsSync(dir));
  
  for (const dir of searchDirs) {
    try {
      const files = fs.readdirSync(dir).filter(f => 
        f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
      );
      
      // Try exact match first
      for (const file of files) {
        const fileNameWithoutExt = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const normalizedFileName = normalizeText(fileNameWithoutExt);
        
        if (normalizedFileName === normalizedProductName) {
          return path.join(dir, file);
        }
      }
      
      // Try partial match (60% of words match)
      for (const file of files) {
        const fileNameWithoutExt = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const normalizedFileName = normalizeText(fileNameWithoutExt);
        
        const fileWords = normalizedFileName.split(' ').filter(w => w.length > 3);
        const productWords = normalizedProductName.split(' ').filter(w => w.length > 3);
        
        const matchingWords = fileWords.filter(word => 
          productWords.some(pw => pw.includes(word) || word.includes(pw))
        );
        
        if (matchingWords.length >= Math.floor(fileWords.length * 0.6) && matchingWords.length >= 2) {
          return path.join(dir, file);
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  return null;
}

// Simple image proxy - fetches image from DB URL and serves it
app.get('/api/product-image/:productId', async (req, res) => {
  const { productId } = req.params;
  
  // CORS + cache headers (1 hour for faster updates)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Cache-Control', 'public, max-age=3600');

  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    
    // Try to find product in MongoDB
    if (ProductModel && mongoose.connection.readyState === 1) {
      const product = await ProductModel.findOne({
        $or: [
          { _id: productId },
          { id: productId }
        ]
      }).select('img imageUrl images Name name title').lean();
      
      if (product) {
        const productName = product.Name || product.name || product.title;
        
        // STEP 1: Check database URL (imageUrl takes priority over img field)
        let imageUrl = product.imageUrl || product.img;
        
        // Try images array if available
        if (!imageUrl && Array.isArray(product.images) && product.images.length > 0) {
          imageUrl = product.images[0].url || product.images[0];
        }
        
        console.log(`[product-image] Product: ${productName}, imageUrl: ${imageUrl}`);
        
        // STEP 2: If it's an EXTERNAL URL (http/https), redirect to proxy
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
          console.log(`[product-image] ✅ Redirecting to proxy for: ${imageUrl}`);
          return res.redirect(302, `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
        }
        
        // STEP 3: If it's a local path (starts with /images/ or just filename), serve it
        if (imageUrl && !imageUrl.startsWith('http')) {
          const fileName = imageUrl.startsWith('/images/') 
            ? imageUrl.replace('/images/', '') 
            : imageUrl.replace(/^\//, '');
            
          const localPaths = [
            path.join(__dirname, '..', 'dist', 'images', fileName),
            path.join(__dirname, '..', 'zah_images', fileName),
            path.join(__dirname, '..', 'images', fileName)
          ];
          
          for (const localPath of localPaths) {
            if (fs.existsSync(localPath)) {
              console.log(`[product-image] ✅ Serving local file from path: ${fileName}`);
              const ext = path.extname(localPath).toLowerCase();
              const contentType = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml'
              }[ext] || 'image/jpeg';
              
              res.set('Content-Type', contentType);
              return fs.createReadStream(localPath).pipe(res);
            }
          }
          
          // If local path doesn't exist, try finding by product name
          console.log(`[product-image] Local path not found, trying by product name: ${productName}`);
        }
        
        // STEP 4: Try to find local image by product name (for products with no URL or path not found)
        if (!imageUrl || (imageUrl && !imageUrl.startsWith('http'))) {
          console.log(`[product-image] No URL in database, checking for local image by name: ${productName}`);
          const localImagePath = findLocalImageForProduct(productName);
          if (localImagePath && fs.existsSync(localImagePath)) {
            console.log(`[product-image] ✅ Found local image fallback: ${productName}`);
            const ext = path.extname(localImagePath).toLowerCase();
            const contentType = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp'
            }[ext] || 'image/jpeg';
            
            res.set('Content-Type', contentType);
            return fs.createReadStream(localImagePath).pipe(res);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[product-image] Error:', err.message);
  }

  // Fallback to placeholder
  try {
    console.log(`[product-image] ⚠️ Using placeholder for product: ${req.params.productId}`);
    res.status(200);
    const png = path.join(__dirname, '..', 'images', 'placeholder.png');
    const svg = path.join(__dirname, '..', 'images', 'placeholder.svg');
    if (fs.existsSync(png)) {
      res.set('Content-Type', 'image/png');
      return fs.createReadStream(png).pipe(res);
    }
    if (fs.existsSync(svg)) {
      res.set('Content-Type', 'image/svg+xml');
      return fs.createReadStream(svg).pipe(res);
    }
  } catch (e) {}
  
  return res.status(200).end();
});

// Image proxy endpoint - redirect to weserv.nl for reliable image serving
app.get('/api/proxy-image', async (req, res) => {
  const originalUrl = req.query.url;
  if (!originalUrl) return res.status(400).send('Missing URL');

  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cache-Control', 'public, max-age=86400');

  try {
    // Use weserv.nl as a reliable image proxy CDN
    // It handles image fetching, caching, and optimization
    const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl.replace(/^https?:\/\//, ''))}&output=webp&q=80`;
    
    console.log(`[proxy-image] Redirecting to weserv for: ${originalUrl.substring(0, 60)}...`);
    return res.redirect(301, weservUrl);

  } catch (error) {
    console.error(`[proxy-image] Error: ${error.message}`);
    res.status(500).send('Image proxy error');
  }
});

// Simple buffer-based image fetcher
app.get('/api/fetch-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing image URL');

  // CORS + cache headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Timing-Allow-Origin', '*');
  res.set('Cache-Control', 'public, max-age=86400');

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        ...(imageUrl.includes('zahcomputers.pk') ? { 'Referer': 'https://zahcomputers.pk' } : {})
      },
      timeout: 15000
    });

    if (!response || !response.ok) {
      return res.status(502).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ab = await response.arrayBuffer();
    const buffer = Buffer.from(ab);

    res.set('Content-Type', contentType);
    return res.send(buffer);
  } catch (err) {
    console.error('Image fetch error:', err && (err.stack || err.message));
    return res.status(500).send('Server error fetching image');
  }
});

// Start the server
// ============================================================================
// /api/v1/* ENDPOINTS (Frontend compatibility)
// ============================================================================

// /api/v1/config - Return app configuration
app.get('/api/v1/config', (req, res) => {
  res.json({
    ok: true,
    storeName: 'Aala Computer',
    storePhone: '+92 300 1234567',
    storeEmail: 'info@aalacomputer.com',
    currency: 'PKR',
    whatsappNumber: '+923001234567'
  });
});

// /api/v1/auth/me - Get current user
app.get('/api/v1/auth/me', (req, res) => {
  // Check for auth token in cookie or Authorization header
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));
  
  if (!token) {
    return res.status(401).json({ ok: false, error: 'not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, user: decoded });
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'invalid token' });
  }
});

// /api/v1/auth/logout - Logout user
app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true, message: 'logged out' });
});

// /api/v1/cart - Get cart (public for now, returns empty array)
app.get('/api/v1/cart', (req, res) => {
  // For now, return empty cart since cart is managed client-side
  // TODO: Implement server-side cart if needed
  res.json([]);
});

// /api/v1/products - Alias for /api/products with same optimizations
app.get('/api/v1/products', async (req, res) => {
  // Add caching headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 32;
  const skip = (page - 1) * limit;
  const category = req.query.category;
  const brand = req.query.brand;
  const search = req.query.search;
  
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    if (ProductModel && mongoose.connection.readyState === 1) {
      // Build query based on filters
      const query = {};
      
      // Category filter
      if (category && category !== 'All') {
        query.$or = [
          { category: { $regex: category, $options: 'i' } },
          { 'category.main': { $regex: category, $options: 'i' } },
          { Name: { $regex: category, $options: 'i' } },
          { name: { $regex: category, $options: 'i' } }
        ];
      }
      
      // Brand filter
      if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
      }
      
      // Search filter
      if (search) {
        query.$or = [
          { Name: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { Spec: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Count total documents for pagination
      const total = await ProductModel.countDocuments(query);
      
      // Fetch products with pagination
      const docs = await ProductModel.find(query)
        .select('id Name name title price img imageUrl category brand description WARRANTY link Spec type')
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Return paginated response
      return res.json({
        products: docs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + docs.length < total
      });
    }
  } catch (e) { 
    console.warn('[v1/products] DB query failed, using file fallback', e && e.message);
  }
  
  // Fallback to file with filtering
  let prods = readDataFile('products.json') || [];
  
  // Apply filters
  if (category && category !== 'All') {
    prods = prods.filter(p => {
      const productCategory = (p.category || '').toLowerCase();
      const productName = (p.Name || p.name || '').toLowerCase();
      const selectedCat = category.toLowerCase();
      return productCategory.includes(selectedCat) || productName.includes(selectedCat);
    });
  }
  
  if (brand) {
    const brandLower = brand.toLowerCase();
    prods = prods.filter(p => {
      const productBrand = (p.brand || '').toLowerCase();
      const productName = (p.Name || p.name || '').toLowerCase();
      return productBrand.includes(brandLower) || productName.includes(brandLower);
    });
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    prods = prods.filter(p => {
      const productName = (p.Name || p.name || '').toLowerCase();
      const productCategory = (p.category || '').toLowerCase();
      return productName.includes(searchLower) || productCategory.includes(searchLower);
    });
  }
  
  // Implement pagination for file-based data
  const total = prods.length;
  const paginatedProds = prods.slice(skip, skip + limit);
  
  res.json({
    products: paginatedProds,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + paginatedProds.length < total
  });
});

// /api/admin/stats - Get admin dashboard statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    
    if (ProductModel && mongoose.connection.readyState === 1) {
      // Get actual stats from database
      const totalProducts = await ProductModel.countDocuments();
      const lowStockProducts = await ProductModel.countDocuments({ 
        $or: [
          { stock: { $exists: true, $lt: 10 } },
          { stock: { $exists: false } }
        ]
      });
      
      return res.json({
        ok: true,
        totalProducts,
        lowStock: lowStockProducts,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback to file-based data
    const products = readDataFile('products.json') || [];
    return res.json({
      ok: true,
      totalProducts: products.length,
      lowStock: products.filter(p => !p.stock || p.stock < 10).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[admin/stats] Error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

// ============================================================================
// END /api/v1/* ENDPOINTS
// ============================================================================

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
// Product schema definition (simplified to match actual database format)
let ProductModel = null;
const ProductSchemaDef = {
  id: { type: String, index: true, unique: true },
  brand: { type: String, default: '' },
  name: String,
  title: String,
  price: { type: Number, default: 0 }, // Simple number field
  img: String,
  imageUrl: String,
  description: String,
  category: String,
  WARRANTY: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
};

function getProductModel() {
  try {
    const mongoose = require('mongoose');
    if (!mongoose) return null;
    // If model already created on mongoose, return it
    if (mongoose.models && mongoose.models.Product) return mongoose.models.Product;
    // Build schema with strict:false to allow additional fields from database
    const schema = new mongoose.Schema(ProductSchemaDef, { 
      timestamps: false,
      strict: false // Allow additional fields from database
    });
    return mongoose.model('Product', schema);
  } catch (err) {
    console.error('[getProductModel] failed to get/create Product model', err && (err.stack || err.message));
    return null;
  }
}

// Get or create Prebuild model (for deals/prebuilds)
function getPrebuildModel() {
  try {
    const mongoose = require('mongoose');
    if (!mongoose) return null;
    // If model already created on mongoose, return it
    if (mongoose.models && mongoose.models.Prebuild) return mongoose.models.Prebuild;
    // Build schema using same structure as Product
    const schema = new mongoose.Schema(ProductSchemaDef, { 
      timestamps: false,
      strict: false
    });
    return mongoose.model('Prebuild', schema);
  } catch (err) {
    console.error('[getPrebuildModel] failed to get/create Prebuild model', err && (err.stack || err.message));
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

// Try to load Cart model
let Cart = null;
try {
  Cart = require(path.join(__dirname, 'models', 'Cart.js'));
} catch (e) {
  Cart = null;
}

// Try to load Order model  
let OrderModel = null;
try {
  OrderModel = require(path.join(__dirname, 'models', 'Order.js'));
  // Handle ESM default export
  if (OrderModel && OrderModel.default) OrderModel = OrderModel.default;
} catch (e) {
  OrderModel = null;
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
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  try {
    if (AdminModel && mongoose.connection.readyState === 1) {
      // Delete ALL existing admins
      await AdminModel.deleteMany({});
      console.log('[admin] Removed all existing admin users');
      
      // Create only the required admin
      const hash = await bcrypt.hash(password, 10);
      await new AdminModel({ username, passwordHash: hash, name: 'Site Admin', role: 'admin' }).save();
      console.log('[admin] Created single admin user:', username);
      return;
    }
  } catch (e) {
    console.warn('[admin] ensureAdminUser DB check failed', e && e.message);
  }
  // file fallback: create admin.json if missing
  const adm = readAdminFile();
  if (!adm || !adm.username) {
    const hash = await bcrypt.hash(password, 10);
    writeAdminFile({ username, passwordHash: hash, name: 'Site Admin' });
    console.log('[admin] default admin created in data/admin.json:', username);
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
        const admin = await AdminModel.findOne({ username: String(username).toLowerCase() }).lean();
        if (!admin) return res.status(401).json({ ok: false, error: 'invalid credentials' });
        const ok = await bcrypt.compare(String(password), String(admin.passwordHash || ''));
        if (!ok) return res.status(401).json({ ok: false, error: 'invalid credentials' });
        const token = jwt.sign({ sub: admin.username, role: admin.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ ok: true, token });
      }
    } catch (e) {
      console.warn('[admin] DB login attempt failed', e && e.message);
    }

    // Fallback to admin.json file
    const adm = readAdminFile();
    if (!adm || !adm.username) return res.status(500).json({ ok: false, error: 'admin not configured' });
    if (String(adm.username).toLowerCase() !== String(username).toLowerCase()) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    const ok = await bcrypt.compare(String(password), String(adm.passwordHash || ''));
    if (!ok) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    const token = jwt.sign({ sub: adm.username, role: adm.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
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

// Update product by id (replace object) - DATABASE ONLY
app.put('/api/admin/products/:id', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const id = req.params.id;
  const payload = req.body || {};
  console.log(`[products UPDATE] ========================================`);
  console.log(`[products UPDATE] PUT request for ID: ${id}`);
  console.log(`[products UPDATE] Image fields in payload:`);
  console.log(`  - img: ${payload.img || 'N/A'}`);
  console.log(`  - imageUrl: ${payload.imageUrl || 'N/A'}`);
  console.log(`  - image: ${payload.image || 'N/A'}`);
  console.log(`[products UPDATE] Other fields: name=${payload.name || payload.title}, price=${payload.price}`);
  
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    
    // Check MongoDB connection
    console.log(`[products UPDATE] MongoDB readyState: ${mongoose.connection.readyState}`);
    if (mongoose.connection.readyState !== 1) {
      console.error('[products UPDATE] MongoDB NOT CONNECTED! State:', mongoose.connection.readyState);
      return res.status(500).json({ ok: false, error: 'Database not connected' });
    }
    
    if (!ProductModel) {
      console.error('[products UPDATE] ProductModel is NULL!');
      return res.status(500).json({ ok: false, error: 'Product model not initialized' });
    }
    
    console.log('[products UPDATE] MongoDB Connected - Attempting update...');
    
    // Try multiple approaches to find and update
    let doc = null;
    let method = '';
    
    // Approach 1: Try with _id (MongoDB ObjectId)
    try {
      console.log(`[products UPDATE] Trying findByIdAndUpdate with id: ${id}`);
      doc = await ProductModel.findByIdAndUpdate(
        id, 
        { $set: { ...payload, updatedAt: new Date() } }, 
        { new: true, runValidators: false }
      );
      if (doc) {
        method = 'findByIdAndUpdate';
        console.log('[products UPDATE] ✓ SUCCESS with findByIdAndUpdate');
      }
    } catch (err) {
      console.log('[products UPDATE] findByIdAndUpdate failed:', err.message);
    }
    
    // Approach 2: Try with custom id field
    if (!doc) {
      console.log(`[products UPDATE] Trying findOneAndUpdate with id field`);
      doc = await ProductModel.findOneAndUpdate(
        { id: String(id) },
        { $set: { ...payload, updatedAt: new Date() } },
        { new: true, runValidators: false }
      );
      if (doc) {
        method = 'findOneAndUpdate (id field)';
        console.log('[products UPDATE] ✓ SUCCESS with findOneAndUpdate (id field)');
      }
    }
    
    // Approach 3: Try with _id as string
    if (!doc) {
      console.log(`[products UPDATE] Trying findOneAndUpdate with _id field`);
      doc = await ProductModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...payload, updatedAt: new Date() } },
        { new: true, runValidators: false }
      );
      if (doc) {
        method = 'findOneAndUpdate (_id field)';
        console.log('[products UPDATE] ✓ SUCCESS with findOneAndUpdate (_id field)');
      }
    }
    
    if (!doc) {
      console.error(`[products UPDATE] ✗ PRODUCT NOT FOUND in MongoDB with ID: ${id}`);
      console.error('[products UPDATE] Database is connected but product does not exist');
      return res.status(404).json({ ok: false, error: 'Product not found in database' });
    }
    
    console.log(`[products UPDATE] ✓✓✓ SUCCESS! Updated via ${method}`);
    console.log(`[products UPDATE] Updated product:`, doc._id, doc.title || doc.name || doc.Name);
    
    // Verify the update by re-fetching from database
    const verifyDoc = await ProductModel.findById(doc._id).lean();
    if (verifyDoc) {
      console.log(`[products UPDATE] ✓ Verified - changes persisted to database`);
      console.log(`[products UPDATE] Image fields in DB after update:`);
      console.log(`  - img: ${verifyDoc.img || 'N/A'}`);
      console.log(`  - imageUrl: ${verifyDoc.imageUrl || 'N/A'}`);
      console.log(`  - image: ${verifyDoc.image || 'N/A'}`);
      console.log(`[products UPDATE] Name in DB: ${verifyDoc.Name || verifyDoc.name || verifyDoc.title}`);
      
      // Check if all image fields are synced
      const imgFields = [verifyDoc.img, verifyDoc.imageUrl, verifyDoc.image].filter(Boolean);
      const allSynced = imgFields.length > 0 && imgFields.every(f => f === imgFields[0]);
      console.log(`[products UPDATE] ${allSynced ? '✓' : '⚠️'} Image fields ${allSynced ? 'ARE' : 'ARE NOT'} synced`);
    } else {
      console.log(`[products UPDATE] ⚠️ WARNING: Could not verify update`);
    }
    console.log(`[products UPDATE] ========================================`);
    
    // Clear cache headers to force image refresh on client
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json({ 
      ok: true, 
      product: doc, 
      message: `Updated via ${method}`,
      timestamp: Date.now(), // Help client bust image cache
      verified: !!verifyDoc
    });
    
  } catch (err) {
    console.error('[products UPDATE] ✗✗✗ FATAL ERROR:', err);
    console.error('[products UPDATE] Stack:', err.stack);
    return res.status(500).json({ ok: false, error: 'Server error: ' + err.message });
  }
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
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aalacomputer', {
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
          brand: payload.brand || '',
          name: payload.name || payload.title,
          title: payload.title || payload.name,
          price: Number(payload.price),
          category: payload.category || 'Uncategorized',
          description: payload.description || '',
          img: payload.img || payload.imageUrl || '',
          imageUrl: payload.imageUrl || payload.img || '',
          WARRANTY: payload.WARRANTY || '1 Year',
          link: payload.link || '',
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
      const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';
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

    // Delete from database - try both _id and id field
    let result = await ProductModel.findByIdAndDelete(id).catch(() => null);
    if (!result) {
      result = await ProductModel.findOneAndDelete({ id: String(id) });
    }
    
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

// ========================================
// CHATBASE SEARCH ENDPOINT (ISOLATED)
// This endpoint is exclusively for Chatbase AI integration
// Does NOT interfere with any existing routes or functionality
// ========================================
app.get('/api/chatbase/search', async (req, res) => {
  try {
    // Set CORS headers for Chatbase
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    // Optional: API key security (uncomment to enable)
    // const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    // const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY || 'your-secret-key';
    // if (apiKey !== CHATBASE_API_KEY) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    
    // Get search query
    const query = req.query.q || '';
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required',
        example: '/api/chatbase/search?q=RGB+8GB+RAM'
      });
    }
    
    console.log(`[chatbase-search] Query: "${query}"`);
    
    // Get MongoDB connection
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    
    if (!ProductModel || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    // Build search query - search across multiple fields
    const searchTerms = query.trim().split(/\s+/).filter(Boolean);
    
    // Create regex patterns for each search term (case-insensitive)
    const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
    
    // Search in name, title, category, brand, description, specs
    const searchQuery = {
      $or: [
        { name: { $in: regexPatterns } },
        { title: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
        { brand: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
        { Spec: { $in: regexPatterns } },
        { specs: { $elemMatch: { $in: regexPatterns } } },
        // Also match if ALL terms are in the name/title (for better relevance)
        { $and: searchTerms.map(term => ({ name: new RegExp(term, 'i') })) },
        { $and: searchTerms.map(term => ({ title: new RegExp(term, 'i') })) }
      ]
    };
    
    // Execute search with limit of 20 results
    const results = await ProductModel
      .find(searchQuery)
      .select('_id id name title category brand price img imageUrl description')
      .limit(20)
      .lean();
    
    console.log(`[chatbase-search] Found ${results.length} results for "${query}"`);
    
    // Format results for Chatbase
    const formattedResults = results.map(product => {
      const productId = product._id || product.id;
      const productName = product.name || product.title || 'Unnamed Product';
      const productPrice = product.price ? `PKR ${product.price.toLocaleString()}` : 'Contact for price';
      const productCategory = product.category || 'General';
      const productUrl = `https://www.aalacomputer.com/products/${productId}`;
      const productImage = product.imageUrl || product.img || '';
      const productBrand = product.brand || '';
      
      return {
        id: String(productId),
        name: productName,
        category: productCategory,
        brand: productBrand,
        price: productPrice,
        url: productUrl,
        image: productImage,
        description: product.description ? product.description.substring(0, 200) : ''
      };
    });
    
    // Return results
    return res.json({
      success: true,
      query: query,
      count: formattedResults.length,
      results: formattedResults
    });
    
  } catch (error) {
    console.error('[chatbase-search] Error:', error.message);
    return res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

// List all products (PUBLIC - for frontend products page) - Using testproduct collection
app.get('/api/products', async (req, res) => {
  // Add caching headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 32; // Default 32 products per page
  
  // Cap limit to 5000 to allow fetching all products
  if (limit > 5000) limit = 5000;
  
  const skip = (page - 1) * limit;
  const category = req.query.category;
  const brand = req.query.brand;
  const search = req.query.search;
  
  const fs = require('fs');
  const logMsg = `[${new Date().toISOString()}] [products] Request: page=${page}, limit=${limit}, skip=${skip}\n`;
  fs.appendFileSync('products-api.log', logMsg);
  
  try {
    const mongoose = require('mongoose');
    const dbReady = mongoose.connection.readyState === 1;
    const logMsg2 = `[${new Date().toISOString()}] [products] DB ready: ${dbReady}\n`;
    fs.appendFileSync('products-api.log', logMsg2);
    
    if (mongoose.connection.readyState === 1) {
      // Get product collection model
      let ProductModel;
      if (mongoose.models && mongoose.models.Product) {
        ProductModel = mongoose.models.Product;
      } else {
        const schema = new mongoose.Schema({}, { strict: false });
        ProductModel = mongoose.model('Product', schema, 'products');
      }
      
      // Build query based on filters
      const query = {};
      
      // Category filter - EXACT match only (no cross-category pollution)
      if (category && category !== 'All') {
        query.category = { $regex: `^${category}$`, $options: 'i' };
      }
      
      // Brand filter
      if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
      }
      
      // Search filter - search in Name, title, category, brand, and specs
      if (search) {
        query.$or = [
          { Name: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { 'category.main': { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { Spec: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Use Promise.all to fetch count and products in parallel
      try {
        const [total, docs] = await Promise.all([
          ProductModel.countDocuments(query),
          ProductModel.find(query)
            // Return all fields - don't restrict with .select()
            .lean()
            .skip(skip)
            .limit(limit)
            .exec()
        ]);
        
        console.log(`[products] Success: page=${page}, returned ${docs.length} products, total=${total}`);
        return res.json({
          products: docs,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + docs.length < total
        });
      } catch (queryErr) {
        const errMsg = `[${new Date().toISOString()}] [products] Query error: ${queryErr && (queryErr.stack || queryErr.message)}\n`;
        fs.appendFileSync('products-api.log', errMsg);
        throw queryErr;
      }
    } else {
      const warnMsg = `[${new Date().toISOString()}] [products] DB not ready, falling back to file\n`;
      fs.appendFileSync('products-api.log', warnMsg);
    }
  } catch (e) { 
    const errMsg = `[${new Date().toISOString()}] [products] DB query failed: ${e && (e.stack || e.message)}\n`;
    fs.appendFileSync('products-api.log', errMsg);
    console.error('[products] MongoDB query failed - no file fallback available:', e && e.message);
    return res.status(503).json({ ok: false, error: 'Database unavailable - please try again later' });
  }
  
  // MongoDB only - no file fallback
  // If we reach here, MongoDB is not connected and we cannot serve products
  console.error('[products] MongoDB not connected and no fallback available');
  return res.status(503).json({ ok: false, error: 'Database unavailable' });
});

// List all products (PROTECTED - for admin dashboard)
app.get('/api/admin/products', async (req, res) => {
  try {
    console.log('[admin/products] Request received');
    
    // Check authentication first
    if (!requireAdmin(req)) {
      console.log('[admin/products] Unauthorized request');
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    // Parse query parameters
    let limit = parseInt(req.query.limit) || 50; // Load 50 by default
    let page = parseInt(req.query.page) || 1;
    const search = req.query.search || req.query.q || ''; // Support both 'search' and 'q' parameters
    const fetchAll = req.query.fetchAll === 'true'; // Fetch all products flag
    
    // Validate and constrain parameters
    if (limit < 1) limit = 50;
    if (limit > 50) limit = 50;  // Cap at 50 products per page
    if (page < 1) page = 1;
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    console.log(`[admin/products] limit=${limit}, page=${page}, skip=${skip}, search="${search}", fetchAll=${fetchAll}`);
    console.log(`[admin/products] 📊 Will return products ${skip + 1} to ${skip + limit}`);

    // Try database first
    try {
      console.log('[admin/products] Checking database connection');
      const mongoose = require('mongoose');
      
      // Check MongoDB connection
      if (!mongoose.connection.readyState) {
        console.log('[admin/products] MongoDB not connected, attempting connection...');
        const MONGO_URI = process.env.MONGODB_URI;
        
        if (!MONGO_URI) {
          console.log('[admin/products] MONGO_URI not configured, falling back to file storage');
          const prods = readDataFile('products.json') || [];
          return res.json({ ok: true, products: prods, total: prods.length });
        }

        try {
          console.log('[admin/products] Connecting to MongoDB...');
          await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
          });
          console.log('[admin/products] MongoDB connection established');
        } catch (connError) {
          console.error('[admin/products] MongoDB connection failed:', connError);
          const prods = readDataFile('products.json') || [];
          return res.json({ ok: true, products: prods, total: prods.length });
        }
      }

      const ProductModel = getProductModel();
      if (ProductModel && mongoose.connection.readyState === 1) {
        // Build query
        let query = {};
        
        // Category filter with smart filtering
        const category = req.query.category || req.query.cat || '';
        if (category && category !== 'All' && category !== '') {
          console.log(`[admin/products] Filtering by category: "${category}"`);
          
          // Smart filtering for Processor category
          if (category.toLowerCase() === 'processor') {
            // Only show actual CPUs (Intel/AMD), not GPUs with those names
            query.$and = [
              {
                $or: [
                  { category: { $regex: 'processor', $options: 'i' } },
                  { category: { $regex: 'cpu', $options: 'i' } }
                ]
              },
              {
                $or: [
                  { Name: { $regex: '\\b(intel|amd|ryzen|i3|i5|i7|i9|xeon)\\b', $options: 'i' } },
                  { name: { $regex: '\\b(intel|amd|ryzen|i3|i5|i7|i9|xeon)\\b', $options: 'i' } }
                ]
              },
              {
                // Exclude graphics cards that might have AMD/Intel in name
                $nor: [
                  { Name: { $regex: '\\b(graphics|gpu|video|card|geforce|gtx|rtx|radeon|arc)\\b', $options: 'i' } },
                  { name: { $regex: '\\b(graphics|gpu|video|card|geforce|gtx|rtx|radeon|arc)\\b', $options: 'i' } }
                ]
              }
            ];
          } else {
            // Standard filtering for other categories - ONLY match category field
            query.$or = [
              { category: { $regex: category, $options: 'i' } },
              { 'category.main': { $regex: category, $options: 'i' } }
            ];
          }
        }
        
        // Search across multiple fields - improved flexible matching with fallback
        if (search) {
          const searchTerm = search.trim();
          console.log(`[admin/products] Searching for: "${searchTerm}" (length: ${searchTerm.length})`);
          
          // For very long search terms (100+ chars), split into key words
          let searchQueries = [];
          
          if (searchTerm.length > 100) {
            // Split long search into key words (first 3-4 words)
            const words = searchTerm.split(/\s+/).slice(0, 4).join(' ');
            console.log(`[admin/products] Long search term detected, using key words: "${words}"`);
            
            // Try with key words first
            searchQueries.push({
              $or: [
                { name: { $regex: words, $options: 'i' } },
                { title: { $regex: words, $options: 'i' } },
                { Name: { $regex: words, $options: 'i' } }
              ]
            });
          }
          
          // Also try full phrase match
          searchQueries.push({
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { title: { $regex: searchTerm, $options: 'i' } },
              { Name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { brand: { $regex: searchTerm, $options: 'i' } },
              { category: { $regex: searchTerm, $options: 'i' } },
              { id: { $regex: searchTerm, $options: 'i' } },
              { Spec: { $regex: searchTerm, $options: 'i' } }
            ]
          });
          
          // Use $or to try multiple search strategies
          const searchQuery = { $or: searchQueries };
          
          // Combine category filter with search filter
          if (query.$or) {
            // If category filter exists, combine with search using $and
            query = {
              $and: [
                { $or: query.$or },  // Category filter
                searchQuery           // Search filter
              ]
            };
          } else {
            // No category filter, just use search
            query = searchQuery;
          }
          
          console.log(`[admin/products] Search query: Multi-strategy matching (${searchQueries.length} strategies)`);
        }
        
        // Get total count
        console.log(`[admin/products] Counting documents with query...`);
        const total = await ProductModel.countDocuments(query);
        console.log(`[admin/products] Total documents found: ${total}`);
        
        // Fetch products with pagination (ALWAYS paginate, even with search)
        let docs;
        const skip = (page - 1) * limit;
        
        console.log(`[admin/products] Skip: ${skip}, Limit: ${limit}, Page: ${page}`);
        
        if (fetchAll && !search) {
          // Only fetch all if explicitly requested AND no search term
          console.log(`[admin/products] Fetching ALL products (fetchAll mode)...`);
          docs = await ProductModel.find(query)
            .select('id Name name title price img imageUrl image category brand description stock inStock')
            .lean()
            .sort({ createdAt: -1 });
          console.log(`[admin/products] ✅ Fetched ALL ${docs.length} products (fetchAll mode)`);
        } else {
          // Default: ALWAYS paginate (even with search)
          console.log(`[admin/products] Fetching paginated products...`);
          docs = await ProductModel.find(query)
            .select('id Name name title price img imageUrl image category brand description stock inStock')
            .lean()
            .skip(skip)
            .limit(limit)
            .exec();
          console.log(`[admin/products] ✅ Fetched ${docs.length} of ${total} products (page ${page}, search: ${!!search})`);
        }
        
        // Validate and mark products with missing/failed images - ONLY on fetched docs
        docs = docs.map(doc => {
          const primaryUrl = doc.imageUrl || doc.img || doc.image || '';
          const url = String(primaryUrl).trim();
          
          // Check if image is missing or invalid
          const hasMissingImage = !url || 
            url === 'undefined' || 
            url === 'null' || 
            url === '/placeholder.svg' || 
            url.startsWith('/fallback/') || 
            url.startsWith('data:image/svg+xml');
          
          return {
            ...doc,
            _hasMissingImage: hasMissingImage
          };
        });
        
        return res.json({ 
          ok: true, 
          products: docs, 
          total: total,
          page: page,
          limit: limit,
          hasMore: docs.length < total
        });
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
    return res.json({ ok: true, products: prods, total: prods.length });
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

// Get all products with missing or placeholder images (PROTECTED - for admin)
app.get('/api/admin/products-missing-images', async (req, res) => {
  try {
    if (!requireAdmin(req)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    console.log('[admin/products-missing-images] Fetching products with missing/placeholder images');

    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('[admin/products-missing-images] MongoDB not connected');
      return res.status(500).json({ ok: false, error: 'Database not connected' });
    }

    const ProductModel = getProductModel();
    
    // Query for products with missing or placeholder images
    const missingImageProducts = await ProductModel.find({
      $or: [
        // Empty or missing image fields
        { img: { $in: ['', null, undefined] } },
        { imageUrl: { $in: ['', null, undefined] } },
        { image: { $in: ['', null, undefined] } },
        // Placeholder images
        { img: { $regex: 'placeholder|default|no-image|missing|broken|error|404', $options: 'i' } },
        { imageUrl: { $regex: 'placeholder|default|no-image|missing|broken|error|404', $options: 'i' } },
        { image: { $regex: 'placeholder|default|no-image|missing|broken|error|404', $options: 'i' } },
        // Common fallback paths
        { img: { $regex: '/images/placeholder|/assets/placeholder|/img/default|/public/placeholder', $options: 'i' } },
        { imageUrl: { $regex: '/images/placeholder|/assets/placeholder|/img/default|/public/placeholder', $options: 'i' } },
        { image: { $regex: '/images/placeholder|/assets/placeholder|/img/default|/public/placeholder', $options: 'i' } }
      ]
    })
    .select('_id name title img imageUrl image category price')
    .limit(1000)
    .lean();

    console.log(`[admin/products-missing-images] Found ${missingImageProducts.length} products with missing/placeholder images`);

    return res.json(missingImageProducts);

  } catch (err) {
    console.error('[admin/products-missing-images] Error:', err.message);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch products with missing images'
    });
  }
});

// Extract image from Google Images (PROTECTED - for admin) - OPTIMIZED FOR SPEED
// Helper function to extract image from Bing
const extractImageFromBing = async (searchQuery) => {
  const axios = require('axios');
  
  const bingSearchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&form=HDRSC2&first=1&tsc=ImageBasicHover`;
  
  const response = await axios.get(bingSearchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 10000
  });

  const html = response.data;
  const imageUrls = [];
  
  // Method 1: Look for murl in the m attribute (Bing's format)
  const mMatches = html.match(/m="([^"]+)"/g);
  if (mMatches) {
    for (const match of mMatches) {
      try {
        const mValue = match.match(/m="([^"]+)"/)[1];
        const decoded = decodeURIComponent(mValue);
        const murlMatch = decoded.match(/"murl":"([^"]+)"/);
        if (murlMatch && murlMatch[1]) {
          let url = murlMatch[1];
          // Clean up HTML entities
          url = url.replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
          // Extract just the URL part (remove query params after image extension)
          const urlMatch = url.match(/https?:\/\/[^\s"'&]+\.(jpg|jpeg|png|gif|webp)/i);
          if (urlMatch) {
            imageUrls.push(urlMatch[0]);
          }
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  // Method 2: Direct image URL extraction
  if (imageUrls.length === 0) {
    const directMatches = html.match(/https?:\/\/[^\s"'`<>&]+\.(jpg|jpeg|png|gif|webp)/gi);
    if (directMatches) {
      imageUrls.push(...directMatches);
    }
  }
  
  // Filter and return the first valid image
  for (const url of imageUrls) {
    if (url.length > 50 && !url.includes('bing.com') && !url.includes('gstatic.com')) {
      return url;
    }
  }
  
  return null;
};

// Helper function to simplify product name for fallback search
const simplifyProductName = (fullName) => {
  // Remove color, specs, and extra details
  // Examples:
  // "Apple MacBook 14 inch blue color" -> "Apple MacBook"
  // "SteelSeries Arctis Nova 3P Wireless Multi-Platform Gaming Headset – White" -> "SteelSeries Arctis Nova"
  // "MSI MAG PANO M100R PZ Premium Mid-Tower Gaming PC Case – White" -> "MSI MAG PANO"
  
  // Remove common color words
  let simplified = fullName.replace(/\b(blue|black|white|red|green|silver|gold|gray|grey|pink|purple|yellow|orange|brown|beige|transparent|matte|glossy|metallic)\b/gi, '');
  
  // Remove common descriptors
  simplified = simplified.replace(/\b(inch|color|style|version|edition|model|variant|pro|max|plus|lite|standard|premium|deluxe|ultimate|professional)\b/gi, '');
  
  // Remove special characters and extra spaces
  simplified = simplified.replace(/[–\-—]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Take first 2-3 words (usually brand + product type)
  const words = simplified.split(' ').filter(w => w.length > 0);
  return words.slice(0, 3).join(' ');
};

app.post('/api/admin/extract-image', async (req, res) => {
  try {
    if (!requireAdmin(req)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({ ok: false, error: 'Product name required' });
    }

    console.log('[extract-image] 🔍 Extracting image for:', productName);

    try {
      // Try 1: Search with full product name
      console.log('[extract-image] 📍 Attempt 1: Full product name search');
      let imageUrl = await extractImageFromBing(productName);
      
      if (imageUrl) {
        console.log('[extract-image] ✅ Found with full name:', imageUrl);
        return res.json({ 
          ok: true, 
          imageUrl: imageUrl,
          source: 'bing-images',
          searchType: 'full-name'
        });
      }
      
      // Try 2: Search with simplified name (brand + product type only)
      const simplifiedName = simplifyProductName(productName);
      if (simplifiedName !== productName) {
        console.log('[extract-image] 📍 Attempt 2: Simplified search -', simplifiedName);
        imageUrl = await extractImageFromBing(simplifiedName);
        
        if (imageUrl) {
          console.log('[extract-image] ✅ Found with simplified name:', imageUrl);
          return res.json({ 
            ok: true, 
            imageUrl: imageUrl,
            source: 'bing-images',
            searchType: 'simplified-name'
          });
        }
      }
      
      // Try 3: Search with just the brand name
      const brandName = productName.split(' ')[0];
      if (brandName && brandName.length > 2) {
        console.log('[extract-image] 📍 Attempt 3: Brand only search -', brandName);
        imageUrl = await extractImageFromBing(brandName);
        
        if (imageUrl) {
          console.log('[extract-image] ✅ Found with brand name:', imageUrl);
          return res.json({ 
            ok: true, 
            imageUrl: imageUrl,
            source: 'bing-images',
            searchType: 'brand-only'
          });
        }
      }
      
      console.log('[extract-image] ❌ No image found after all attempts');
      return res.status(404).json({ ok: false, error: 'No image found' });

    } catch (error) {
      console.error('[extract-image] Error:', error.message);
      return res.status(500).json({ 
        ok: false, 
        error: 'Failed to extract image'
      });
    }

  } catch (err) {
    console.error('[extract-image] Error:', err.message);
    return res.status(500).json({ 
      ok: false, 
      error: 'Internal server error'
    });
  }
});

// Get single product by ID (PUBLIC - OPTIMIZED for fast loading)
app.get('/api/product/:id', (req, res) => {
  // Short cache to show admin updates quickly
  res.setHeader('Cache-Control', 'public, max-age=30, must-revalidate'); // Cache for 30 seconds only
  
  const id = req.params.id;
  try {
    const mongoose = require('mongoose');
    const ProductModel = getProductModel();
    
    if (ProductModel && mongoose.connection.readyState === 1) {
      // OPTIMIZED: Direct findById or findOne with lean() for faster reads
      ProductModel.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
          { id: String(id) }
        ]
      })
      .select('id Name name title price img imageUrl image category category_id brand description WARRANTY link Spec type inStock')
      .lean() // Much faster than full Mongoose documents
      .then((doc) => {
        if (!doc) return res.status(404).json({ ok: false, error: 'product not found' });
        return res.json(doc);
      })
      .catch(err => {
        console.error('[product/:id] product get failed', err && (err.stack || err.message));
        res.status(500).json({ ok: false, error: 'db error' });
      });
      return;
    }
    
    // Fallback to file
    const prods = readDataFile('products.json') || [];
    const product = prods.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    if (!product) return res.status(404).json({ ok: false, error: 'product not found' });
    res.json(product);
  } catch (e) {
    console.error('get product failed', e);
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

// Get single product by ID (PROTECTED - for admin)
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


// NOTE: Public product editing endpoint removed - only admin endpoints available

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

// Deals and Prebuilds Models
function getDealModel() {
  try {
    const mongoose = require('mongoose');
    if (!mongoose) return null;
    if (mongoose.models && mongoose.models.Deal) return mongoose.models.Deal;
    const schema = new mongoose.Schema(Object.assign({}, ProductSchemaDef, { price: mongoose.Schema.Types.Mixed }), { timestamps: true });
    return mongoose.model('Deal', schema);
  } catch (err) {
    console.error('[getDealModel] failed', err && err.message);
    return null;
  }
}

function getPrebuildModel() {
  try {
    const mongoose = require('mongoose');
    if (!mongoose) return null;
    if (mongoose.models && mongoose.models.Prebuild) return mongoose.models.Prebuild;
    const schema = new mongoose.Schema(Object.assign({}, ProductSchemaDef, { price: mongoose.Schema.Types.Mixed }), { timestamps: true });
    return mongoose.model('Prebuild', schema);
  } catch (err) {
    console.error('[getPrebuildModel] failed', err && err.message);
    return null;
  }
}

// PUBLIC: Get all deals
app.get('/api/deals', (req, res) => {
  try {
    const mongoose = require('mongoose');
    const DealModel = getDealModel();
    if (DealModel && mongoose.connection.readyState === 1) {
      DealModel.find({}).lean().sort({ createdAt: -1 }).then((docs) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(docs || []);
      }).catch(err => { 
        console.error('[deals] list failed', err && (err.stack || err.message)); 
        res.status(500).json({ ok: false, error: 'db error' }); 
      });
      return;
    }
  } catch (e) { 
    console.error('[deals] error:', e);
  }
  const deals = readDataFile('deals.json') || [];
  res.setHeader('Content-Type', 'application/json');
  res.json(deals);
});

// PROTECTED: Create deal
app.post('/api/admin/deals', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  const payload = req.body || {};
  if (!payload.name && !payload.title) {
    return res.status(400).json({ ok: false, error: 'Product name or title is required' });
  }

  try {
    const mongoose = require('mongoose');
    const DealModel = getDealModel();
    if (DealModel && mongoose.connection.readyState === 1) {
      const id = payload.id || `d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const doc = new DealModel({
        id,
        name: payload.name || payload.title,
        title: payload.title || payload.name,
        price: Number(payload.price) || 0,
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
      await doc.save();
      console.log(`[deal] Created new deal: ${id}`);
      return res.json({ ok: true, product: doc.toObject() });
    }
    
    const deals = readDataFile('deals.json') || [];
    const id = payload.id || `d_${Date.now()}`;
    const newDeal = { id, ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    deals.unshift(newDeal);
    writeDataFile('deals.json', deals);
    return res.json({ ok: true, product: newDeal });
  } catch (e) {
    console.error('[deal] Create failed:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

// PUBLIC: Get all prebuilds
app.get('/api/prebuilds', (req, res) => {
  try {
    const mongoose = require('mongoose');
    const PrebuildModel = getPrebuildModel();
    if (PrebuildModel && mongoose.connection.readyState === 1) {
      PrebuildModel.find({}).lean().sort({ createdAt: -1 }).then((docs) => res.json(docs)).catch(err => { 
        console.error('[prebuilds] list failed', err && (err.stack || err.message)); 
        res.status(500).json({ ok: false, error: 'db error' }); 
      });
      return;
    }
  } catch (e) { /* fallback to file */ }
  const prebuilds = readDataFile('prebuilds.json') || [];
  res.json(prebuilds);
});

// PUBLIC: Get all videos from database
app.get('/api/videos', (req, res) => {
  try {
    const videos = safeLoadJSON('videos.json') || [];
    res.json({ 
      success: true,
      videos: videos,
      total: videos.length
    });
  } catch (err) {
    console.error('[videos] Error fetching videos:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

// PUBLIC: Get TikTok videos for a user
app.get('/api/tiktok/videos', async (req, res) => {
  try {
    const username = req.query.username || 'aalacomputers';
    const apiKey = process.env.TIKTOK_API_KEY || process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      console.warn('[tiktok] No API key configured, returning mock data');
      return res.json({ 
        videos: getMockTikTokVideos(),
        source: 'mock'
      });
    }

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'tiktok-api.p.rapidapi.com'
      }
    };

    const response = await fetch(
      `https://tiktok-api.p.rapidapi.com/user/info?username=${username}`,
      options
    );

    if (!response.ok) {
      throw new Error(`TikTok API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.user && data.user.pinnedVideos && data.user.pinnedVideos.length > 0) {
      const videos = data.user.pinnedVideos.slice(0, 3).map(video => ({
        id: video.id,
        title: video.desc || 'TikTok Video',
        likes: video.stats?.likeCount || 0,
        comments: video.stats?.commentCount || 0,
        shares: video.stats?.shareCount || 0,
        videoUrl: `https://www.tiktok.com/@${username}/video/${video.id}`,
        thumbnail: video.video?.downloadAddr || video.dynamicCover || '/placeholder.svg',
        author: data.user.nickname || 'Aala Computers',
        authorAvatar: data.user.avatarLarger || '/placeholder.svg'
      }));
      
      console.log(`[tiktok] Fetched ${videos.length} videos for @${username}`);
      return res.json({ videos, source: 'tiktok' });
    } else {
      console.warn('[tiktok] No pinned videos found, returning mock data');
      return res.json({ 
        videos: getMockTikTokVideos(),
        source: 'mock'
      });
    }
  } catch (err) {
    console.error('[tiktok] Error fetching videos:', err.message);
    // Return mock data as fallback
    res.json({ 
      videos: getMockTikTokVideos(),
      source: 'mock',
      error: err.message
    });
  }
});

// Helper function for mock TikTok videos
function getMockTikTokVideos() {
  return [
    {
      id: '7565218063243627794',
      title: '110k PC that runs GTA 5 like a butter 🔥',
      likes: 125400,
      comments: 8900,
      shares: 5200,
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7565218063243627794',
      thumbnail: 'https://p16-sign.tiktokcdn.com/tos-pk-0-0-0/7565218063243627794~c5_1080x1920.jpeg',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg'
    },
    {
      id: '2',
      title: 'Budget Gaming PC Build - 50K PKR 💻',
      likes: 89200,
      comments: 6500,
      shares: 3800,
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7564123456789012345',
      thumbnail: 'https://via.placeholder.com/300x400?text=Budget+Gaming+PC',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg'
    },
    {
      id: '3',
      title: 'High-End Gaming Rig - RTX 4070 Beast 🚀',
      likes: 156800,
      comments: 11200,
      shares: 7400,
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7563987654321098765',
      thumbnail: 'https://via.placeholder.com/300x400?text=RTX+4070+Gaming+PC',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg'
    }
  ];
}

// PROTECTED: Create prebuild
app.post('/api/admin/prebuilds', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  const payload = req.body || {};
  if (!payload.name && !payload.title) {
    return res.status(400).json({ ok: false, error: 'Product name or title is required' });
  }

  try {
    const mongoose = require('mongoose');
    const PrebuildModel = getPrebuildModel();
    if (PrebuildModel && mongoose.connection.readyState === 1) {
      const id = payload.id || `pb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const doc = new PrebuildModel({
        id,
        name: payload.name || payload.title,
        title: payload.title || payload.name,
        price: Number(payload.price) || 0,
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
      await doc.save();
      console.log(`[prebuild] Created new prebuild: ${id}`);
      return res.json({ ok: true, product: doc.toObject() });
    }
    
    const prebuilds = readDataFile('prebuilds.json') || [];
    const id = payload.id || `pb_${Date.now()}`;
    const newPrebuild = { id, ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    prebuilds.unshift(newPrebuild);
    writeDataFile('prebuilds.json', prebuilds);
    return res.json({ ok: true, product: newPrebuild });
  } catch (e) {
    console.error('[prebuild] Create failed:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

// PROTECTED: Update prebuild
app.put('/api/admin/prebuilds/:id', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  const { id } = req.params;
  const payload = req.body || {};

  try {
    const mongoose = require('mongoose');
    const PrebuildModel = getPrebuildModel();
    if (PrebuildModel && mongoose.connection.readyState === 1) {
      const doc = await PrebuildModel.findById(id);
      if (!doc) {
        return res.status(404).json({ ok: false, error: 'Prebuild not found' });
      }
      
      if (payload.name) doc.name = payload.name;
      if (payload.title) doc.title = payload.title;
      if (typeof payload.price !== 'undefined') doc.price = Number(payload.price);
      if (payload.category) doc.category = payload.category;
      if (payload.description) doc.description = payload.description;
      if (payload.img) doc.img = payload.img;
      if (payload.imageUrl) doc.imageUrl = payload.imageUrl;
      if (Array.isArray(payload.specs)) doc.specs = payload.specs;
      if (Array.isArray(payload.tags)) doc.tags = payload.tags;
      if (typeof payload.stock !== 'undefined') doc.stock = Number(payload.stock);
      doc.updatedAt = new Date();
      
      await doc.save();
      console.log(`[prebuild] Updated prebuild: ${id}`);
      return res.json({ ok: true, product: doc.toObject() });
    }
    
    const prebuilds = readDataFile('prebuilds.json') || [];
    const idx = prebuilds.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Prebuild not found' });
    }
    
    prebuilds[idx] = { ...prebuilds[idx], ...payload, updatedAt: new Date().toISOString() };
    writeDataFile('prebuilds.json', prebuilds);
    return res.json({ ok: true, product: prebuilds[idx] });
  } catch (e) {
    console.error('[prebuild] Update failed:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

// PROTECTED: Delete prebuild
app.delete('/api/admin/prebuilds/:id', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  const { id } = req.params;
  console.log(`[prebuild] DELETE request for ID: ${id}`);

  try {
    const mongoose = require('mongoose');
    const PrebuildModel = getPrebuildModel();
    
    if (PrebuildModel && mongoose.connection.readyState === 1) {
      console.log('[prebuild] Using MongoDB for deletion');
      
      // Try multiple approaches to find and delete
      let result = null;
      
      // Approach 1: Direct findByIdAndDelete
      try {
        result = await PrebuildModel.findByIdAndDelete(id);
      } catch (err) {
        console.log('[prebuild] findByIdAndDelete failed, trying findOne:', err.message);
      }
      
      // Approach 2: Find by _id string match
      if (!result) {
        result = await PrebuildModel.findOneAndDelete({ _id: id });
      }
      
      // Approach 3: Find by id field
      if (!result) {
        result = await PrebuildModel.findOneAndDelete({ id: id });
      }
      
      if (!result) {
        console.log(`[prebuild] Not found in MongoDB, trying JSON file`);
        // Fall through to JSON file handling
      } else {
        console.log(`[prebuild] Successfully deleted from MongoDB: ${id}`);
        return res.json({ ok: true, message: 'Prebuild deleted' });
      }
    }
    
    // JSON file fallback
    console.log('[prebuild] Using JSON file for deletion');
    const prebuilds = readDataFile('prebuilds.json') || [];
    console.log(`[prebuild] Found ${prebuilds.length} prebuilds in file`);
    
    const idx = prebuilds.findIndex(p => {
      const match = String(p._id) === String(id) || String(p.id) === String(id);
      if (match) console.log(`[prebuild] Match found at index ${idx}`);
      return match;
    });
    
    if (idx === -1) {
      console.log('[prebuild] Prebuild not found in file either');
      return res.status(404).json({ ok: false, error: 'Prebuild not found' });
    }
    
    const deleted = prebuilds.splice(idx, 1);
    writeDataFile('prebuilds.json', prebuilds);
    console.log(`[prebuild] Deleted from file:`, deleted[0]);
    return res.json({ ok: true, message: 'Prebuild deleted' });
  } catch (e) {
    console.error('[prebuild] Delete failed:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

// NOTE: Public prebuild delete endpoint removed - only admin endpoints available

// Database status endpoint (for debugging)
app.get('/api/db-status', (req, res) => {
  try {
    const mongoose = require('mongoose');
    const status = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models)
    };
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// ==================== CATEGORIES ENDPOINTS ====================

// Public: Get all categories (dynamically from DB)
app.get('/api/categories', async (req, res) => {
  try {
    const ProductModel = getProductModel();
    let categories = [];
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      // Get categories from actual products in DB
      const dbCategories = await ProductModel.aggregate([
        { $match: { is_active: { $ne: false } } },
        { $group: { 
            _id: '$category',
            count: { $sum: 1 },
            brands: { $addToSet: '$brand' }
          } 
        },
        { $match: { _id: { $ne: null, $ne: '' } } },
        { $sort: { _id: 1 } }
      ]);
      
      // Load Pakistan categories for metadata
      const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
      
      categories = dbCategories.map((cat, idx) => {
        const categoryName = cat._id;
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        const pakistanCat = PAKISTAN_CATEGORIES.find(
          pc => pc.name === categoryName || 
                pc.slug === slug ||
                (pc.alternativeNames && pc.alternativeNames.includes(categoryName))
        );
        
        return {
          _id: categoryName,
          id: categoryName,
          name: categoryName,
          slug: slug,
          description: pakistanCat?.description || `Shop ${categoryName}`,
          icon: pakistanCat?.icon || 'package',
          brands: cat.brands.filter(b => b && b.trim()),
          productCount: cat.count
        };
      });
      
      console.log(`[/api/categories] Returning ${categories.length} categories from DB`);
    } else {
      // Fallback to file
      categories = readDataFile('categories.json') || [];
      console.log('[/api/categories] Using file-based fallback');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(categories);
  } catch (err) {
    console.error('[categories] Get failed:', err);
    res.status(500).json({ ok: false, error: 'Failed to get categories' });
  }
});

// Admin: Get all categories (from DB)
app.get('/api/admin/categories', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const ProductModel = getProductModel();
    let categories = [];
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      // Get all unique categories from products
      const dbCategories = await ProductModel.aggregate([
        { $group: { 
            _id: '$category',
            count: { $sum: 1 },
            brands: { $addToSet: '$brand' }
          } 
        },
        { $match: { _id: { $ne: null, $ne: '' } } },
        { $sort: { _id: 1 } }
      ]);
      
      const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
      
      categories = dbCategories.map(cat => {
        const categoryName = cat._id;
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        const pakistanCat = PAKISTAN_CATEGORIES.find(
          pc => pc.name === categoryName || pc.slug === slug
        );
        
        return {
          _id: categoryName,
          id: categoryName,
          name: categoryName,
          slug: slug,
          brands: cat.brands.filter(b => b && b.trim()),
          productCount: cat.count,
          icon: pakistanCat?.icon || 'package'
        };
      });
    } else {
      categories = readDataFile('categories.json') || [];
    }
    
    res.json({ ok: true, categories });
  } catch (err) {
    console.error('[admin/categories] Error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get categories' });
  }
});

// Admin: Create category
app.post('/api/admin/categories', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const categories = readDataFile('categories.json') || [];
    const newCategory = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    categories.push(newCategory);
    writeDataFile('categories.json', categories);
    res.json({ ok: true, category: newCategory });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to create category' });
  }
});

// Admin: Update category
app.put('/api/admin/categories/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const categories = readDataFile('categories.json') || [];
    const idx = categories.findIndex(c => String(c._id) === String(req.params.id) || String(c.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Category not found' });
    
    categories[idx] = { ...categories[idx], ...req.body, updatedAt: new Date() };
    writeDataFile('categories.json', categories);
    res.json({ ok: true, category: categories[idx] });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update category' });
  }
});

// Admin: Delete category
app.delete('/api/admin/categories/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const categories = readDataFile('categories.json') || [];
    const idx = categories.findIndex(c => String(c._id) === String(req.params.id) || String(c.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Category not found' });
    
    categories.splice(idx, 1);
    writeDataFile('categories.json', categories);
    res.json({ ok: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to delete category' });
  }
});

// ==================== ENHANCED DYNAMIC CATEGORIES ====================

// Category cache to avoid DB queries on every request
const categoryCache = { data: null, timestamp: 0, ttl: 300000 }; // 5 min cache

// Intelligent product matching function
function intelligentProductMatch(product, categorySlug, categoryName) {
  const productName = (product.name || product.title || product.Name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productBrand = (product.brand || '').toLowerCase();
  const productDesc = (product.description || '').toLowerCase();
  
  const slug = categorySlug.toLowerCase();
  const catName = categoryName.toLowerCase();
  
  // 1. EXACT CATEGORY MATCH (highest priority)
  if (productCategory === slug || productCategory === catName) {
    return { match: true, score: 100 };
  }
  
  // 2. CATEGORY SPECIFIC RULES with strict boundaries
  
  // PROCESSORS: SUPER STRICT - Only Intel/AMD CPUs, NO laptops, NO other brands
  if (slug === 'processors' || catName === 'processors' || slug === 'cpu' || catName === 'cpu') {
    // EXCLUDE IMMEDIATELY if it's a laptop or prebuilt
    const isLaptop = productName.includes('laptop') || productName.includes('notebook') || 
                     productName.includes('gaming laptop') || productName.includes('ultrabook') ||
                     productName.includes('legion') || productName.includes('ideapad') ||
                     productName.includes('thinkpad') || productName.includes('thinkbook') ||
                     productName.includes('victus') || productName.includes('pavilion') ||
                     productName.includes('elitebook') || productName.includes('probook') ||
                     productName.includes('vivobook') || productName.includes('zenbook') ||
                     productName.includes('tuf gaming') || productName.includes('rog strix') ||
                     productCategory.includes('laptop') || productCategory.includes('notebook');
    
    if (isLaptop) return { match: false, score: 0 };
    
    // ONLY ALLOW Intel and AMD brands
    const isIntelAMD = productBrand.includes('intel') || productBrand.includes('amd') ||
                       productName.includes('intel') || productName.includes('amd');
    
    if (!isIntelAMD) return { match: false, score: 0 }; // Reject if not Intel/AMD
    
    // Intel processor patterns - must be desktop CPU
    const intelPatterns = ['i3', 'i5', 'i7', 'i9', 'core i3', 'core i5', 'core i7', 'core i9', 
                          'pentium', 'celeron', 'xeon', 'intel core'];
    const hasIntel = intelPatterns.some(kw => productName.includes(kw));
    
    // AMD processor patterns - must be desktop CPU
    const amdPatterns = ['ryzen', 'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'threadripper', 
                        'athlon', 'fx-', 'a4-', 'a6-', 'a8-', 'a10-', 'a12-'];
    const hasAMD = amdPatterns.some(kw => productName.includes(kw));
    
    // Additional exclusion: if name contains screen size or "gen" with number (laptop indicator)
    const hasScreenSize = /\d{2,3}(\.\d)?\s*inch|\d{2,3}(\.\d)?"/i.test(productName);
    const hasGenIndicator = /\d{1,2}th\s*gen/i.test(productName) && !productName.toLowerCase().startsWith('intel') && !productName.toLowerCase().startsWith('amd');
    
    if (hasScreenSize || hasGenIndicator) {
      return { match: false, score: 0 };
    }
    
    // Must have Intel OR AMD keywords AND must not be a laptop
    if ((hasIntel || hasAMD) && !isLaptop) {
      // Priority scoring: Products starting with Intel/AMD get higher score
      const startsWithIntelAMD = productName.toLowerCase().startsWith('intel') || 
                                  productName.toLowerCase().startsWith('amd');
      return { match: true, score: startsWithIntelAMD ? 100 : 95 };
    }
    
    return { match: false, score: 0 };
  }
  
  // LAPTOPS: Must explicitly contain laptop/notebook
  if (slug === 'laptops' || catName === 'laptops') {
    const isLaptop = productName.includes('laptop') || productName.includes('notebook');
    if (isLaptop) return { match: true, score: 95 };
    return { match: false, score: 0 };
  }
  
  // GRAPHICS CARDS: GPU/Graphics keywords, not monitors
  if (slug === 'graphics-cards' || catName === 'graphics cards' || slug === 'gpu') {
    const isMonitor = productName.includes('monitor') || productName.includes('display') || productName.includes('screen');
    if (isMonitor) return { match: false, score: 0 };
    
    // Enhanced GPU detection for various naming patterns
    const gpuKeywords = ['rtx', 'gtx', 'radeon', 'rx', 'graphics card', 'gpu', 'video card', 'geforce'];
    const gpuBrands = ['nvidia', 'amd radeon', 'asus', 'msi', 'gigabyte', 'zotac', 'palit', 'evga', 'sapphire', 'xfx', 'powercolor'];
    const gpuModels = ['rtx 50', 'rtx 40', 'rtx 30', 'rtx 20', 'gtx 16', 'gtx 10', 'rx 7', 'rx 6', 'rx 5'];
    
    const hasGPU = gpuKeywords.some(kw => productName.includes(kw) || productCategory.includes(kw));
    const hasGPUBrand = gpuBrands.some(brand => productName.includes(brand) || productBrand.includes(brand));
    const hasGPUModel = gpuModels.some(model => productName.includes(model));
    
    // Match if has GPU keyword OR (GPU brand AND GPU model)
    if (hasGPU || (hasGPUBrand && hasGPUModel)) {
      return { match: true, score: 95 };
    }
  }
  
  // MONITORS: Must contain monitor/display keywords
  if (slug === 'monitors' || catName === 'monitors') {
    const monitorKeywords = ['monitor', 'display', 'screen', 'lcd', 'led'];
    const hasMonitor = monitorKeywords.some(kw => productName.includes(kw));
    if (hasMonitor) return { match: true, score: 95 };
  }
  
  // MOTHERBOARDS
  if (slug === 'motherboards' || catName === 'motherboards') {
    const mbKeywords = ['motherboard', 'mobo', 'mainboard', 'b550', 'b650', 'x570', 'z690', 'z790'];
    const hasMB = mbKeywords.some(kw => productName.includes(kw));
    if (hasMB) return { match: true, score: 90 };
  }
  
  // RAM/MEMORY
  if (slug === 'ram' || catName === 'ram' || slug === 'memory') {
    const ramKeywords = ['ram', 'memory', 'ddr4', 'ddr5', 'dimm'];
    const hasRAM = ramKeywords.some(kw => productName.includes(kw));
    if (hasRAM) return { match: true, score: 90 };
  }
  
  // STORAGE
  if (slug === 'storage' || catName === 'storage') {
    const storageKeywords = ['ssd', 'hdd', 'nvme', 'm.2', 'hard drive', 'drive'];
    const hasStorage = storageKeywords.some(kw => productName.includes(kw));
    if (hasStorage) return { match: true, score: 90 };
  }
  
  // KEYBOARDS
  if (slug === 'keyboards' || catName === 'keyboards') {
    const kbKeywords = ['keyboard', 'mechanical'];
    const hasKB = kbKeywords.some(kw => productName.includes(kw));
    if (hasKB) return { match: true, score: 90 };
  }
  
  // MOUSE
  if (slug === 'mouse' || catName === 'mouse') {
    const mouseKeywords = ['mouse', 'mice'];
    const hasMouse = mouseKeywords.some(kw => productName.includes(kw));
    if (hasMouse) return { match: true, score: 90 };
  }
  
  // HEADSETS
  if (slug === 'headsets' || catName === 'headsets' || slug === 'headphones') {
    const headsetKeywords = ['headset', 'headphone', 'earphone'];
    const hasHeadset = headsetKeywords.some(kw => productName.includes(kw));
    if (hasHeadset) return { match: true, score: 90 };
  }
  
  // CONTROLLERS / GAMEPADS
  if (slug === 'controllers' || catName === 'controllers' || slug === 'gamepad' || slug === 'controller') {
    const controllerKeywords = ['controller', 'gamepad', 'joystick', 'dualsense', 'dualshock', 
                                'xbox controller', 'ps5 controller', 'ps4 controller', 'game controller'];
    const hasController = controllerKeywords.some(kw => productName.includes(kw) || productCategory.includes(kw));
    if (hasController) return { match: true, score: 90 };
  }
  
  // 3. BRAND MATCHING (fallback)
  if (productBrand && (productName.includes(catName) || productBrand.includes(catName))) {
    return { match: true, score: 60 };
  }
  
  // 4. PARTIAL CATEGORY NAME MATCH (weak signal)
  if (productCategory.includes(slug) || slug.includes(productCategory)) {
    return { match: true, score: 50 };
  }
  
  return { match: false, score: 0 };
}

// Public: Get dynamic categories from actual products in DB
app.get('/api/categories/dynamic', async (req, res) => {
  try {
    // Check cache first
    if (categoryCache.data && (Date.now() - categoryCache.timestamp) < categoryCache.ttl) {
      return res.json(categoryCache.data);
    }
    
    const ProductModel = getProductModel();
    let categories = [];
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      // Get unique categories with their brands from products
      const dbCategories = await ProductModel.aggregate([
        { $match: { is_active: { $ne: false } } },
        { $group: { 
            _id: '$category',
            count: { $sum: 1 },
            brands: { $addToSet: '$brand' }
          } 
        },
        { $match: { _id: { $ne: null, $ne: '' } } },
        { $sort: { count: -1 } }
      ]);
      
      // Load Pakistan categories for additional metadata
      const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
      
      // Build categories list with enhanced metadata
      categories = dbCategories.map((cat, idx) => {
        const categoryName = cat._id;
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        // Find matching Pakistan category for official brands
        const pakistanCat = PAKISTAN_CATEGORIES.find(
          pc => pc.name === categoryName || 
                pc.slug === slug ||
                (pc.alternativeNames && pc.alternativeNames.includes(categoryName))
        );
        
        // Filter out null/empty brands and use official brands if available
        const activeBrands = cat.brands.filter(b => b && b.trim());
        const officialBrands = pakistanCat ? pakistanCat.brands : [];
        
        return {
          _id: categoryName,
          id: categoryName,
          name: categoryName,
          slug: slug,
          description: pakistanCat ? pakistanCat.description : `Shop ${categoryName} - ${cat.count} products available`,
          icon: pakistanCat ? pakistanCat.icon : 'package',
          productCount: cat.count,
          brands: activeBrands.length > 0 ? activeBrands : officialBrands,
          officialBrands: officialBrands,
          published: true,
          sortOrder: idx
        };
      });
      
      console.log(`[categories/dynamic] Built ${categories.length} categories from DB`);
      
    } else {
      // Fallback to file-based categories
      categories = readDataFile('categories.json') || [];
      console.log('[categories/dynamic] Using file-based fallback');
    }
    
    // Cache the result
    categoryCache.data = categories;
    categoryCache.timestamp = Date.now();
    
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(categories);
  } catch (err) {
    console.error('[categories/dynamic] Error:', err);
    // Fallback to static categories
    const fallback = readDataFile('categories.json') || [];
    res.json(fallback);
  }
});

// Public: Get products for a specific category with OPTIMIZED filtering
app.get('/api/categories/:slug/products', async (req, res) => {
  const startTime = Date.now();
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 24;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const brand = req.query.brand;
    const sortBy = req.query.sortBy || 'featured';
    
    console.log(`[categories/${slug}/products] START: slug="${slug}", page=${page}, brand="${brand || 'all'}"`);
    
    const ProductModel = getProductModel();
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      // Load category detector for keyword-based matching
      const { detectCategory } = require('./utils/categoryDetector');
      const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
      
      // Find category info
      const pakistanCategory = PAKISTAN_CATEGORIES.find(
        c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase()
      );
      
      const categoryVariations = pakistanCategory ? [
        pakistanCategory.name,
        pakistanCategory.slug,
        ...(pakistanCategory.alternativeNames || [])
      ] : [slug];
      
      // Build OPTIMIZED database query - filter at DB level, not in memory
      const query = {
        $or: categoryVariations.map(name => ({
          category: { $regex: new RegExp(`^${name}$`, 'i') }
        })),
        is_active: { $ne: false }
      };
      
      // Add brand filter at DB level
      if (brand && brand !== 'All') {
        query.brand = { $regex: new RegExp(brand, 'i') };
      }
      
      // Build sort criteria
      let sort = {};
      switch (sortBy) {
        case 'price-low':
          sort = { price: 1 };
          break;
        case 'price-high':
          sort = { price: -1 };
          break;
        case 'name':
          sort = { name: 1 };
          break;
        default:
          sort = { createdAt: -1 }; // Featured/newest first
      }
      
      // Execute OPTIMIZED query with pagination at DB level
      const [products, total] = await Promise.all([
        ProductModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .select('-__v'), // Exclude version key
        ProductModel.countDocuments(query)
      ]);
      
      const elapsed = Date.now() - startTime;
      console.log(`[categories/${slug}/products] Found ${products.length} of ${total} total products (${elapsed}ms, DB-level filtering)`);
      
      // Apply keyword-based validation and auto-correct if needed
      const validatedProducts = products.map(product => {
        const detectedCat = detectCategory(product);
        
        // If detected category doesn't match current, flag for auto-correction
        if (detectedCat && detectedCat.toLowerCase() !== (product.category || '').toLowerCase()) {
          console.log(`  ⚠️  Auto-correct candidate: "${product.name}" (${product.category} → ${detectedCat})`);
          
          // Optionally auto-correct in background (non-blocking)
          if (process.env.AUTO_CORRECT_CATEGORIES === 'true') {
            ProductModel.updateOne(
              { _id: product._id },
              { $set: { category: detectedCat } }
            ).catch(err => console.error('Auto-correct error:', err));
          }
        }
        
        return product;
      });
      
      res.setHeader('Cache-Control', 'public, max-age=120'); // Cache for 2 minutes
      res.json({
        products: validatedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      });
      
    } else {
      // Fallback to file-based products
      console.log(`[categories/${slug}/products] Using JSON fallback (MongoDB not connected)`);
      const fileProducts = readDataFile('products.json') || [];
      const category = (readDataFile('categories.json') || []).find(c => c.slug === slug);
      const categoryName = category ? category.name : slug;
      
      const filtered = fileProducts.filter(p => {
        const result = intelligentProductMatch(p, slug, categoryName);
        return result.match;
      });
      
      const paginatedProducts = filtered.slice(skip, skip + limit);
      const elapsed = Date.now() - startTime;
      console.log(`[categories/${slug}/products] JSON fallback: Found ${paginatedProducts.length} of ${filtered.length} (${elapsed}ms)`);
      
      res.json({
        products: paginatedProducts,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
        hasMore: skip + paginatedProducts.length < filtered.length
      });
    }
    
  } catch (err) {
    console.error('[categories/:slug/products] Error:', err);
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
});

// ==================== PAKISTAN CATEGORIES & STRICT FILTERING ====================

// Public: Get official Pakistan categories with brands
app.get('/api/pakistan-categories', (req, res) => {
  try {
    const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json({
      ok: true,
      categories: PAKISTAN_CATEGORIES
    });
  } catch (err) {
    console.error('[pakistan-categories] Error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch categories' });
  }
});

// Public: Get products by category ID (STRICT filtering)
app.get('/api/category/:categoryId/products', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const limit = parseInt(req.query.limit) || 32;
    const page = parseInt(req.query.page) || 1;
    const brand = req.query.brand;
    
    console.log(`[category/${categoryId}/products] STRICT filtering for category_id=${categoryId}`);
    
    const ProductModel = getProductModel();
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      // Build strict query
      const query = {
        category_id: categoryId,
        is_active: { $ne: false }
      };
      
      // Add brand filter if specified
      if (brand) {
        query.brand = { $regex: new RegExp(brand, 'i') };
      }
      
      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        ProductModel.find(query)
          .select('id Name name title price img imageUrl image category category_id brand description inStock')
          .lean()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ProductModel.countDocuments(query)
      ]);
      
      console.log(`[category/${categoryId}/products] Found ${products.length} products (total: ${total})`);
      
      res.setHeader('Cache-Control', 'public, max-age=180'); // Cache for 3 minutes
      res.json({
        ok: true,
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      });
    } else {
      // Fallback to file-based filtering
      const allProducts = readDataFile('products.json') || [];
      const filtered = allProducts.filter(p => p.category_id === categoryId && p.is_active !== false);
      
      const skip = (page - 1) * limit;
      const paginated = filtered.slice(skip, skip + limit);
      
      res.json({
        ok: true,
        products: paginated,
        total: filtered.length,
        page,
        limit,
        hasMore: skip + paginated.length < filtered.length
      });
    }
  } catch (err) {
    console.error('[category/:categoryId/products] Error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch products' });
  }
});

// Admin: Validation endpoint to find mismatched products
app.get('/api/admin/validate-products', async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  
  try {
    const ProductModel = getProductModel();
    const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      const allProducts = await ProductModel.find({})
        .select('id Name name title category category_id brand brand_id is_active')
        .lean()
        .limit(1000);
      
      const issues = [];
      
      allProducts.forEach(product => {
        const productName = product.Name || product.name || product.title || 'Unnamed';
        
        // Check 1: Missing category_id
        if (!product.category_id) {
          issues.push({
            product_id: product.id || product._id,
            product_name: productName,
            issue: 'missing_category_id',
            details: `Product has category="${product.category}" but no category_id`
          });
        }
        
        // Check 2: Invalid category_id
        if (product.category_id) {
          const validCategory = PAKISTAN_CATEGORIES.find(c => c.id === product.category_id);
          if (!validCategory) {
            issues.push({
              product_id: product.id || product._id,
              product_name: productName,
              issue: 'invalid_category_id',
              details: `category_id=${product.category_id} not found in Pakistan categories`
            });
          }
        }
        
        // Check 3: Brand doesn't match category
        if (product.category_id && product.brand) {
          const category = PAKISTAN_CATEGORIES.find(c => c.id === product.category_id);
          if (category && category.brands.length > 0) {
            const brandMatches = category.brands.some(b => 
              b.toLowerCase() === product.brand.toLowerCase()
            );
            if (!brandMatches) {
              issues.push({
                product_id: product.id || product._id,
                product_name: productName,
                issue: 'brand_not_in_category',
                details: `Brand "${product.brand}" not listed for category "${category.name}"`
              });
            }
          }
        }
        
        // Check 4: Missing brand
        if (!product.brand || product.brand === '') {
          issues.push({
            product_id: product.id || product._id,
            product_name: productName,
            issue: 'missing_brand',
            details: 'Product has no brand specified'
          });
        }
      });
      
      res.json({
        ok: true,
        total_products: allProducts.length,
        issues_found: issues.length,
        issues: issues.slice(0, 100), // Return first 100 issues
        summary: {
          missing_category_id: issues.filter(i => i.issue === 'missing_category_id').length,
          invalid_category_id: issues.filter(i => i.issue === 'invalid_category_id').length,
          brand_not_in_category: issues.filter(i => i.issue === 'brand_not_in_category').length,
          missing_brand: issues.filter(i => i.issue === 'missing_brand').length
        }
      });
    } else {
      res.json({ ok: false, error: 'Database not connected' });
    }
  } catch (err) {
    console.error('[validate-products] Error:', err);
    res.status(500).json({ ok: false, error: 'Validation failed', details: err.message });
  }
});

// Public: Get brands for a specific category
app.get('/api/category/:categoryId/brands', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const { PAKISTAN_CATEGORIES } = require('./data/pakistanCategories');
    
    const category = PAKISTAN_CATEGORIES.find(c => c.id === categoryId);
    
    if (!category) {
      return res.status(404).json({ ok: false, error: 'Category not found' });
    }
    
    // Get actual brands from products in this category
    const ProductModel = getProductModel();
    
    if (ProductModel && mongoose && mongoose.connection.readyState === 1) {
      const brands = await ProductModel.aggregate([
        { $match: { category_id: categoryId, is_active: { $ne: false } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $match: { _id: { $ne: null, $ne: '' } } },
        { $sort: { count: -1 } }
      ]);
      
      res.json({
        ok: true,
        category_id: categoryId,
        category_name: category.name,
        expected_brands: category.brands,
        actual_brands: brands.map(b => ({ brand: b._id, count: b.count }))
      });
    } else {
      res.json({
        ok: true,
        category_id: categoryId,
        category_name: category.name,
        brands: category.brands
      });
    }
  } catch (err) {
    console.error('[category/brands] Error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch brands' });
  }
});

// ==================== BRANDS ENDPOINTS ====================

// Admin: Get all brands
app.get('/api/admin/brands', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const brands = readDataFile('brands.json') || [];
    res.json({ ok: true, brands });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to get brands' });
  }
});

// Admin: Create brand
app.post('/api/admin/brands', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const brands = readDataFile('brands.json') || [];
    const newBrand = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    brands.push(newBrand);
    writeDataFile('brands.json', brands);
    res.json({ ok: true, brand: newBrand });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to create brand' });
  }
});

// Admin: Update brand
app.put('/api/admin/brands/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const brands = readDataFile('brands.json') || [];
    const idx = brands.findIndex(b => String(b._id) === String(req.params.id) || String(b.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Brand not found' });
    
    brands[idx] = { ...brands[idx], ...req.body, updatedAt: new Date() };
    writeDataFile('brands.json', brands);
    res.json({ ok: true, brand: brands[idx] });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update brand' });
  }
});

// Admin: Delete brand
app.delete('/api/admin/brands/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const brands = readDataFile('brands.json') || [];
    const idx = brands.findIndex(b => String(b._id) === String(req.params.id) || String(b.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Brand not found' });
    
    brands.splice(idx, 1);
    writeDataFile('brands.json', brands);
    res.json({ ok: true, message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to delete brand' });
  }
});

// ==================== DEALS ENDPOINTS ====================

// Admin: Get all deals
app.get('/api/admin/deals', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const deals = readDataFile('deals.json') || [];
    res.json({ ok: true, deals });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to get deals' });
  }
});

// Admin: Create deal
app.post('/api/admin/deals', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const deals = readDataFile('deals.json') || [];
    const newDeal = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    deals.push(newDeal);
    writeDataFile('deals.json', deals);
    res.json({ ok: true, deal: newDeal });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to create deal' });
  }
});

// Admin: Update deal
app.put('/api/admin/deals/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const deals = readDataFile('deals.json') || [];
    const idx = deals.findIndex(d => String(d._id) === String(req.params.id) || String(d.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Deal not found' });
    
    deals[idx] = { ...deals[idx], ...req.body, updatedAt: new Date() };
    writeDataFile('deals.json', deals);
    res.json({ ok: true, deal: deals[idx] });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update deal' });
  }
});

// Admin: Delete deal
app.delete('/api/admin/deals/:id', (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const deals = readDataFile('deals.json') || [];
    const idx = deals.findIndex(d => String(d._id) === String(req.params.id) || String(d.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Deal not found' });
    
    deals.splice(idx, 1);
    writeDataFile('deals.json', deals);
    res.json({ ok: true, message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to delete deal' });
  }
});

// Endpoint to increment AI-open counter (called by frontend when AI opens product via window.aalaaiOpen)
// AI open tracking endpoint removed.

// ===== IMAGE PROXY ENDPOINT =====
// Proxy endpoint to serve external images (Bing, Google, etc.) through our server
// This bypasses CORS issues and allows frontend to display images
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    // Validate URL is actually an image URL
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    // Use node-fetch or https to fetch the image
    const https = require('https');
    const http = require('http');
    
    const protocol = imageUrl.startsWith('https') ? https : http;
    
    // Set timeout and headers
    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    protocol.get(imageUrl, options, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).json({ error: 'Failed to fetch image' });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Pipe the image directly to response
      response.pipe(res);
    }).on('error', (err) => {
      console.error('[proxy-image] Error fetching image:', err.message);
      res.status(500).json({ error: 'Failed to fetch image' });
    });
    
  } catch (error) {
    console.error('[proxy-image] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
// Use a middleware approach that's more reliable
app.use((req, res, next) => {
  // Only handle non-API routes and non-static file requests
  // Exclude: /api, /assets, /images, /uploads
  if (!req.path.startsWith('/api') && 
      !req.path.startsWith('/assets') && 
      !req.path.startsWith('/images') && 
      !req.path.startsWith('/uploads')) {
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

// Add logging for debugging
console.log('[server] PORT environment variable:', process.env.PORT);
console.log('[server] Using PORT:', PORT);

async function startServer() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Log all environment variables (sensitive ones will be masked)
    console.log('[server] Environment variables:');
    Object.keys(process.env).forEach(key => {
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN')) {
        console.log(`  ${key}: ****`);
      } else {
        console.log(`  ${key}: ${process.env[key]}`);
      }
    });
    
    // Get MongoDB URI from environment or use MongoDB Atlas as fallback (no local URI)
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    if (MONGO_URI) {
      // Log connection attempt (safely hiding credentials)
      const safeUri = MONGO_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://****:****@');
      console.log('[db] Connecting to MongoDB...', safeUri);
      
      // Configure mongoose
      mongoose.set('bufferCommands', false);
      mongoose.set('strictQuery', false);
      
      // Enhanced connection monitoring
      mongoose.connection.on('connected', () => {
        console.log('[db] Mongoose connection established');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('[db] Mongoose connection error:', err.message);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('[db] Mongoose connection disconnected');
      });
      
      const connectWithRetry = async (retries = 3) => {
        try {
          console.log(`[db] Connection attempt ${4 - retries}/3...`);
          
          await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 10000, // 10 seconds
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            family: 4, // Force IPv4 (fixes some DNS issues)
          });
          
          // Verify connection by attempting a simple operation
          await mongoose.connection.db.admin().ping();
          console.log('[db] ✅ MongoDB connection verified with ping');
          return true;
        } catch (e) {
          const errorMsg = e.message || String(e);
          console.error(`[db] ❌ Connection attempt ${4 - retries}/3 failed:`, errorMsg);
          
          // Detailed error logging
          if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
            console.error('[db] DNS Resolution Error - Check:');
            console.error('  1. Internet connection is working');
            console.error('  2. MongoDB Atlas cluster is accessible');
            console.error('  3. Firewall/antivirus not blocking MongoDB');
          } else if (errorMsg.includes('ETIMEDOUT') || errorMsg.includes('timed out')) {
            console.error('[db] Connection Timeout - Check:');
            console.error('  1. IP address is whitelisted in MongoDB Atlas');
            console.error('  2. Network firewall allows outbound connections');
            console.error('  3. MongoDB Atlas cluster is running');
          } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('auth')) {
            console.error('[db] Authentication Error - Check credentials');
          }
          
          if (retries > 0) {
            const delay = 3000; // 3 seconds between retries
            console.log(`[db] Retrying in ${delay/1000} seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectWithRetry(retries - 1);
          }
          
          console.error('[db] ⚠️ All connection attempts failed');
          console.error('[db] Server will continue with file-based storage fallback');
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
    
    // ===== ADMIN STATISTICS ENDPOINT =====
    app.get('/api/admin/statistics', async (req, res) => {
      try {
        if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
        
        const mongoose = require('mongoose');
        const ProductModel = getProductModel();
        
        let statistics = {
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          topProducts: [],
          recentOrders: [],
          salesByCategory: {}
        };
        
        // Get total products from database
        if (ProductModel && mongoose.connection.readyState === 1) {
          try {
            statistics.totalProducts = await ProductModel.countDocuments();
          } catch (err) {
            console.error('[admin/statistics] DB product count error:', err);
          }
        } else {
          // Fallback to file
          const products = readDataFile('products.json') || [];
          statistics.totalProducts = products.length;
        }
        
        // Load REAL orders from file
        try {
          const ordersData = readDataFile('orders.json') || [];
          statistics.totalOrders = ordersData.length;
          statistics.totalSales = ordersData.length;
          statistics.totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
          statistics.avgOrderValue = statistics.totalOrders > 0 ? Math.round(statistics.totalRevenue / statistics.totalOrders) : 0;
          
          // Get REAL top products from orders
          const productSales = {};
          ordersData.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                if (!productSales[item.name]) {
                  productSales[item.name] = { name: item.name, sales: 0, revenue: 0 };
                }
                productSales[item.name].sales += item.qty || 1;
                productSales[item.name].revenue += (item.price || 0) * (item.qty || 1);
              });
            }
          });
          
          // Sort by revenue and get top 5
          statistics.topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
          
          // Get REAL recent orders
          statistics.recentOrders = ordersData.slice(-5).reverse().map(order => ({
            id: order.id || Math.random().toString(36).substr(2, 9),
            customerName: order.customerName || order.customer?.name || 'Guest',
            total: order.total || 0,
            date: order.date || order.createdAt || new Date().toISOString(),
            items: order.items || []
          }));
          
          // Calculate sales by category from orders
          const categorySales = {};
          ordersData.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                const category = item.category || 'Unknown';
                if (!categorySales[category]) {
                  categorySales[category] = 0;
                }
                categorySales[category] += (item.price || 0) * (item.qty || 1);
              });
            }
          });
          statistics.salesByCategory = categorySales;
        } catch (err) {
          console.error('[admin/statistics] Orders file error:', err);
        }
        
        res.json({ ok: true, statistics });
      } catch (err) {
        console.error('[admin/statistics] Error:', err);
        res.status(500).json({ ok: false, error: 'Failed to load statistics' });
      }
    });

    // ===== UPDATE PRODUCT ENDPOINT =====
    app.put('/api/admin/products/:id', async (req, res) => {
      try {
        if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
        
        const productId = req.params.id;
        const updateData = req.body;
        
        const mongoose = require('mongoose');
        const ProductModel = getProductModel();
        
        if (ProductModel && mongoose.connection.readyState === 1) {
          try {
            const updated = await ProductModel.findByIdAndUpdate(
              productId,
              { $set: updateData },
              { new: true }
            );
            
            if (updated) {
              return res.json({ ok: true, product: updated });
            }
          } catch (err) {
            console.error('[admin/products/update] DB error:', err);
          }
        }
        
        // Fallback to file-based update
        let products = readDataFile('products.json') || [];
        const index = products.findIndex(p => (p.id || p._id) === productId);
        
        if (index !== -1) {
          products[index] = { ...products[index], ...updateData };
          writeDataFile('products.json', products);
          return res.json({ ok: true, product: products[index] });
        }
        
        res.status(404).json({ ok: false, error: 'Product not found' });
      } catch (err) {
        console.error('[admin/products/update] Error:', err);
        res.status(500).json({ ok: false, error: 'Failed to update product' });
      }
    });

    // ===== DELETE PRODUCT ENDPOINT =====
    app.delete('/api/admin/products/:id', async (req, res) => {
      try {
        if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
        
        const productId = req.params.id;
        
        const mongoose = require('mongoose');
        const ProductModel = getProductModel();
        
        if (ProductModel && mongoose.connection.readyState === 1) {
          try {
            const deleted = await ProductModel.findByIdAndDelete(productId);
            if (deleted) {
              return res.json({ ok: true, message: 'Product deleted' });
            }
          } catch (err) {
            console.error('[admin/products/delete] DB error:', err);
          }
        }
        
        // Fallback to file-based delete
        let products = readDataFile('products.json') || [];
        const filtered = products.filter(p => (p.id || p._id) !== productId);
        
        if (filtered.length < products.length) {
          writeDataFile('products.json', filtered);
          return res.json({ ok: true, message: 'Product deleted' });
        }
        
        res.status(404).json({ ok: false, error: 'Product not found' });
      } catch (err) {
        console.error('[admin/products/delete] Error:', err);
        res.status(500).json({ ok: false, error: 'Failed to delete product' });
      }
    });

    // ===== STATIC FILE SERVING (AFTER ALL API ROUTES) =====
    // Serve static files from dist (built frontend) - MUST be after API routes
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      // Serve static files with proper headers
      app.use(express.static(distPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          // Set proper MIME types
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
        }
      }));
      console.log('[server] Serving static files from:', distPath);
    } else {
      console.warn('[server] dist directory not found at:', distPath);
    }
    
    // ensure admin exists either in DB or file
    await ensureAdminUser();

    app.listen(PORT,'0.0.0.0', () => console.log(`Backend server listening on port ${PORT}`));
  } catch (e) {
    console.error('Failed to start server', e && e.message);
    console.error('Stack trace:', e && e.stack);
    process.exit(1);
  }
}

// Add unhandled error handlers for better debugging
process.on('uncaughtException', (err) => {
  console.error('[global] uncaughtException:', err);
  console.error('[global] uncaughtException stack:', err.stack);
  // Don't exit the process for uncaught exceptions to prevent 502 errors
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[global] unhandledRejection:', reason);
  console.error('[global] unhandledRejection promise:', promise);
  // Don't exit the process for unhandled rejections to prevent 502 errors
  // process.exit(1);
});

// Start server only when run directly. When imported (e.g. by serverless wrapper), export the app.
if (require.main === module) {
  console.log('[server] Starting server...');
  startServer().catch(err => {
    console.error('[server] Failed to start server:', err);
    process.exit(1);
  });
} else {
  try { module.exports = { app, startServer }; } catch (e) { /* ignore export errors */ }
}
