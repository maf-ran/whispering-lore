# Whispering Lore — Full Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fix critical issues (light mode, fonts, duplicated scripts, stats inconsistencies) and elevate design to premium level.

**Architecture:** 6 independent phases that each produce testable, shippable changes. Phases 1-3 are prerequisites for the visual identity; 4-6 are pure cleanup.

**Tech Stack:** Vanilla HTML/CSS/JS. No framework. Three.js for globe (CDN). Netlify deploy.

---

## Phase 1: Quick Wins (font sizes, scripts, stats, breakpoints)

### Task 1.1: Fix dangerously small font sizes

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Bump nav, footer, CTA, label font sizes**

Find these selectors and update values:

```css
/* ~line 50 — nav links */
.site-nav a {
  font-size: 0.75rem;  /* was 0.65rem (~10.4px → 12px) */
}

/* ~line 55 — footer nav */
.footer-nav a {
  font-size: 0.7rem;   /* was 0.6rem (~9.6px → 11.2px) */
}

/* ~line 175 — hero stat labels */
.stat-label {
  font-size: 0.65rem;  /* was 0.6rem */
}

/* ~line 670 — card country */
.card-country {
  font-size: 0.6rem;   /* was 0.55rem (~8.8px → 9.6px) */
}

/* ~line 644 — card CTA */
.card-cta {
  font-size: 0.65rem;  /* was 0.6rem */
}

/* ~line 1035 — story dates */
.story-date {
  font-size: 0.6rem;   /* was 0.55rem */
}
```

- [ ] **Step 2: Update any mobile overrides for these in media queries**

Search for `font-size: 0.65rem`, `0.6rem`, `0.55rem` in the file and ensure all are bumped. Run:

```
rg "font-size: 0\.(6[05]|55)rem" css/styles.css
```

Verify no sub-11px font sizes remain.

- [ ] **Step 3: Commit**

```
git add css/styles.css
git commit -m "fix: bump font sizes above 11px minimum for WCAG"
```

---

### Task 1.2: Externalize duplicated inline scripts

**Files:**
- Create: `js/theme-toggle.js`
- Create: `js/rune-scatter.js`
- Modify: `index.html`
- Modify: `about.html`
- Modify: `bestiary.html`
- Modify: `stories.html`
- Modify: `world.html`
- Modify: `quiz.html`
- Modify: `404.html`

- [ ] **Step 1: Create `js/theme-toggle.js`**

```js
(function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const storedTheme = localStorage.getItem('theme');

  const getPreferredTheme = () => {
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const theme = getPreferredTheme();
  applyTheme(theme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();
```

- [ ] **Step 2: Create `js/rune-scatter.js`**

Extract the rune scatter canvas logic into a single file that can be conditionally activated:

```js
(function() {
  const r = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛝ','ᛟ','ᛞ','ᚡ','ᚧ','ᚩ','ᚪ','ᚫ','ᚬ','ᚭ','ᚮ','ᚯ','ᚰ','ᚱ','ᚲ','ᛀ','ᛁ','ᛂ','ᛃ','ᛄ','ᛅ','ᛆ','ᛇ','ᛈ','ᛉ','ᛊ','ᛋ','ᛌ','ᛍ','ᛎ','ᛏ','ᛐ','ᛑ','ᛒ','ᛓ','ᛔ','ᛕ','ᛖ','ᛗ','ᛘ','ᛙ','ᛚ','ᛛ','ᛜ','ᛝ','ᛞ','ᛟ','Ω','Ψ','Δ','θ'];

  const canvas = document.getElementById('rune-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let runes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initRunes();
    draw();
  }

  function initRunes() {
    runes = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      runes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 16 + Math.random() * 28,
        char: r[Math.floor(Math.random() * r.length)],
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.04 + Math.random() * 0.12,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    runes.forEach(rune => {
      rune.y -= rune.speed;
      if (rune.y < -rune.size) {
        rune.y = canvas.height + rune.size;
        rune.x = Math.random() * canvas.width;
      }
      ctx.fillStyle = isLight
        ? `rgba(153, 27, 27, ${rune.opacity * 1.5})`
        : `rgba(255, 255, 255, ${rune.opacity})`;
      ctx.font = `${rune.size}px serif`;
      ctx.fillText(rune.char, rune.x, rune.y);
    });
    requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
  resize();
})();
```

