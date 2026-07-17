# Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken header nav layout (wrapping "METHODOLOGY" under the brand) with a single-row layout: brand + crimson divider + scrollable nav strip + theme toggle.

**Architecture:** Pure CSS/HTML change. Remove the absolutely-centered brand and the three-child flex layout. Replace with a single flex row where the brand is inline-left, a 1px crimson divider separates it from a scrollable nav strip (overflow-x: auto, hidden scrollbar), and the theme toggle sits far right. No JS changes. 1 CSS file + 9 HTML files.

**Tech Stack:** Vanilla CSS, HTML. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-17-nav-redesign.md`

---

## File Map

| File | Change |
|------|--------|
| `css/styles.css` | Remove `.header-nav-group` (desktop + mobile rules), modify `header` and `.header-brand`, add `.header-divider` + `.header-nav-strip` |
| `index.html` | Restructure `<header>` contents |
| `bestiary.html` | Restructure `<header>` contents |
| `stories.html` | Restructure `<header>` contents |
| `world.html` | Restructure `<header>` contents |
| `quiz.html` | Restructure `<header>` contents |
| `about.html` | Restructure `<header>` contents |
| `mylore.html` | Restructure `<header>` contents |
| `methodology.html` | Restructure `<header>` contents |
| `404.html` | Restructure `<header>` contents |

---

### Task 1: Restructure header CSS

**Files:**
- Modify: `css/styles.css:172-183` (header rule)
- Modify: `css/styles.css:240-244` (.header-nav-group → .header-nav-strip)
- Modify: `css/styles.css:246-257` (.header-brand — remove absolute positioning)
- Add: `.header-divider` rule (after .header-brand)
- Remove: `css/styles.css:2680-2682` (`header .theme-toggle { margin-left: auto; }` — no longer needed)
- Modify: `css/styles.css:2724-2773` (mobile overrides)

- [ ] **Step 1: Modify the header rule**

Replace the `header` rule at line 172. Remove `justify-content: space-between` (no longer needed — children flow naturally with flex). Add `gap: 1rem`.

```css
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(180deg, rgba(13, 13, 13, 0.95) 0%, transparent 100%);
}
```

- [ ] **Step 2: Replace .header-nav-group with .header-nav-strip**

Replace the `.header-nav-group` rule at line 240 with:

```css
.header-nav-strip {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.header-nav-strip::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 3: Modify .header-brand**

Replace the `.header-brand` rule at line 246. Remove `position: absolute`, `left: 50%`, `transform: translateX(-50%)`. Add `flex-shrink: 0`.

```css
.header-brand {
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-primary);
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Add .header-divider**

Insert after the `.header-brand .hero-accent` rule (line 261):

```css
.header-divider {
  width: 1px;
  height: 1.2rem;
  background: var(--accent);
  opacity: 0.5;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Remove `header .theme-toggle { margin-left: auto; }`**

Delete the rule at line 2680-2682. The toggle no longer needs auto margin since the nav strip fills available space with `flex: 1`.

- [ ] **Step 6: Update nav inside the strip**

Ensure the `nav` rule at line 200 keeps `display: flex` and `gap: 1.5rem` (desktop). The links already have `white-space: nowrap` isn't set yet — add it to `nav a` at line 205:

```css
nav a {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-secondary);
  position: relative;
  white-space: nowrap;
  transition: color var(--transition), transform 0.15s;
}
```

- [ ] **Step 7: Replace mobile overrides at 768px**

Replace the entire `@media (max-width: 768px)` header block (lines 2724-2773) with:

```css
/* ── Responsive: 768px ── */
@media (max-width: 768px) {
  header {
    padding: 0.65rem 1rem;
    gap: 0.5rem;
  }

  .header-brand {
    font-size: 0.75rem;
    letter-spacing: 0.2em;
  }

  .header-divider {
    height: 1rem;
  }

  nav {
    gap: 0.75rem;
  }

  nav a {
    font-size: 0.6rem;
    letter-spacing: 0.1em;
  }
```

Note: This removes `flex-wrap: wrap` from the header, `order` properties, and the old `.header-nav-group` mobile rules. The header no longer wraps — everything stays in one line and the nav strip scrolls.

- [ ] **Step 8: Commit CSS changes**

```bash
git add css/styles.css
git commit -m "refactor(css): restructure header for brand + divider + scrollable nav"
```

---

### Task 2: Restructure header HTML in all 9 pages

**Files:**
- Modify: `index.html`, `bestiary.html`, `stories.html`, `world.html`, `quiz.html`, `about.html`, `mylore.html`, `methodology.html`, `404.html`

Each page has the same header structure with minor differences (the `class="active"` link varies per page, and `404.html` has no active link).

- [ ] **Step 1: Restructure index.html header**

Replace lines 60-83 of `index.html`:

```html
  <header>
    <span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>
    <span class="header-divider" aria-hidden="true"></span>
    <div class="header-nav-strip">
      <nav id="site-nav" aria-label="Main navigation">
      <a href="index.html" class="active">HOME</a>
      <a href="bestiary.html">BESTIARY</a>
      <a href="stories.html">STORIES</a>
      <a href="world.html">WORLD</a>
      <a href="quiz.html">EXAMINATION</a>
      <a href="about.html">ABOUT</a>
      <a href="mylore.html">MY LORE</a>
      <a href="methodology.html">METHODOLOGY</a>
      </nav>
    </div>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode">
      <svg class="theme-icon-light" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg class="theme-icon-dark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false" style="display:none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  </header>
```

The `class="active"` stays on `HOME` for index.html.

- [ ] **Step 2: Restructure bestiary.html header**

Same pattern. `class="active"` goes on `<a href="bestiary.html">BESTIARY</a>`. Remove the `.header-nav-group` wrapper, move brand before nav, add divider.

- [ ] **Step 3: Restructure stories.html header**

Same pattern. `class="active"` on `<a href="stories.html">STORIES</a>`.

- [ ] **Step 4: Restructure world.html header**

Same pattern. `class="active"` on `<a href="world.html">WORLD</a>`.

- [ ] **Step 5: Restructure quiz.html header**

Same pattern. `class="active"` on `<a href="quiz.html">EXAMINATION</a>`.

- [ ] **Step 6: Restructure about.html header**

Same pattern. `class="active"` on `<a href="about.html">ABOUT</a>`.

- [ ] **Step 7: Restructure mylore.html header**

Same pattern. `class="active"` on `<a href="mylore.html">MY LORE</a>`.

- [ ] **Step 8: Restructure methodology.html header**

Same pattern. `class="active"` on `<a href="methodology.html">METHODOLOGY</a>`.

- [ ] **Step 9: Restructure 404.html header**

Same pattern. No `class="active"` on any link (404 page).

- [ ] **Step 10: Commit HTML changes**

```bash
git add index.html bestiary.html stories.html world.html quiz.html about.html mylore.html methodology.html 404.html
git commit -m "refactor(html): restructure header for brand + divider + scrollable nav"
```

---

### Task 3: Verification

**Files:**
- Test: existing `tests/e2e/responsive.spec.js` (no changes needed)

- [ ] **Step 1: Run Jest tests**

```bash
npx jest
```

Expected: 11 suites, 106 tests, all passing.

- [ ] **Step 2: Start local server and run Playwright responsive tests**

```bash
npx serve -l tcp://0.0.0.0:3000 --no-port-switching --no-clipboard &
sleep 3
npx playwright test --project=chromium tests/e2e/responsive.spec.js --reporter=list --workers=4
```

Expected: 58/58 passing across all viewports (360px–2560px) × all pages.

- [ ] **Step 3: Manual spot-check at 768px**

Verify the nav strip scrolls horizontally on narrower viewports and all 8 links are accessible without wrapping.

- [ ] **Step 4: Push**

```bash
git push
```

- [ ] **Step 5: Update todos.md**

Mark nav redesign as complete.
