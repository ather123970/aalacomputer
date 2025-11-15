# Render Deployment Setup

## Quick Fix for Current Error

The error `Cannot find package '@vitejs/plugin-react'` occurs because Render is trying to build from the wrong directory.

## Correct Render Configuration

### Method 1: Manual Configuration (Recommended)

1. **Go to your Render service dashboard**
2. **Settings → Build & Deploy**
3. **Update these settings:**

```
Build Command: npm install && npm run build
Start Command: node backend/index.cjs
```

### Method 2: Using render.yaml (Alternative)

The `render.yaml` file is already configured correctly:

```yaml
buildCommand: npm install && npm run build
startCommand: node backend/index.cjs
```

## Environment Variables

Make sure these are set in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

## What This Fixes

- **Build Command**: `npm install && npm run build` ensures dependencies are installed and frontend is built
- **Start Command**: `node backend/index.cjs` starts the backend server that serves both API and frontend
- **Directory**: Builds from project root, not subdirectories

## Troubleshooting

### If build still fails:
1. Check that all dependencies are in `package.json`
2. Verify `vite.config.js` is in project root
3. Ensure `@vitejs/plugin-react` is in devDependencies

### If app doesn't load:
1. Check that `dist` folder is created during build
2. Verify MongoDB connection
3. Check Render logs for errors

## Test Locally

Before deploying, test locally:

```bash
npm install
npm run build
node backend/index.cjs
```

Visit `http://localhost:10000` to verify everything works.
