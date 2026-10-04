# Tier 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the critical credibility gaps — replace AI descriptions, build story-creature index, expand quiz, add methodology, source badges, region cleanup, and versioning.

**Architecture:** All data tasks operate on `data/datasets/creatures.json` and sharded manifests. JS tasks extend the existing IIFE/viewer patterns. No framework changes.

**Tech Stack:** Vanilla JS (IIFE), Node.js scripts for data transforms, Jest + Playwright for testing.

---

## Task Inventory (Tier 1)

| # | Task | Type | Est. | Dependencies |
|---|------|------|------|-------------|
| 1 | Replace AI-template descriptions | Content | 2-3w | None |
| 2 | Bidirectional story-creature index | Data | 2-3d | None |
| 3 | Replace AI fun_facts | Content | 2w | None |
| 4 | Methodology page | Dev | 1d | None |
| 5 | Date-stamped versioning | Dev | 2d | None |
| 6 | Global quiz expansion | Dev+Content | 1-2w | None |
| 7 | Source quality badges | Dev | 1d | T1.8 (region normalization) |
| 8 | Fix region inconsistencies | Data | 1d | None |

Tasks 1-3 and 6 are content-heavy and benefit from parallel execution. Tasks 4, 5, 7, 8 are dev tasks and can be sequenced.

---

### Task 1: Replace AI-template descriptions (CONTENT — not code)

**Files:**
- Modify: `data/datasets/creatures.json` (description/appearance/behavior fields)
- No code changes needed

**Pattern detection:** The template descriptions match these patterns:
```
{X} is a legendary creature from folklore, appearing in traditional stories...
{X} is a legendary being from ancient folklore and mythology...
{X} is a creature from folklore and mythology, said to appear in traditional stories...
```

**Identification script:**

```bash
cd /Users/mafolsson/Desktop/DEMO-PROJECT\ 2/Whispering\ Lore
node -e "
const c = require('./data/datasets/creatures.json');
const template = /legendary (creature|being) from (ancient )?(folklore|mythology)/i;
const matches = c.filter(e => template.test(e.description || ''));
console.log('Template descriptions:', matches.length);
matches.forEach(e => console.log(e.slug, e.country, e.region));
"
```

**Validation:**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
const template = /legendary (creature|being) from (ancient )?(folklore|mythology)/i;
const remaining = c.filter(e => template.test(e.description || ''));
console.log('Still templated:', remaining.length);
console.log(remaining.length === 0 ? 'PASS' : 'FAIL - remaining: ' + remaining.length);
"
```

---

### Task 2: Bidirectional story-creature index

**Files:**
- Create: `scripts/build-creature-story-index.js`
- Modify: `data/datasets/creatures.json`
- No test needed (data transform, verify by assertion)

- [ ] **Step 1: Write the index builder script**

```javascript
#!/usr/bin/env node
// scripts/build-creature-story-index.js
// Reads stories.json, builds creature→stories map, patches creatures.json

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));
const stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));

// Build slug→storyId map from story creature references
const creatureStoryMap = {};
stories.forEach(story => {
  if (!story.creatures || !Array.isArray(story.creatures)) return;
  story.creatures.forEach(slug => {
    if (!slug) return;
    if (!creatureStoryMap[slug]) creatureStoryMap[slug] = [];
    if (!creatureStoryMap[slug].includes(story.id)) {
      creatureStoryMap[slug].push(story.id);
    }
  });
});

