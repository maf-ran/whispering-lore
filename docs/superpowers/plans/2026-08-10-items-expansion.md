# Items Expansion to ~670 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow `data/items.json` from 319 to ~670 items (~350 new) across the Americas, Africa, South Asia, Oceania, and Eastern Europe/Baltic/Arctic; extend the type taxonomy; release v1.2.0 with a fresh Zenodo DOI.

**Architecture:** Five per-region research phases, each a staged batch through the existing `research_items_phase1.py` pipeline (dedup → validate → stage → apply with genuine back-references), then `shard-data.mjs` regeneration, jest + chromium e2e gates, and a commit per phase. A taxonomy task (Task 1) unblocks the new types before any batch apply. Final phase wraps with sw bump, README counts, and v1.2.0 tag/DOI.

**Tech Stack:** Python 3 (research pipeline), Node.js (shard generation, jest), Playwright (chromium e2e), git.

**Spec:** `docs/superpowers/specs/2026-08-10-items-expansion.md`

---

## Task 1: Extend the type taxonomy

Unlocks the 4 new types so later batch applies validate. Touch three surfaces: the Python pipeline `ALLOWED_TYPES`, the jest `ALLOWED_TYPES`, and the schema doc.

**Files:**
- Modify: `archive/scripts/research_items_phase1.py:46-51`
- Modify: `tests/items-data.test.js:23`
- Modify: `docs/items-schema.md` (Type section)

- [ ] **Step 1: Update the Python pipeline allowed types**

In `archive/scripts/research_items_phase1.py`, replace the `ALLOWED_TYPES` set:

```python
ALLOWED_TYPES = {
    'weapon', 'jewelry', 'ship', 'garment', 'tool',
    'household object', 'ritual object', 'rune stave',
    'musical instrument', 'other',
    'religious object', 'crown', 'cooking vessel', 'container',
}
```

- [ ] **Step 2: Update the jest allowed types**

In `tests/items-data.test.js:23`, replace the `ALLOWED_TYPES` array:

```js
const ALLOWED_TYPES = ['weapon', 'jewelry', 'ship', 'garment', 'tool', 'household object', 'ritual object', 'rune stave', 'musical instrument', 'other', 'religious object', 'crown', 'cooking vessel', 'container'];
```

- [ ] **Step 3: Update the schema doc**

In `docs/items-schema.md`, replace the Type line with the 14-type list:

```markdown
`weapon`, `jewelry`, `ship`, `garment`, `tool`, `household object`, `ritual object`, `rune stave`, `musical instrument`, `other`, `religious object`, `crown`, `cooking vessel`, `container`
```

- [ ] **Step 4: Run jest**

Run: `npx jest tests/items-data.test.js`
Expected: PASS (all items-data tests green; the current 319 items only use the original 10 types, so this is a no-op assertion change)

- [ ] **Step 5: Commit**

```bash
git add archive/scripts/research_items_phase1.py tests/items-data.test.js docs/items-schema.md
git commit -m "feat(items): extend type taxonomy with religious object, crown, cooking vessel, container (G5)"
```

---

## Task 2: Update the research guide with Phase 3 batches

Keeps `archive/scripts/expansions/items/guide.md` authoritative for future batch work: add the new batch-number ranges and the Phase 3 country/region reference.

**Files:**
- Modify: `archive/scripts/expansions/items/guide.md`

- [ ] **Step 1: Update the id/batch-number paragraph**

In `guide.md`, replace the `id` field-rule bullet (the one listing batch-1..batch-8 ranges) with:

```markdown
- `id`: unique; pattern `<slug>-NNNN` (4-digit). Batch numbering: batch-1 = `02xx`, batch-2 = `03xx`, batch-3 = `04xx`, batch-4 = `05xx`, batch-5 = `06xx`, batch-6 = `07xx`, batch-7 = `08xx`, batch-8 = `09xx`, batch-9 = `10xx`, batch-10 = `11xx`, batch-11 = `12xx`. Phase 3 (gap regions): batch-12 = `13xx` Americas, batch-13 = `14xx` Africa, batch-14 = `15xx` South Asia, batch-15 = `16xx` Oceania, batch-16 = `17xx` Eastern Europe/Baltic/Arctic.
```

