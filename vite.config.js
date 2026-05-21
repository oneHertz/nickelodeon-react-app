import { defineConfig } from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'build',
    
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,gif,webm,mp4}'],
        maximumFileSizeToCacheInBytes: 1e7,
      },
      manifest: {
        "name": "Humppakone",
        "short_name": "Humppakone",
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "start_url": "/",
        "display": "standalone"
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
})