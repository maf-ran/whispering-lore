# Tier 2: Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the dataset from "broad but shallow" to "credible and interconnected" — verified sources, linked entities, academic citations, complete stories, and richer metadata schema.

**Architecture:** All data tasks operate on `data/datasets/creatures.json`, `data/datasets/stories.json`, and sharded manifests. JS tasks extend existing IIFE/viewer patterns. No framework changes.

**Tech Stack:** Vanilla JS (IIFE), Node.js scripts for data transforms, Jest + Playwright for testing. Bone & Ash design system.

**Long pole:** T2.1 (source quality verification) is a 3-4 month content campaign. All other dev tasks (T2.2–T2.8) can run in parallel with it.

---

## Task Inventory (Tier 2)

| # | Task | Type | Est. | Dependencies | Parallelizable |
|---|------|------|------|-------------|---------------|
| 1 | Source quality verification campaign | Content | 3-4mo | None | Yes — long pole |
| 2 | Auto-link related creatures | Dev | 2-3d | None | Yes |
| 3 | Citation export (BibTeX/MLA/APA) | Dev | 1w | T1.5 (done) | Yes |
| 4 | Complete placeholder stories | Content | 3-5d | None | Yes |
| 5 | Random creature/story buttons | Dev | 1d | None | Yes |
| 6 | My Lore empty state | Dev | 0.5d | None | Yes |
| 7 | Living tradition flag | Dev+Content | 2d | None | Yes |
| 8 | Source-type tags | Dev+Content | 3d | None | Yes |

**Dependency map:**
```
T2.1 (content, long pole) ── parallel ──┬── T2.2 (auto-link)
                                         ├── T2.3 (citation — benefits from T1.5)
                                         ├── T2.4 (stories)
                                         ├── T2.5 (random buttons)
                                         ├── T2.6 (empty state)
                                         ├── T2.7 (living tradition)
                                         └── T2.8 (source-type tags)
```

---

## T2.1: Source Quality Verification Campaign (CONTENT — long pole)

**Files:**
- Create: `docs/data-quality/verification-progress.md` (tracking file)
- Modify: `data/datasets/creatures.json` (source_quality, source fields for each verified entry)
- No code changes needed

**Goal:** Upgrade from ~2.6% verified to 50%+ by systematically reviewing every entry region by region.

- [ ] **Step 1: Create the tracking file**

Create `docs/data-quality/verification-progress.md`:

```markdown
# Source Quality Verification Progress

**Goal:** 50%+ of entries marked `verified` or `literary` with a named source.
**Started:** 2026-07-06
**Current:** ~95 verified (2.6%) out of ~3,668 total

## Region-by-Region Tracker

| Region | Total | Verified | Literary | Unknown | % Done | Reviewer | Notes |
|--------|-------|----------|----------|---------|--------|----------|-------|
| Nordic | 450 | 0 | 0 | 450 | 0% | — | — |
| Celtic | 200 | 0 | 0 | 200 | 0% | — | — |
| European | 400 | 0 | 0 | 400 | 0% | — | — |
| East Asia | 350 | 0 | 0 | 350 | 0% | — | — |
| South Asia | 200 | 0 | 0 | 200 | 0% | — | — |
| Southeast Asia | 250 | 0 | 0 | 250 | 0% | — | — |
| Middle East | 200 | 0 | 0 | 200 | 0% | — | — |
| Pacific | 300 | 0 | 0 | 300 | 0% | — | — |
| Sub-Saharan Africa | 400 | 0 | 0 | 400 | 0% | — | — |
| Northern America | 300 | 0 | 0 | 300 | 0% | — | — |
| Southern America | 250 | 0 | 0 | 250 | 0% | — | — |
| Central America | 200 | 0 | 0 | 200 | 0% | — | — |
| Arctic/Antarctic | 50 | 0 | 0 | 50 | 0% | — | — |
| Unknown | 118 | 0 | 0 | 118 | 0% | — | — |

## Quality Levels

1. **verified** — Cross-checked against ≥2 independent scholarly sources. Source field contains named reference.
2. **literary** — Sourced from a published literary/folkloric work. Single source is acceptable if credible.
3. **unknown** — Not yet checked, or no verifiable source found.

## Process

1. Pick an unstarted region
2. Review each entry's `source` and `source_quality` fields
3. Check source against library catalogs / academic databases
4. Update `source_quality` and `source` field
5. Mark region % complete in tracker
6. Every 500 entries: regenerate shards, commit

## Changelog

| Date | Entries Reviewed | Cumulative | % Complete | Notes |
|------|-----------------|------------|-----------|-------|
```

- [ ] **Step 2: Baseline measurement**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
var verified = c.filter(function(d) { return d.source_quality === 'verified'; }).length;
var literary = c.filter(function(d) { return d.source_quality === 'literary'; }).length;
var unknown = c.filter(function(d) { return d.source_quality === 'unknown' || !d.source_quality; }).length;
console.log('Baseline: verified=' + verified + ' literary=' + literary + ' unknown=' + unknown + ' total=' + c.length);
"
```

- [ ] **Step 3: Per-entry review pattern**

For each entry being reviewed, change the `source_quality` field and update `source`:

```json
{
  "slug": "nuckelavee",
  "source_quality": "verified",
  "source": "Orkney Folklore (Ernest Marwick, The Folklore of Orkney and Shetland, 1975)"
}
```

- [ ] **Step 4: Periodic shard regeneration**

Every 500 entries verified:

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
```

- [ ] **Step 5: Validation script**

