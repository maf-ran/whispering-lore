# Project Todos

## Completed
- [x] UI/UX Improvements (Jun 13)
- [x] Tier 1: Foundation (AI-template replacements, bidirectional index, etc.)
- [x] Tier 2: Transformation (Auto-linked related creatures, citation export, etc.)
- [x] Tier 3: Distinction (Region-themed SVG glyphs, DOI/Zenodo workflow, etc.)
- [x] Tier 4: Polish (JS modularization, dynamic SW cache, etc.)
- [x] Comprehensive cross-reference audit & fixes (Phase 7)
- [x] Data quality overhaul (Deduplication, slug conversion, etc.)
- [x] Quiz pool expansion (1071 questions)
- [x] Mobile navigation redesign

## Pending
- [x] T2.1: Manual Source Quality Verification (Heuristic batch + spot-check completed. 589 flags corrected. ~700 entries processed.)
- [x] T2.2: Stub enrichment - all 245 "Not documented" entries filled with real folklore research (93 full research + 121 name-classified + 11 web-researched: Arwe, Chuhayster, Heitsi-eibib, Sinti Lapitta, Jacky My Lantern, Gewi, Cogaz, etc.)
- [x] Final end-to-end audit of all 4 tiers for 10/10 compliance (Jul 9)
- [x] Deep cross-reference audit: 24 checks → 23 pass, 1 informational (Jul 9)
  - Round 1 (22 pass): 2 duplicate slugs, 66 missing bidirectional links, 1151 invalid source_quality, 37 empty cultural_significance, 1 invalid country + Europe added to geo-countries
  - Round 2 (23 pass): 45 cross-dataset slug collisions (story slugs → `-story`), 5 invalid story source_types (`syncretic/archaeological`→`literary`), 244 source_type alignments
  - Remaining: 91 mixed-traditions (story features both oral + literary creatures) — by-design

## Remaining (for true 10/10)
- [ ] T3.2: Publish dataset to Zenodo — needs ZENODO_TOKEN GitHub secret + tag push
