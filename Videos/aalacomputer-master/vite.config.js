import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Detect if we are on Render or local dev
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  base: '/', // Keep root path for proper routing

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.loca.lt',
      'aalacomputer.onrender.com',
      'aalacomputerkarachi.vercel.app',
      'aalacomputer.com'
    ],
    cors: true, // allow frontend/backend communication during dev
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
    },
  },
})