```bash
node -e "
var c = require('./data/datasets/creatures.json');
var verified = c.filter(function(d) { return d.source_quality === 'verified'; }).length;
var literary = c.filter(function(d) { return d.source_quality === 'literary'; }).length;
var total = c.length;
var pct = Math.round((verified + literary) / total * 100);
console.log('Verified: ' + verified + ', Literary: ' + literary + ', Total verified/lit: ' + (verified+literary) + '/' + total + ' (' + pct + '%)');
console.log(pct >= 50 ? 'PASS - 50%+ threshold met' : 'PENDING - ' + (50-pct) + '% remaining');
"
```

- [ ] **Step 6: Commit checkpoint**

```bash
git add data/datasets/creatures.json data/sharded/ docs/data-quality/verification-progress.md
git commit -m "content: verify source quality for [region] entries (N entries verified)"
```

---

## T2.2: Auto-link Related Creatures (DEV)

**Files:**
- Create: `scripts/auto-link-related.js`
- Modify: `data/datasets/creatures.json` (populate `related` arrays)

**Goal:** Populate empty `related` arrays for ~90% of creatures using (region, type) clusters ranked by attribute overlap. Top 5 related slugs per entry.

- [ ] **Step 1: Write the auto-link script**

```javascript
#!/usr/bin/env node
// scripts/auto-link-related.js
// Groups creatures by (region, type) clusters, ranks by attribute overlap,
// populates top 5 related slugs per entry.

var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Build lookup by slug
var bySlug = {};
creatures.forEach(function(c) { bySlug[c.slug] = c; });

// Score relatedness between two creatures
function scoreRelatedness(a, b) {
  var score = 0;
  // Same region: +3
  if (a.region && b.region && a.region === b.region) score += 3;
  // Same type: +3
  if (a.type && b.type && a.type === b.type) score += 3;
  // Same country: +2
  if (a.country && b.country && a.country === b.country) score += 2;
  // Same culture: +2
  if (a.culture && b.culture && a.culture === b.culture) score += 2;
  // Same archetype: +2
  if (a.archetype && b.archetype && a.archetype === b.archetype) score += 2;
  // Same element: +1
  if (a.element && b.element && a.element === b.element) score += 1;
  // Same parent_species: +2
  if (a.parent_species && b.parent_species && a.parent_species === b.parent_species) score += 2;
  // Shared behavior tags: +1 per match (max +3)
  if (a.behavior_tags && b.behavior_tags && Array.isArray(a.behavior_tags) && Array.isArray(b.behavior_tags)) {
    var shared = a.behavior_tags.filter(function(t) { return b.behavior_tags.indexOf(t) !== -1; });
    score += Math.min(shared.length, 3);
  }
  // Shared habitat tags: +1 per match (max +3)
  if (a.habitat_tags && b.habitat_tags && Array.isArray(a.habitat_tags) && Array.isArray(b.habitat_tags)) {
    var shared = a.habitat_tags.filter(function(t) { return b.habitat_tags.indexOf(t) !== -1; });
    score += Math.min(shared.length, 3);
  }
  return score;
}

var updatedCount = 0;
var totalRelated = 0;

creatures.forEach(function(c) {
  // Preserve existing related entries
  var existing = (c.related && Array.isArray(c.related)) ? c.related.slice() : [];
  
  // Score all other creatures
  var scored = [];
  creatures.forEach(function(other) {
    if (other.slug === c.slug) return;
    // Skip if already in related
    if (existing.indexOf(other.slug) !== -1) return;
    var score = scoreRelatedness(c, other);
    if (score > 0) {
      scored.push({ slug: other.slug, score: score });
    }
  });
  
  // Sort by score descending, take top 5
  scored.sort(function(a, b) { return b.score - a.score; });
  var top = scored.slice(0, 5).map(function(s) { return s.slug; });
  
  // Merge with existing, deduplicate
  var merged = existing.concat(top);
  var unique = [];
  var seen = {};
  merged.forEach(function(slug) {
    if (!seen[slug]) {
      seen[slug] = true;
      unique.push(slug);
    }
  });
  
  // Cap at 10 max (existing + new)
  c.related = unique.slice(0, 10);
  
  if (existing.length !== c.related.length || existing.some(function(s) { return c.related.indexOf(s) === -1; })) {
    updatedCount++;
    totalRelated += c.related.length;
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
console.log('Updated ' + updatedCount + ' creatures with related arrays');
console.log('Total related refs: ' + totalRelated);

// Verification
var empty = creatures.filter(function(c) { return !c.related || c.related.length === 0; });
console.log('Still empty: ' + empty.length + '/' + creatures.length + ' (' + Math.round(empty.length/creatures.length*100) + '%)');
```

- [ ] **Step 2: Run the script**

```bash
node scripts/auto-link-related.js
```

Expected output: `Updated ~3,300 creatures with related arrays` (most of the ~90% that were empty).

- [ ] **Step 3: Verify no self-references or duplicates**

```bash
node -e "
var c = require('./data/datasets/creatures.json');
var issues = 0;
c.forEach(function(entry) {
  if (!entry.related) return;
  if (entry.related.indexOf(entry.slug) !== -1) {
    console.log('SELF-REF: ' + entry.slug);
    issues++;
  }
  var seen = {};
  entry.related.forEach(function(r) {
    if (seen[r]) { console.log('DUP in ' + entry.slug + ': ' + r); issues++; }
    seen[r] = true;
  });
});
console.log('Issues found: ' + issues);
"
```

Expected: 0 issues.

- [ ] **Step 4: Regenerate shards and run tests**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 5: Commit**

```bash
git add data/datasets/creatures.json data/sharded/ scripts/auto-link-related.js
git commit -m "feat: auto-populate related creature arrays via attribute overlap scoring"
```

---

## T2.3: Citation Export (DEV)

