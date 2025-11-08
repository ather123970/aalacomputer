// dev-api-server.js - small shim to mount api/*.js handlers with Express for local testing
import express from 'express';
import path from 'path';
import fs from 'fs';
const app = express();
app.use(express.json());

const API_DIR = path.resolve(process.cwd(), 'api');

function findHandler(reqPath) {
  // map /api/v1/cart -> api/v1/cart.js
  const rel = reqPath.replace(/^\//, '').replace(/^api\//, '');
  const candidate = path.join(API_DIR, rel + '.js');
  if (fs.existsSync(candidate)) return candidate;
  // if path ends with /, try index.js
  const alt = path.join(API_DIR, rel, 'index.js');
  if (fs.existsSync(alt)) return alt;
  return null;
}

app.use('/api', async (req, res, next) => {
  const handlerPath = findHandler(req.path);
  if (!handlerPath) return res.status(404).json({ message: 'Not found' });
  try {
    const mod = await import('file://' + handlerPath);
    const handler = mod && mod.default ? mod.default : mod;
    // Some handlers are synchronous functions, others async - support both
    return await handler(req, res);
  } catch (e) {
    console.error('handler import error', e);
    return res.status(500).json({ message: 'handler error', detail: String(e && (e.stack || e.message)) });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log('Dev API shim listening on', PORT));