- [ ] **Step 2: Append the Phase 3 region/country reference section**

Append to the end of `guide.md`:

```markdown
## Country / region reference (Phase 3 — gap regions)

- **13xx Americas** — Countries: `Mexico`, `Guatemala`, `United States`, `Canada`, `Peru`, `Brazil`, `Argentina`, `Chile`, `Bolivia`, `Colombia`, `Venezuela`, `Ecuador`, `Haiti`, `Cuba`, `Puerto Rico`, `Jamaica`, `Greenland`, `Honduras`, `Panama`, `Costa Rica`, `Uruguay`, `Paraguay`. Regions: `Mesoamerica`, `North America`, `South America`, `Caribbean`, `Amazonian`, `Arctic`, `Latin America and Caribbean`, `Americas`, `Andean`.
- **14xx Africa** — Countries: `Nigeria`, `Ghana`, `Kenya`, `South Africa`, `Zimbabwe`, `Ethiopia`, `Senegal`, `Mali`, `Benin`, `Ivory Coast`, `Congo`, `Tanzania`, `Uganda`, `Rwanda`, `Madagascar`, `Zambia`, `Malawi`, `Mozambique`, `Angola`, `Cameroon`, `Niger`, `Chad`, `Sudan`, `Somalia`, `Morocco`, `Algeria`, `Tunisia`, `Egypt`. Regions: `West Africa`, `East Africa`, `Central Africa`, `Southern Africa`, `Sub-Saharan Africa`, `North Africa`, `African`, `World`.
- **15xx South Asia** — Countries: `India`, `Sri Lanka`, `Pakistan`, `Nepal`, `Bangladesh`, `Bhutan`, `Afghanistan`. Regions: `South Asia`, `Asia`, `Himalayan`.
- **16xx Oceania** — Countries: `Australia`, `New Zealand`, `Fiji`, `Papua New Guinea`, `Samoa`, `Tonga`, `Hawaii`, `Solomon Islands`, `Vanuatu`, `Cook Islands`, `French Polynesia`, `Tuvalu`, `Nauru`, `Palau`, `Micronesia`, `Marshall Islands`. Regions: `Oceania`, `Pacific`, `Aboriginal`, `Polynesia`.
- **17xx Eastern Europe / Baltic / Arctic** — Countries: `Russia`, `Ukraine`, `Belarus`, `Lithuania`, `Latvia`, `Estonia`, `Poland`, `Romania`, `Bulgaria`, `Hungary`, `Czech Republic`, `Georgia`, `Armenia`, `Azerbaijan`, `Kazakhstan`, `Russia (Tatarstan)`, `Russia (Sakha Republic)`, `Russia (Buryatia)`, `Russia (Tuva)`, `Russia (Siberia)`. Regions: `Slavic`, `Baltic`, `Arctic`, `Caucasus`, `Central Asia`, `Eastern Europe`, `Northern Europe`, `Europe`.
```

> Verify every country/region string against `data/datasets/geo-countries.json` / `geo-regions.json` before finalizing this section — exact match required.

- [ ] **Step 3: Commit**

```bash
git add archive/scripts/expansions/items/guide.md
git commit -m "docs(items): Phase 3 batch ranges + gap-region reference in research guide (G5)"
```

---

## Task 3: Create ref files for cross-link verification

Each Phase 3 area gets a `ref-<area>.txt` (mirroring the existing `ref-celtic.txt` pattern) listing verified creature/story slugs available for `related_creatures` / `featured_in_stories`. These prevent speculative linking during research.

**Files:**
- Create: `archive/scripts/expansions/items/ref-americas.txt`
- Create: `archive/scripts/expansions/items/ref-africa.txt`
- Create: `archive/scripts/expansions/items/ref-south-asia.txt`
- Create: `archive/scripts/expansions/items/ref-oceania.txt`
- Create: `archive/scripts/expansions/items/ref-eastern-europe.txt`