**Files:**
- Create: `js/citations.js` (citation format functions)
- Modify: `js/creatures-viewer.js` (add "Cite this" button + popover in detail footer)
- Modify: `js/stories-viewer.js` (same for story detail)
- Modify: `bestiary.html` (add citation placeholder elements)
- Modify: `stories.html` (same)
- Modify: `css/styles.css` (popover styles)
- Create: `tests/citations.test.js` (Jest unit tests for format correctness)

- [ ] **Step 1: Write citation utility**

Create `js/citations.js`:

```javascript
// js/citations.js
// Citation generation for BibTeX, MLA, and APA formats
;(function () {
  'use strict';

  var citationFormats = {};

  function escapeLatex(str) {
    if (!str) return '';
    return str.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$')
              .replace(/#/g, '\\#').replace(/_/g, '\\_').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  }

  function buildAuthor(entry) {
    // Use "Whispering Lore" as institutional author
    return 'Whispering Lore';
  }

  function buildYear(entry) {
    if (entry.lastUpdated) return entry.lastUpdated.split('-')[0];
    return '2026';
  }

  function buildDate(entry) {
    return entry.lastUpdated || '2026-07-05';
  }

  // BibTeX: @misc{slug, author = {}, title = {}, ...}
  citationFormats.bibtex = function(entry, isStory) {
    var id = entry.slug || entry.id || 'unknown';
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var subtitle = isStory ? 'folktale' : 'mythical creature entry';
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var year = buildYear(entry);
    var author = buildAuthor(entry);
    var date = buildDate(entry);

    return '@misc{' + id + ',\n' +
      '  author = {' + author + '},\n' +
      '  title = {' + escapeLatex(title) + '},\n' +
      '  howpublished = {\\url{' + url + '}},\n' +
      '  year = {' + year + '},\n' +
      '  note = {Accessed: ' + date + '},\n' +
      '  publisher = {Whispering Lore},\n' +
      '  type = {' + subtitle + '}\n' +
      '}';
  };

  // MLA: "Title." Whispering Lore, date, URL.
  citationFormats.mla = function(entry, isStory) {
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var subtitle = isStory ? 'Folktale' : 'Mythical Creature Entry';
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var date = buildDate(entry);
    var year = buildYear(entry);

    return '"' + title + '." ' + subtitle + ', Whispering Lore, ' + date + ', ' + url + '.';
  };

  // APA: Whispering Lore. (year). Title. Site Name. URL
  citationFormats.apa = function(entry, isStory) {
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var year = buildYear(entry);

    return 'Whispering Lore. (' + year + '). ' + title + '. Whispering Lore. ' + url;
  };

  // Generate all three formats
  function generateAll(entry, isStory) {
    return {
      bibtex: citationFormats.bibtex(entry, isStory),
      mla: citationFormats.mla(entry, isStory),
      apa: citationFormats.apa(entry, isStory)
    };
  }

  // Register on shared utils
  if (window.__sharedUtils) {
    window.__sharedUtils.CitationGenerator = {
      generateAll: generateAll,
      formats: citationFormats
    };
  }
})();
```

- [ ] **Step 2: Add citation styles to CSS**

In `css/styles.css`, add:

```css
.cite-popover {
  position: absolute;
  z-index: 100;
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 1rem;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.cite-popover.is-hidden { display: none; }
.cite-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.cite-popover-header h4 {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin: 0;
}
.cite-popover-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
}
.cite-popover-close:hover { color: var(--text-primary); }
.cite-format-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}
.cite-format-tab {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.65rem;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  text-transform: uppercase;
}
.cite-format-tab.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(153, 27, 27, 0.1);
}
.cite-text {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--bg-deep);
  padding: 0.5rem;
  border: 1px solid var(--border);
  max-height: 120px;
  overflow-y: auto;
  word-break: break-all;
  white-space: pre-wrap;
  margin-bottom: 0.5rem;
}
.cite-copy-btn {
  background: var(--accent);
  color: var(--text-primary);
  border: none;
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  text-transform: uppercase;
  width: 100%;
}
.cite-copy-btn:hover { opacity: 0.8; }
.cite-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  font-family: var(--font-display);
  letter-spacing: 0.03em;
  margin-left: 0.5rem;
}
.cite-btn:hover { border-color: var(--accent); color: var(--accent); }
```

- [ ] **Step 3: Add "Cite this" to creature detail footer**

In `bestiary.html`, after the `creature-stories` crossref div and before the closing of `detail-content`, add:

```html
<div class="detail-crossref">
  <button id="detail-cite-btn" class="cite-btn">Cite this</button>
  <div class="cite-popover is-hidden" id="detail-cite-popover">
    <div class="cite-popover-header">
      <h4>Citation</h4>
      <button class="cite-popover-close" id="cite-popover-close">&times;</button>
    </div>
    <div class="cite-format-tabs">
      <button class="cite-format-tab active" data-format="bibtex">BibTeX</button>
      <button class="cite-format-tab" data-format="mla">MLA</button>
      <button class="cite-format-tab" data-format="apa">APA</button>
    </div>
    <div class="cite-text" id="cite-text"></div>
    <button class="cite-copy-btn" id="cite-copy-btn">Copy to Clipboard</button>
  </div>
</div>
```

- [ ] **Step 4: Wire up citation in creature detail render**

In `js/creatures-viewer.js`, in the `showDetail` → `renderCreature` function, after the share button handler (around line 862), add:

