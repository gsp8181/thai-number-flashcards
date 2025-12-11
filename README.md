```markdown
# Thai Number Flashcards

Vite + React web app to show random flashcards of Thai numbers (1 .. 10,000,000).

Features:

Features:
- Random numbers up to a user-defined max (1..10,000,000).
- Thai words (correct grammar rules for ยี่สิบ, เอ็ด, สิบ, etc.).
- Multiple romanization styles: PB+ (Paiboon-like), RTGS+ (precomposed), and regular RTGS.
- Optional Thai numerals (๑, ๒, ...) with thousands grouping.
- Text-to-Speech (Web Speech API) in Thai when revealing.
- PWA support: manifest/service worker and GitHub Pages-ready build. Includes offline mode and automatic updates.
- Study controls: next, prev, reveal, auto-advance timer.
- Keyboard shortcuts: Space (reveal), ArrowRight (next), ArrowLeft (prev).
- Simple score marking.

Quick start:
1. Install dependencies:
   npm install

2. Run dev:
   npm run dev

3. Build:
   npm run build

4. Preview production build:
   npm run preview

GitHub Pages:
- A workflow is included in `.github/workflows/pages.yml` that builds and deploys the `dist/` site to GitHub Pages via the official Pages actions.
- Push to `main` and the workflow will build & publish.

Testing:
- Unit tests use Vitest.
  npm run test

Notes:
- TTS uses the browser's speechSynthesis; choose a browser that supports Thai voices (Chrome generally provides good voice selection).
- The Thai conversion supports up to 10,000,000; numbers above that will be returned as plain digits.


```