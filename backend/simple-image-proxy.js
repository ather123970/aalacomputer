/**
 * Simple Image Proxy - Direct image serving without complex logic
 * This is a standalone Express app that handles image proxying
 */

const express = require('express');
const axios = require('axios');
const app = express();

// Simple image proxy endpoint
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).send('Missing URL');
  }

  console.log(`[Simple Proxy] Fetching: ${imageUrl.substring(0, 80)}...`);

  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cache-Control', 'public, max-age=86400');

  try {
    // Simple direct fetch with axios
    const response = await axios.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 10000,
      responseType: 'arraybuffer'
    });

    // Set content type from response
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set('Content-Type', contentType);
    
    console.log(`[Simple Proxy] ✅ Success: ${contentType}`);
    return res.send(response.data);

  } catch (error) {
    console.error(`[Simple Proxy] ❌ Error: ${error.message}`);
    
    // Return a simple 1x1 transparent PNG as fallback
    const transparentPng = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    res.set('Content-Type', 'image/png');
    return res.send(transparentPng);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
