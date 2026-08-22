# Accessibility Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zero axe-core violations on all 10 pages (desktop + mobile) including detail overlays and search results, enforced by a permanent Playwright spec.

**Architecture:** New `tests/e2e/accessibility.spec.js` using `@axe-core/playwright` runs a fixed scan matrix and asserts zero violations, with an empty-by-default exclusions map for verified false positives. Fix classes found by the baseline run follow the recipes in Tasks 3-5; anything not covered gets fixed directly or excluded only after verification.

**Tech Stack:** Playwright (chromium project), `@axe-core/playwright`, vanilla HTML/CSS/JS site (no framework).

**Spec:** `docs/superpowers/specs/2026-08-21-accessibility-pass-design.md`

> **Execution outcome (Aug 21):** Tasks 2/3 skipped — baseline showed color-contrast violations only, so their condition-gated recipes had no drivers. Task 5 triage empty (zero exclusions needed). Final gate: 25 tests green, EXCLUSIONS `{}`.

**Verified facts:**
- Deep-link slugs: creature `troll-norway`, story `ragnark-the-end-and-rebirth`, item `mjolnir`.
- Existing e2e style: `require('@playwright/test')`, absolute URLs `http://localhost:3000/...`, `waitUntil: 'load'` with 15-20s timeouts.
- Server for e2e: `python3 /tmp/threaded-server.py` (dual-stack threaded, port 3000). Recreate from repo memory note if missing.
- Chromium-only runs: `npx playwright test --project=chromium --reporter=dot`.
- eslint ignores `archive/`; specs carry `/* eslint-env node */`.

---

### Task 1: Baseline — install axe, write scan spec, capture violations

**Files:**
- Modify: `package.json` (devDependency)
- Create: `tests/e2e/accessibility.spec.js`

- [ ] **Step 1: Install dependency**

```bash
npm install --save-dev @axe-core/playwright
```

Expected: added to `devDependencies` in `package.json`.

- [ ] **Step 2: Write the failing spec**

Create `tests/e2e/accessibility.spec.js`:

```js
/* eslint-env node */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = 'http://localhost:3000';
const PAGES = [
  'index.html',
  'about.html',
  'world.html',
  'bestiary.html',
  'items.html',
  'stories.html',
  'quiz.html',
  'mylore.html',
  'methodology.html',
  '404.html',
];

// page-key -> rule-id -> reason. MUST stay empty unless a finding is
// verified as a false positive with a link/explanation recorded here.
const EXCLUSIONS = {};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 320, height: 568 },
];

async function scan(page, key) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const excluded = (EXCLUSIONS[key] || []);
  return results.violations.filter((v) => !excluded.includes(v.id));
}

function assertClean(violations, label) {
  const summary = violations
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`)
    .join('; ');
  expect(violations, `${label}: ${summary}`).toHaveLength(0);
}

