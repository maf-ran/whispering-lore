# Folklore Coverage Report

**Generated:** 2026-06-29  
**Total creatures:** 3668  
**Total stories:** 1719  
**Countries represented:** 210+  
**Regions represented:** 32

## Quality Dashboard

| Metric | Value |
|---|---|
| Creature count | 3668 |
| Story count | 1719 |
| Descriptions ≥30 chars | 100% |
| Stories with creature refs | 1272 / 1719 (74%) |
| Tests | 106 passing (Jest + Playwright) |

## Top Creature Types

| Type | Count |
|---|---|
| spirit | 640 |
| deity | 310 |
| Unknown | 245 |
| water-spirit | 173 |
| ghost | 164 |
| nature-spirit | 164 |
| trickster | 142 |
| guardian | 139 |
| giant | 117 |
| demon | 100 |
| monster | 97 |
| ancestor-spirit | 95 |
| animal-spirit | 80 |
| serpent | 80 |
| shapeshifter | 73 |

## Regions

| Region | Count |
|---|---|
| North America | 849 |
| Nordic | 306 |
| Unknown | 247 |
| West Africa | 222 |
| Southeast Asia | 209 |
| South America | 197 |
| Pacific | 169 |
| Central Asia | 155 |
| Mesoamerica | 144 |
| East Africa | 141 |
| South Asia | 115 |
| Slavic | 111 |
| Middle East and North Africa | 96 |
| Southern Africa | 95 |
| Caribbean | 93 |
| East Asia and Pacific | 90 |
| Mediterranean | 86 |
| Germanic | 52 |
| North Africa | 52 |
| Central Africa | 46 |
| Celtic | 35 |
| Sami | 29 |
| Balkan | 25 |
| Africa | 23 |
| Baltic | 20 |
| Caucasus | 18 |
| Northern Europe | 13 |
| Norse | 13 |
| World | 9 |
| Europe | 4 |
| Arctic | 2 |
| West Asia | 2 |

## Features Implemented

- **Phase 3 — Shimmer Shard System**: Inline data scripts removed (~20MB). Manifest-driven lazy loading from `data/sharded/`. All viewers use `shimmer.loadAllShards()`.
- **Sort By**: A-Z and Newest sort on both bestiary and stories pages.
- **TODAY'S FEATURE pill**: Works reliably with shimmer + XHR fallback chain.
- **Data Quality Overhaul (Jun 29)**: Deduplicated 46 groups (50 entries), removed 6 AI entries, resolved 300+ stale refs, expanded 459 creature summaries, filled 9 story placeholders, fixed 176 broken cross-references, fixed 4603 broken story refs.
- **Story Reading UX**: Typography, progress bar, metadata, reading time estimates.
- **Cross-References**: Related creatures and story references on detail pages.
- **XHR Fallbacks**: All viewers have XHR fallback when shimmer is unavailable.
- **Skeleton Loaders**: 24 shimmer-animated skeleton cards during data loading.
- **Tactile Feedback**: `:active` transforms on interactive elements.
- **Mobile Responsiveness**: Breakpoints at 900px, 768px, 700px, 600px, 480px.
- **Light Mode Toggle**: localStorage-persisted theme toggle on all pages.