- [ ] **Step 1: Verify slugs exist, then write ref files**

Run the following (adjust the query slugs per area) to confirm slugs exist before writing:

```bash
node -e "const c=require('./data/datasets/creatures.json').map(x=>x.slug); const s=require('./data/datasets/stories.json').map(x=>x.slug); const want=['quetzalcoatl','kukulkanplumedserpent-mexico','curupira','la-llorona-the-weeping-woman','wendigo','adlet-greenland','mami-wata','tikoloshe-or-tokoloshe','taniwha','bunyip','yowie']; const all=[...c,...s]; want.forEach(w=>console.log(w, all.includes(w)?'OK':'MISSING'));"
```

Each `ref-<area>.txt` lists **verified** creature and story slugs, grouped by country where helpful, e.g.:

```text
# ref-americas.txt — verified creature/story slugs (Americas)
# Generated 2026-08-10. Only add slugs confirmed present in
# data/datasets/creatures.json / stories.json.

CREATURES
quetzalcoatl            # Mexico (Aztec feathered serpent)
kukulkanplumedserpent-mexico
la-llorona-the-weeping-woman
wendigo                 # US/Canada (Algonquian)
adlet-greenland         # Greenland (Inuit)
curupira                # Brazil (Amazonian forest spirit)

STORIES
the-first-corn          # Mexico (Maya/Nahua corn myth)
the-legend-of-lake-titicaca  # Peru
```

Use the pipeline query pattern from Step 1 against each area's candidate slugs to confirm existence. **Never** list a slug that does not resolve.

- [ ] **Step 2: Verify ref files only contain resolving slugs**

```bash
node -e "const fs=require('fs'); const c=new Set(require('./data/datasets/creatures.json').map(x=>x.slug)); const s=new Set(require('./data/datasets/stories.json').map(x=>x.slug)); require('fs').readdirSync('archive/scripts/expansions/items').filter(f=>/^ref-.*\.txt$/.test(f)).forEach(f=>{ const inC=[],inS=[],other=[]; fs.readFileSync('archive/scripts/expansions/items/'+f,'utf8').split(/\n/).forEach(l=>{ l=l.trim(); if(!l||l.startsWith('#')||l.startsWith('STORIES')||l.startsWith('CREATURES'))return; const slug=l.split(/\s+/)[0]; if(c.has(slug))inC.push(slug); else if(s.has(slug))inS.push(slug); else other.push(slug); }); console.log(f, 'creatures',inC.length,'stories',inS.length,'MISSING',other); });"
```

Expected: every file reports `MISSING []`.

- [ ] **Step 3: Commit**

```bash
git add archive/scripts/expansions/items/ref-*.txt
git commit -m "docs(items): verified cross-link ref files for Phase 3 gap regions (G5)"
```

---

## Task 4: Americas batch (`13xx`, ~80 items)

The first data phase. Full research → staged-apply cycle. This is the template for all later phases.

**Files:**
- Create: `archive/scripts/expansions/items/batch-13xx-americas.json`
- Modify (via pipeline): `data/items.json`, `data/datasets/creatures.json`, `data/datasets/stories.json`
- Regenerate: `data/sharded/**`

- [ ] **Step 1: Research + draft the batch**

Draft ~80 item objects across Mesoamerica, North America, South America, the Caribbean, and the Arctic. Follow `archive/scripts/expansions/items/guide.md` field rules exactly. Real, well-attested examples to seed the batch (verify against sources; do not fabricate):

