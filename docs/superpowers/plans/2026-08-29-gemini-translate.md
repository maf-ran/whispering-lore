# Gemini On-Demand Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, per session precedent).

**Goal:** Replace the dead Google-translate-widget languages with on-demand Gemini translation of visible content + UI chrome, with the API key kept on the server (Netlify Function env var).

**Spec:** `docs/superpowers/specs/2026-08-29-gemini-translate-design.md`

**Critical invariant (security):** `GEMINI_API_KEY` must never appear in the repo, deploy zip, or client. It is read only by `netlify/functions/translate.js` from `process.env.GEMINI_API_KEY`.

---

### Task 1: Netlify Function proxy

1. Create `netlify/functions/translate.js` (CommonJS, Netlify default):
   - `GET /` or missing key → `503 { error: 'not_configured' }`.
   - `POST` body `{ source, target, strings[] }`; validate target ∈ supported codes, strings ≤ 200 & total ≤ 8000 chars; else `400`.
   - Call `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent` with `GEMINI_API_KEY` as `?key=`; prompt asks for JSON array aligned 1:1, preserve proper nouns/folklore terms, return `{ translations: [] }`.
   - Timeout + upstream error mapping; `405` for non-POST.
2. New file only for now; unit-testable via mocked `fetch` (inject or use global fetch mock in jest).

### Task 2: Client module `js/translate.js`

1. Reveal `window.__translate = { enable(code), disable(), isActive(), getActive }`.
2. Cache helpers (`localStorage` with versioned keys; wrapped in try/catch for privacy mode).
3. Dictionary fetch for chrome (translates `en` dict from `js/i18n.js` → cached dict → call `window.__i18n.applyChrome`).
4. Visible-content collection + batching (≤200), writes results into Shimmer `_i18n` merge for reload.
5. `<html lang>` + title/description.
6. Graceful degradation on `not_configured`/timeout/error.

### Task 3: Wire the language menu

1. In `js/language-toggle.js` `choose()`: `sv` → native (unchanged); other languages → `__translate.enable(code)`; remove the dead `googtrans` cookie+reload path (or repurpose to `__translate`).
2. Keep `Original (English)` behavior (clear active translation).
3. Guard: only initialize translate module if `window.__translate` present (progressive).

### Task 4: Security/CSP + deploy config

1. `netlify.toml`: remove `https://translate.google.com` from `script-src`, `https://translate-pa.googleapis.com` connect host if unused, and `frame-src https://translate.google.com`. Ensure `connect-src` allows `'self'` for the function route (same-origin).
2. Add `.env.example` (gitignored) documenting `GEMINI_API_KEY`; confirm `.gitignore` excludes `.env*` and `netlify/functions` never references a literal key.

### Task 5: Tests + gates

1. jest: function validation/cap + Gemini call shape (fetch mock); translate module cache/batch/lang-state (jsdom).
2. playwright: **stub** `/.netlify/functions/translate` via `page.route` → assert chrome + one card get translated; second call cached; `not_configured` degrades to English.
3. axe: one Gemini-backed page.
4. Full gates: eslint 0, jest green, chromium green.
5. Set `GEMINI_API_KEY` locally for manual smoke only when user provides it; never commit.

### Task 6: Docs + zip

1. Update `netlify.toml`, spec/plan committed.
2. Rebuild `/tmp/whispering-lore-deploy.zip` (excludes `netlify/functions` secrets — none exist).
3. Update todos.md + memory NOTES; push.

---

## Self-review

- Key secrecy is the #1 acceptance criterion: grep the repo AND the zip for `GEMINI_API_KEY=` (should only appear in `.env.example` documentation, never a real value).
- Non-sv menu items currently dead → must now produce translated chrome, not a reload that does nothing.
- Do not regress native sv mode or the jest dict-parity test.
