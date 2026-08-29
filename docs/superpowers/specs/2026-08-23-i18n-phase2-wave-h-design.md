# i18n Phase 2 – Wave H Design Spec

**Overview**

This document defines the design for extending the internationalisation (i18n) overlay system to non‑Nordic regions (e.g., Celtic, East Asian, African, etc.) across all three content types: creatures, stories, and items. The goal is to bring the same level of coverage, validation, and deployment workflow as achieved for the Nordic region in previous waves.

---

## Scope

- **Regions**: Celtic, East Asian (Chinese, Japanese, Korean), African, South‑American, and any additional locales required for future expansion.
- **Content Types**: `creatures`, `stories`, `items` (all three must have full overlay support per region).
- **Overlay Format**: Identical JSON schema to existing Nordic overlays (`{ name, summary, description, ... }`). No new fields.
- **No Server‑Side Changes**: All processing remains client‑side; only static JSON assets and Service Worker version bump.
- **No SEO Changes**: Search‑engine metadata stays unchanged.
- **No New Dependencies**: Reuse existing build tooling, localisation utilities, and validation scripts.

---

## Approach

1. **Overlay Generation**
   - Re‑use the current `archive/scripts/shard-data.mjs` pipeline to generate region‑specific overlays.
   - Extend the `manifest.i18n` generation to include new region keys.
   - Ensure each overlay file follows the same naming convention, e.g., `data/i18n/<region>/creatures-<region>.json`.

2. **Merge Logic**
   - Leverage the existing `Shimmer` overlay merge logic; it already merges overlays based on `type‑region` keys.
   - Add region list to the overlay discovery loop; no code change required beyond manifest expansion.

3. **Validation**
   - Extend the current validation script (`scripts/validate-i18n.js`) to iterate over the new region list.
   - Enforce content quality thresholds identical to Nordic (description length >= 0.6×EN, no missing fields, no duplicate slugs).

4. **Testing**
   - Re‑use the Wave C fixture test (`tests/i18n/wave-c.test.js`).
   - Parameterise the test to run for each new region using a data‑driven approach.
   - Add a new fixture file per region under `tests/fixtures/i18n/<region>/`.

5. **Deployment
   - Bump Service Worker version to `v1_0_24`.
   - Update the `sw.js` manifest generation script to include the new region assets.
   - Ensure the CI pipeline (`.github/workflows/ci.yml`) picks up the version bump automatically.
   - Update `todos.md` with the new tasks.

---

## Testing Plan

- **Unit Tests**: Validate each generated JSON file against the schema.
- **Integration Tests**: Load each region overlay in a headless Chrome instance; verify that the UI displays the correct localized content.
- **E2E Tests**: Run the existing Playwright suite, adding a step to switch language via the language toggle and assert that a random entry from each new region appears correctly.

---

## Deployment Notes

- After merging, run `npm run build` which will regenerate the Service Worker with the new version string.
- Deploy the built `dist/` folder to the static host.
- No runtime server changes; the site remains a purely static JAMstack deployment.
- Remember to update `todos.md` with entries for the new region generation and test additions.

---

**Checklist**
- [ ] Add region list to manifest generation.
- [ ] Create overlay JSON files for each new region.
- [ ] Extend validation script.
- [ ] Add parameterised tests and fixtures.
- [ ] Bump Service Worker version to `v1_0_24`.
- [ ] Update CI configuration if necessary.
- [ ] Update `todos.md`.
