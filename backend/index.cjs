const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(compression());

// Serve static files from backend/dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, { maxAge: '1d' }));

// Simple API health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Fallback to index.html for client-side routing
// use a regex route so the string-to-regexp parser doesn't choke on '*' in some envs
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend running. Serving static from ${distPath} on port ${PORT}`);
});

module.exports = app;
