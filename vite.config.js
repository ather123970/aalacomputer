import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs-extra'
import path from 'path'

// Detect if we are on Render or local dev
const isProduction = process.env.NODE_ENV === 'production'

// Plugin to copy images to dist during build
const copyImagesPlugin = () => ({
  name: 'copy-images',
  closeBundle: async () => {
    const zahImagesPath = path.resolve(__dirname, 'zah_images')
    const distImagesPath = path.resolve(__dirname, 'dist/images')
    
    if (fs.existsSync(zahImagesPath)) {
      await fs.copy(zahImagesPath, distImagesPath, { overwrite: true })
      console.log('✅ Copied zah_images to dist/images')
    }
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), copyImagesPlugin()],
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

  preview: {
    host: true,
    port: 4173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
    },
  },
})