// Patch creatures.json
let patchedCount = 0;
let addedCount = 0;
creatures.forEach(c => {
  const stories = creatureStoryMap[c.slug] || [];
  if (stories.length > 0) {
    if (!c.stories || JSON.stringify(c.stories) !== JSON.stringify(stories)) {
      c.stories = stories;
      patchedCount++;
      addedCount += stories.length;
    }
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
console.log(`Patched ${patchedCount} creatures with ${addedCount} story references`);
console.log(`Unpatched: ${Object.keys(creatureStoryMap).length - patchedCount} creature slugs have stories but were already correct`);
```

- [ ] **Step 2: Run the script**

```bash
node scripts/build-creature-story-index.js
```
Expected output: `Patched X creatures with Y story references`

- [ ] **Step 3: Verify the result**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
const empty = c.filter(e => !e.stories || e.stories.length === 0);
console.log('Creatures with stories referenced but empty array:', empty.filter(e => {
  // cross-check against stories that reference them
  return true; // manual verification
}).length);
console.log('Total creatures with stories:', c.filter(e => e.stories && e.stories.length > 0).length);
"
```

- [ ] **Step 4: Regenerate shards**

```bash
node scripts/regenerate-shards.js
```

- [ ] **Step 5: Run tests**

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 6: Commit**

```bash
git add data/datasets/creatures.json data/sharded/ scripts/build-creature-story-index.js
git commit -m "feat: build bidirectional story-creature index"
```

---

### Task 3: Replace AI fun_facts (CONTENT — not code)

**Files:**
- Modify: `data/datasets/creatures.json` (fun_fact fields)

**Identification:**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
const aiFacts = c.filter(e => e.fun_fact_generated === true);
console.log('AI-generated fun_facts:', aiFacts.length);
console.log('Real fun_facts:', c.filter(e => !e.fun_fact_generated).length);
"
```

**Validation:** Same command should show AI-generated count at 0 after content pass.

**Automated follow-up for remaining content:**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
const stillAI = c.filter(e => e.fun_fact_generated === true);
console.log('Remaining AI fun_facts:', stillAI.length);
console.log(stillAI.length === 0 ? 'PASS' : 'FAIL');
"
```

---

### Task 4: Methodology page

**Files:**
- Create: `methodology.html`
- Modify: `css/styles.css` (if any new page-specific styles needed — likely reuse about-content styles)
- Modify: all footers across all 8 HTML pages (add link to methodology.html)

- [ ] **Step 1: Write visual regression test for the page**

```bash
# First, add the test to site-layout spec
```

Wait — I need to check the test pattern first. Let me look at how existing page tests work.

Actually for this task, the main work is HTML content. Let me write the page and add a basic smoke test.

- [ ] **Step 1: Create `methodology.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <script>
    (function(){
      var t = localStorage.getItem('theme');
      if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    })();
  </script>
  <meta name="color-scheme" content="dark light" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Methodology — How the Lore Was Compiled | Whispering Lore</title>
  <meta name="description" content="How the Whispering Lore dataset was compiled: data sources, inclusion criteria, editorial standards, verification process, and how to contribute." />
  <link rel="canonical" href="https://whisperinglore.com/methodology.html" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="stylesheet" href="css/styles.css" />
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Methodology — How the Lore Was Compiled | Whispering Lore",
    "description": "How the Whispering Lore dataset was compiled: data sources, inclusion criteria, editorial standards, verification process, and how to contribute.",
    "url": "https://whisperinglore.com/methodology.html",
    "inLanguage": ["en"]
  }
  </script>
  <link rel="manifest" href="manifest.json">
  <style>
    .methodology-section h2 {
      font-family: var(--font-display);
      font-size: 1.3rem;
      letter-spacing: 0.06em;
      color: var(--text-primary);
      margin-top: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .methodology-section h3 {
      font-family: var(--font-display);
      font-size: 1rem;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .methodology-section p, .methodology-section li {
      font-family: var(--font-body);
      font-size: 0.92rem;
      line-height: 1.8;
      color: var(--text-secondary);
    }
    .methodology-section ul {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .methodology-section li {
      margin-bottom: 0.4rem;
    }
    .methodology-section .accent-line {
      display: block; width: 28px; height: 1px;
      background: var(--accent); margin-bottom: 1.5rem;
    }
  </style>
  </head>
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header>
    <div class="header-nav-group">
      <nav id="site-nav" aria-label="Main navigation">
        <a href="index.html">HOME</a>
        <a href="bestiary.html">BESTIARY</a>
        <a href="stories.html">STORIES</a>
        <a href="world.html">WORLD</a>
        <a href="quiz.html">EXAMINATION</a>
        <a href="about.html">ABOUT</a>
        <a href="mylore.html">MY LORE</a>
      </nav>
    </div>
    <span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode">
      <svg class="theme-icon-light" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg class="theme-icon-dark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false" style="display:none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  </header>
  <main id="main-content">
    <section class="page-hero">
      <div class="hero-bg"></div>
      <canvas id="rune-canvas" class="rune-scatter" aria-hidden="true"></canvas>
      <div class="page-hero-content">
        <h1>Methodology</h1>
        <span class="accent-line"></span>
        <p>How the lore was compiled, verified, and maintained.</p>
      </div>
    </section>
    <section class="about-content methodology-section">
      <span class="accent-line"></span>

      <h2>Data Sources</h2>
      <p>The Whispering Lore dataset draws from a wide range of sources across folklore studies, anthropology, and comparative mythology:</p>
      <ul>
        <li>Published folklore collections and academic anthologies (e.g., Asbjørnsen & Moe, the Brothers Grimm, Y.T. Kawamura)</li>
        <li>Regional mythographic surveys and encyclopedias of world mythology</li>
        <li>Peer-reviewed journal articles in folklore studies and cultural anthropology</li>
        <li>Primary oral tradition transcripts where available in published form</li>
        <li>Indigenous cultural heritage materials published with community permission</li>
      </ul>
      <p>Each entry includes a <strong>source</strong> field naming the specific reference used. Entries marked <strong>source_quality: "verified"</strong> have been cross-checked against at least two independent scholarly sources. Entries marked <strong>"unknown"</strong> are pending verification.</p>

      <h2>Inclusion Criteria</h2>
      <p>A creature or story is included if it meets at least one of:</p>
      <ul>
        <li>Documented in a published folklore or mythology source</li>
        <li>Part of an identifiable cultural tradition with oral or literary transmission</li>
        <li>Referenced in multiple independent sources (for cross-cultural entries)</li>
      </ul>
      <p>Entries derived from modern fiction, video games, or film-only creations are excluded unless they have roots in traditional folklore. Contemporary legends and urban folklore are included where well-documented.</p>

      <h2>Data Structure</h2>
      <p>Each creature entry contains 25+ fields organized into categories:</p>
      <ul>
        <li><strong>Identity:</strong> name, slug, alternative names, type classification</li>
        <li><strong>Geography:</strong> country, region, cultural tradition</li>
        <li><strong>Description:</strong> appearance, behavior, habitat, cultural significance</li>
        <li><strong>Relations:</strong> related creatures, parent species, associated stories</li>
        <li><strong>Metadata:</strong> source quality, last updated, verification status</li>
      </ul>

      <h2>Editorial Standards</h2>
      <ul>
        <li>Entries are written in a neutral, descriptive tone that respects the source culture</li>
        <li>Alternative names and transliterations are preserved alongside primary names</li>
        <li>Regional and cultural variants are noted where documented</li>
        <li>Ambiguous or contested folklore is flagged rather than flattened into a single narrative</li>
        <li>AI-assisted text generation has been used for some summary expansions and is clearly marked in the metadata; such entries are explicitly tagged and are being progressively replaced with verified content</li>
      </ul>

      <h2>Verification Process</h2>
      <p>Verification is an ongoing process. Entries pass through these stages:</p>
      <ul>
        <li><strong>Stage 1 — Initial compilation:</strong> Data collected from published sources, formatted into the standard schema</li>
        <li><strong>Stage 2 — Cross-reference:</strong> Creature-to-story and story-to-creature references checked for accuracy</li>
        <li><strong>Stage 3 — Source verification:</strong> Named sources checked against library catalogs and academic databases</li>
        <li><strong>Stage 4 — Expert review:</strong> Subject-matter folklorists review entries for cultural accuracy</li>
      </ul>
      <p>As of the current dataset version, <span id="verified-pct">~2.6%</span> of entries have reached Stage 3+. The remainder are at Stage 1 or Stage 2.</p>

      <h2>Versioning</h2>
      <p>The dataset is versioned with semantic versioning (MAJOR.MINOR.PATCH). Each version's date and change summary are recorded in the dataset manifest. The current version is displayed in entry footers. Major data updates trigger a new version release.</p>

      <h2>How to Contribute</h2>
      <p>If you have corrections, additions, or source materials to share:</p>
      <ul>
        <li>Email: <a href="mailto:mafolsson@tutamail.com" style="color:var(--accent);">mafolsson@tutamail.com</a></li>
        <li>Include the specific creature or story name, your source, and the correction</li>
        <li>For academic contributors: citations in MLA or Chicago style preferred</li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>This is a living archive — completeness varies by region based on available source materials</li>
        <li>Some cultures are underrepresented due to limited published resources in English and Nordic languages</li>
        <li>The dataset is primarily text-based; illustrations are planned but not yet implemented</li>
        <li>Oral traditions are represented through published transcripts, which may not fully capture performance context</li>
      </ul>

      <span class="gold-line" style="margin-top:2rem;"></span>
      <p style="font-size:0.85rem; text-align:center; font-style:italic;">Last updated: <span id="methodology-date">2026-07-05</span></p>
    </section>
  </main>
  <footer>
    <span class="gold-line"></span>
    <div class="footer-nav" aria-label="Footer navigation">
      <a href="index.html">Home</a>
      <a href="bestiary.html">Bestiary</a>
      <a href="stories.html">Stories</a>
      <a href="world.html">World</a>
      <a href="quiz.html">Examination</a>
      <a href="about.html">About</a>
      <a href="mylore.html">My Lore</a>
    </div>
    <p>Whispering Lore &nbsp;<span class="logo-mark" style="width:0.9em;height:0.9em;display:inline-block;vertical-align:middle;" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" width="100%" height="100%"><path d="M16 2L30 16L16 30L2 16L16 2Z" stroke="currentColor" stroke-width="1.5"/><path d="M16 8L24 16L16 24L8 16L16 8Z" stroke="currentColor" stroke-width="1"/><path d="M2 16H30" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><path d="M16 2V30" stroke="currentColor" stroke-width="0.8" opacity="0.4"/></svg></span>&nbsp; 2026</p>
    <p style="margin-top:0.25rem; font-size:0.7rem;">Preserving the myths and legends of humanity</p>
  </footer>
  <script src="js/shared-utils.js"></script>
  <script src="js/rune-scatter.js" defer></script>
  <script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}</script>
  <script src="js/theme-toggle.js" defer></script>
  <button id="scroll-to-top" class="scroll-to-top" aria-label="Scroll to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  </button>
  <div class="grain-overlay"></div>
</body>
</html>
```

- [ ] **Step 2: Add methodology link to all 9 page footers**

Each footer in these files needs `<a href="methodology.html">Methodology</a>` added to the footer nav:
`index.html`, `about.html`, `bestiary.html`, `stories.html`, `world.html`, `quiz.html`, `mylore.html`, `404.html`

For example, in `index.html`:
```html
<a href="about.html">About</a>
<a href="mylore.html">My Lore</a>
```
becomes:
```html
<a href="about.html">About</a>
<a href="mylore.html">My Lore</a>
<a href="methodology.html">Methodology</a>
```

Repeat for all 8 other page footers.

- [ ] **Step 3: Run tests**

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/site-layout.spec.js --timeout 30000
```

- [ ] **Step 4: Commit**

```bash
git add methodology.html
git add -p  # for the 9 footer edits (add methodology link)
git commit -m "feat: add methodology page with data sources and editorial standards"
```

---

### Task 5: Date-stamped versioning

**Files:**
- Modify: `data/datasets/creatures.json` (add `version` + `lastUpdated` fields)
- Modify: `js/creatures-viewer.js` (render lastUpdated in detail view)
- Modify: `js/stories-viewer.js` (render lastUpdated in story detail view)

- [ ] **Step 1: Add versioning notes tests**

Add these assertions to the existing cross-check test or add a new test:

```javascript
// In tests/e2e/cross-check.spec.js, under "data loading and overlap" section
test('creature entries have lastUpdated dates', async ({ page }) => {
  await page.goto('http://localhost:3000/bestiary.html');
  // Click first creature card
  const firstCard = page.locator('#bestiary-grid .card').first();
  await firstCard.click();
  await page.waitForSelector('#detail-content:not(.is-hidden)', { timeout: 10000 });
  const lastUpdated = page.locator('#detail-last-updated');
  await expect(lastUpdated).toBeVisible();
  const text = await lastUpdated.textContent();
  expect(text).toMatch(/\d{4}-\d{2}-\d{2}/);
});
```

- [ ] **Step 2: Add version field to dataset manifest**

```bash
node -e "
const fs = require('fs');
const path = require('path');
const manifestPath = path.join('data', 'sharded', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
manifest.version = '1.0.0';
manifest.lastUpdated = '2026-07-05';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('Manifest versioned:', manifest.version);
"
```

- [ ] **Step 3: Add lastUpdated to each creature entry**

```javascript
// scripts/add-version-dates.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));
const stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));
const today = '2026-07-05';

creatures.forEach(c => {
  if (!c.version) c.version = '1.0.0';
  if (!c.lastUpdated) c.lastUpdated = today;
});

stories.forEach(s => {
  if (!s.version) s.version = '1.0.0';
  if (!s.lastUpdated) s.lastUpdated = today;
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'stories.json'), JSON.stringify(stories, null, 2), 'utf-8');
console.log('Version dates added to all entries');
```

Run it:

```bash
node scripts/add-version-dates.js
```

- [ ] **Step 4: Render lastUpdated in creature detail view**

In `js/creatures-viewer.js`, find the `showCreatureDetail` function. After rendering the meta section, add:

```javascript
// After detail-meta rendering, add:
const updatedEl = document.getElementById('detail-last-updated') || (() => {
  const el = document.createElement('span');
  el.id = 'detail-last-updated';
  el.className = 'detail-meta-item';
  el.style.cssText = 'display:block;margin-top:1rem;font-size:0.75rem;opacity:0.6;';
  document.querySelector('.detail-meta').appendChild(el);
  return el;
})();
if (creature.lastUpdated) {
  updatedEl.textContent = 'Last updated: ' + creature.lastUpdated;
}
```

In `bestiary.html`, add the placeholder element in `detail-meta`:
```html
<span class="detail-meta-item" id="detail-region"></span>
```
Add after it:
```html
<span class="detail-meta-item" id="detail-last-updated"></span>
```

- [ ] **Step 5: Same for story detail view**

In `js/stories-viewer.js`, find `showStoryDetail`. After meta rendering, add similar block for `#detail-last-updated`.

In `stories.html`, add:
```html
<span class="detail-meta-item" id="detail-last-updated"></span>
```

- [ ] **Step 6: Regenerate shards and run tests**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 7: Commit**

```bash
git add data/datasets/ data/sharded/ js/creatures-viewer.js js/stories-viewer.js bestiary.html stories.html scripts/add-version-dates.js
git commit -m "feat: add date-stamped versioning to all entries"
```

---

### Task 6: Global quiz expansion

**Files:**
- Create: `scripts/generate-quiz-questions.js` (automated question generation from creature data)
- Modify: `data/quiz-pool/` across all 6 levels (new JSON question files + updated index.json)
- Modify: `tests/` (update quiz pool tests)

- [ ] **Step 1: Write quiz generation script**

```javascript
// scripts/generate-quiz-questions.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quiz-pool');

const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Question templates by difficulty
const templates = {
  1: [ // Easy: basic identification
    { prompt: (c) => `Which country is the ${c.name} from?`,
      makeChoices: (c, pool) => {
        const correct = c.country;
        const wrong = pool.filter(p => p.country !== correct).map(p => p.country);
        const shuffled = [correct, ...shuffle(wrong).slice(0, 3)];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    },
    { prompt: (c) => `What type of creature is a ${c.name}?`,
      makeChoices: (c, pool) => {
        const correct = c.type;
        const wrong = pool.filter(p => p.type !== correct).map(p => p.type);
        const distinct = [...new Set(wrong)].slice(0, 3);
        const shuffled = [correct, ...distinct];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    }
  ],
  2: [ // Easy-Medium: region + tradition
    { prompt: (c) => `Which region does the ${c.name} come from?`,
      makeChoices: (c, pool) => {
        const correct = c.region || 'Unknown';
        const wrong = pool.filter(p => p.region !== correct).map(p => p.region);
        const distinct = [...new Set(wrong)].slice(0, 3);
        if (distinct.length < 3) return null;
        const shuffled = [correct, ...distinct];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    }
  ],
  3: [ // Medium: habitat, behavior
    { prompt: (c) => `Where is a ${c.name} said to dwell?`,
      makeChoices: (c, pool) => {
        const correct = c.habitat && c.habitat.length > 10 ? c.habitat.slice(0, 60) : 'Forests and wilderness';
        const wrong = pool.filter(p => p.habitat && p.habitat !== c.habitat).map(p => p.habitat);
        const distinct = [...new Set(wrong)].filter(h => h && h.length > 5).slice(0, 3);
        if (distinct.length < 3) return null;
        const shuffled = [correct, ...distinct];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    }
  ],
  4: [ // Medium-Hard: appearance or behavior
    { prompt: (c) => `How is a ${c.name} described?`,
      makeChoices: (c, pool) => {
        const correct = c.appearance && c.appearance.length > 15 ? c.appearance.slice(0, 80) : null;
        if (!correct) return null;
        const wrong = pool.filter(p => p.appearance && p.appearance !== c.appearance).map(p => p.appearance);
        const distinct = [...new Set(wrong)].filter(a => a && a.length > 10).slice(0, 3);
        if (distinct.length < 3) return null;
        const shuffled = [correct, ...distinct];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    }
  ],
  5: [ // Hard: cultural significance
    { prompt: (c) => `What cultural significance does the ${c.name} hold?`,
      makeChoices: (c, pool) => {
        if (!c.cultural_significance || c.cultural_significance.length < 15) return null;
        const correct = c.cultural_significance.slice(0, 80);
        const wrong = pool.filter(p => p.cultural_significance && p.cultural_significance !== c.cultural_significance).map(p => p.cultural_significance);
        const distinct = [...new Set(wrong)].filter(s => s && s.length > 10).slice(0, 3);
        if (distinct.length < 3) return null;
        const shuffled = [correct, ...distinct];
        return { choices: shuffle(shuffled), correctIndex: shuffled.indexOf(correct) };
      }
    }
  ],
  6: [ // Expert: true/false statements + sub-question
    { prompt: (c) => `True or false: The ${c.name} is from ${c.country}.`,
      isTrueFalse: true,
      correctBool: true,
      sub_question: { prompt: (c) => `The ${c.name} is a type of ${c.type}.`, true_is_correct: true }
    },
    { prompt: (c) => `True or false: The ${c.name} primarily dwells in ${c.habitat ? c.habitat.split(/[,.]/)[0].trim() : 'the wilderness'}.`,
      isTrueFalse: true,
      correctBool: true,
      sub_question: { prompt: (c) => `The ${c.name} is native to ${c.region || 'its region'}.`, true_is_correct: true }
    }
  ]
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Group creatures by region for balanced coverage
const byRegion = {};
creatures.forEach(c => {
  const region = c.region || 'Unknown';
  if (!byRegion[region]) byRegion[region] = [];
  byRegion[region].push(c);
});

const regions = Object.keys(byRegion);
let questionId = 0;
const questions = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

// Generate questions per region
Object.entries(byRegion).forEach(([region, pool]) => {
  const shuffled = shuffle(pool);
  const targetPerRegion = Math.max(2, Math.floor(shuffled.length / 30));

  shuffled.slice(0, targetPerRegion).forEach(c => {
    [1, 2, 3, 4, 5, 6].forEach(level => {
      (templates[level] || []).forEach(tmpl => {
        if (tmpl.isTrueFalse) {
          // Level 6 true/false format
          questionId++;
          questions[level].push({
            id: `q-auto-${questionId}`,
            type: 'creatures',
            prompt: tmpl.prompt(c),
            choices: ['True', 'False'],
            correctIndex: tmpl.correctBool ? 0 : 1,
            extra: {
              geo: { country: c.country, region: c.region },
              trueFalse: {
                prompt: tmpl.sub_question.prompt(c),
                answer: tmpl.sub_question.true_is_correct
              }
            }
          });
          return;
        }
        const result = tmpl.makeChoices(c, creatures);
        if (!result) return;
        questionId++;
        const question = {
          id: `q-auto-${questionId}`,
          type: 'creatures',
          prompt: tmpl.prompt(c),
          choices: result.choices,
          correctIndex: result.correctIndex,
          extra: {
            geo: { country: c.country, region: c.region }
          }
        };
        questions[level].push(question);
      });
    });
  });
});

// Write questions to quiz-pool
[1, 2, 3, 4, 5, 6].forEach(level => {
  const dir = path.join(QUIZ_DIR, `level${level}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const existing = (questions[level] || []);
  // Write in batches of 5 per file
  const files = [];
  for (let i = 0; i < existing.length; i += 5) {
    const batch = existing.slice(i, i + 5);
    const fn = `auto-${level}-${Math.floor(i/5) + 1}.json`;
    fs.writeFileSync(path.join(dir, fn), JSON.stringify(batch, null, 2), 'utf-8');
    files.push(fn);
  }
  // Write index.json
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(files, null, 2), 'utf-8');
  console.log(`Level ${level}: ${existing.length} questions (${files.length} files)`);
});

