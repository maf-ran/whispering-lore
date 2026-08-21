# Accessibility Pass — Design

Date: 2026-08-21
Status: Approved (conversation), pending spec review
Target: WCAG 2.2 AA, zero axe-core violations

## Goal

Bring all 10 pages of Whispering Lore to zero axe-core violations at desktop and
mobile viewports, including dynamically rendered states (detail overlays, search
results). Add a permanent Playwright regression gate so violations cannot return.

## Non-Goals

- No visual redesign. Changes are limited to what accessibility requires
  (contrast, outlines, ARIA attributes).
- No behavior changes to existing features.
- No full manual screen-reader certification — automated axe coverage only.

## Tooling

- Dependency: `@axe-core/playwright` (devDependency).
- New spec: `tests/e2e/accessibility.spec.js`.

## Scan Matrix

| State | Pages | Viewports |
| --- | --- | --- |
| Static page load | index, about, world, bestiary, items, stories, quiz, mylore, methodology, 404 | 1440×900 and 320×568 |
| Detail overlay open | one creature (bestiary), one story, one item — opened via deep link (`?creature=` / `?story=` / `?item=`) with stable, well-known slugs so scans don't depend on sort order | 1440×900 |
| Search results | `/search.html?q=troll` with results rendered | 1440×900 |

Total scans: 20 static + 3 overlay + 1 search = 24 per run.

## Assertions

- Every scan asserts zero axe violations (`axeResults.violations.length === 0`).
- Known false positives go in a documented `exclusions` map keyed by
  `page → ruleId`, each entry with a one-line reason comment. The map starts
  empty; entries are added only if a finding is verified as false positive.
- Color-contrast findings are fixed in CSS, not excluded, unless the element is
  genuinely decorative text (then it should not be text).

## Expected Fixes (from backlog + known suspects)

1. Decorative SVGs (rune scatter, section dividers, region glyphs, logo icon):
   add `aria-hidden="true"` / empty alt semantics where missing.
2. Focus visibility on custom widgets: `.facet-option`, `.filter-chip`,
   `.region-card`, `.hotspot-item` — Aug 15 pass added `:focus-visible`
   outlines on some; verify all interactive elements have visible focus.
3. Any contrast failures found by axe (Aug 15 introduced `--accent-strong` and
   `--text-muted` tokens; new regressions possible from later features:
   quiz share feedback, ko-fi label, mylore export buttons).

## Constraints

- Preserve existing behavior and visuals except where a fix requires change.
- All gates must pass after fixes: eslint 0 errors, jest suite green,
  chromium e2e green **including** the new accessibility spec.
- Existing 437-test chromium suite must stay green (some fixes touch markup
  that layout/text-overflow specs assert).

## Verification

1. `npx playwright test --project=chromium tests/e2e/accessibility.spec.js` — all scans pass.
2. Full chromium suite green.
3. eslint + jest green.
4. Manual spot check of one fixed contrast/outline case in browser.

## Docs

- Prune stale entries from `FUTURE_IMPROVEMENTS.md` (SEO foundations,
  OG image automation, Cache-Control headers — already done).
- Log the pass in `todos.md`.