```json
[
  {
    "id": "tezcatlipoca-smoking-mirror-1301",
    "slug": "tezcatlipoca-smoking-mirror",
    "name": "Tezcatlipoca's Smoking Mirror",
    "aliases": ["Tezcatlipoca", "Obsidian Mirror"],
    "country": "Mexico",
    "region": "Mesoamerica",
    "culture": "Aztec (Nahua)",
    "type": "religious object",
    "material": "Obsidian",
    "era": "Postclassic (Aztec)",
    "maker": null,
    "powers": "Reveals hidden truths and the fates of kings; the god Tezcatlipoca is said to see through it.",
    "associated_creature": null,
    "description": "A round obsidian mirror carried by the Aztec god Tezcatlipoca, whose name means 'Smoking Mirror'. Priests and rulers consulted such mirrors for divination, and the god was believed to see everything that happened in the world reflected in the polished stone. Obsidian mirrors from the Aztec period survive in museum collections, including one long held in the British Museum and associated with the antiquarian Edward King.",
    "related_creatures": [],
    "featured_in_stories": [],
    "source": "Florentine Codex; British Museum collections (ethnography)",
    "source_type": "secondary_scholarly",
    "source_quality": "expert",
    "attested": true,
    "keywords": ["obsidian", "mirror", "tezcatlipoca", "aztec", "divination"],
    "search_terms": ["smoking mirror", "tezcatlipoca", "obsidian mirror", "aztec mirror"],
    "version": "1.0.0",
    "lastUpdated": "2026-08-10"
  },
  {
    "id": "maori-...",
    "slug": "…",
    "name": "…",
    "country": "…",
    "region": "…",
    "culture": "…",
    "type": "…",
    "material": "…",
    "era": "…",
    "maker": null,
    "powers": "…",
    "associated_creature": null,
    "description": "150–400 char concrete description…",
    "related_creatures": [],
    "featured_in_stories": [],
    "source": "…",
    "source_type": "…",
    "source_quality": "…",
    "attested": true,
    "keywords": [],
    "search_terms": [],
    "version": "1.0.0",
    "lastUpdated": "2026-08-10"
  }
]
```

Guidelines:
- One item per folklore object/artifact. Spread across `Mesoamerica`, `North America` (incl. First Nations), `South America`, `Caribbean`, `Arctic`/Inuit.
- Use the **new types** where they fit (`religious object`, `crown`, `cooking vessel`, `container`) — this phase is the first real consumer of Task 1.
- `associated_creature` / `related_creatures` only from `ref-americas.txt`. `featured_in_stories` only from verified story slugs.
- `attested: true` only with a named source; `false`/`null` for legend-only material with honest wording.

- [ ] **Step 2: Dedup check**

Run: `python3 archive/scripts/research_items_phase1.py dedup archive/scripts/expansions/items/batch-13xx-americas.json`
Expected: `no dedup collisions` (exit 0). If collisions print, rename the conflicting slug/alias/search_term.

- [ ] **Step 3: Validate**

Run: `python3 archive/scripts/research_items_phase1.py validate archive/scripts/expansions/items/batch-13xx-americas.json`
Expected: `-> 0 error(s)`. Fix all errors (wrong geo values, unresolved cross-links, bad types, missing fields).

- [ ] **Step 4: Stage + review**

Run: `python3 archive/scripts/research_items_phase1.py stage archive/scripts/expansions/items/batch-13xx-americas.json`
Expected: `staged ~80 items -> data/items.staged.json (total ~399)`.

Inspect `data/items.staged.json` for quality: descriptions concrete, no boilerplate, cross-links genuine, attestation honest.

- [ ] **Step 5: Apply (with back-references)**

Run: `python3 archive/scripts/research_items_phase1.py apply archive/scripts/expansions/items/batch-13xx-americas.json`
Expected: `merged -> data/items.json (total ~399)`; back-references added to creatures.json/stories.json.

- [ ] **Step 6: Rebuild shards + manifest**

Run: `node archive/scripts/shard-data.mjs`
Expected: manifest totals updated; item by-slug batches and by-region shards regenerated; no errors.

- [ ] **Step 7: Run jest**

Run: `npx jest`
Expected: 172/172 PASS (items-data tests re-validate the whole dataset against the new types).

- [ ] **Step 8: Run chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS (item counts are data-driven and self-adapt).

