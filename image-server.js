const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.IMAGE_SERVER_PORT || 5000;

// Enable CORS for all origins (adjust for production)
app.use(cors());

// Serve zah_images folder statically
app.use('/images', express.static(path.join(__dirname, 'zah_images')));

// Root endpoint - Homepage
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Server - Running</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
        }
        h1 { color: #333; margin-bottom: 10px; }
        .status { color: #10b981; font-size: 18px; font-weight: 600; margin-bottom: 30px; }
        .endpoint {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          border-left: 4px solid #667eea;
        }
        .endpoint-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .endpoint-url {
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-weight: 600;
          word-break: break-all;
        }
        a { color: #667eea; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .info { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
        .info p { margin-bottom: 10px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🖼️ Image Server</h1>
        <div class="status">✅ Server is running</div>
        
        <div class="endpoint">
          <div class="endpoint-label">📁 Images Directory</div>
          <div class="endpoint-url">${baseUrl}/images/&lt;filename&gt;</div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-label">📋 List All Images</div>
          <div class="endpoint-url"><a href="${baseUrl}/images-list" target="_blank">${baseUrl}/images-list</a></div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-label">💚 Health Check</div>
          <div class="endpoint-url"><a href="${baseUrl}/health" target="_blank">${baseUrl}/health</a></div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-label">🧪 Test Dashboard</div>
          <div class="endpoint-url"><a href="${baseUrl}/test" target="_blank">${baseUrl}/test</a></div>
        </div>
        
        <div class="info">
          <p><strong>Base URL:</strong> ${baseUrl}</p>
          <p><strong>CORS:</strong> Enabled for all domains</p>
          <p><strong>Images Folder:</strong> zah_images/</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image server is running' });
});

// Test dashboard route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-images.html'));
});

// List all available images
app.get('/images-list', (req, res) => {
  const fs = require('fs');
  const imagesDir = path.join(__dirname, 'zah_images');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read images directory' });
    }
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    res.json({
      count: imageFiles.length,
      baseUrl: baseUrl,
      images: imageFiles.map(file => ({
        name: file,
        url: `${baseUrl}/images/${encodeURIComponent(file)}`
      }))
    });
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Image server running at http://localhost:${PORT}`);
  console.log(`📁 Serving images from: ${path.join(__dirname, 'zah_images')}`);
  console.log(`🔗 Access images at: http://localhost:${PORT}/images/<filename>`);
  console.log(`📋 List all images: http://localhost:${PORT}/images-list`);
});
