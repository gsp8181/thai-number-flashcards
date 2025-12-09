import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// If you deploy to a GitHub Pages repo named e.g. `thai-number-flashcards`,
// uncomment and set base: '/thai-number-flashcards/'
// Otherwise leave base as '/' for root domain.
// export default defineConfig({
//   base: '/your-repo-name/',
//   plugins: [react()],
// })

// Set `base` from the environment so builds can target a subpath (GitHub Pages)
// or the site root. Recommended usage when deploying to a repo page:
//   BASE_PATH=/thai-number-flashcards/ npm run build
// On Windows PowerShell:
//   $env:BASE_PATH = '/thai-number-flashcards/'; npm run build
// If you prefer a build that works both on root and on a subpath without
// setting env vars, use `base: './'` (produces relative asset URLs).
export default defineConfig({
  // Default to relative paths so built assets work under a subpath
  // or when served from a folder (works for GitHub Pages project pages).
  // You can still override with BASE_PATH env var for explicit repo roots.
  base: process.env.BASE_PATH || './',
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: null,
      registerType: 'autoUpdate',
      includeAssets: ['icons/tnf-192.svg', 'icons/tnf-512.svg', 'icons/tnf-192.png', 'icons/tnf-512.png'],
      src: 'src/sw-custom.js',
      manifest: {
        name: 'Thai Number Flashcards',
        short_name: 'ThaiNums',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#d62828',
        icons: [
          {
            src: 'icons/tnf-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/tnf-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/tnf-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icons/tnf-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        // Precache all common static files (JS/CSS/HTML/images/json)
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        // Allow bigger assets to be precached if needed (5 MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Ensure navigation requests load the SPA `index.html` (so app boots offline)
        navigateFallback: 'index.html',
        // Runtime caching for external images and API-like JSON requests
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\/(?:api|data)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
})