- [ ] **Step 9: Commit**

```bash
git add archive/scripts/expansions/items/batch-13xx-americas.json data/items.json data/datasets/creatures.json data/datasets/stories.json data/sharded
git commit -m "feat(items): Phase 3 Americas batch (~80 items, 13xx) (G5)"
```

---

## Task 5: Africa batch (`14xx`, ~70 items)

**Files:**
- Create: `archive/scripts/expansions/items/batch-14xx-africa.json`
- Modify (via pipeline): `data/items.json`, `data/datasets/creatures.json`, `data/datasets/stories.json`
- Regenerate: `data/sharded/**`

- [ ] **Step 1: Research + draft the batch**

~70 items across West, East, Central, Southern, and North Africa. Use `ref-africa.txt` for cross-links. Cover: Yoruba/Igbo ritual objects (Nigeria), Akan goldweights and royal regalia (Ghana), Ashanti stools, Maasai beadwork (Kenya), Zulu items (South Africa), Zimbabwean artifacts, Ethiopian religious objects, Dogon (Mali), Vodun objects (Benin), Egyptian items already exist (avoid dupes). Same field rules as Task 4; use new types where they fit.

- [ ] **Step 2: Dedup check**

Run: `python3 archive/scripts/research_items_phase1.py dedup archive/scripts/expansions/items/batch-14xx-africa.json`
Expected: `no dedup collisions` (exit 0).

- [ ] **Step 3: Validate**

Run: `python3 archive/scripts/research_items_phase1.py validate archive/scripts/expansions/items/batch-14xx-africa.json`
Expected: `-> 0 error(s)`.

- [ ] **Step 4: Stage + review**

Run: `python3 archive/scripts/research_items_phase1.py stage archive/scripts/expansions/items/batch-14xx-africa.json`
Expected: `staged ~70 items -> data/items.staged.json (total ~469)`.

- [ ] **Step 5: Apply**

Run: `python3 archive/scripts/research_items_phase1.py apply archive/scripts/expansions/items/batch-14xx-africa.json`
Expected: `merged -> data/items.json (total ~469)`.