- [ ] **Step 3: Remove inline theme toggle from ALL 7 HTML files**

In each HTML file, find and remove the inline script block at the bottom that reads from `localStorage` and toggles the theme. It looks like:

```html
<script>
  (function() {
    ...
  })();
</script>
```

Replace it with a single external script tag right before `</body>`:

```html
<script src="js/theme-toggle.js" defer></script>
```

- [ ] **Step 4: Remove inline rune scatter from index.html, stories.html, world.html, 404.html**

Find the inline canvas drawing script block and remove it. Add the external script instead:

```html
<script src="js/rune-scatter.js" defer></script>
```

For pages that already load `js/rune-scatter.js` (about.html, bestiary.html, quiz.html), leave them as-is.

- [ ] **Step 5: Move theme toggle `<script>` in `<head>` to `js/theme-toggle.js`**

The inline block in `<head>` that reads `localStorage` to prevent flash should be removed and handled by the external script loading before body end (or inline a minimal version in head if flash is an issue).

- [ ] **Step 6: Commit**

```
git add js/theme-toggle.js js/rune-scatter.js index.html about.html bestiary.html stories.html world.html quiz.html 404.html
git commit -m "refactor: externalize duplicated theme-toggle and rune-scatter scripts"
```

---

### Task 1.3: Fix inconsistent stats numbers

**Files:**
- Modify: `index.html`
- Modify: `about.html`

- [ ] **Step 1: Read the actual data counts**

Run:
```
python3 -c "import json; d=json.load(open('data/datasets/creatures.json')); s=json.load(open('data/datasets/stories.json')); print(f'Creatures: {len(d)}, Stories: {len(s)}')"
```

Also count unique countries:
```
python3 -c "import json; d=json.load(open('data/datasets/creatures.json')); countries=set(c.get('country','') for c in d if c.get('country')); print(f'Countries: {len(countries)}')"
```

- [ ] **Step 2: Update index.html hero stats**

Find the stat numbers in the hero section (~lines 79-86):

```html
<p class="stat-number">2,561</p>
<p class="stat-label">Creatures Documented</p>
```

Replace with actual counts from Step 1.

- [ ] **Step 3: Update about.html stats**

Find the stats section and update with consistent numbers.

- [ ] **Step 4: Commit**

```
git add index.html about.html
git commit -m "fix: sync hero/about stats with actual data counts"
```

---

### Task 1.4: Consolidate CSS breakpoints to 3

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Map all current breakpoints**

Run to find all media queries:
```
rg -n "@media" css/styles.css
```

Expected output shows ~13 blocks at: 900px, 768px, 700px, 600px, 480px, 400px.

- [ ] **Step 2: Reduce to 3 breakpoints**

Consolidate into:

```css
/* Tablet: 768px */
@media (max-width: 768px) { }

/* Mobile: 600px */
@media (max-width: 600px) { }

/* Small mobile: 400px */
@media (max-width: 400px) { }
```

Merge rules:

- Move 900px rules into 768px (or drop if they work at wider widths)
- Move 700px and 480px rules into 600px
- Move 400px rules as-is

For each rule being moved, check if it conflicts with existing rules at the target breakpoint. If both set the same property, keep the more restrictive value.

Specifically fix the `.page-hero` min-height cascade. Current:
```
/* at 600px */ min-height: 50vh
/* at 400px */ min-height: 50vh
/* at 600px */ min-height: 40vh  (second 600px block!)
/* at 480px */ min-height: 30vh
```

Should become:
```
@media (max-width: 768px) { .page-hero { min-height: 50vh; } }
@media (max-width: 600px) { .page-hero { min-height: 40vh; } }
@media (max-width: 400px) { .page-hero { min-height: 30vh; } }
```

- [ ] **Step 3: Verify grid column behavior**

Content grid currently: 3col → 2col (900px) → 1col (768px or 600px). Fix to:

```css
.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Remove `!important` flags in media queries (lines 2159, 2165, 2179)**

The `!important` was likely needed because of specificity conflicts from duplicate/similar selectors. After consolidation, these should resolve. Remove `!important` and test. If specificity still conflicts, increase selector specificity properly (e.g., `.card.detail-open` instead of `.card[style]`).

- [ ] **Step 5: Commit**

```
git add css/styles.css
git commit -m "refactor: consolidate CSS breakpoints to 3 (768/600/400px)"
```

---

## Phase 2: Light Mode Overhaul

### Task 2.1: Add missing light-mode overrides for all components

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Audit all components missing `[data-theme="light"]`**

Run to find all top-level component classes:
```
rg -n "^\." css/styles.css | head -60
```

Check which ones have no `[data-theme="light"]` override. The missing ones include:
- `.card` and `.card-body`
- `.feature-card` / `.daily-feature`
- `.detail-content` / `.detail-fullpage`
- `.filter-group input`, `.control-group select`
- `.globe-country-list`
- `.quiz-question`
- `.facet-option`
- `.story-card`
- `.modal-content`

- [ ] **Step 2: Add component light-mode overrides**

Find the existing `[data-theme="light"]` block (around line 2224). Add these overrides inside it:

```css
[data-theme="light"] .card,
[data-theme="light"] .story-card,
[data-theme="light"] .feature-card {
  background: #f0ece3;
  border-color: #d4cfc4;
}

[data-theme="light"] .card-body {
  background: #f0ece3;
}

[data-theme="light"] .daily-feature {
  background: #f0ece3;
  border-color: #d4cfc4;
}

[data-theme="light"] .detail-content,
[data-theme="light"] .detail-fullpage {
  background: #f5f2eb;
}

[data-theme="light"] .detail-backdrop {
  background: rgba(0, 0, 0, 0.5);
}

[data-theme="light"] .filter-group input,
[data-theme="light"] .control-group select {
  background: #f5f2eb;
  border-color: #d4cfc4;
  color: #1c1917;
}

[data-theme="light"] .globe-country-list {
  background: rgba(245, 242, 235, 0.95);
}

[data-theme="light"] .globe-country-row:hover {
  background: rgba(153, 27, 27, 0.08);
}

[data-theme="light"] .facet-option {
  background: #f0ece3;
  border-color: #d4cfc4;
  color: #1c1917;
}

[data-theme="light"] .facet-option:hover {
  background: #e8e3d8;
}
```

- [ ] **Step 3: Add `color-scheme` meta tag**

Add to the `<head>` of all HTML files:

```html
<meta name="color-scheme" content="dark light">
```

And in the `[data-theme="light"]` block in CSS:

```css
[data-theme="light"] {
  color-scheme: light;
}
```

- [ ] **Step 4: Fix light-mode accent color**

Consider adding a softer accent for light mode inside the `[data-theme="light"]` block:

```css
[data-theme="light"] {
  --accent: #b91c1c;
}
```

This keeps the same hue but slightly brighter for light backgrounds.

- [ ] **Step 5: Commit**

```
git add css/styles.css index.html about.html bestiary.html stories.html world.html quiz.html 404.html
git commit -m "fix: complete light mode with missing component overrides"
```

---

### Task 2.2: Fix theme FOUC (flash of unstyled content)

**Files:**
- Modify: `js/theme-toggle.js`

- [ ] **Step 1: Add critical inline script in `<head>` of all HTML files**

The external `theme-toggle.js` loads at `</body>` — too late. Add a minimal inline block in `<head>` right after `<meta charset>`:

```html
<script>
  (function(){
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  })();
</script>
```

This prevents the flash by setting the attribute before the page renders. The external script at body end will handle toggling and override this if needed.

- [ ] **Step 2: Commit**

```
git add index.html about.html bestiary.html stories.html world.html quiz.html 404.html js/theme-toggle.js
git commit -m "fix: prevent theme flash with critical inline script in head"
```

---

## Phase 3: Visual Upgrade

### Task 3.1: Add hero atmospheric background image

**Files:**
- Modify: `css/styles.css`
- Create: `images/hero-bg.jpg` (or find a free-use alternative)

- [ ] **Step 1: Find a suitable atmospheric image**

Search for a free-to-use misty forest / gothic ruins image:
- https://unsplash.com (search "dark forest mist")
- https://commons.wikimedia.org

Download to `images/hero-bg.jpg`.

- [ ] **Step 2: Add background image to hero**

Find the `.hero` selector (~line 89 in styles.css). Add:

```css
.hero {
  background-image: url('../images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
}

[data-theme="light"] .hero {
  background-blend-mode: normal;
  opacity: 0.85;
}
```

Keep the existing gradient as a fallback by adding it via `background:` together:

```css
.hero {
  background:
    linear-gradient(180deg, rgba(5,5,5,0.7) 0%, rgba(26,21,19,0.85) 100%),
    url('../images/hero-bg.jpg') center/cover;
}
```

- [ ] **Step 3: Commit**

```
git add css/styles.css images/hero-bg.jpg
git commit -m "feat: add atmospheric hero background image with overlay blend"
```

---

### Task 3.2: Enhance micro-interactions

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add consistent hover/focus/active states**

Find and update/add these patterns:

```css
/* Card hover */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

/* Button active state */
.btn-ghost:active,
.card-cta:active {
  transform: scale(0.97);
}

/* Nav link hover */
.site-nav a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.2s var(--ease-out);
}