```javascript
// Citation button
var citeBtn = document.getElementById('detail-cite-btn');
var citePopover = document.getElementById('detail-cite-popover');
if (citeBtn && citePopover && window.__sharedUtils && window.__sharedUtils.CitationGenerator) {
  var gen = window.__sharedUtils.CitationGenerator;
  var currentFormat = 'bibtex';

  function showCitation() {
    var citations = gen.generateAll(creature, false);
    var textEl = document.getElementById('cite-text');
    if (textEl) textEl.textContent = citations[currentFormat];
    citePopover.classList.remove('is-hidden');
  }

  citeBtn.onclick = function(e) {
    e.stopPropagation();
    var isHidden = citePopover.classList.contains('is-hidden');
    // Hide all other popovers first
    document.querySelectorAll('.cite-popover').forEach(function(p) { p.classList.add('is-hidden'); });
    if (isHidden) showCitation();
    else citePopover.classList.add('is-hidden');
  };

  // Format tabs
  citePopover.querySelectorAll('.cite-format-tab').forEach(function(tab) {
    tab.onclick = function() {
      currentFormat = tab.getAttribute('data-format');
      citePopover.querySelectorAll('.cite-format-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var citations = gen.generateAll(creature, false);
      var textEl = document.getElementById('cite-text');
      if (textEl) textEl.textContent = citations[currentFormat];
    };
  });

  // Close button
  var closeBtn = document.getElementById('cite-popover-close');
  if (closeBtn) closeBtn.onclick = function() { citePopover.classList.add('is-hidden'); };

  // Copy button
  var copyBtn = document.getElementById('cite-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = function() {
      var textEl = document.getElementById('cite-text');
      if (textEl) {
        navigator.clipboard.writeText(textEl.textContent).then(function() {
          var orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(function() { copyBtn.textContent = orig; }, 2000);
        });
      }
    };
  }
}

// Close popover on outside click
document.addEventListener('click', function(e) {
  if (citePopover && !citePopover.classList.contains('is-hidden') && !e.target.closest('.cite-btn') && !e.target.closest('.cite-popover')) {
    citePopover.classList.add('is-hidden');
  }
});
```

- [ ] **Step 5: Same for story detail view**

In `stories.html`, after `detail-creatures-section`:

```html
<div class="detail-crossref">
  <button id="detail-cite-btn" class="cite-btn">Cite this</button>
  <div class="cite-popover is-hidden" id="detail-cite-popover">
    <div class="cite-popover-header">
      <h4>Citation</h4>
      <button class="cite-popover-close" id="cite-popover-close">&times;</button>
    </div>
    <div class="cite-format-tabs">
      <button class="cite-format-tab active" data-format="bibtex">BibTeX</button>
      <button class="cite-format-tab" data-format="mla">MLA</button>
      <button class="cite-format-tab" data-format="apa">APA</button>
    </div>
    <div class="cite-text" id="cite-text"></div>
    <button class="cite-copy-btn" id="cite-copy-btn">Copy to Clipboard</button>
  </div>
</div>
```

In `js/stories-viewer.js`, add same citation wiring in `showDetail` → `renderStory`, after the share button handler (around line 379), using `gen.generateAll(story, true)`.

- [ ] **Step 6: Write citation unit tests**

Create `tests/citations.test.js`:

```javascript
// Pull in the citation generator (simulated for Node.js testing)
// We test the format logic inline

var formats = {};

function escapeLatex(str) {
  if (!str) return '';
  return str.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$')
            .replace(/#/g, '\\#').replace(/_/g, '\\_').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

function generateBibtex(entry, isStory) {
  var id = entry.slug || entry.id || 'unknown';
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var year = (entry.lastUpdated || '2026-07-05').split('-')[0];
  var date = entry.lastUpdated || '2026-07-05';
  return '@misc{' + id + ',\n  author = {Whispering Lore},\n  title = {' + escapeLatex(title) + '},\n  howpublished = {\\url{' + url + '}},\n  year = {' + year + '},\n  note = {Accessed: ' + date + '},\n  publisher = {Whispering Lore},\n  type = {' + (isStory ? 'folktale' : 'mythical creature entry') + '}\n}';
}

function generateMla(entry, isStory) {
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var subtitle = isStory ? 'Folktale' : 'Mythical Creature Entry';
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var date = entry.lastUpdated || '2026-07-05';
  return '"' + title + '." ' + subtitle + ', Whispering Lore, ' + date + ', ' + url + '.';
}

function generateApa(entry, isStory) {
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var year = (entry.lastUpdated || '2026-07-05').split('-')[0];
  return 'Whispering Lore. (' + year + '). ' + title + '. Whispering Lore. ' + url;
}

var mockCreature = {
  slug: 'nuckelavee',
  name: 'Nuckelavee',
  lastUpdated: '2026-07-05'
};

var mockStory = {
  slug: 'three-billy-goats-gruff',
  title: 'Three Billy Goats Gruff',
  lastUpdated: '2026-07-05'
};

test('BibTeX creature citation starts with @misc', function() {
  var result = generateBibtex(mockCreature, false);
  expect(result.startsWith('@misc{nuckelavee,')).toBe(true);
});

test('BibTeX story citation contains title', function() {
  var result = generateBibtex(mockStory, true);
  expect(result.indexOf('Three Billy Goats Gruff') !== -1).toBe(true);
});

test('MLA creature citation ends with URL and period', function() {
  var result = generateMla(mockCreature, false);
  expect(result.indexOf('nuckelavee') !== -1).toBe(true);
  expect(result.endsWith('.')).toBe(true);
});

test('APA citation starts with Whispering Lore', function() {
  var result = generateApa(mockCreature, false);
  expect(result.startsWith('Whispering Lore.')).toBe(true);
});

test('MLA story citation contains folktale subtitle', function() {
  var result = generateMla(mockStory, true);
  expect(result.indexOf('Folktale') !== -1).toBe(true);
});

test('BibTeX escapes special LaTeX characters', function() {
  var entry = { slug: 'test', name: 'Test & % $ # _ Species', lastUpdated: '2026-07-05' };
  var result = generateBibtex(entry, false);
  expect(result.indexOf('\\&') !== -1).toBe(true);
  expect(result.indexOf('\\%') !== -1).toBe(true);
  expect(result.indexOf('\\$') !== -1).toBe(true);
  expect(result.indexOf('\\#') !== -1).toBe(true);
  expect(result.indexOf('\\_') !== -1).toBe(true);
});

test('All three formats include the URL', function() {
  var bib = generateBibtex(mockCreature, false);
  var mla = generateMla(mockCreature, false);
  var apa = generateApa(mockCreature, false);
  expect(bib.indexOf('whisperinglore.com') !== -1).toBe(true);
  expect(mla.indexOf('whisperinglore.com') !== -1).toBe(true);
  expect(apa.indexOf('whisperinglore.com') !== -1).toBe(true);
});
```

