# Comprehensive Database Expansion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Systematically expand the Whispering Lore database with highly detailed, multi-paragraph folklore entries (1,000–2,500+ characters per entry) for under-represented nations and indigenous cultural traditions.

**Architecture:** Research authentic regional entities across global folklore gap regions, author rich JSON records following strict schema standards, append to `data/datasets/creatures.json`, regenerate sharded data via `shard-data.mjs`, and verify index consistency.

**Tech Stack:** Node.js, Python 3, Jest.

**Spec:** `docs/superpowers/specs/2026-09-18-database-expansion-design.md`

## Global Constraints
- Commit messages must follow Conventional Commits (e.g. `feat: add ...`).
- Every new creature entry must contain exhaustive descriptive fields (`description`, `appearance`, `behavior`, `cultural_significance`) exceeding 1,000 characters total.
- All shard generators and indexers must run successfully after dataset modification.

---

### Task 1: Research and Author Expanded Entries for Caribbean & Central Asia
**Files:**
- Modify: `data/datasets/creatures.json`
- Test: `tests/creatures-index.test.js`

- [ ] **Step 1: Draft detailed folklore entries for Caribbean (e.g. Soucouyant / Loogaroo) and Central Asia (e.g. Albasty / Div)**
- [ ] **Step 2: Append entries with rich multi-paragraph descriptions (>1,000 chars)**
- [ ] **Step 3: Run shard generation script (`node archive/scripts/shard-data.mjs`)**
- [ ] **Step 4: Verify shard output and manifest integrity**
- [ ] **Step 5: Commit changes**