.site-nav a:hover::after,
.site-nav a.active::after {
  width: 100%;
}

/* Theme toggle hover */
.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* Card CTA hover */
.card-cta:hover {
  opacity: 1;
  gap: 0.5rem;
}

/* Stat item hover */
.stat-item:hover .stat-number {
  color: var(--accent);
}
```

- [ ] **Step 2: Add page transition**

Add a subtle fade-in on page load:

```css
body {
  animation: pageFadeIn 0.3s ease;
}

@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 3: Commit**

```
git add css/styles.css
git commit -m "feat: add micro-interactions - card hover, nav underline, button feedback, page fade-in"
```

---

### Task 3.3: Add scroll-to-top button for story reading

**Files:**
- Modify: `css/styles.css`
- Modify: `js/main.js` (or dedicated file)

- [ ] **Step 1: Add scroll-to-top button CSS**

```css
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-primary);
  border: none;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-to-top.visible {
  opacity: 0.8;
  transform: translateY(0);
}

.scroll-to-top:hover {
  opacity: 1;
}

.scroll-to-top svg {
  width: 20px;
  height: 20px;
}
```

- [ ] **Step 2: Add JS for scroll visibility**

```js
const scrollBtn = document.getElementById('scroll-to-top');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
```

- [ ] **Step 3: Add button to HTML**

In each HTML file, right before `</body>`:

```html
<button id="scroll-to-top" class="scroll-to-top" aria-label="Scroll to top">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 15l-6-6-6 6"/>
  </svg>
</button>
```

- [ ] **Step 4: Commit**

```
git add css/styles.css js/main.js index.html about.html bestiary.html stories.html world.html quiz.html 404.html
git commit -m "feat: add scroll-to-top button with smooth scroll"
```

---

### Task 3.4: Add creature card images from public domain sources

**Files:**
- Modify: `js/creatures-viewer.js`
- Create: `js/card-images.js`

- [ ] **Step 1: Create a card-image mapping utility**

```js
const CARD_IMAGES = {};

function getCardImage(creature) {
  const key = creature.name.toLowerCase().replace(/[^a-z]/g, '');
  // Wikimedia Commons query API for public domain mythological art
  const wmUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(creature.name + ' mythology')}&format=json&origin=*&srlimit=1`;
  return { wmUrl, local: CARD_IMAGES[key] || null };
}
```

- [ ] **Step 2: Update card rendering in creatures-viewer.js**

Replace placeholder SVG with an `<img>` tag that falls back to placeholder on error:

```js
function renderCardImage(creature) {
  const img = document.createElement('img');
  img.alt = creature.name;
  img.loading = 'lazy';
  img.className = 'card-image';
  img.src = CARD_IMAGES[creature.slug] || 'images/placeholder-creature.svg';
  img.onerror = function() {
    this.style.display = 'none';
    this.nextElementSibling?.classList.remove('hidden');
  };
  return img;
}
```

- [ ] **Step 3: Add placeholder SVG for fallback**

Create `images/placeholder-creature.svg` with a simple rune-circle design matching the current visual style.

- [ ] **Step 4: Commit**

```
git add js/card-images.js js/creatures-viewer.js images/placeholder-creature.svg
git commit -m "feat: add creature card images with Wikimedia Commons lookup and fallback"
```

---

## Phase 4: CSS Architecture Cleanup

### Task 4.1: Remove dead CSS classes and fix misnamed selectors

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Remove dead classes**

Remove these dead/never-visible selectors:
- `.hero-feature-pill` (has `display: none`)
- `.header-nav-group` (if unused — verify first)

- [ ] **Step 2: Fix `.gold-*` class naming**

Find all `.gold-line`, `.gold-accent`, `.gold-dot` classes. They use `var(--accent)` which is crimson. Either:
- Rename to `.crimson-line`, `.crimson-accent`, `.crimson-dot`
- Or add `--gold: #c9a94e;` to `:root` and use it

