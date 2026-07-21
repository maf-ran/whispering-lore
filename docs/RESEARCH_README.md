# Folklore Research Engine

## Table of Contents (Research Plans & Specs)

- **Plans** (high-level step-by-step workflows)
  - `docs/superpowers/plans/2026-05-29-refine-creature-database.md`
  - `docs/superpowers/plans/2026-05-27-quiz-system-plan.md`
  - `docs/superpowers/plans/2026-05-26-sami-expansion.md`
  - `docs/superpowers/plans/2026-05-26-greenland-expansion.md`
  - `docs/superpowers/plans/2026-05-26-icelandic-expansion.md`
  - `docs/superpowers/plans/2026-05-26-danish-expansion.md`
  - `docs/superpowers/plans/2026-05-26-finnish-expansion.md`
  - `docs/superpowers/plans/2026-05-20-bestiary-faceted-archive.md`
  - `docs/superpowers/plans/2026-05-20-bestiary-2-0.md`
  - `docs/superpowers/plans/2026-05-20-indexeddb-client-db.md`
- **Specs** (design documentation for each plan)
  - `docs/superpowers/specs/2026-05-27-quiz-system-design.md`
  - `docs/superpowers/specs/2026-05-26-usa-native-plains-expansion-design.md`
  - `docs/superpowers/specs/2026-05-26-usa-native-southwest-expansion-design.md`
  - `docs/superpowers/specs/2026-05-26-sami-expansion-design.md`
  - `docs/superpowers/specs/2026-05-26-greenland-expansion-design.md`
  - `docs/superpowers/specs/2026-05-26-nordic-expansion-design.md`
  - `docs/superpowers/specs/2026-05-20-bestiary-faceted-archive-design.md`
  - `docs/superpowers/specs/2026-05-20-bestiary-2-0-immersive-archive.md`
  - `docs/superpowers/specs/2026-05-20-indexeddb-client-db-design.md`
  - `docs/superpowers/specs/2026-05-24-daily-feature-design.md`
  - `docs/superpowers/specs/2026-05-24-living-lore-redesign.md`

---


This document describes the research methodology and data pipeline powering the Global Folklore Database.
Research is conducted via AI-assisted multi-pass web searches with academic source prioritisation.

---

# Project Structure

```
Whispering Lore/
├─ data/datasets/creatures.json      — 3,668 creature entries
├─ data/datasets/stories.json        — 1,719 story entries
├─ data/sharded/                     — Shimmer manifest + region-based shards
├─ data/geo-countries.json           — 243 country geodata
├─ docs/                             — Research documentation
│   ├─ RESEARCH_README.md            — This file
│   ├─ RESEARCH_EXPERTS.md           — Folklore scholars reference
│   ├─ RESEARCH_MISSING_COUNTRIES.md — Missing country research
│   ├─ creature-schema.md            — Creature data model
│   ├─ story-schema.md               — Story data model
│   ├─ DATABASE-GUIDE.md             — Full database documentation
│   ├─ COVERAGE.md                   — Coverage statistics
│   ├─ PROJECT_SUMMARY.md            — Project overview
│   └─ data-quality/                 — Quality audit reports
├─ tests/                            — 141 Jest tests + 80 Playwright cross-device tests
└─ archive/scripts/                  — Node scripts for data prep and validation
```

---

# Research Pipeline

1. **Identify** — Find creature/story name in Tier 1+ source
2. **Corroborate** — Cross-reference across at least 2 sources
3. **Contextualise** — Determine culture of origin, region, era
4. **Classify** — Assign source_type and source_quality fields
5. **Write** — Follow style guide (see DATABASE-GUIDE.md Section 4)
6. **Cite** — Fill source field with specific reference
7. **Cross-link** — Connect to related creatures and stories

---

# Source Quality Tiers

| Tier | Label | Description |
|------|-------|-------------|
| Stage 3+ | expert | Academic ethnographies, peer-reviewed journals |
| Stage 3+ | verified | University press, documented oral traditions |
| Stage 3+ | researched | Web-sourced with academic references |
| Stage 3+ | well-documented | Museum collections, official archives |
| Below | fair | Oral tradition, no known academic publication |
| Below | good | Literary works, general references |

**Current coverage:** 99.0% Stage 3+ (5,331/5,387 entries)

---

# Output

- Structured datasets (`data/datasets/`, `data/sharded/`)
- Encyclopedia entries (inline in JSON)
- Updated source archive (`docs/`)
- Coverage reports (`docs/COVERAGE.md`)
