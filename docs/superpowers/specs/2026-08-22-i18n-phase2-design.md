# i18n Phase 2 Design — Swedish Native Mode

**Date:** 2026-08-22
**Status:** Approved design, pending implementation plan
**Builds on:** `2026-08-22-i18n-design.md` (Phase 1, shipped). Phase 1's Google Translate toggle stays for 44 languages; this phase adds quality-first Swedish as a native mode that takes precedence for `sv`.

---

## Decisions (user-approved)

| Question | Decision |
|---|---|
| Toggle semantics | Svenska = native mode immediately (`?lang=sv`, GT cookie cleared); other 44 languages keep GT flow |
| Content batches | Nordic regions first |
| Untranslated entries | Muted badge "översättning saknas"; content falls back to English |
| Delivery split | One spec; Wave A = infrastructure + ~50-entry Nordic pilot (shippable); Wave B = remaining content batches |

Carried over from Phase 1 decisions: chrome + full lore scope; LLM-batched translation by the assistant in staged commits; nav toggle stays the only switcher; full SEO treatment (`hreflang`, localized meta).

## 1. Data & Merge Layer

- EN shards remain the single canonical source.
- Swedish overlays: `data/i18n/sv/{creatures,stories,items}-{region}.json`
  - Shape: `{ "_meta": {...}, "entries": { "<slug>": { "name": "...", "summary": "..." } } }`
  - Only translated fields are present. `name` is required per entry; `summary` expected; other fields may follow later without format changes.
- Shimmer merge point: after an EN shard loads and when native mode is active, fetch the matching overlay file (lazy, promise-cached per file) and shallow-merge fields onto entries by slug. Merged entries get `_i18n = { lang: 'sv', partial: <bool> }`.
- One choke point inside `js/shared-utils.js` (Shimmer) so cards, search indexing, detail overlays, quiz lookups and homepage sections all receive merged data without consumer changes.
- Overlay files are optional at runtime — a missing 404 resolves to "no translations for this region" (no badge spam, no errors).
- Quiz questions: overlay file `data/i18n/sv/quiz.json` keyed by question id (Wave B content; infra ships in Wave A).

## 2. Language State

- Native mode is defined purely by `?lang=sv` present in the URL. No localStorage mirror.
- Helper in `js/shared-utils.js`: `getNativeLang()` (parse from location), `withLang(url)` (append/preserve param), used by viewer link builders (`?creature=`, `?story=`, `?item=`, pagination/facets) and a DOM pass that rewrites existing static internal `<a href>`s on load.
- Entering native mode strips any `googtrans` cookie (GT must not fight overlays). Leaving native mode (choosing another language or Original) removes `?lang=` first, then follows the existing Phase 1 cookie+reload flow.

## 3. Toggle Behavior

- Menu item Svenska gains a subtle "native" dot once sv coverage passes a threshold (constant in `js/language-toggle.js`; Wave A sets it manually after pilot lands; not computed at runtime).
- Choosing Svenska: `clearGoogtrans()` → navigate to current path with `?lang=sv` (preserving any viewer deep-link params).
- From native mode: choosing any GT language → navigate to path **without** `lang` param → existing applyLanguage(cookie+reload). Choosing Original → same strip → clear cookie.

## 4. Chrome & Static Pages

- New module `js/i18n.js`: dictionaries `{ en: {...}, sv: {...} }` (~150 keys: nav, hero stats labels, filter bar, sort labels, buttons, footer, badges, about/methodology prose paragraphs).
- Static markup gets `data-i18n="key"` attributes; on native load the module swaps `textContent`. Prose keys hold full paragraph strings.
- `<html lang="sv">` set when native.
- Localized `<title>` and `meta description` per page from dictionary keys (`title.index`, `desc.index`, …).

## 5. Fallback Marker

- Entries with `_i18n.partial` render a muted badge — text `översättning saknas`, styled `.i18n-pending` (crimson-tinted border/text on `--bg-card`, both themes, axe-AA verified, included in accessibility gate scans).
- Placement: card corner + detail overlay header row. Detail body shows English content beneath the badge.
- Homepage latest/daily cards in native mode: English names + badge (their generators gain sv variants post-Wave-A; noted as follow-up).

## 6. SEO

- All 11 pages get static `link rel="alternate" hreflang="en"` (self, no param) and `hreflang="sv"` (`?lang=sv`) tags.
- In native mode the dynamic `<html lang>` and localized title/description come from the dictionary (§4).
- Sitemap unchanged (param URLs excluded by convention).

## 7. Content Waves

- **Wave A (this implementation plan):** all of §1–§6 + pilot batch — I translate ~50 Nordic creature entries (name + summary) inline into the first overlay files, plus matching stories where trivially available. Everything tested and shippable alone.
- **Wave B (ongoing):** repeatable batch workflow (I translate region by region into new overlay files; each batch is a normal commit), then quiz question batches, then latest/daily generator sv variants.

## 8. Testing

- **Unit (jest):** merge precedence & partial flag; missing-overlay tolerance; `getNativeLang`/`withLang` URL logic; dictionary en↔sv key parity (fails CI if drift); toggle mode-switching helpers (cookie cleared entering native, restored flow leaving).
- **E2E (Playwright, chromium-only like existing suites):**
  - `?lang=sv` renders pilot entry's sv name; uncovered entry shows badge + EN body
  - internal links preserve `?lang=sv`
  - hreflang tags present; `<html lang>` flips; title localizes
  - mode switching: Svenska clears googtrans; GT language from native strips `lang` param
  - axe suite extended to scan one native-mode page (badge contrast included)

## Out of Scope

- Translating the remaining 43 GT languages natively; server-side rendering; sitemap changes; translating quiz content in Wave A; machine-translating via API.