- [ ] **Step 7: Run tests**

```bash
npx jest tests/citations.test.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 8: Commit**

```bash
git add js/citations.js css/styles.css bestiary.html stories.html js/creatures-viewer.js js/stories-viewer.js tests/citations.test.js
git commit -m "feat: add citation export with BibTeX, MLA, and APA formats"
```

---

## T2.4: Complete Placeholder Stories (CONTENT)

**Files:**
- Modify: `data/datasets/stories.json` (replace placeholder summaries + add full_text, themes, moral, source)

- [ ] **Step 1: Identify placeholder stories**

```bash
node -e "
var s = require('./data/datasets/stories.json');
s.filter(function(st) { return st.summary && st.summary.toLowerCase().indexOf('placeholder') !== -1; })
 .forEach(function(st) { console.log(st.id, st.title, st.country); });
"
```

This lists the 9 stories that need replacement.

- [ ] **Step 2: For each story, replace fields**

Each story follows this schema (for example, the existing complete stories):

```json
{
  "id": "storyX",
  "title": "Actual Folktale Title",
  "country": "Country",
  "continent": "Continent",
  "region": "Region",
  "type": "fairy-tale",
  "summary": "Real folklore summary describing the tale's plot and cultural context.",
  "full_text": "The actual full narrative text of the story, split into paragraphs...",
  "themes": ["theme1", "theme2", "theme3"],
  "moral": "The lesson or moral of the story.",
  "source": "Source reference",
  "period": "Earliest known period",
  "keywords": ["keyword1", "keyword2"],
  "creatures": ["creature-slug"],
  "source_quality": "unknown",
  "slug": "story-slug",
  "version": "1.0.0",
  "lastUpdated": "2026-07-06"
}
```

For each placeholder story:
1. Research the folklore tradition of that country/small island
2. Write a proper summary (no "placeholder" text)
3. Add full_text with the narrative (or mark "Full text not yet transcribed" if narrative not available)
4. Add themes, moral, source, keywords, creature references
5. Set `source_quality` to the appropriate value if source is known

- [ ] **Step 3: Verify no placeholders remain**

```bash
node -e "
var s = require('./data/datasets/stories.json');
var remaining = s.filter(function(st) { return st.summary && st.summary.toLowerCase().indexOf('placeholder') !== -1; });
console.log('Remaining placeholders: ' + remaining.length);
console.log(remaining.length === 0 ? 'PASS' : 'FAIL - ' + remaining.length + ' remaining');
"
```

- [ ] **Step 4: Regenerate shards and run tests**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 5: Commit**

```bash
git add data/datasets/stories.json data/sharded/
git commit -m "content: replace 9 placeholder stories with real folklore content"
```

---

## T2.5: Random Creature/Story Buttons (DEV)

**Files:**
- Modify: `index.html` (add buttons to hero area)
- Modify: `js/main.js` (random pick logic)
- Modify: `css/styles.css` (button styles if needed — likely can reuse `.btn-ghost`)

- [ ] **Step 1: Add buttons to hero area**

In `index.html`, after the existing hero buttons in `.hero-actions`, add:

```html
<div class="hero-actions">
  <a href="bestiary.html" class="btn-ghost">Explore Bestiary</a>
  <a href="stories.html" class="btn-ghost">Read Stories</a>
</div>
<button class="btn-ghost" id="btn-random-creature" style="margin-top:0.5rem;">🎲 Random Creature</button>
<button class="btn-ghost" id="btn-random-story" style="margin-top:0.5rem;margin-left:0.5rem;">🎲 Random Story</button>
<button class="btn-ghost" id="btn-surprise-me" style="margin-top:0.5rem;margin-left:0.5rem;">✨ Surprise Me</button>
```

- [ ] **Step 2: Add random pick logic**

In `js/main.js`, add at the top of the DOMContentLoaded handler or at the bottom of the file:

```javascript
// Random navigation buttons
function initRandomButtons() {
  var btnCreature = document.getElementById('btn-random-creature');
  var btnStory = document.getElementById('btn-random-story');
  var btnSurprise = document.getElementById('btn-surprise-me');

  var shuffle = window.__sharedUtils && window.__sharedUtils.Shimmer
    ? window.__sharedUtils.Shimmer.manifest
    : null;

  function getRandomSlug(type) {
    if (!shuffle || !shuffle[type]) return null;
    var items = shuffle[type].items || [];
    if (!items.length) return null;
    return items[Math.floor(Math.random() * items.length)].slug;
  }

  function navigateTo(type) {
    var slug = getRandomSlug(type);
    if (!slug) return;
    var page = type === 'creatures' ? 'bestiary.html?creature=' : 'stories.html?story=';
    window.location.href = page + encodeURIComponent(slug);
  }

  if (btnCreature) {
    btnCreature.addEventListener('click', function() {
      // Try shimmer manifest first, fallback to XHR
      var slug = getRandomSlug('creatures');
      if (slug) { window.location.href = 'bestiary.html?creature=' + encodeURIComponent(slug); return; }
      // Fallback: fetch via shimmer
      var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
      if (sh && sh.getAllKeys) {
        sh.getAllKeys('creatures', function(err, keys) {
          if (keys && keys.length) {
            var randomSlug = keys[Math.floor(Math.random() * keys.length)];
            window.location.href = 'bestiary.html?creature=' + encodeURIComponent(randomSlug);
          }
        });
      }
    });
  }

  if (btnStory) {
    btnStory.addEventListener('click', function() {
      var slug = getRandomSlug('stories');
      if (slug) { window.location.href = 'stories.html?story=' + encodeURIComponent(slug); }
    });
  }

  if (btnSurprise) {
    btnSurprise.addEventListener('click', function() {
      var pick = Math.random() < 0.5 ? 'creatures' : 'stories';
      navigateTo(pick);
    });
  }
}

