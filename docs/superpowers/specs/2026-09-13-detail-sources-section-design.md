# Design: Sources Section for Entry Detail Views

Date: 2026-09-13

## Goal

Render the `source` reference(s) for every creature, story, and item entry in
its detail view — currently the `source` string is stored on every entry but
never shown in the UI (only `source_type` / `source_quality` badges render).

## Placement

On each detail page, a new `.detail-section.detail-sources` at the end of the
main content column `.cd-content`, i.e. after the last content block and
**before** the cross-ref section:

- `bestiary.html`: after `detail-funfact`, before `#creature-stories`
- `stories.html`: after `detail-period`, before `#story-recs`
- `items.html`: after last content section, before `#detail-creatures-section`

## Rendering

One shared renderer `window.__sharedUtils.renderSources(sectionEl, entry)` in
`js/shared-utils.js` (already loaded on all pages before the viewers).

The skeleton heading is static in the HTML (so the existing one-shot i18n
pass picks it up), with the body filled by JS:

```html
<div class="detail-section detail-sources is-hidden" id="detail-creature-sources">
  <h3 data-i18n="detail.sources">Sources</h3>
  <ul class="detail-source-list"></ul>
  <div class="detail-source-badges"></div>
</div>
```

The viewer calls `renderSources(el, entry)` during detail render, which fills
`.detail-source-list` and `.detail-source-badges`.

The section renders, as a bulleted list:

1. The `source` string split on `;`, each ref trimmed, one `<li>` each.
   Commas stay inside items (e.g. `Greek Mythology (Euripides, Argonautica)`).
2. URLs inside any item auto-linked via `https?://` regex, target `_blank`,
   `rel="noopener noreferrer"`.
3. A badge row beneath the list using existing classes: `.source-type-badge
   --<source_type>` and `.source-badge--<source_quality>`.

## Hide Rules

The section stays `.is-hidden` and refs are skipped when:

- `source` is missing/empty/not a string.
- `source` equals `None — no independent source located`.

## i18n

New `detail.sources` key in all 4 `DICT` lang blocks of `js/i18n.js`:

- en: `Sources`
- es: `Fuentes`
- sv: `Källförteckning`
- no: `Kilder`

## No Regressions

Existing hero badges (creatures) and sidebar attribution cards (stories/items)
stay untouched; the new section only adds the source list.

## Tests

Add a unit test for `renderSources` covering:

- split on `;` with trimming
- URL auto-link
- "None" entry → section hidden / refs skipped