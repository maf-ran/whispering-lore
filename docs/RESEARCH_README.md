# 🧠 Folklore Research Engine (OpenCode)

## 📚 Table of Contents (Research Plans & Specs)

- **Plans** (high‑level step‑by‑step workflows)
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


This document describes the complete research engine powering the Global Folklore Database.  
It includes skills, hooks, data architecture, pipelines, and automation.

---

# 📁 Project Structure (Research Engine)

project-root/
├── skills/
│   ├── research-method/
│   ├── folklore-entry/
│   ├── source-criticism/
│   └── dataset-builder/
│
├── data/
│   ├── sources.md
│   ├── research-history.md
│   ├── motifs-index.md
│   ├── aliases-dictionary.md
│   ├── region-index.md
│   └── datasets/
│
├── hooks/
│   ├── update-sources-archive.md
│   ├── append-research-history.md
│   ├── validate-dataset.md
│   └── load-source-archive.md
│
├── output/
│   ├── entries/
│   ├── logs/
│   └── debug/
│
└── docs/
└── RESEARCH_README.md

---

# 🧩 Skills Overview

### **research-method**
Multi-pass research engine:
- regional → national → international search
- motif search
- alias search
- archive search
- academic prioritization
- duplicate detection

### **folklore-entry**
Generates encyclopedia-style entries.

### **source-criticism**
Evaluates credibility, bias, and source quality.

### **dataset-builder**
Creates structured JSON datasets.

---

# 🔧 Hooks Overview

### `update-sources-archive`
Adds new sources to `sources.md`.

### `append-research-history`
Logs research sessions.

### `validate-dataset`
Validates JSON datasets.

### `load-source-archive`
Loads known sources at session start.

---

# 🔥 Pipeline C (Full Research Pipeline)

1. Initialization  
2. Known source extraction  
3. Multi-pass research  
4. New source processing  
5. Data extraction  
6. Dataset creation  
7. Article generation  
8. Logging  
9. Follow-up planning  

---

# 📦 Output

- Structured datasets  
- Encyclopedia entries  
- Updated source archive  
- Updated research history  
