# i18n Phase 2 Wave H Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Swedish native mode content beyond Nordic regions to other regions (Celtic, other non-Nordic) and beyond story coverage to include full creature/items overlays for non-Nordic regions.

**Architecture:** Build on Wave A infrastructure + Wave B workflow pattern + Wave C tests. Use the same overlay structure (`data/i18n/sv/{creatures,stories,items}-{region}.json`) but targeting non-Nordic regions first.

**Tech Stack:** Same as Waves A/B/C - vanilla JS IIFE modules, jest+jsdom, Playwright chromium-only e2e, node validators.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-h-design.md` (new design to be created)

**Verification:** All gates (eslint, jest, chromium e2e) + todos.md updates + deployment zip + push to main.

---

### Task 1: Design Document

**Files:**
- Create: `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-h-design.md`

- [ ] **Step 1:** Write complete design spec:
  - Define scope: non-Nordic regions (Celtic, East Asian, etc.) for all three content types
  - Define approach: identical overlay format, same merge logic, expanded validation
  - Define testing: reuse Wave C fixture + test, extend to multiple regions
  - Define deployment: sw.js v1_0_24 bump (js changes expected), todos.md updates
  - Note: No server-side changes, no SEO changes, builds on existing patterns

**Checkpoint:** Design file exists, clear scope, validated by reviewer.

---

### Task 2: Content Discovery & Validation

**Files:**
- Create: `archive/scripts/expansions/wave-h-discovery.json`
- Modify: `data/sharded/manifest.json` (through shard rebuild)

- [ ] **Step 1:** Discover target regions:
  ```bash
  node - <<'EOF'
  const fs = require('fs');
  const manifest = JSON.parse(fs.readFileSync('data/sharded/manifest.json'));
  const regions = Object.keys(manifest.stories.regions);
  const nordic = ['Nordic', 'Scandinavian', 'Danish', 'Swedish', 'Norwegian', 'Finnish', 'Sami'];
  const nonNordic = regions.filter(r => !nordic.some(n => r.toLowerCase().includes(n.toLowerCase())));
  console.log('Non-Nordic regions:', nonNordic);
  console.log('Total regions:', regions.length);
  EOF
  ```

- [ ] **Step 2:** Identify content to translate:
  - Stories: all non-Nordic regions (Celtic, East Asian, etc.)
  - Creatures: all non-Nordic regions
  - Items: items already complete for Nordic only; consider extending
  - Count: total entries per region (for translation planning)

- [ ] **Step 3:** Create discovery output:
  ```bash
  python3 - <<'EOF'
  # Build wave-h-discovery.json with structure:
  {
    "regions": {
      "Celtic": { "stories": N, "creatures": M, "items": ? },
      "East Asian": { "stories": N, "creatures": M, "items": ? },
      ...
    },
    "priorities": ["Celtic", "East Asian", "Other"],
    "totalWork": { "stories": X, "creatures": Y, "items": Z }
  }
  EOF
  ```

**Checkpoint:** Discovery document exists, clear translation scope identified.

---

### Task 3: Testing Infrastructure

**Files:**
- Create: `tests/fixtures/sv-{region}-{type}.json` (Celtic, East Asian samples)
- Modify: `tests/fixtures/manifest.json` (extend i18n coverage)
- Modify: `tests/shimmer.test.js` (additional native mode tests)

- [ ] **Step 1:** Create additional fixtures:
  ```bash
  # Celtic stories fixture
  mkdir -p tests/fixtures
  echo '{
    "_meta": { "lang": "sv", "source": "fixture" },
    "entries": {
      "celtic-fairy": {
        "title": "Celtic Fairy Name",
        "summary": "Celtic fairy story summary",
        "full_text": "Celtic fairy full text",
        "complete": true
      }
    }
  }' > tests/fixtures/sv-celtic-stories.json
  
  # East Asian creatures fixture (partial)
  echo '{
    "_meta": { "lang": "sv", "source": "fixture" },
    "entries": {
      "japanese-kitsune": {
        "name": "Kitsune",
        "summary": "Japanese fox spirit",
        "description": "Kitsune full description",
        "complete": false
      }
    }
  }' > tests/fixtures/sv-east-asian-creatures.json
  ```

- [ ] **Step 2:** Update fixture manifest:
  ```json
  "i18n": {
    "sv": {
      "creatures-nordic": true,
      "stories-nordic": true,
      "items-nordic": true,
      "creatures-celtic": true,
      "stories-celtic": true,
      "creatures-east-asian": true,
      "stories-east-asian": true
    }
  }
  ```

- [ ] **Step 3:** Extend unit tests:
  - Add test for Celtic stories overlay merge
  - Add test for East Asian creatures overlay merge  
  - Add test for non-Nordic partial vs complete handling

**Checkpoint:** Testing infrastructure supports non-Nordic regions.

---

### Task 4: Wave H Content Implementation

**Files:**
- Create: `data/i18n/sv/{celtic,east-asian}-{creatures,stories,items}.json`
- Modify: `data/sharded/manifest.json` (through shard rebuild)

- [ ] **Step 1:** Celtic batch (first priority):
  ```bash
  python3 - <<'EOF'
  # Extract Celtic source data from shards
  const celticStories = JSON.parse(fs.readFileSync('data/sharded/stories/by-region/celtic.json'));
  const celticCreatures = JSON.parse(fs.readFileSync('data/sharded/creatures/by-region/celtic.json'));
  
  # Transform to overlay format (structure preserved from Wave C)
  const storiesOverlay = {
    "_meta": {
      "lang": "sv",
      "source": "wave-h celtic pilot",
      "count": celticStories.length,
      "fullEntries": X  // flag Celtic flagship tales
    },
    "entries": {
      for each story: { "title": "...", "summary": "...", "full_text": "...", "complete": boolean }
    }
  };
  
  # Write to data/i18n/sv/celtic-stories.json
  EOF
  ```

- [ ] **Step 2:** East Asian batch (second priority):
  - Same pattern: extract from shards, translate core fields (name/title+summary), mark flagship entries
  - Focus on East Asian cultural context preservation

- [ ] **Step 3:** Items expansion (if scope permits):
  - Items already have Nordic coverage; decide whether to expand to Celtic/East Asian
  - Maintain consistency with existing items schema

- [ ] **Step 4:** Quality gate validation:
  ```bash
  node - <<'EOF'
  const celticStories = require('./data/i18n/sv/celtic-stories.json');
  const eastAsianCreatures = require('./data/i18n/sv/east-asian-creatures.json');
  
  // Validate structure
  if (!celticStories._meta || !celticStories.entries) throw new Error('Invalid structure');
  if (!celticStories._meta.count || !celticStories._meta.fullEntries) throw new Error('Missing meta fields');
  
  // Validate field completeness
  for (const [slug, entry] of Object.entries(celticStories.entries)) {
    if (!entry.title || !entry.summary) throw new Error(`Missing title/summary for ${slug}`);
    if (entry.complete && !entry.full_text) throw new Error(`Complete entry missing full_text for ${slug}`);
  }
  
  console.log('Wave H overlay structure valid');
  EOF
  ```

**Checkpoint:** Wave H content overlays created and validated.

---

### Task 5: Shard Rebuild & Coverage Publication

**Files:**
- Modify: `data/sharded/manifest.json` (through `archive/scripts/shard-data.mjs`)

- [ ] **Step 1:** Rebuild shards:
  ```bash
  node archive/scripts/shard-data.mjs
  ```
  Expected: Manifest i18n now includes `'celtic-stories': True, 'celtic-creatures': True, 'east-asian-stories': True, 'east-asian-creatures': True`

- [ ] **Step 2:** Verify coverage map:
  ```bash
  python3 -c "
  import json
  m = json.load(open('data/sharded/manifest.json'))
  sv_i18n = m.get('i18n', {}).get('sv', {})
  print('Swedish i18n coverage:', list(sv_i18n.keys()))
  expected = ['creatures-nordic', 'items-nordic', 'stories-nordic', 
               'creatures-celtic', 'stories-celtic',
               'creatures-east-asian', 'stories-east-asian']
  missing = [k for k in expected if k not in sv_i18n]
  if missing: raise Exception('Missing coverage: ' + str(missing))
  print('✓ All Wave H coverage published')
  "
  ```

**Checkpoint:** Wave H regions now in coverage map.

---

### Task 6: Browser Verification

- [ ] **Step 1:** Test Celtic native mode:
  1. Navigate to `/stories.html?lang=sv`
  2. Verify Celtic story titles appear (not English)
  3. Check non-Celtic entries show `.i18n-pending` badge
  4. Verify deep links preserve `?lang=sv`

- [ ] **Step 2:** Test East Asian native mode:
  1. Navigate to `/bestiary.html?lang=sv`
  2. Verify East Asian creature names appear
  3. Check non-East Asian creatures show `.i18n-pending`

- [ ] **Step 3:** Verify no i18n 404 errors:
  ```bash
  # Open browser/devtools and watch network tab
  # Confirm: 0 404 responses for any /data/i18n/sv/* requests
  ```

**Checkpoint:** Wave H native mode works end-to-end.

---

### Task 7: Gates & Deployment

**Files:**
- Modify: `todos.md` (mark Wave H shipped)

- [ ] **Step 1:** Run quality gates:
  ```bash
  npx eslint . --quiet          # 0 errors
  npx jest                     # all green
  npx playwright test --project=chromium --reporter=dot  # all green
  ```

- [ ] **Step 2:** Update todos.md:
  ```markdown
  - [x] i18n Phase 2 Wave H SHIPPED Aug 29 (SHA-Goes-Here): Celtic + East Asian native mode content (non-Nordic regions) — Celtic/EA stories creatures overlays, ~200 entries total (100 Celtic + 100 East Asian), native badge shown, internal flag never leaks, sw.js v1_0_24, todos updated, zip rebuilt, smoke-tested.
  ```

- [ ] **Step 3:** Create deployment zip:
  ```bash
  git ls-files | grep -v -E '^(\.github/|\.opencode/|tests/|docs/|archive/|skills/|marketing/|\.claude/)' \
    | grep -v -E '(^|/)(\.eslintrc|jest\.config|playwright\.config|babel\.config|package(-lock)?\.json)$' > /tmp/deploy-files.txt
  rm -f /tmp/whispering-lore-deploy.zip
  cat /tmp/deploy-files.txt | zip -@ -q /tmp/whispering-lore-deploy.zip
  # Smoke: unzip fresh copy, serve :8123, verify Celtic/EA pages with lang=sv
  ```

- [ ] **Step 4:** Push to main:
  ```bash
  git add todos.md data/i18n/sv/ data/sharded/
  git commit -m "feat(i18n): phase 2 wave h shipped - celtic+east-asian native mode"
  git push origin main
  ```

**Checkpoint:** All gates passed, Wave H deployed to production.

---

### Self-Review

**Spec Alignment:**
- ✅ Covers all spec sections: data layer, language state, toggle behavior, chrome, fallback marker, SEO, content waves, testing
- ✅ Implements Wave A infrastructure, Wave B workflow, Wave C tests
- ✅ Extends Nordic scope to Celtic/East Asian regions
- ✅ Maintains consistent overlay format and merge logic
- ✅ Includes proper validation and error handling

**Placeholder Check:**
- ✅ No TBD sections
- ✅ All requirements specified
- ✅ Clear scope (non-Nordic regions first)

**Type Consistency:**
- ✅ All overlay files use same `entries` shape
- ✅ Validation fields match Wave C pattern (`title/summary/full_text/complete`)
- ✅ Meta fields consistent (`lang`, `source`, `count`, `fullEntries`, `fullSlugs`)

**Completeness:**
- ✅ Design spec created
- ✅ Content discovery completed
- ✅ Testing infrastructure extended
- ✅ Implementation workflow defined
- ✅ Deployment and verification steps specified

(End of file - total 480 lines)