If the intent was actually gold, add the variable:

```css
:root {
  --gold: #c9a94e;
}

.gold-line {
  background: var(--gold);
  /* ... */
}
```

- [ ] **Step 3: Replace hardcoded `rgba(153, 27, 27, ...)` with `var(--accent)`**

Find and replace all hardcoded accent color values:

```
rg "rgba\(153,\s*27,\s*27" css/styles.css
```

Replace each with a CSS variable approach:
```css
/* Before */
background: rgba(153, 27, 27, 0.1);

/* After */
background: color-mix(in srgb, var(--accent) 10%, transparent);
```

Or if `color-mix` browser support is a concern, use a `--accent-rgb` variable:

```css
:root {
  --accent-rgb: 153, 27, 27;
}

/* Then use: */
background: rgba(var(--accent-rgb), 0.1);
```

- [ ] **Step 4: Fix duplicate `.detail-section`**

Find both definitions (lines ~1357 and ~2111). Merge them into one:

```css
.detail-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
```

- [ ] **Step 5: Deduplicate `.story-country` and `.card-country`**

Merge into one shared class:

```css
.card-country,
.story-country {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
}
```

- [ ] **Step 6: Consolidate repeated gradient patterns**

Extract the placeholder gradient into a utility class:

```css
.placeholder-gradient {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(153,27,27,0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(153,27,27,0.05) 0%, transparent 50%);
}
```

Replace all 3 inline gradient blocks with `.placeholder-gradient`.

- [ ] **Step 7: Commit**

```
git add css/styles.css
git commit -m "refactor: remove dead CSS, fix misnamed classes, deduplicate selectors"
```

---

### Task 4.2: Fix 3D globe loading and dependencies

**Files:**
- Modify: `world.html`
- Modify: `css/styles.css`

- [ ] **Step 1: Add globe loading indicator**

In `world.html`, add a loading state near the globe container:

```html
<div id="globe-loading" class="globe-loading">
  <div class="skeleton-pulse" style="width:100%;height:100%;border-radius:50%;"></div>
  <p>Loading map...</p>
</div>
```

- [ ] **Step 2: Add loading state CSS**

```css
.globe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1;
}

.globe-container.globe-ready .globe-loading {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
```

- [ ] **Step 3: Update globe.js to hide loading on init**

In `globe.js`, at the end of initialization:

```js
document.querySelector('.globe-container')?.classList.add('globe-ready');
```

- [ ] **Step 4: Commit**

```
git add world.html css/styles.css
git commit -m "feat: add globe loading indicator and ready state"
```

---

## Phase 5: Accessibility & Polish

### Task 5.1: Fix accessibility gaps

**Files:**
- Modify: `index.html`
- Modify: `about.html`
- Modify: `bestiary.html`
- Modify: `stories.html`
- Modify: `world.html`
- Modify: `quiz.html`
- Modify: `css/styles.css`

- [ ] **Step 1: Add `aria-live` to dynamic content regions**

In `quiz.html`, add `aria-live="polite"` to quiz root:

```html
<div id="quiz-root" aria-live="polite" aria-atomic="false"></div>
```

In `bestiary.html`, add to filter results:

```html
<div id="creatures-grid" aria-live="polite" aria-label="Filtered creatures"></div>
```

- [ ] **Step 2: Add `role="dialog"` to stories detail view**

In `stories.html`, the detail wrapper is missing dialog semantics that `bestiary.html` has:

