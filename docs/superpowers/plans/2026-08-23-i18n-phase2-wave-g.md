# i18n Phase 2 Wave G Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, per session precedent).

**Goal:** Final nordic batch — positions 201–314 (114 entries) → 314/314 complete. Two sub-batch commits.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-g-design.md`

---

### Task 1: Sub-batch G1 (201–250)

1. Extract `d[200:250]` → `/tmp/waveg1-source.json`; list slugs.
2. Translate → `/tmp/wg1-*.json` chunks of 5 entries, ALL fields (name+summary+description) present in every entry.
3. Merge into overlay (no-overlap assert), flag complete, update `_meta`, cyrillic scan.
4. Gate: expect 250 entries / 200 complete; all slugs valid.
5. Browser spot-check one new entry; commit `feat(i18n): swedish nordic creatures batch 5a (entries 201-250)`.

### Task 2: Sub-batch G2 (251–314)

1. Extract `d[250:314]` → `/tmp/waveg2-source.json`.
2. Translate → `/tmp/wg2-*.json` chunks of 5 entries, ALL fields present.
3. Merge, flag complete, `_meta`, cyrillic scan.
4. Gate: expect exactly 314 entries / 314 complete (= full shard coverage).
5. Browser spot-check; commit `feat(i18n): swedish nordic creatures final batch (entries 251-314)`.

### Task 3: Gates + ship

1. eslint --quiet (0); jest green; full chromium green (world.html iPad flake passes isolated = acceptable).
2. todos.md: Wave G shipped line replacing backlog bullet.
3. Zip rebuild; smoke :8123 incl one late-entry check; commit docs; push main.

---

## Self-review

Procedure identical to Waves E/F with two safety commits. Known traps carried over: write tool ~9k cap (chunks of ≤5 entries), missing name/summary fields (validation gate catches), wrong-slug clobbering (merge asserts no overlap), Cyrillic homoglyphs (scan after merge).
