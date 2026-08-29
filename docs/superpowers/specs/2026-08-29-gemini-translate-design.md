# Gemini On-Demand Translation Design (Phase 3)

**Date:** 2026-08-29
**Status:** Approved direction, pending implementation plan
**Builds on:** Phase 1 (GT toggle, now dead upstream) + Phase 2 (native Swedish mode, 314/314 nordic creatures, 82/82 items).

---

## Problem

The Phase 1 Google Translate integration relied on Google's free `translate_a/element.js` website-translator widget. That widget no longer loads on arbitrary custom domains (confirmed: no `element.js` request is ever made; `window.google` never appears). Every non-Swedish menu option is therefore dead.

## Direction (user-approved)

Replace the dead widget with **server-side Gemini translation behind a Netlify Function** so the API key stays secret. When a visitor picks a non-Swedish, non-English language, translate the **visible content on demand** (option 1) and cache per language.

## 1. Key Security (hard boundary, non-negotiable)

- A static client cannot hide an API key by definition: anything shipped to the browser can be read via DevTools, and any "encryption" whose decryption runs in the browser can be reversed by anyone.
- Therefore the `GEMINI_API_KEY` never appears in the repo, the deploy zip, or the client bundle. It exists only as a **Netlify environment variable**, encrypted at rest by Netlify's platform.
- All translation requests from the page go to a **same-origin Netlify Function** (`/.netlify/functions/translate`), which is the only thing that reads the key.
- `netlify.toml` `connect-src` already includes `'self'`; add the function route and a rate-limit middleware to blunt abuse of the server-side key.

## 2. Serverless Proxy

Netlify Function `netlify/functions/translate.js`:
- Reads `process.env.GEMINI_API_KEY` (Netlify env var). If absent → 503 `{ error: 'not_configured' }` so the client degrades gracefully.
- Accepts `POST` with `{ source: 'en', target: '<lang>', strings: string[] }`.
- Calls the Gemini REST API (`generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`) with a strict translation prompt (preserve proper nouns, place numbers/entities, return JSON array aligned 1:1 with input).
- Enforces a per-request cap (e.g. ≤ 200 strings, ≤ 8000 chars) and validates the target is a supported code.
- Returns `{ translations: string[] }` aligned by index.

## 3. Client Engine

New module `js/translate.js` (loaded only when a Gemini-backed language is selected, to keep cold-start lean), exposing `window.__translate`:

- **Language menu wiring:** In `js/language-toggle.js`, `sv` → native mode (unchanged, keeps priority). Any other language → `window.__translate.enable(code)` instead of the dead `googtrans` cookie+reload.
- **Chrome/UI dictionary:** `js/i18n.js` keeps `en` + `sv` canonical. For other languages, the engine calls the function to translate the `en` dictionary values once, caches in `localStorage` (`wl:i18n:<lang>:v2`), then runs `applyChrome` against the generated dictionary.
- **Visible content:** After the current shard list + open detail are rendered, the engine collects the translatable strings from the loaded entry objects (name/summary/description), dedupes, batches ≤ 200, translates, and writes results back into the in-memory Shimmer data `_i18n { lang, partial }` overlay so the card/detail renderers show them naturally on next re-render. Cache the mapping in `localStorage` (`wl:i18n:<lang>:<slug>`).
- **HTML/meta:** set `document.documentElement.lang`, localized `<title>`/`description` via the generated dictionary.
- **Fallback:** API error, timeout, or `not_configured` → revert gracefully to English, show a one-time non-blocking notice, never crash.

## 4. Scope Boundaries (this wave)

- Translates **visible** content only (current list + open detail + chrome), not the entire archive or all 44 languages pre-baked.
- 44 target languages validated against the existing `GROUPS` menu codes.
- Swedish remains native and canonical (Gemini never runs for `sv`).
- Server-side rendering of translated pages is out of scope.

## 5. Testing

- **Unit (jest):** dictionary-parity logic for generated dicts; string batching/cap; localStorage cache round-trip; URL/lang-state helpers; function input validation + cap (mocked fetch).
- **E2E (playwright, chromium):** with the function **stubbed** (route interception), choosing a non-sv language applies a mock translation to chrome + a visible card; cache hit skips a second call; `not_configured` degrades to English without error.
- **Axe:** one Gemini-backed language page scanned (contrast retained since we keep the same text nodes/classes).
- **CSP:** `connect-src` must allow same-origin function; no `translate.google.com` any more (remove dead host from `netlify.toml` script-src/connect-src/frame-src).

## Out of Scope / Known Risk

- The official Google Cloud Translation API path (user deferred to Gemini).
- Truly hiding a key in static client code (impossible; documented above).
- Pre-baking all languages (option 2/3) — deferred.
- Gemini model choice, temperature, and prompt tuned for folklore register; if quality is poor for archaic terms, revisit prompt/model in a follow-up.