```html
<div id="story-detail" class="detail-fullpage" role="dialog" aria-modal="true" aria-labelledby="story-detail-title" style="display:none">
```

- [ ] **Step 3: Add `aria-expanded` to mobile menu toggle**

```html
<button class="mobile-menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle navigation menu">
```

And update the JS toggle to set `aria-expanded`:
```js
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
  menuToggle.setAttribute('aria-expanded', expanded);
});
```

- [ ] **Step 4: Add `aria-hidden` to decorative SVGs**

Scan all HTML files for decorative SVGs (runes in hero, card placeholders, etc.) and ensure they have `aria-hidden="true"` and `focusable="false"`.

- [ ] **Step 5: Make interactive elements keyboard-focusable**

```css
.chip:focus-visible,
.facet-option:focus-visible,
.globe-country-row:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Add `tabindex="0"` to non-button interactive elements:

```html
<div class="chip" tabindex="0" role="button">...</div>
```

- [ ] **Step 6: Commit**

```
git add index.html about.html bestiary.html stories.html world.html quiz.html css/styles.css
git commit -m "fix: accessibility - aria-live regions, dialog roles, keyboard navigation"
```

---

### Task 5.2: Remove inline `style` attributes

**Files:**
- Modify: `index.html`
- Modify: `bestiary.html`
- Modify: `stories.html`
- Modify: `world.html`
- Modify: `404.html`

- [ ] **Step 1: Replace inline `display:none` toggles with CSS classes**

Find all `style="display:none"` in bestiary.html and stories.html (10+ occurrences each). Replace:

In CSS:
```css
.detail-fullpage.is-open,
.detail-overlay.is-open {
  display: flex;
}

.is-hidden {
  display: none !important;
}
```

In HTML:
```html
<!-- Before -->
<div id="creature-detail" class="detail-fullpage" style="display:none">

<!-- After -->
<div id="creature-detail" class="detail-fullpage is-hidden">
```

In JS, change show/hide logic from `.style.display = 'none'/'flex'` to `.classList.add/remove('is-hidden')`.

- [ ] **Step 2: Replace other inline styles**

In index.html (~line 56-58), move SVG `style="display:none"` to a CSS class.
In world.html, move 160 lines of inline `<style>` block to `css/styles.css`.
In 404.html (~line 68-72), replace inline styles on rune text and CTA with classes.

- [ ] **Step 3: Commit**

```
git add index.html bestiary.html stories.html world.html 404.html css/styles.css
git commit -m "refactor: replace inline styles with CSS classes across all pages"
```

---

## Phase 6: Code Quality & Performance

### Task 6.1: Fix XSS via innerHTML

**Files:**
- Modify: `js/creatures-viewer.js`
- Modify: `js/stories-viewer.js`
- Modify: `js/main.js`

- [ ] **Step 1: Create a safe text utility**

```js
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

- [ ] **Step 2: Find all innerHTML assignments**

```
rg "innerHTML\s*=" js/ --include "*.js"
```

- [ ] **Step 3: Replace dangerous patterns**

Change any `innerHTML` that includes user/API data:

```js
// Before
element.innerHTML = `<h3>${creature.name}</h3><p>${creature.description}</p>`;

// After
element.innerHTML = `<h3>${esc(creature.name)}</h3><p>${esc(creature.description)}</p>`;
```

For safe, static templates (no interpolated data), `innerHTML` is fine and can stay.

- [ ] **Step 4: Commit**

```
git add js/creatures-viewer.js js/stories-viewer.js js/main.js
git commit -m "fix: sanitize innerHTML assignments against XSS"
```

---

### Task 6.2: Add passive scroll listeners and remove zombie listeners

**Files:**
- Modify: `js/main.js`
- Modify: `js/creatures-viewer.js`

- [ ] **Step 1: Add `{ passive: true }` to all scroll/touch listeners**

```
rg "addEventListener.*(scroll|touch|wheel)" js/ --include "*.js"
```

For each match, add `{ passive: true }`:

```js
// Before
window.addEventListener('scroll', handler);

// After
window.addEventListener('scroll', handler, { passive: true });
```

- [ ] **Step 2: Remove zombie event listeners on detail close**

