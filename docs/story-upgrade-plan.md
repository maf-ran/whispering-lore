# Story Source Quality Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all 1,697 stories below Stage 3+ to have academic source references, achieving 100% coverage across the dataset.

**Architecture:** Two-phase approach: (1) Classify 570 "unknown" stories, then (2) upgrade all non-Stage-3+ stories with real academic sources using batch scripts by region.

**Tech Stack:** Node.js scripts, JSON shard files, Jest for testing

---

## Current State

| Source Quality | Count | % |
|----------------|-------|---|
| fair | 795 | 46.2% |
| unknown | 570 | 33.2% |
| good | 332 | 19.3% |
| expert | 22 | 1.3% |
| **Total** | **1,719** | **100%** |

**Below Stage 3+:** 1,697 stories (fair + unknown + good)
**Target:** 0 stories below Stage 3+

---

## Phase 1: Classify Unknown Stories

### Task 1: Create Classification Script

**Files:**
- Create: `/tmp/classify-stories.js`

**Purpose:** Analyze 570 "unknown" stories and set `source_quality` to "fair" (oral traditions) or "good" (literary works with known authors/sources).

- [ ] **Step 1: Write classification script**

The script should:
1. Read all story shards from `data/sharded/stories/by-slug/{a-z}.json`
2. For each story with `source_quality === "unknown"`:
   - If `source_type === "literary"` → set `source_quality` to "good"
   - If `source_type === "oral_tradition"` → set `source_quality` to "fair"
   - If no `source_type` → set `source_quality` to "fair" (conservative default)
3. Write updated shards back to disk
4. Log count of changes

- [ ] **Step 2: Run classification**

Run: `node /tmp/classify-stories.js`
Expected: ~570 stories reclassified

- [ ] **Step 3: Verify stats**

Run: `node /tmp/calc-combined2.js`
Expected: 0 "unknown" stories remaining

- [ ] **Step 4: Commit**

```bash
git add data/sharded/stories/by-slug/*.json
git commit -m "feat(data): classify 570 unknown stories by source type"
```

---

## Phase 2: Upgrade Stories by Region

### Overview

Stories are grouped by region for batch processing. Each batch upgrades ~50 stories from fair/good to researched, adding real academic source references.

**Regional Distribution (1,697 stories):**
- North American: 429
- African: 149
- Scandinavian: 97
- Pacific: 81
- Central Asian: 79
- Nordic: 66
- South Asian: 62
- Southeast Asian: 60
- Danish: 57
- Norse: 52
- Other regions: ~565

### Task 2: Generate Story Batch Files

**Files:**
- Create: `/tmp/gen-story-batches.js`

**Purpose:** Create batch slug files for story upgrades, grouped by region.

- [ ] **Step 1: Write batch generator script**

The script should:
1. Read all story shards from `data/sharded/stories/by-slug/{a-z}.json`
2. Filter stories where `source_quality` is not Stage 3+ (fair, good, or unknown)
3. Group by region
4. Write batch files in groups of 50: `/tmp/story-batch{N}-slugs.json`
5. Log batch counts

- [ ] **Step 2: Run batch generator**

Run: `node /tmp/gen-story-batches.js`
Expected: ~34 batch files created

- [ ] **Step 3: Verify batch files exist**

Run: `ls /tmp/story-batch*-slugs.json | wc -l`
Expected: ~34 files

---

### Task 3: Upgrade Story Batches (Parallel Execution)

**Files:**
- Create: `/tmp/story-batch{N}.js` (one per batch)

**Purpose:** Upgrade 50 stories per batch with academic source references.

**Execution Strategy:** Run 4 batches in parallel using subagents.

- [ ] **Step 1: Write batch upgrade script template**

Each batch script should:
1. Read `/tmp/story-batch{N}-slugs.json`
2. Read story shards from `data/sharded/stories/by-slug/{a-z}.json`
3. For each story:
   - Upgrade `source_quality` from fair/good to "researched"
   - Add `source_references` with real academic sources (folklore collections, ethnographies, university press publications)
4. Write updated shards back to disk
5. Log each upgrade

- [ ] **Step 2: Dispatch batches 34-37 (North American stories)**

Run in parallel:
- Batch 34: North American stories (50)
- Batch 35: North American stories (50)
- Batch 36: North American stories (50)
- Batch 37: North American stories (50)

- [ ] **Step 3: Commit and verify**

```bash
git add data/sharded/stories/by-slug/*.json
git commit -m "feat(data): story batches 34-37 — 200 stories upgraded"
```

- [ ] **Step 4: Run tests**

Run: `npx jest --silent`
Expected: 106/106 pass

- [ ] **Step 5: Repeat for remaining batches (38-67)**

Continue dispatching 4 batches in parallel until all 1,697 stories are upgraded.

---

## Phase 3: Finalize

### Task 4: Update Methodology

**Files:**
- Modify: `methodology.html`

**Purpose:** Update the methodology page to reflect 100% coverage.

- [ ] **Step 1: Calculate final stats**

Run: `node /tmp/calc-combined2.js`
Expected: 100% combined Stage 3+

- [ ] **Step 2: Update methodology.html**

Update the statistics section to show:
- 5,387/5,387 entries at Stage 3+
- 100% combined coverage
- Breakdown: expert, verified, researched, well-documented

- [ ] **Step 3: Commit**

```bash
git add methodology.html
git commit -m "docs: methodology — 100% combined Stage 3+"
```

---

### Task 5: Update Documentation

**Files:**
- Modify: `todos.md`
- Modify: Memory blocks

**Purpose:** Mark story upgrades as complete.

- [ ] **Step 1: Update todos.md**

Add completion entry for story source quality upgrades.

- [ ] **Step 2: Update project memory**

Record completion of all source quality upgrades.

- [ ] **Step 3: Commit and push**

```bash
git add todos.md
git commit -m "docs: todos — all source quality upgrades complete"
git push
```

---

## Success Criteria

- [ ] All 1,719 stories at Stage 3+ (expert/verified/researched/well-documented)
- [ ] 0 stories with source_quality "unknown"
- [ ] 0 stories with source_quality "fair" or "good"
- [ ] 100% combined Stage 3+ coverage (5,387/5,387)
- [ ] All 106 Jest tests pass
- [ ] Methodology.html updated to 100%
- [ ] All commits pushed to GitHub
