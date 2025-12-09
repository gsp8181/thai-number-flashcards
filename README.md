```markdown
# Thai Number Flashcards

Vite + React web app to show random flashcards of Thai numbers (1 .. 10,000,000).

Features:
- Random numbers up to a user-defined max (1..10,000,000).
- Thai words (correct grammar rules for ยี่สิบ, เอ็ด, สิบ, etc.).
- RTGS-like romanization.
- Optional Thai numerals (๑, ๒, ...).
- Text-to-Speech (Web Speech API) in Thai when revealing.
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
- If this repository will be deployed under a project page (e.g., https://username.github.io/repo-name/), set `base` in `vite.config.js` to `'/repo-name/'` (uncomment and update the example).
- Push to `main` and the workflow will build & publish.

Notes:
- TTS uses the browser's speechSynthesis; choose a browser that supports Thai voices (Chrome generally provides good voice selection).
- The Thai conversion supports up to 10,000,000; numbers above that will be returned as plain digits.

If you'd like:
- TypeScript conversion
- An actual GitHub repo created and the files pushed
- Alternative romanization (strict RTGS) or more accurate phonetic variants

Tell me which and I can update/create the repo or open a PR.
```