// Call after shimmer is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRandomButtons);
} else {
  initRandomButtons();
}
```

- [ ] **Step 3: Run tests**

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/site-layout.spec.js --timeout 30000
```

- [ ] **Step 4: Manual verification**

Open `index.html` and verify:
- "Random Creature" navigates to a creature detail on bestiary.html
- "Random Story" navigates to a story detail on stories.html
- "Surprise Me" navigates to either

- [ ] **Step 5: Commit**

```bash
git add index.html js/main.js
git commit -m "feat: add random creature, random story, and surprise me buttons to hero"
```

---

## T2.6: My Lore Empty State (DEV)

**Files:**
- Modify: `js/mylore.js` (add links to bestiary/stories in empty state)
- Modify: `mylore.html` (add guidance section container)
- Modify: `css/styles.css` (guidance section styles)

- [ ] **Step 1: Update My Lore HTML to add guidance section**

In `mylore.html`, add before `#fav-creatures`:

```html
<div class="mylore-guidance is-hidden" id="mylore-guidance">
  <div class="mylore-guidance-content">
    <h2>Your Lore Collection is Empty</h2>
    <span class="accent-line"></span>
    <p>Start building your personal collection of mythical creatures and folklore stories. Here's how:</p>
    <div class="mylore-guidance-cards">
      <div class="card">
        <div class="card-body">
          <span class="gold-accent"></span>
          <h3>Explore the Bestiary</h3>
          <p>Browse hundreds of mythical creatures from cultures around the world. Click the heart icon on any creature to add it to your collection.</p>
          <a href="bestiary.html" class="card-cta">Enter the Bestiary</a>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <span class="gold-accent"></span>
          <h3>Read Folklore Stories</h3>
          <p>Discover ancient tales, folktales, and legends. Use the bookmark button to save your favorite stories for later.</p>
          <a href="stories.html" class="card-cta">Read Stories</a>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Update mylore.js**

Replace the existing `renderSavedItems` function:

```javascript
;(function () {
  'use strict'

  function renderSavedItems() {
    var loreBox = window.__sharedUtils && window.__sharedUtils.LoreBox;
    if (!loreBox) { return }

    var favCreatures = loreBox.get('creatures');
    var favStories = loreBox.get('stories');

    var cGrid = document.getElementById('fav-creatures');
    var sGrid = document.getElementById('fav-stories');
    var guidance = document.getElementById('mylore-guidance');

    var hasCreatures = favCreatures.length > 0;
    var hasStories = favStories.length > 0;

    // Show guidance if both are empty
    if (guidance) {
      if (!hasCreatures && !hasStories) {
        guidance.classList.remove('is-hidden');
      } else {
        guidance.classList.add('is-hidden');
      }
    }

    if (cGrid) {
      cGrid.innerHTML = hasCreatures
        ? favCreatures.map(function(c) { return [
            '<article class="card">',
            '<div class="card-image-placeholder"></div>',
            '<div class="card-body">',
            '<span class="gold-accent"></span>',
            '<h3>' + window.__sharedUtils.escapeXml(c.name) + '</h3>',
            '<p>' + window.__sharedUtils.escapeXml(c.description || 'No description available.') + '</p>',
            '<a href="bestiary.html?creature=' + window.__sharedUtils.escapeXml(c.slug) + '" class="card-cta">View Entry</a>',
            '</div></article>'
          ].join(''); }).join('')
        : '<p class="no-results">No favorite creatures yet.</p>';
    }

    if (sGrid) {
      sGrid.innerHTML = hasStories
        ? favStories.map(function(s) { return [
            '<article class="card">',
            '<div class="card-image-placeholder"></div>',
            '<div class="card-body">',
            '<span class="gold-accent"></span>',
            '<h3>' + window.__sharedUtils.escapeXml(s.title) + '</h3>',
            '<p>' + window.__sharedUtils.escapeXml(s.summary || 'No summary available.') + '</p>',
            '<a href="stories.html?story=' + window.__sharedUtils.escapeXml(s.slug) + '" class="card-cta">Read Tale</a>',
            '</div></article>'
          ].join(''); }).join('')
        : '<p class="no-results">No bookmarked stories yet.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', renderSavedItems);
})();
```

- [ ] **Step 3: Add CSS for guidance section**

In `css/styles.css`, add:

```css
.mylore-guidance {
  margin: 2rem 0;
}
.mylore-guidance-content {
  text-align: center;
  padding: 2rem 0;
}
.mylore-guidance-content h2 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-primary);
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}
.mylore-guidance-content p {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  max-width: 500px;
  margin: 0 auto 1.5rem;
}
.mylore-guidance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/site-layout.spec.js --timeout 30000
```

- [ ] **Step 5: Commit**

```bash
git add js/mylore.js mylore.html css/styles.css
git commit -m "feat: add guidance empty state to My Lore page with links to bestiary and stories"
```

---

## T2.7: Living Tradition Flag (DEV + CONTENT)

**Files:**
- Create: `scripts/bulk-assign-living-tradition.js`
- Modify: `data/datasets/creatures.json` (add `living_tradition` field)
- Modify: `bestiary.html` (add badge placeholder)
- Modify: `js/creatures-viewer.js` (badge rendering)
- Modify: `css/styles.css` (badge styles)

- [ ] **Step 1: Write bulk-assignment script**

```javascript
#!/usr/bin/env node
// scripts/bulk-assign-living-tradition.js
// Assigns living_tradition based on region/type heuristics.
// Entries from cultures with actively practiced traditions are flagged.
// Manual review notes are added for all assignments.