- [ ] **Step 6: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`
Expected: manifest totals updated; no errors.

- [ ] **Step 7: Run jest**

Run: `npx jest`
Expected: 172/172 PASS.

- [ ] **Step 8: Run chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS.

- [ ] **Step 9: Commit**

```bash
git add archive/scripts/expansions/items/batch-14xx-africa.json data/items.json data/datasets/creatures.json data/datasets/stories.json data/sharded
git commit -m "feat(items): Phase 3 Africa batch (~70 items, 14xx) (G5)"
```

---

## Task 6: South Asia batch (`15xx`, ~50 items)

**Files:**
- Create: `archive/scripts/expansions/items/batch-15xx-south-asia.json`
- Modify (via pipeline): `data/items.json`, `data/datasets/creatures.json`, `data/datasets/stories.json`
- Regenerate: `data/sharded/**`

- [ ] **Step 1: Research + draft the batch**

~50 items across India, Sri Lanka, Pakistan, Nepal, Bangladesh, Bhutan, Afghanistan. Use `ref-south-asia.txt`. Cover: Hindu mythic items (Sudarshana Chakra, Vishnu's mace Kaumodaki, Shiva's trident Trishula), Buddhist relics, Sikh religious objects, Nepalese/Tibetan (khukuri, prayer items), Sri Lankan (Buddha's tooth relic, etc.). **Check existing items first** — Persian/MENA/East Asian items already exist; avoid name collisions (dedup catches these).

- [ ] **Step 2: Dedup check**

Run: `python3 archive/scripts/research_items_phase1.py dedup archive/scripts/expansions/items/batch-15xx-south-asia.json`
Expected: `no dedup collisions` (exit 0).

- [ ] **Step 3: Validate**

Run: `python3 archive/scripts/research_items_phase1.py validate archive/scripts/expansions/items/batch-15xx-south-asia.json`
Expected: `-> 0 error(s)`.

- [ ] **Step 4: Stage + review**

Run: `python3 archive/scripts/research_items_phase1.py stage archive/scripts/expansions/items/batch-15xx-south-asia.json`
Expected: `staged ~50 items -> data/items.staged.json (total ~519)`.

- [ ] **Step 5: Apply**

Run: `python3 archive/scripts/research_items_phase1.py apply archive/scripts/expansions/items/batch-15xx-south-asia.json`
Expected: `merged -> data/items.json (total ~519)`.

- [ ] **Step 6: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`
Expected: manifest totals updated; no errors.

- [ ] **Step 7: Run jest**

Run: `npx jest`
Expected: 172/172 PASS.

- [ ] **Step 8: Run chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS.

- [ ] **Step 9: Commit**

```bash
git add archive/scripts/expansions/items/batch-15xx-south-asia.json data/items.json data/datasets/creatures.json data/datasets/stories.json data/sharded
git commit -m "feat(items): Phase 3 South Asia batch (~50 items, 15xx) (G5)"
```

---

## Task 7: Oceania batch (`16xx`, ~40 items)

**Files:**
- Create: `archive/scripts/expansions/items/batch-16xx-oceania.json`
- Modify (via pipeline): `data/items.json`, `data/datasets/creatures.json`, `data/datasets/stories.json`
- Regenerate: `data/sharded/**`

- [ ] **Step 1: Research + draft the batch**

~40 items across Australia (Aboriginal), New Zealand (Māori), Melanesia, Polynesia, and Micronesia. Use `ref-oceania.txt`. Cover: Māori taonga (mere pounamu, tiki, waka), Aboriginal songlines/song-sticks, didgeridoo, coolamons, Polynesian navigation artifacts, Samoan siapo, Tongan items, Fijian weapons, Hawaiian feather cloaks.

- [ ] **Step 2: Dedup check**

Run: `python3 archive/scripts/research_items_phase1.py dedup archive/scripts/expansions/items/batch-16xx-oceania.json`
Expected: `no dedup collisions` (exit 0).

- [ ] **Step 3: Validate**

Run: `python3 archive/scripts/research_items_phase1.py validate archive/scripts/expansions/items/batch-16xx-oceania.json`
Expected: `-> 0 error(s)`.

- [ ] **Step 4: Stage + review**

Run: `python3 archive/scripts/research_items_phase1.py stage archive/scripts/expansions/items/batch-16xx-oceania.json`
Expected: `staged ~40 items -> data/items.staged.json (total ~559)`.

- [ ] **Step 5: Apply**

Run: `python3 archive/scripts/research_items_phase1.py apply archive/scripts/expansions/items/batch-16xx-oceania.json`
Expected: `merged -> data/items.json (total ~559)`.

- [ ] **Step 6: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`
Expected: manifest totals updated; no errors.

- [ ] **Step 7: Run jest**

Run: `npx jest`
Expected: 172/172 PASS.

- [ ] **Step 8: Run chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS.

- [ ] **Step 9: Commit**

```bash
git add archive/scripts/expansions/items/batch-16xx-oceania.json data/items.json data/datasets/creatures.json data/datasets/stories.json data/sharded
git commit -m "feat(items): Phase 3 Oceania batch (~40 items, 16xx) (G5)"
```

---

## Task 8: Eastern Europe / Baltic / Arctic batch (`17xx`, ~110 items)

**Files:**
- Create: `archive/scripts/expansions/items/batch-17xx-eastern-europe.json`
- Modify (via pipeline): `data/items.json`, `data/datasets/creatures.json`, `data/datasets/stories.json`
- Regenerate: `data/sharded/**`

- [ ] **Step 1: Research + draft the batch**

~110 items across Slavic, Baltic, Caucasus, and Arctic peoples. Use `ref-eastern-europe.txt`. Cover: Russian/Slavic (Koschei's needle, Baba Yaga's mortar/pestle, Ivan's firebird feather), Ukrainian (rushnyk, pysanka), Baltic (Latvian Laima distaff, Estonian), Polish (Szczerbiec already exists — dedup will flag), Romanian/Carpathian, Hungarian, Caucasus (Georgian, Armenian, Azerbaijani), Tatar, Yakut/Sakha, Buryat, Tuvan, Siberian/Nenets. **Existing `szczerbiec` item already exists** — do not duplicate.

- [ ] **Step 2: Dedup check**

Run: `python3 archive/scripts/research_items_phase1.py dedup archive/scripts/expansions/items/batch-17xx-eastern-europe.json`
Expected: `no dedup collisions` (exit 0).

- [ ] **Step 3: Validate**

Run: `python3 archive/scripts/research_items_phase1.py validate archive/scripts/expansions/items/batch-17xx-eastern-europe.json`
Expected: `-> 0 error(s)`.

- [ ] **Step 4: Stage + review**

Run: `python3 archive/scripts/research_items_phase1.py stage archive/scripts/expansions/items/batch-17xx-eastern-europe.json`
Expected: `staged ~110 items -> data/items.staged.json (total ~669)`.

- [ ] **Step 5: Apply**

Run: `python3 archive/scripts/research_items_phase1.py apply archive/scripts/expansions/items/batch-17xx-eastern-europe.json`
Expected: `merged -> data/items.json (total ~669)`.

- [ ] **Step 6: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`
Expected: manifest totals updated; no errors.

- [ ] **Step 7: Run jest**

Run: `npx jest`
Expected: 172/172 PASS.

- [ ] **Step 8: Run chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS.

- [ ] **Step 9: Commit**

```bash
git add archive/scripts/expansions/items/batch-17xx-eastern-europe.json data/items.json data/datasets/creatures.json data/datasets/stories.json data/sharded
git commit -m "feat(items): Phase 3 Eastern Europe/Baltic/Arctic batch (~110 items, 17xx) (G5)"
```

---

## Task 9: Final counts verification + docs

After all five batches, confirm the dataset totals and refresh the user-facing count surfaces.

**Files:**
- Modify: `README.md`
- Modify: `data/research-history.md`
- Modify: `todos.md`

- [ ] **Step 1: Verify final counts**

Run: `node -e "const i=require('./data/items.json'); console.log('items:', i.length); const byType={}; i.forEach(x=>byType[x.type]=(byType[x.type]||0)+1); console.log(byType);"` plus region counts:

```bash
node -e "const i=require('./data/items.json'); const r={}; i.forEach(x=>r[x.region]=(r[x.region]||0)+1); Object.entries(r).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(v,k));"
```

Expected: total ~669; Americas/Africa/South Asia/Oceania/Eastern Europe regions now nonzero.

- [ ] **Step 2: Update README count**

Update the Artifacts row in `README.md` (e.g. `319` → the actual final count from Step 1). Match the existing format used by other dataset rows.

- [ ] **Step 3: Log the research**

Append a dated section to `data/research-history.md` covering the five Phase 3 batches (counts, regions, dates, commit range).

- [ ] **Step 4: Tick todos**

In `todos.md`, mark the G5 items-expansion tasks complete.

- [ ] **Step 5: Commit**

```bash
git add README.md data/research-history.md todos.md
git commit -m "docs(items): Phase 3 expansion complete (~669 items), update counts (G5)"
```

---

## Task 10: Service worker bump + final check

Bump the sw cache so clients pick up the new shard set, and run the full verification gate.

**Files:**
- Modify: `sw.js:1`

- [ ] **Step 1: Bump cache version**

In `sw.js:1`, change:

```js
const CACHE_NAME = "whisperinglore-v1_0_15"
```

to:

```js
const CACHE_NAME = "whisperinglore-v1_0_16"
```

(Use the next available version — check the current value first; if the tree has moved past v1_0_15, bump to one past the latest.)

- [ ] **Step 2: Full jest**

Run: `npx jest`
Expected: 172/172 PASS.

- [ ] **Step 3: Full chromium e2e**

Run: `npx playwright test --project=chromium`
Expected: 414/414 PASS.

- [ ] **Step 4: Lint changed files**

Run: `npx eslint sw.js` (and any other JS changed during G5).
Expected: no new errors beyond any pre-existing baseline.

- [ ] **Step 5: Commit**

```bash
git add sw.js
git commit -m "chore(sw): bump cache to v1_0_16 for Phase 3 items expansion (G5)"
```

---

## Task 11: Release v1.2.0 (Zenodo)

Tag and push; the workflow mints a fresh Zenodo deposition (new DOI per tag, per the established v1.1.0 pattern — not a version chain).

**Files:**
- Modify: `.zenodo.json` (refresh counts for v1.2.0)
- Modify: `docs/DEPLOYMENT.md` (DOI record if it documents the current DOI)
- Tag: `v1.2.0`

- [ ] **Step 1: Refresh `.zenodo.json` counts**

Update `count` values in `.zenodo.json` to the final items count (and any creature/story count changes from back-references — verify against the actual data before writing). Also update `version` if present.

- [ ] **Step 2: Update docs that reference the DOI**

Grep for `10.5281/zenodo.21865169`:

```bash
rg -l "21865169" --hidden -g '!node_modules'
```

Update any doc stating the current items/counts or the release DOI note (they will change when the v1.2.0 DOI is minted — see Step 4/5). Follow existing format.

- [ ] **Step 3: Commit prep**

```bash
git add .zenodo.json docs/DEPLOYMENT.md
git commit -m "feat(zenodo): prepare v1.2.0 bundle with Phase 3 items expansion"
```

- [ ] **Step 4: Tag and push**

```bash
git tag v1.2.0
git push origin main
git push origin v1.2.0
```

Expected: GitHub Actions `zenodo-publish.yml` workflow runs and completes green.

- [ ] **Step 5: Verify the new DOI**

After the workflow completes, find the new record DOI. Check via the Zenodo API or the Actions log (the v1.1.0 workflow printed the deposition/record IDs). Confirm the bundle contains `data/items.json` + `docs/*-schema.md` and the refreshed counts.

- [ ] **Step 6: Update DOI references + commit**

Replace the old DOI (`10.5281/zenodo.21865169`) with the new one wherever it appears (about.html, README.md, docs/DEPLOYMENT.md, docs/COVERAGE.md, docs/PROJECT_SUMMARY.md, todos.md), then commit and push:

```bash
git add .
git commit -m "feat(zenodo): publish v1.2.0 (DOI 10.5281/zenodo.<NEW_ID>)"
git push origin main
```

- [ ] **Step 7: Update memory + todos**

Mark G5 fully complete in `todos.md` and the project memory block (final counts, DOI, commit range).

---

## Self-Review Checklist

- **Spec coverage:** Taxonomy (T1 ✓), guide + ref files (T2/T3 ✓), Americas (T4 ✓), Africa (T5 ✓), South Asia (T6 ✓), Oceania (T7 ✓), Eastern Europe (T8 ✓), docs/counts (T9 ✓), sw bump (T10 ✓), v1.2.0 release (T11 ✓). All spec sections covered.
- **Placeholder scan:** The batch research steps necessarily describe source material rather than pre-writing ~350 objects (data must be researched, not fabricated) — but every mechanical step has exact commands and expected output. The Task 4 example item is fully written; Tasks 5–8 reference the same template rather than repeating it inline.
- **Type consistency:** `ALLOWED_TYPES` updated in exactly two code surfaces (Python pipeline + jest) plus the schema doc, with identical type strings across all three. Type names used in examples match the new enum exactly.
- **ID consistency:** `13xx`–`17xx` ranges in the plan match the guide update in Task 2. All batch file paths match the naming convention in `archive/scripts/expansions/items/`.
- **Verification gates:** Every batch phase runs dedup → validate → stage → apply → shard rebuild → jest → chromium e2e → commit, in that order.
