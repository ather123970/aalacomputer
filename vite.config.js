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
    allowedHosts: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        // Keep the original path when proxying so frontend paths like
        // /api/v1/cart map to backend /api/v1/cart (backend expects /api/...)
        // (no rewrite)
      }
    }
  },
})
