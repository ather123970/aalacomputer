// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Treat the repository-level `images/` directory as Vite's public directory
  // so files placed there are copied through to the build output and served
  // as static assets in production at the site root.
  publicDir: 'images',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true
  },
  server: {
    host: true,
  allowedHosts: ['.loca.lt', 'localhost', '127.0.0.1', 'aalacomputerkarachi.vercel.app', 'aalacomputer.com'],
    cors: false,
    // Proxy /api to the local API shim during development so frontend requests
    // to /api/v1/* are forwarded to the dev API server. The dev shim provided
    // in tools/dev-api-server.js listens on port 3001 by default.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
})
