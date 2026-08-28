import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Music App',
        short_name: 'Music',
        description: 'A cross-platform music player',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // cangxue-backend listens on PORT=3000 by default; the web dev server
        // also uses 3000, so run the backend on another port (e.g. PORT=3001)
        // and point this proxy at it, or set VITE_API_TARGET.
        target: process.env.VITE_API_TARGET ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