var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Cultures with actively practiced folk traditions (non-exhaustive, starting point)
var LIVELY_REGIONS = {
  'East Asia': true,      // Shinto, folk Buddhism, Shenism
  'South Asia': true,     // Hinduism, folk Islam
  'Southeast Asia': true, // Indigenous animism, syncretic traditions
  'Pacific': true,        // Active island traditions
  'Sub-Saharan Africa': true, // Active oral traditions
  'Northern America': true,   // Indigenous traditions (some)
  'Southern America': true,   // Syncretic + Indigenous
  'Central America': true,    // Syncretic + Indigenous
  'Middle East': true     // Folk Islam, Zoroastrian remnants
};

// Types commonly associated with living traditions
var LIVELY_TYPES = {
  'household-spirit': true,
  'ancestor-spirit': true,
  'nature-spirit': true,
  'guardian': true,
  'trickster': true,
  'culture-hero': true
};

// NOTE: This is a heuristic starting point. Every flagged entry needs manual review.
// The script outputs a list of entries requiring verification.
var output = [];
var flagged = 0;
var total = 0;

creatures.forEach(function(c) {
  var living = false;
  var reasons = [];

  // Heuristic 1: region with active traditions
  if (c.region && LIVELY_REGIONS[c.region]) {
    living = true;
    reasons.push('region: ' + c.region);
  }

  // Heuristic 2: type commonly associated with active folk belief
  if (c.type && LIVELY_TYPES[c.type]) {
    living = true;
    reasons.push('type: ' + c.type);
  }

  // Heuristic 3: source_quality === 'verified' + source mentions modern belief
  // (can't auto-detect, but flagged for manual review)

  if (living) {
    c.living_tradition = true;
    flagged++;
  } else {
    c.living_tradition = false;
  }
  total++;
  output.push({ slug: c.slug, name: c.name, living_tradition: c.living_tradition, reasons: reasons });
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');

// Output review guide
fs.writeFileSync(
  path.join(__dirname, '..', 'docs', 'data-quality', 'living-tradition-review.md'),
  '# Living Tradition Flag — Manual Review Guide\n\n' +
  'The following entries were flagged as `living_tradition: true` by heuristic rules.\n' +
  'Each needs manual verification: is this creature/entity still part of active folk belief?\n\n' +
  '| Slug | Name | Reasons |\n|------|------|--------|\n' +
  output.filter(function(o) { return o.living_tradition; })
    .map(function(o) { return '| ' + o.slug + ' | ' + o.name + ' | ' + o.reasons.join(', ') + ' |'; })
    .join('\n') + '\n'
);

console.log('Total: ' + total);
console.log('Flagged as living_tradition: ' + flagged);
console.log('Not flagged: ' + (total - flagged));
console.log('Review file: docs/data-quality/living-tradition-review.md');
```

- [ ] **Step 2: Run the script**

```bash
node scripts/bulk-assign-living-tradition.js
```

- [ ] **Step 3: Update HTML and JS for badge**

In `bestiary.html`, in the creature `detail-meta` section, add a badge span:

```html
<span class="detail-meta-item"><span id="detail-live-badge"></span></span>
```

In `js/creatures-viewer.js`, in the `renderCreature` function, add after the source badge rendering (around line 874):

```javascript
var liveBadgeEl = document.getElementById('detail-live-badge');
if (liveBadgeEl) {
  if (creature.living_tradition === true) {
    liveBadgeEl.innerHTML = '<span class="live-badge">Living Tradition</span>';
  } else if (creature.living_tradition === false) {
    liveBadgeEl.innerHTML = '<span class="live-badge live-badge--inactive">Historical</span>';
  } else {
    liveBadgeEl.innerHTML = '';
  }
}
```

- [ ] **Step 4: Add CSS**

In `css/styles.css`, add:

```css
.live-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #22c55e;
  color: #22c55e;
  border-radius: 2px;
  margin-left: 0.5rem;
}
.live-badge--inactive {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}
```

- [ ] **Step 5: Run tests and regenerate shards**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 6: Commit**

```bash
git add data/datasets/creatures.json data/sharded/ scripts/bulk-assign-living-tradition.js bestiary.html js/creatures-viewer.js css/styles.css docs/data-quality/living-tradition-review.md
git commit -m "feat: add living_tradition flag with heuristic bulk assignment and badge rendering"
```

---

## T2.8: Source-Type Tags (DEV + CONTENT)

**Files:**
- Create: `scripts/bulk-assign-source-type.js`
- Modify: `data/datasets/creatures.json` (add `source_type` field)
- Modify: `bestiary.html` (add badge placeholder)
- Modify: `js/creatures-viewer.js` (badge rendering)
- Modify: `css/styles.css` (badge color styles)

- [ ] **Step 1: Write bulk-assignment script**

```javascript
#!/usr/bin/env node
// scripts/bulk-assign-source-type.js
// Assigns source_type based on existing source and region metadata.
// Values: oral_tradition, literary, archaeological, syncretic, unknown

var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Heuristic patterns
var patterns = {
  oral_tradition: [
    /folklore/i, /folk tale/i, /folktale/i, /oral/i, /legend/i,
    /myth/i, /fairy.?tale/i, /traditional/i, /tale/i
  ],
  literary: [
    /chronicle/i, /epic/i, /poem/i, /saga/i, /edda/i,
    /literary/i, /written/i, /manuscript/i, /text/i,
    /gospel/i, /scripture/i
  ],
  archaeological: [
    /archaeolog/i, /inscription/i, /artifact/i, /petroglyph/i,
    /cave.?painting/i, /rune.?stone/i, /stele/i
  ],
  syncretic: [
    /syncretic/i, /fusion/i, /christianiz/i, /islamiz/i,
    /hybrid/i
  ]
};

// Region-based defaults (when no source field exists)
var regionDefaults = {
  'Pacific': 'oral_tradition',
  'Sub-Saharan Africa': 'oral_tradition',
  'Northern America': 'oral_tradition',  // indigenous
  'Southern America': 'oral_tradition',  // indigenous + syncretic
  'Central America': 'oral_tradition',   // indigenous
  'Arctic': 'oral_tradition',
  'Antarctic': 'oral_tradition',
  'East Asia': 'literary',       // early written records
  'South Asia': 'literary',      // ancient texts
  'Middle East': 'literary',     // ancient texts
  'Nordic': 'literary',          // sagas, eddas
  'Celtic': 'literary',          // medieval manuscripts
  'European': 'literary'         // medieval + classical texts
};

var unknownDefault = 'unknown';

var counts = { oral_tradition: 0, literary: 0, archaeological: 0, syncretic: 0, unknown: 0 };

creatures.forEach(function(c) {
  if (c.source_type) {
    // Already assigned, count and skip
    if (counts[c.source_type] !== undefined) counts[c.source_type]++;
    else counts.unknown++;
    return;
  }

  var source = c.source || '';
  var assigned = false;

  // Try pattern matching on source field
  Object.keys(patterns).forEach(function(type) {
    if (assigned) return;
    var found = patterns[type].some(function(re) { return re.test(source); });
    if (found) {
      c.source_type = type;
      counts[type]++;
      assigned = true;
    }
  });

  if (assigned) return;

  // Fallback to region default
  if (c.region && regionDefaults[c.region]) {
    c.source_type = regionDefaults[c.region];
    counts[c.source_type]++;
    return;
  }

  // Last resort
  c.source_type = unknownDefault;
  counts.unknown++;
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');

Object.keys(counts).forEach(function(k) {
  console.log(k + ': ' + counts[k]);
});
console.log('Total: ' + creatures.length);
```

- [ ] **Step 2: Run the script**

```bash
node scripts/bulk-assign-source-type.js
```

Expected output shows the distribution across the 5 types.

- [ ] **Step 3: Update HTML, JS, and CSS for badges**

In `bestiary.html`, in the creature `detail-meta` section, add after the source badge:

```html
<span class="detail-meta-item"><span id="detail-source-type-badge"></span></span>
```

In `js/creatures-viewer.js`, in the `renderCreature` function, add after the `detail-source-badge` rendering (around line 874):

```javascript
var sourceTypeBadge = document.getElementById('detail-source-type-badge');
if (sourceTypeBadge && creature.source_type) {
  var st = creature.source_type;
  var stLabel = st.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
  sourceTypeBadge.innerHTML = '<span class="source-type-badge source-type-badge--' + st + '">' + stLabel + '</span>';
}
```

In `css/styles.css`, add:

```css
.source-type-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid;
  border-radius: 2px;
  margin-left: 0.5rem;
}
.source-type-badge--oral_tradition {
  color: #f59e0b;
  border-color: #f59e0b;
}
.source-type-badge--literary {
  color: #3b82f6;
  border-color: #3b82f6;
}
.source-type-badge--archaeological {
  color: #8b5cf6;
  border-color: #8b5cf6;
}
.source-type-badge--syncretic {
  color: #06b6d4;
  border-color: #06b6d4;
}
.source-type-badge--unknown {
  color: var(--text-secondary);
  border-color: var(--border);
}
```

- [ ] **Step 4: Verify no entries are missing source_type**

```bash
node -e "
var c = require('./data/datasets/creatures.json');
var missing = c.filter(function(e) { return !e.source_type; });
console.log('Missing source_type: ' + missing.length);
var valid = ['oral_tradition','literary','archaeological','syncretic','unknown'];
var bad = c.filter(function(e) { return e.source_type && valid.indexOf(e.source_type) === -1; });
console.log('Invalid source_type values: ' + bad.length);
bad.forEach(function(e) { console.log('  ' + e.slug + ': ' + e.source_type); });
"
```

Expected: 0 missing, 0 invalid.

- [ ] **Step 5: Regenerate shards and run tests**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 6: Commit**

```bash
git add data/datasets/creatures.json data/sharded/ scripts/bulk-assign-source-type.js bestiary.html js/creatures-viewer.js css/styles.css
git commit -m "feat: add source_type field with 5-class tag system and badge rendering"
```

---

## Execution Order

```
Week 1:   T2.1 (start, long pole) + T2.5 (1d) + T2.6 (0.5d)
Week 2:   T2.1 (ongoing) + T2.2 (2-3d) + T2.7 (2d, dev portion)
Week 3:   T2.1 (ongoing) + T2.8 (3d, dev portion) + T2.4 (3-5d, content)
Week 4:   T2.1 (ongoing) + T2.3 (1w, dev)
Weeks 5+: T2.1 (ongoing, deep into content campaign)
```

T2.1 runs continuously in the background. All dev tasks are independent and can be parallelized.

## Verification Checklist

Run after each task:

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/ --timeout 30000
```

No drop from current pass rate.

## Scoring Projection

```
Phase           User  Researcher  Academic  Folklorist
Current          8       7          7          8
After Tier 2     9       9          8          9
```
