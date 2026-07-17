# Navigation Redesign: Brand + Crimson Divider + Scrollable Nav Strip

**Date:** 2026-07-17
**Status:** Approved
**Scope:** Header navigation layout across all 9 HTML pages

## Problem

The current header uses `display: flex; justify-content: space-between` with three children:
1. `.header-nav-group` (8 nav links in a flex row)
2. `.header-brand` (absolutely centered, doesn't consume flex space)
3. `.theme-toggle` button

At viewport widths below ~1100px, the 8 nav links (HOME, BESTIARY, STORIES, WORLD, EXAMINATION, ABOUT, MY LORE, METHODOLOGY) overflow the available space. "METHODOLOGY" wraps to a second line, appearing underneath the centered brand — visually broken.

## Solution

Replace the current three-child flex layout with a **single flex row**: brand, vertical divider, scrollable nav strip, theme toggle. The nav strip uses `overflow-x: auto` with hidden scrollbars so links never wrap — they scroll horizontally on narrow viewports.

## Design

### Layout Structure

```
header (flex, align-items: center)
├── .header-brand          "Whispering LORE" — nowrap, flex-shrink: 0
├── .header-divider        1px crimson vertical line — flex-shrink: 0
├── .header-nav-strip      overflow-x: auto, scrollbar hidden, flex: 1
│   └── nav#site-nav       flex row with gap
│       ├── a (HOME)
│       ├── a (BESTIARY)
│       └── ... (8 links total)
└── .theme-toggle          flex-shrink: 0
```

### CSS Changes

**Remove:**
- `.header-nav-group` (entire rule — replaces `.header-nav-strip`)
- `.header-brand { position: absolute; left: 50%; transform: translateX(-50%); }`
- `.header-nav-group` mobile overrides (lines ~2729–2770, including `overflow-x: auto`, scrollbar hiding, width/padding rules, and nav flex-direction reset)

**Add/Modify:**
- `header` — remains `display: flex; align-items: center; gap: 1rem; padding: 1rem 2rem;`
- `.header-brand` — remove absolute positioning, keep typography. Add `flex-shrink: 0; white-space: nowrap;`
- `.header-divider` — `width: 1px; height: 1.2rem; background: var(--accent); opacity: 0.5; flex-shrink: 0;`
- `.header-nav-strip` — `flex: 1; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;` + webkit scrollbar hidden
- `nav` inside strip — `display: flex; gap: 1.25rem; white-space: nowrap;`

**Active state:**
- `.nav a.active` or `.nav a:hover` — brighter text color + crimson bottom border. Currently uses `::after` pseudo-element. Keep this but ensure it works within the scrollable strip.

### Mobile (&lt;768px)

- Same single-row layout. No hamburger menu (preserved from current design).
- Reduce font sizes and gaps slightly (`0.55rem` links, `0.75rem` gap).
- Brand + divider + scrollable links + toggle all in one line.
- Strip scrolls horizontally — users can swipe to see all 8 links.

### Pages to Update

All 9 HTML files have identical header structure:
1. `index.html`
2. `bestiary.html`
3. `stories.html`
4. `world.html`
5. `quiz.html`
6. `about.html`
7. `mylore.html`
8. `methodology.html`
9. `404.html`

**HTML change per page:** Replace the current header contents:
```html
<!-- BEFORE -->
<div class="header-nav-group">
  <nav id="site-nav" aria-label="Main navigation">
    <a>HOME</a> ... <a>METHODOLOGY</a>
  </nav>
</div>
<span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>
<button class="theme-toggle">...</button>

<!-- AFTER -->
<span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>
<span class="header-divider" aria-hidden="true"></span>
<div class="header-nav-strip">
  <nav id="site-nav" aria-label="Main navigation">
    <a>HOME</a> ... <a>METHODOLOGY</a>
  </nav>
</div>
<button class="theme-toggle">...</button>
```

### Performance

- No new JS. Pure CSS layout change.
- `overflow-x: auto` is performant — no layout thrashing.
- No new network requests.

### Accessibility

- Brand text remains readable at all sizes.
- All 8 nav links remain visible (no hidden/collapsed links).
- Keyboard navigation: Tab order = brand (skip) → first nav link → ... → last nav link → theme toggle.
- `aria-label="Main navigation"` stays on `<nav>`.
- Divider gets `aria-hidden="true"`.

## Files Changed

| File | Change |
|------|--------|
| `css/styles.css` | Restructure header CSS (~40 lines changed) |
| `index.html` | Restructure header HTML |
| `bestiary.html` | Restructure header HTML |
| `stories.html` | Restructure header HTML |
| `world.html` | Restructure header HTML |
| `quiz.html` | Restructure header HTML |
| `about.html` | Restructure header HTML |
| `mylore.html` | Restructure header HTML |
| `methodology.html` | Restructure header HTML |
| `404.html` | Restructure header HTML |

## Verification

1. **Visual:** All 9 pages render correctly at 320px, 768px, 1024px, 1440px, 1920px
2. **Nav scroll:** At 768px and below, nav strip scrolls horizontally — all links accessible
3. **Active state:** Current page link has crimson underline
4. **Theme toggle:** Works in new position (far right)
5. **No regression:** 106 Jest tests + 58 Playwright responsive tests pass
