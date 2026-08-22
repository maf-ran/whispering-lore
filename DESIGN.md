# Whispering Lore — Design System

**Bone & Ash** — a dark, editorial folklore aesthetic: charcoal and bone surfaces,
crimson accents, serif typography, and restrained motion. One shared stylesheet
(`css/styles.css`) drives every page through CSS custom properties.

---

## Color Palette

### Dark theme (default) — `:root`

| Token | Value | Role |
|---|---|---|
| `--bg-deep` | `#111111` | Main background |
| `--bg-card` | `#1C1917` | Card / panel surfaces |
| `--bg-dark` | `#111111` | Darker sections |
| `--hero-bg` → `--hero-step4` | `#050505` → `#1A1513` | 5-step hero gradient |
| `--text-primary` | `#D6D3C8` | Headings / body ("bone") |
| `--text-secondary` | `#A8A29E` | Muted text |
| `--text-muted` | `#8F8A84` | Captions, metadata |
| `--accent` | `#991B1B` | Crimson — links, borders, highlights |
| `--accent-hover` | `#B91C1C` | Accent hover state |
| `--accent-strong` | `#E05C5C` | Emphasis on dark surfaces |
| `--border` | `#292524` | Hairlines, card borders |

Badge semantics: `--badge-success #22c55e`, `--badge-info #3b82f6`,
`--badge-warning #f59e0b`, `--badge-purple #a78bfa`, `--badge-violet #8b5cf6`,
`--badge-cyan #06b6d4`.

### Light theme — `[data-theme="light"]`

| Token | Value |
|---|---|
| `--bg-deep` | `#F5F2EB` (parchment) |
| `--bg-card` | `#FFFFFF` |
| `--bg-dark` | `#EDE8DF` |
| `--text-primary` | `#1C1917` |
| `--text-secondary` | `#57534E` |
| `--border` | `#D6D3C8` |
| `--accent` | `#B91C1C` |

**Theming rules**
- Never hardcode colors — consume tokens so both themes stay valid.
- Never use `opacity` to soften an accent over cards: alpha-blending breaks
  contrast differently per theme (the `.region-pct` lesson).
- Third-party widgets must be recolored via scoped overrides on our side
  (`!important` beats their inline styles — see `.ko-fi-support` block).

---

## Typography

| Token | Family | Use |
|---|---|---|
| `--font-display` | `'Cinzel', serif` | Headings, display, nav brand |
| `--font-body` | `'Lora', serif` | Body copy, excerpts |

Both load from Google Fonts with `display=swap`. Cinzel carries the mythic /
inscriptional voice; Lora keeps long lore readable.

---

## Layout Patterns

- **Hero** — full-bleed 5-step gradient (`--hero-*`), rune-scatter canvas
  (28+ symbols across Norse/Celtic/Greek/Egyptian traditions, white at 4–16%
  opacity), stats bar, ghost buttons (transparent, crimson border).
- **Page hero** — inner pages use `.page-hero` (55vh) + `.page-hero-content`.
- **Content grid** — `.content-grid`, 3-col responsive.
- **Section rhythm** — `.section-divider` (SVG crimson curve) between sections;
  `.section-heading` = centered heading with crimson rule.
- **Cards** — `.card` on `var(--bg-card)` with crimson accent line.

---

## Component Inventory

| Component | Purpose |
|---|---|
| `.filter-bar` | Search + sort controls above data grids |
| `.filter-chip` | Active filter pill with remove button |
| `.facet-option` | Dynamic facet row with count |
| `.hero-feature-pill` | Ghost button linking to the daily feature |
| `.latest-item` | Homepage "Latest Additions" entry |
| `.skip-link` | A11y skip-to-content (focus-visible styled) |
| Skeleton loaders | Shimmer placeholders while shards load |
| Detail overlays | Full entity view (`#detail-content` pattern) |

---

## Motion

- `fadeInUp` — entrance animation (`.hero-actions`: 1.4s ease, 1.1s delay)
- Pulse / shimmer loops on badges and skeletons run **infinitely**
- Motion is decorative only; all content is readable without it
- The accessibility test suite drains finite animations before scanning
  (`awaitSettled()` in `tests/e2e/accessibility.spec.js`)

---

## Accessibility Constraints (enforced)

Zero-violation axe gate: 10 pages × 2 viewports + overlays + search state
(`npx playwright test --project=chromium tests/e2e/accessibility.spec.js`).

- Text contrast ≥ AA against **both** themes — verify new colors against the
  light theme too, not just charcoal.
- Decorative SVGs carry `aria-hidden="true"`; icons are inline SVG, not emoji.
- Focus states: global `:focus-visible` plus specific treatments for chips,
  facets, skip link. Focus is trapped inside open overlays.
- Ko-fi widget is recolored to site tokens by CSS overrides; its CDN is
  mocked in tests for hermetic scanning.

---

## Page Inventory

| Page | Role |
|---|---|
| `index.html` | Hero, daily feature, latest additions, stats |
| `bestiary.html` | Creature grid — search, sort, facets |
| `stories.html` | Story grid — search, sort, facets, recommendations |
| `items.html` | Legendary artifact grid + detail overlays |
| `search.html` | Cross-dataset full-text search with deep links |
| `world.html` | Three.js globe, country/region counts |
| `quiz.html` | 1,071-question examination engine |
| `mylore.html` | Personal archive — favourites, export/import |
| `about.html` / `methodology.html` / `404.html` | Static editorial pages |

---

*Source of truth: css/styles.css `:root` + `[data-theme="light"]` blocks.
Update this file when tokens change.*
