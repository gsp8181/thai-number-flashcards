import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react()]
})