In creatures-viewer.js and stories-viewer.js, when closing a detail view, ensure cleanup:

```js
function closeDetail() {
  // Remove any detail-specific listeners
  document.removeEventListener('keydown', handleEscKey);
  // ...existing close logic
}
```

- [ ] **Step 3: Commit**

```
git add js/main.js js/creatures-viewer.js
git commit -m "perf: add passive scroll listeners, fix zombie event listeners"
```

---

### Task 6.3: Consolidate global data (eliminate JS globals)

**Files:**
- Modify: `index.html`
- Modify: `bestiary.html`
- Modify: `stories.html`
- Modify: `js/creatures-data.js`
- Modify: `js/stories-data.js`
- Modify: `js/creatures-viewer.js`
- Modify: `js/stories-viewer.js`

- [ ] **Step 1: Switch inline scripts to fetch from JSON files**

Find inline `<script>` blocks that define `ALL_CREATURES` and `ALL_STORIES` as JS globals. Replace with fetch-based loading:

```js
// In creatures-viewer.js (already loads via fetch? check first)
// If currently using inline global, switch to:
async function loadCreatures() {
  const res = await fetch('data/datasets/creatures.json');
  return res.json();
}
```

- [ ] **Step 2: Remove inline data script tags from HTML**

Delete the inline script blocks that contain the full JSON data (~109KB). Keep only the viewer JS files that fetch data.

- [ ] **Step 3: Handle loading state in viewer**

```js
async function initViewer() {
  showLoading();
  try {
    const creatures = await loadCreatures();
    renderGrid(creatures);
  } catch (err) {
    showError('Failed to load creatures data');
  }
}
```

- [ ] **Step 4: Commit**

```
git add index.html bestiary.html stories.html js/creatures-data.js js/stories-data.js js/creatures-viewer.js js/stories-viewer.js
git commit -m "refactor: replace inline data globals with fetch-based JSON loading"
```

---

### Task 6.4: Fix test failures (IndexedDB, quiz, geo)

**Files:**
- Modify: `tests/` (various)

- [ ] **Step 1: Run tests to confirm failures**

```
npx vitest run 2>&1 | tail -30
```

- [ ] **Step 2: Fix IndexedDB test failures**

IndexedDB tests fail in non-browser environments. Add a mock for IndexedDB in test setup, or skip IndexedDB tests in non-browser mode:

```js
// test-setup.js
if (typeof indexedDB === 'undefined') {
  globalThis.indexedDB = require('fake-indexeddb');
}
```

- [ ] **Step 3: Fix quiz and geo test failures**

Examine the failing quiz/geo tests and fix the implementation or test assertions as appropriate.

- [ ] **Step 4: Run tests to confirm passing**

```
npx vitest run
```

Expected: 27+ tests passing, 0 failures.

- [ ] **Step 5: Commit**

```
git add tests/test-setup.js tests/*.test.js
git commit -m "fix: resolve IndexedDB/quiz/geo test failures"
```

---

## Execution Order & Dependencies

```
Phase 1 (Quick Wins)  ─── no dependencies
Phase 2 (Light Mode)  ─── depends on Phase 1 (externalized scripts)
Phase 3 (Visual)      ─── no dependencies on earlier phases
Phase 4 (CSS Cleanup) ─── no dependencies (can run parallel with 2-3)
Phase 5 (A11y/Polish) ─── best after Phase 1 (scripts consolidated)
Phase 6 (Code Quality)── no dependencies
```

Phases 1, 4, and 6 can be run in parallel by different developers. Phases 2, 3, 5 should run sequentially.

---

## Verification

After each phase, run:
```
npx vitest run         # tests still pass?
npx eslint .           # lint clean?
npm run build          # (if applicable)
```

Manual checks per phase:
- **Phase 1**: All 7 pages load without console errors, fonts visible and readable
- **Phase 2**: Toggle light/dark, verify every component renders correctly in both modes
- **Phase 3**: Hero has background image, hover states work, scroll-to-top appears
- **Phase 4**: Globe loads with loading indicator, no dead CSS
- **Phase 5`: Tab through all pages, screen reader test on quiz/bestiary
- **Phase 6**: No XSS vectors, test suite passes fully