console.log('Total auto-generated questions:', questionId);
```

- [ ] **Step 2: Run the generator**

```bash
node scripts/generate-quiz-questions.js
```

Expected: generates 100+ questions across levels 1-5, balanced by region.

- [ ] **Step 3: Run quiz tests**

```bash
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000 -g "quiz"
```

Expected: quiz pool test passes with larger pool.

- [ ] **Step 4: Manual quality check**

```bash
node -e "
const fs = require('fs');
const path = require('path');
[1,2,3,4,5,6].forEach(level => {
  const dir = path.join('data/quiz-pool', 'level' + level);
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf-8'));
  console.log('Level', level, 'files:', index.length);
  let total = 0;
  index.forEach(fn => {
    const qs = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf-8'));
    total += Array.isArray(qs) ? qs.length : 1;
  });
  console.log('  Total questions:', total);
});
"
```

- [ ] **Step 5: Run full test suite**

```bash
npx playwright test tests/e2e/ --timeout 30000
```

- [ ] **Step 6: Commit**

```bash
git add data/quiz-pool/ scripts/generate-quiz-questions.js
git commit -m "feat: expand quiz pool to 100+ global questions"
```

---

### Task 7: Source quality badges

**Files:**
- Modify: `js/creatures-viewer.js` (render source quality badge)
- Modify: `css/styles.css` (badge styles)
- Modify: `bestiary.html` (add badge placeholder)

- [ ] **Step 1: Add badge styles to CSS**

In `css/styles.css`, add:

```css
.source-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid;
  border-radius: 2px;
  margin-left: 0.5rem;
}
.source-badge--verified {
  color: #22c55e;
  border-color: #22c55e;
}
.source-badge--literary {
  color: #3b82f6;
  border-color: #3b82f6;
}
.source-badge--unknown {
  color: var(--text-secondary);
  border-color: var(--border);
}
```

- [ ] **Step 2: Add badge placeholder to detail view**

In `bestiary.html`, find `<span class="detail-meta-item" id="detail-region"></span>` and add after it:
```html
<span class="detail-meta-item"><span id="detail-source-badge"></span></span>
```

- [ ] **Step 3: Render badge in creature detail**

In `js/creatures-viewer.js`, in the function that populates detail meta, add:

```javascript
const badgeEl = document.getElementById('detail-source-badge');
if (badgeEl && creature.source_quality) {
  const sq = creature.source_quality;
  const label = sq.charAt(0).toUpperCase() + sq.slice(1);
  const cls = 'source-badge source-badge--' + sq;
  badgeEl.innerHTML = '<span class="' + cls + '">' + label + '</span>';
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/cross-check.spec.js --timeout 30000
```

- [ ] **Step 5: Commit**

```bash
git add js/creatures-viewer.js css/styles.css bestiary.html
git commit -m "feat: add source quality badges to creature detail view"
```

---

### Task 8: Fix region inconsistencies

**Files:**
- Create: `scripts/normalize-regions.js`
- Modify: `data/datasets/creatures.json`
- Modify: `data/datasets/stories.json`

- [ ] **Step 1: Write the normalization script**

```javascript
// scripts/normalize-regions.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');

const canonical = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'geo-regions.json'), 'utf-8'));
const canonicalSet = new Set(canonical);

