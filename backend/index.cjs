const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
// Use PORT from environment (required on many PaaS providers) or fallback to 3000
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // if behind a proxy (Render/Heroku)
app.use(helmet());
app.use(cors());
app.use(compression());

// Serve static files from project root dist directory
const distPath = path.join(__dirname, '..', 'dist');
console.log('[server] Looking for frontend files in:', distPath);
// Serve static assets with caching; index.html is always served via the fallback route
app.use(express.static(distPath, { maxAge: '1d' }));

// Simple API health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Fallback to index.html for client-side routing
// use a regex route so the string-to-regexp parser doesn't choke on '*' in some envs
app.get(/.*/, (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  // ensure index.html is not cached by clients
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(indexFile, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running. Serving static from ${distPath} on port ${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`Received ${signal}, closing server...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  // force exit if not closed in a few seconds
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