test.describe('Accessibility (axe)', () => {
  for (const vp of VIEWPORTS) {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const p of PAGES) {
      test(`static ${p} @${vp.name}`, async ({ page }) => {
        await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 20000 });
        // let async viewers/renderers settle before scanning
        await page.waitForTimeout(1500);
        assertClean(await scan(page, p), `${p} @${vp.name}`);
      });
    }
  }

  test('detail overlay: creature (bestiary)', async ({ page }) => {
    await page.goto(`${BASE}/bestiary.html?creature=troll-norway`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#creature-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'bestiary-detail'), 'bestiary detail overlay');
  });

  test('detail overlay: story', async ({ page }) => {
    await page.goto(`${BASE}/stories.html?story=ragnark-the-end-and-rebirth`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#story-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'stories-detail'), 'stories detail overlay');
  });

  test('detail overlay: item', async ({ page }) => {
    await page.goto(`${BASE}/items.html?item=mjolnir`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#item-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'items-detail'), 'items detail overlay');
  });

  test('search results state', async ({ page }) => {
    await page.goto(`${BASE}/search.html?q=troll`, { waitUntil: 'load', timeout: 20000 });
    await expect(page.locator('#search-status')).toContainText(/results for "troll"/, { timeout: 20000 });
    assertClean(await scan(page, 'search-results'), 'search results');
  });
});
```

Note: axe's default `disableFrameNavigation` etc. is fine here — no iframes on these pages. If the world.html Three.js canvas triggers `aria-required-children`-style noise inside the globe container, that belongs in Task 5's verification flow, not a blind exclusion.

- [ ] **Step 3: Run baseline and capture every violation**

Start server if not running:

```bash
python3 /tmp/threaded-server.py &
```

Run only the accessibility suite:

```bash
npx playwright test --project=chromium tests/e2e/accessibility.spec.js --reporter=line 2>&1 | tee /tmp/axe-baseline.txt
```

Expected: FAILURES listing each violating rule id, impact, page and node count. Save this output — it drives Tasks 3-5. Do NOT add exclusions yet.

- [ ] **Step 4: Extract a deduplicated rule list for planning**

```bash
grep -oE '[a-z-]+ \((critical|serious|moderate|minor)\)' /tmp/axe-baseline.txt | sort | uniq -c | sort -rn
```

Use this list to confirm which of Tasks 3-5 apply and what extra work exists.

---

### Task 2: Decorative SVG semantics

Applies when baseline shows `image-alt`, `svg-image-alt`, `role-img-alt`, or similar on inline SVGs.

**Files (verify each before editing):**
- `index.html` (hero rune scatter container, section dividers)
- `about.html`, all other pages: shared `.section-divider` SVG markup
- `css/styles.css` — no change expected here

- [ ] **Step 1: Locate decorative SVG patterns**

```bash
rg -n '<svg' index.html about.html world.html bestiary.html items.html stories.html quiz.html mylore.html methodology.html 404.html | head -40
```

Decorative = conveys no information beyond adjacent text (dividers, rune scatter background glyphs, logo next to wordmark).

- [ ] **Step 2: Mark decorative SVGs**

For every decorative inline `<svg>`, ensure the opening tag carries `aria-hidden="true"` and `focusable="false"`. Example transformation:

```html
<!-- before -->
<svg class="section-divider-svg" viewBox="0 0 1200 60">...</svg>

<!-- after -->
<svg class="section-divider-svg" viewBox="0 0 1200 60" aria-hidden="true" focusable="false">...</svg>
```

For the rune scatter (generated by `js/rune-scatter.js`), set attributes at creation:

```js
glyph.setAttribute('aria-hidden', 'true')
glyph.setAttribute('focusable', 'false')
```

If the logo SVG sits next to visible text ("Whispering Lore"), mark it decorative the same way. If it stands alone, give the svg `role="img"` and a `<title>` instead:

```html
<svg role="img" aria-labelledby="logo-title" ...><title id="logo-title">Whispering Lore rune emblem</title>...</svg>
```

- [ ] **Step 3: Re-run affected scans**

```bash
npx playwright test --project=chromium tests/e2e/accessibility.spec.js --reporter=line 2>&1 | tail -20
```

Expected: image/svg-related rules gone from failures. Other failures may remain.

- [ ] **Step 4: Commit**

```bash
git add index.html about.html world.html bestiary.html items.html stories.html quiz.html mylore.html methodology.html 404.html js/rune-scatter.js
git commit -m "fix(a11y): mark decorative svgs aria-hidden"
```

(Adjust staged files to what actually changed.)

---

### Task 3: Focus visibility on custom widgets

Applies when baseline shows `focus-visible` / keyboard-related findings, or manual check finds missing outlines.

**Files:**
- `css/styles.css` — widget focus styles near existing `:focus-visible` rules (Aug 15 pass added some; search first)

- [ ] **Step 1: Audit current focus styles**

```bash
rg -n 'focus-visible|outline' css/styles.css | head -30
```

Interactive widgets that need a visible `:focus-visible` outline: `.facet-option`, `.filter-chip`, `.region-card`, `.hotspot-item`, `.card[tabindex]`, quiz answer buttons, mylore export/import controls.

- [ ] **Step 2: Add missing outlines**

Follow the existing pattern (find it via Step 1). Canonical addition if absent:

```css
.facet-option:focus-visible,
.filter-chip:focus-visible,
.region-card:focus-visible,
.hotspot-item:focus-visible {
  outline: 2px solid var(--accent-strong);
  outline-offset: 2px;
}
```

Never remove existing outlines; only add or align color tokens.

- [ ] **Step 3: Verify manually in one browser pass**

Serve, open bestiary, Tab through filter bar and cards; confirm outline appears on every stop.

- [ ] **Step 4: Re-run suite and commit**

```bash
npx playwright test --project=chromium tests/e2e/accessibility.spec.js --reporter=line 2>&1 | tail -5
git add css/styles.css && git commit -m "fix(a11y): focus outlines on custom widgets"
```

---

### Task 4: Color contrast fixes

Applies when baseline shows `color-contrast`.

**Files:**
- `css/styles.css` (token values or specific selectors)

- [ ] **Step 1: List contrast failures with selectors**

From `/tmp/axe-baseline.txt`, note each failing selector + fg/bg. Cross-check suspicious late additions: `.ko-fi-label`, quiz share feedback (`#share-feedback`), `.btn-ghost` on light theme, facet counts.

- [ ] **Step 2: Fix at token level where possible**

Prefer adjusting tokens over one-off overrides. Current known-good AA tokens: `--accent-strong: #E05C5C`, `--text-muted: #8F8A84` on dark surfaces. For any failing muted text on dark bg, move selector to `--text-muted`; for accent text, `--accent-strong`. Light-theme equivalents live in the light-theme variable block — update both sides together.

Only touch CSS custom properties/selectors tied to failing nodes; do not re-tint whole sections.

- [ ] **Step 3: Re-run suite and commit**

```bash
npx playwright test --project=chromium tests/e2e/accessibility.spec.js --reporter=line 2>&1 | tail -5
git add css/styles.css && git commit -m "fix(a11y): contrast fixes from axe baseline"
```

---

### Task 5: Remaining violations — fix or verified exclusion

Anything left after Tasks 2-4.

- [ ] **Step 1: Triage each remaining rule**

For each remaining violation ask: real user impact?
- Real → fix markup/CSS/JS directly (no recipe; use judgment, keep changes minimal).
- False positive (tool limitation, e.g. canvas globe, intentionally hidden off-screen text picked up anyway) → add entry to `EXCLUSIONS` in `tests/e2e/accessibility.spec.js`:

```js
const EXCLUSIONS = {
  'world.html': ['some-rule-id'], // Three.js globe canvas has no DOM semantics; visual equivalent provided by region cards
};
```

Rule: exclusion requires a written reason comment AND a manual verification note in todos.md. Never exclude `color-contrast` or `focus-*` rules.

- [ ] **Step 2: Full accessibility suite green**

```bash
npx playwright test --project=chromium tests/e2e/accessibility.spec.js --reporter=dot
```

Expected: all scans pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "fix(a11y): resolve remaining axe violations"
```

---

### Task 6: Full gates + docs

- [ ] **Step 1: Full chromium suite**

```bash
npx playwright test --project=chromium --reporter=dot
```

Expected: previous 437 + ~26 new accessibility tests, all green (~7m).

- [ ] **Step 2: Lint + unit**

```bash
npx eslint . 2>&1 | tail -3   # expect 0 errors
npx jest                       # expect 175 passed
```

- [ ] **Step 3: Prune stale entries in FUTURE_IMPROVEMENTS.md**

Delete these lines (all done already):
- SEO Foundations section: WebSite/SearchAction JSON-LD, per-entity CreativeWork JSON-LD, FAQ schema (done Aug 16). Keep keyword-volume line only if still wanted — otherwise delete section.
- Content & Engagement: "Social media OG image generation automation" (og-image.png shipped Aug 16).
- Performance: "Add Cache-Control headers for static assets" (netlify.toml png headers commit `90c8db0`; Netlify sets defaults for other static assets).

- [ ] **Step 4: Log in todos.md under New Features & Enhancements**

```markdown
- [x] A11y pass: axe-core gate spec (10 pages × 2 viewports + overlays + search), zero violations, fixes committed (Aug 21)
```

Include any exclusion verifications as sub-bullets.

- [ ] **Step 5: Commit docs**

```bash
git add FUTURE_IMPROVEMENTS.md todos.md package.json package-lock.json
git commit -m "docs: a11y pass complete, prune stale backlog"
```

---

## Self-Review Notes

- Spec coverage: scan matrix (Task 1), SVG semantics (Task 2), focus (Task 3), contrast (Task 4), exclusions discipline (Task 5), docs pruning (Task 6) — matches spec sections.
- Unknown-until-run content handled by baseline-first structure (Task 1 Step 3) + triage rules (Task 5); no placeholder "fix stuff" steps — each task has concrete commands and code patterns.
- Names consistent: `EXCLUSIONS`, `scan()`, `assertClean()` used identically across tasks.
