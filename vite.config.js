import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to a GitHub Pages repo named e.g. `thai-number-flashcards`,
// uncomment and set base: '/thai-number-flashcards/'
// Otherwise leave base as '/' for root domain.
// export default defineConfig({
//   base: '/your-repo-name/',
//   plugins: [react()],
// })

export default defineConfig({
  plugins: [react()]
})