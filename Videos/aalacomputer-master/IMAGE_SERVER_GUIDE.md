# Image Server Setup Guide

## Overview
Your JSON currently has remote URLs pointing to `https://zahcomputers.pk/...`. This guide helps you set up a local image server to serve images from the `zah_images/` folder.

## Files Created

1. **`image-server.js`** - Express server to serve images
2. **`update-image-urls.js`** - Script to update JSON URLs
3. **`IMAGE_SERVER_GUIDE.md`** - This guide

---

## Quick Start

### 1. Start the Image Server

```bash
node image-server.js
```

The server will start on `http://localhost:5000` by default.

**Custom Port:**
```bash
IMAGE_SERVER_PORT=8080 node image-server.js
```

### 2. Test the Server

Open your browser and visit:
- **Health Check:** http://localhost:5000/health
- **List Images:** http://localhost:5000/images-list
- **View Image:** http://localhost:5000/images/AMD%20Ryzen%205%203600%20Desktop%20Processor.jpg

---

## Update JSON URLs

### Option 1: Convert to Server URLs (Recommended)

```bash
node update-image-urls.js server http://localhost:5000
```

This creates `aalacomputer.final.json` with URLs like:
```json
{
  "img": "http://localhost:5000/images/AMD%20Ryzen%205%203600%20Desktop%20Processor.jpg",
  "imageUrl": "http://localhost:5000/images/AMD%20Ryzen%205%203600%20Desktop%20Processor.jpg"
}
```

### Option 2: Convert to Local Paths

```bash
node update-image-urls.js local
```

Creates URLs like:
```json
{
  "img": "./zah_images/AMD Ryzen 5 3600 Desktop Processor.jpg",
  "imageUrl": "./zah_images/AMD Ryzen 5 3600 Desktop Processor.jpg"
}
```

### Option 3: Keep Remote URLs

```bash
node update-image-urls.js remote
```

Keeps existing remote URLs or generates placeholder URLs.

---

## Production Deployment

### Deploy to Heroku

1. **Create `Procfile`:**
```
web: node image-server.js
```

2. **Deploy:**
```bash
heroku create your-image-server
git add .
git commit -m "Add image server"
git push heroku main
```

3. **Update JSON:**
```bash
node update-image-urls.js server https://your-image-server.herokuapp.com
```

### Deploy to Railway

1. Create new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set start command: `node image-server.js`
4. Deploy and get your URL
5. Update JSON with your Railway URL

### Deploy to Vercel/Netlify

For static hosting:
1. Upload `zah_images/` to a CDN or static host
2. Update JSON with CDN URLs:
```bash
node update-image-urls.js server https://your-cdn.com
```

---

## Integration with Your App

### Update Backend to Use New URLs

If you're using the image server, update your backend to point to it:

```javascript
// backend/config.js
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:5000/images';

// When serving products
products.map(product => ({
  ...product,
  img: `${IMAGE_BASE_URL}/${product.imageName}`,
  imageUrl: `${IMAGE_BASE_URL}/${product.imageName}`
}));
```

### Environment Variables

Create `.env` file:
```env
IMAGE_SERVER_PORT=5000
IMAGE_BASE_URL=http://localhost:5000/images
```

---

## NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "image-server": "node image-server.js",
    "update-urls:local": "node update-image-urls.js local",
    "update-urls:server": "node update-image-urls.js server http://localhost:5000",
    "update-urls:production": "node update-image-urls.js server https://your-domain.com"
  }
}
```

Then run:
```bash
npm run image-server
npm run update-urls:server
```

---

## CORS Configuration

The server allows all origins by default. For production, restrict CORS:

```javascript
// image-server.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

---

## Troubleshooting

### Images Not Loading

1. **Check server is running:**
```bash
curl http://localhost:5000/health
```

2. **Verify image exists:**
```bash
curl http://localhost:5000/images-list
```

3. **Check file permissions:**
```bash
ls -la zah_images/
```

### Port Already in Use

Change the port:
```bash
IMAGE_SERVER_PORT=8080 node image-server.js
```

### URL Encoding Issues

The server automatically handles URL encoding for filenames with spaces and special characters.

---

## Summary

1. ✅ **Current State:** JSON has remote URLs from zahcomputers.pk
2. ✅ **Image Server:** Created to serve local images
3. ✅ **Update Script:** Created to convert URLs
4. ✅ **Ready for MongoDB:** Final JSON will be MongoDB-ready

**Next Steps:**
1. Start the image server: `node image-server.js`
2. Update JSON URLs: `node update-image-urls.js server`
3. Import to MongoDB: Use `aalacomputer.final.json`
4. Deploy server to production when ready

---

## Questions?

- **Local Development:** Use `http://localhost:5000`
- **Production:** Deploy server and update URLs
- **CDN Alternative:** Upload images to Cloudflare/S3 and update URLs
