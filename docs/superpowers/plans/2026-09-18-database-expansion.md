# Database Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the folklore database with targeted country gap-filling entries and regenerate all data shards and indices.

**Architecture:** Add curated entries to master datasets, regenerate canonical data shards via `shard-data.mjs`, rebuild search and entity indices using Python scripts, and verify via Jest test suite.

**Tech Stack:** Node.js, Python 3, Jest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-18-database-expansion-design.md`

## Global Constraints
- Commit messages must follow Conventional Commits (lowercase subjects: feat:, fix:, docs:, chore:).
- All indexers must be run after dataset updates (`shard-data.mjs` and Python index builders).
- Tests must pass cleanly (`npm test`).

---

### Task 1: Add Curated Gap-Filling Folklore Entries

**Files:**
- Modify: Dataset source files / shard builders (e.g. `archive/scripts/shard-data.mjs` or relevant data sources)
- Test: `tests/creatures-index.test.js`

**Interfaces:**
- Consumes: Existing master data structure
- Produces: Expanded folklore dataset with coverage for previously sparse countries.

- [ ] **Step 1: Run existing test suite to ensure clean baseline**

Run: `node node_modules/.bin/jest --silent`
Expected: PASS

- [ ] **Step 2: Add curated folklore entries for target gap countries**

Update data records with new entries.

- [ ] **Step 3: Regenerate data shards and indices**

Run: `node archive/scripts/shard-data.mjs`
Run: `python3 archive/scripts/build-creatures-index.py` (if applicable)

- [ ] **Step 4: Run tests and verify success**

Run: `node node_modules/.bin/jest --silent`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add .
git commit -m "feat: expand folklore database with gap-filling entries"
```