// Aliases that map to canonical names
const aliases = {
  'East Asia and Pacific': 'Pacific',
  'East Asian': 'East Asia',
  'Middle Eastern': 'Middle East',
  'North America': 'Northern America',
  'South America': 'Southern America',
  'Central America': 'Central America',
  'Latin America': 'South America',
  'Mesoamerican': 'Central America',
  'Sub-Saharan Africa': 'Sub-Saharan Africa',
  'North Africa': 'Northern Africa',
};

const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));
const stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));

let creatureFixes = 0;
let storyFixes = 0;

const normalize = (val) => {
  if (!val) return val;
  if (canonicalSet.has(val)) return val;
  if (aliases[val]) {
    creatureFixes++;
    return aliases[val];
  }
  // Fuzzy match: find closest canonical name
  for (const c of canonical) {
    if (c.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(c.toLowerCase())) {
      creatureFixes++;
      return c;
    }
  }
  console.warn('No mapping for region:', val);
  return val;
};

creatures.forEach(c => {
  if (c.region) c.region = normalize(c.region);
});

stories.forEach(s => {
  if (s.region) s.region = normalize(s.region);
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'stories.json'), JSON.stringify(stories, null, 2), 'utf-8');
console.log('Creature fixes:', creatureFixes, 'Story fixes:', storyFixes);
```

- [ ] **Step 2: Run the script**

```bash
node scripts/normalize-regions.js
```
Expected: reports creatureFixes + storyFixes.

- [ ] **Step 3: Verify no invalid regions remain**

```bash
node -e "
const c = require('./data/datasets/creatures.json');
const canonical = require('./data/datasets/geo-regions.json');
const set = new Set(canonical);
const bad = c.filter(e => e.region && !set.has(e.region));
console.log('Invalid creature regions:', bad.length);
bad.forEach(e => console.log('  ' + e.slug + ': ' + e.region));

const s = require('./data/datasets/stories.json');
const badSt = s.filter(e => e.region && !set.has(e.region));
console.log('Invalid story regions:', badSt.length);
badSt.forEach(e => console.log('  ' + e.id + ': ' + e.region));
"
```
Expected: 0 invalid regions.

- [ ] **Step 4: Regenerate shards and run tests**

```bash
node scripts/regenerate-shards.js
npx jest --testPathIgnorePatterns='tests/e2e/'
npx playwright test tests/e2e/ --timeout 30000
```

- [ ] **Step 5: Commit**

```bash
git add data/datasets/creatures.json data/datasets/stories.json data/sharded/ scripts/normalize-regions.js
git commit -m "fix: normalize region values to canonical set"
```
