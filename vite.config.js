// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: [
            './*',
            '!backend',
            '!api',
            '!.git',
            '!.gitignore',
            '!node_modules',
            '!dist',
            '!package-lock.json',
            '!package.json',
            '!vercel.json',
            '!netlify.toml',
            '!push_to_github.ps1',
            '!DEPLOYMENT.md',
            '!README.md',
            '!vite.config.js',
            '!eslint.config.js',
            '!tailwind.config.js',
            '!*.log',
            '!*.md',
            '!*.ps1',
            '!*.toml',
            '!*.json',
            '!*.env*',
          ],
          dest: '.',
        },
        {
          src: 'images/**',
          dest: 'images',
        },
        {
          src: 'src/**',
          dest: 'src',
        },
        {
          src: 'tools/**',
          dest: 'tools',
        },
        {
          src: 'components/**',
          dest: 'components',
        },
        {
          src: 'data/**',
          dest: 'data',
        },
      ],
    }),
  ],
  base: '/',
  build: {
    // place the build output inside backend/dist so the backend can serve it
    outDir: 'backend/dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
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
      },
    },
  },
});
