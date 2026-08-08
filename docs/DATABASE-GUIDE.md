# Whispering Lore — Database Guide

**Last updated:** 2026-07-30  
**Scope:** `data/datasets/creatures.json` (3668 entries), `data/datasets/stories.json` (2185 entries)  
**Coverage:** 212 countries, 151 cultural regions  

---

## 1. Dataset Overview

### Creatures — `data/datasets/creatures.json`

| Metric | Value |
|--------|-------|
| Total entries | 3668 |
| Unique countries | 212 |
| Unique regions | 32 |
| Unique types | ~100 (canonical 46) |
| Unique mythologies | ~100 |
| Field count per entry | 34 |

### Stories — `data/datasets/stories.json`

| Metric | Value |
|--------|-------|
| Total entries | 2185 |
| Unique countries | 89 |
| Unique types | 14 (legend, myth, fairy-tale, etc.) |
| Field count per entry | 14 |

### Cross-Reference

| Relationship | Count | Notes |
|---|---|---|
| Countries with both creatures & stories | 212 | Stories dataset covers 242 countries (some compound); 30 story-only countries |
| Stories referencing specific creatures | 2062/2185 | 94% of stories have creature cross-references; 123 without are myth/legend types with no specific creature |
| Story-creature refs matching creature names | Most match as type/category | Refs use generic terms like "spirit", "fairy", "ghost" |
| Overlapping slugs | 270 slug groups affecting 621 creatures | Different countries share identical slugs — needs disambiguation |
| Creatures in stories but not in dataset | ~20 generic refs | "bergsrå", "vodnik", "Yggdrasil" etc. are missing from creatures |

---

## 2. Field Reference — Creatures

### Required Fields (MUST be populated for every entry)

| Field | Type | Length (avg) | Completeness | Description |
|-------|------|-------------|-------------|-------------|
| `id` | string | ~15 chars | 100% | Unique identifier, e.g. `kitsune-042` — lowercase slug + dash + integer |
| `slug` | string | ~20 chars | 100% | URL-safe identifier: `kitsune`. Must be unique per entry. |
| `name` | string | ~20 chars | 100% | Display name: `Kitsune`. Capitalised. Use standard English spelling. |
| `country` | string | ~15 chars | 100% | Modern country or cultural region: `Japan`, `Sami`, `Maya`. 220 values, but **1296 unique regions** suggests country is too broad vs too granular. |
| `region` | string | ~15 chars | 100% | Cultural region: `Japanese`, `West African`. 1296 unique values — extremely granular. |
| `culture` | string | ~20 chars | 100% | Specific culture/tribe: `Akan`, `Yoruba`, `Koryak`. Overlaps with region. |
| `type` | string | ~15 chars | **100%** (fixed May 2026) | Core classification: `spirit`, `dragon`, `trickster`. 991 unique values — 787 types used once only. |
| `mythology` | string | ~15 chars | 100% | Broader mythological tradition: `Norse`, `Japanese`, `Hindu`. |
| `archetype` | string | ~15 chars | **45%** (1691 are "unknown"/"none") | Campbellian archetype: `Trickster`, `Shadow`, `Mentor`. Needs population. |
| `description` | string | 329 chars | 100% | Main narrative description. 27–1773 range. 51 entries under 50 chars — too short. |
| `appearance` | string | 145 chars | 99.9% | Physical description. 33 entries under 20 chars. |
| `behavior` | string | 169 chars | 100% | Behavioral traits, interactions with humans. 4 entries under 20 chars. |
| `habitat` | string | 67 chars | 100% | Environment/location. **86 entries under 10 chars** — weakest field. |
| `cultural_significance` | string | 164 chars | 99.9% | Role in culture, rituals, beliefs. 2 entries under 10 chars. |
| `summary` | string | 89 chars | 100% | One-sentence summary for previews. |
| `fun_fact` | string | 111 chars | 100% | Engaging trivia — all currently AI-generated. |
| `fun_fact_generated` | string | — | 100% | Timestamp of fun fact generation. |
| `keywords` | string[] | ~50 chars | 100% | Comma-separated keywords for search. |
| `search_terms` | string[] | ~80 chars | 100% | Alternative search terms, local names. |
| `schema_org_type` | string | ~20 chars | 100% | Schema.org type: `MythicalCreature`. |
| `seo_title` | string | ~60 chars | 100% | SEO-optimised title tag. |
| `seo_description` | string | ~160 chars | 100% | SEO meta description. |
| `motifs` | string[] | ~40 chars | 100% | Folklore motifs (Propp/ATU indices). |
| `featured_in_stories` | string[] | ~20 chars | 100% | Story slugs this creature appears in. |

### Optional but Empty Fields (0% populated)

| Field | Purpose | Priority for population |
|-------|---------|------------------------|
| `aliases` | Alternative names, epithets | MEDIUM — helpful for cross-linking |
| `strengths` | Combat/ability strengths | LOW — game-mechanics adjacent |
| `weaknesses` | Combat/ability weaknesses | LOW — game-mechanics adjacent |
| `habitat_tags` | Categorised environment tags | MEDIUM — enables habitat faceting |
| `behavior_tags` | Categorised behavior tags | MEDIUM — enables behavior faceting |
| `element` | Classical element affinity | LOW — useful but niche |
| `source` | Specific source citation | **HIGH** — important for credibility |
| `source_quality` | Reliability rating | 100% populated but needs standardisation |

---

## 3. Field Reference — Stories

| Field | Type | Avg Length | Completeness | Notes |
|-------|------|------------|-------------|-------|
| `id` | string | ~12 chars | 100% | Auto-generated |
| `title` | string | ~35 chars | 100% | Properly capitalised story title |
| `country` | string | ~15 chars | 100% | 89 countries — mostly European |
| `continent` | string | ~10 chars | 100% | Europe, Asia, Africa, Americas, Oceania |
| `region` | string | ~15 chars | 100% | Scandinavia, West Africa, East Asia |
| `type` | string | ~15 chars | 100% | `legend`, `myth`, `fairy-tale`, `folklore`, etc. |
| `summary` | string | 72 chars | 100% | **Too short** — should be 100–200 chars |
| `full_text` | string | 2940 chars | 100% | 1502–6064 range. Good quality. |
| `themes` | string | ~60 chars | 96.5% | Comma-separated themes |
| `moral` | string | ~80 chars | 100% | Story moral/lesson |
| `source` | string | ~60 chars | 100% | Collection/publication source |
| `period` | string | ~30 chars | 100% | `Oral tradition`, `19th century`, etc. |
| `keywords` | string[] | ~50 chars | 100% | Search keywords |
| `creatures` | string[] | ~15 chars | 96.5% | **Inconsistent** — uses generic types (`spirit`, `fairy`) not specific creature slugs |

---

## 4. Writing Style Guide

### Voice & Tone

- **Authoritative but accessible** — write as a scholarly compendium for a general audience
- **Third-person** — never "I", "we", "you"
- **Present tense** for creatures that "are" part of living folklore; past tense for extinct/transitioned beings
- **Neutral** — avoid cultural bias; present beliefs as reported, not judged

### Description Rules

#### DO
- Begin with the most distinctive trait: `"Shapeshifting fox spirit of Japanese folklore..."`
- Use plain English; translate foreign terms in parentheses on first use
- Lead with taxonomy/classification, then notable traits, then cultural context
- Separate logical sections with periods, not line breaks
- Keep to 200–500 characters

#### DON'T
- **No ALL-CAPS** for emphasis (found in 352 entries: `TWO CLASSES: ZENKO (善狐) vs YAKO (野狐)`) — use **bold** or italics sparingly
- **No AI-generation artifacts** (`>`, `()`, inconsistent capitalisation)
- **No markdown** in JSON string fields
- **No editorialising** ("amazingly", "incredibly", "interestingly")
- **No redundant qualifiers** ("very", "quite", "extremely")

### Example — Good Description

```
Shapeshifting fox spirit of Japanese folklore, revered as messenger of Inari. Gains supernatural power with age — more tails indicate greater wisdom, up to nine after 1,000 years. Divided into two classes: zenko (benevolent, serve Inari shrines) and yako (wild, sometimes malicious). Known for elaborate illusions, fox-fire (kitsunebi), and the ability to possess humans. The nine-tailed celestial tenko ascends to heaven. Inari's messengers receive offerings of rice, sake, and fried tofu at over 30,000 shrines nationwide.
```

### Example — Poor Description (AI-generated style)

```
ONE OF JAPAN'S 'BIG THREE' yokai. '狐' = fox. GAIN powers with AGE - more tails = older/wiser. Up to NINE tails after 1,000 years. TWO CLASSES: ZENKO (善狐, 'good fox') = benevolent, serve INARI. YAKO (野狐...
```

### Field-by-Field Writing Rules

| Field | Style | Target Length | Rules |
|-------|-------|--------------|-------|
| `description` | Narrative, encyclopedic | 200–500 chars | Lead with identity, then traits, then cultural role |
| `appearance` | Visual, concrete | 100–300 chars | Start with most striking feature. Describe colours, size, distinctive marks |
| `behavior` | Observational | 100–300 chars | How it acts toward humans. Include both benevolent and malevolent traits |
| `habitat` | Environmental | 50–200 chars | Where it dwells: specific geography, structures, liminal spaces |
| `cultural_significance` | Anthropological | 100–300 chars | Rituals, festivals, taboos. Historical role. Modern relevance |
| `summary` | Teaser | 80–150 chars | One compelling sentence usable in card previews |
| `fun_fact` | Engaging trivia | 80–200 chars | Unexpected, memorable fact. Avoid "Did you know?" framing |

---

## 5. Research Methodology

### Source Hierarchy

```
Tier 1 — Primary sources
  └─ Academic ethnographies, folklore collections (Krohn, Aarne-Thompson-Uther)
  └─ Regional folklore encyclopedias (Myths of the World series)
  └─ Museum collections (British Museum, Musée du Quai Branly)
  └─ Peer-reviewed journals (Folklore, Western Folklore, Fabula)

Tier 2 — Secondary sources
  └─ University press books on mythology
  └─ Documented oral traditions with citation
  └─ Modern folklore studies

Tier 3 — Reference
  └─ Online encyclopedias with citations (Wikipedia, Britannica)
  └─ Dedicated folklore websites with source lists
  └─ Encyclopedias of world mythology

AVOID
  └─ Blog posts without citations
  └─ Neo-pagan reinterpretations
  └─ Video game / pop culture depictions (unless cross-referencing)
  └─ Self-published or non-attributed web content
```

### Research Process

1. **Identify** — Find the creature's name in a Tier 1+ source
2. **Corroborate** — Cross-reference across at least 2 sources
3. **Contextualise** — Determine culture of origin, region, era
4. **Classify** — Assign type, archetype, mythology fields
5. **Write** — Follow style guide (Section 4)
6. **Cite** — Fill `source` field with specific reference
7. **Cross-link** — Connect to related creatures and stories

### Search Strategy

- Use the dedicated research prompt at `docs/research-prompt_multi.md`
- Run at least 3 web searches per entry using different search engines
- Prioritise regional folklore archives over general mythology websites
- For Indigenous traditions: prefer sources written by or in collaboration with community members

---

## 6. Required Pre-Submission Checks

### Per-Entry Checklist

Before adding a new creature, verify:

```
[ ] name — Capitalised, standard English spelling
[ ] slug — Lowercase, hyphenated, unique across entire dataset
[ ] country — Uses standard country name or recognised cultural region
[ ] region — Cultural region name (not country, not continent)
[ ] type — One of the common types if possible; avoid creating new singleton types
[ ] description — 200–500 chars, no AI artifacts, no ALL-CAPS
[ ] appearance — 100–300 chars, concrete visual details
[ ] behavior — 100–300 chars, human interactions
[ ] habitat — 50–200 chars, specific location details
[ ] cultural_significance — 100–300 chars, rituals/beliefs
[ ] summary — 80–150 chars, preview-quality
[ ] fun_fact — 80–200 chars, memorable trivia
[ ] source — Specific citation (book, journal, museum collection)
[ ] archetype — Not "unknown" (choose actual Campbellian archetype)
```

### Per-Edit Checklist

```
[ ] No duplicate slugs introduced
[ ] No ALL-CAPS or AI-formatting artifacts added
[ ] Description within 200–500 char target
[ ] Spelling matches standard English
[ ] Country uses existing value where possible (one of 220 current)
[ ] Type uses existing value where possible (one of 204 common types, not a new singleton)
[ ] Cross-linked featured_in_stories if applicable
```

---

## 7. Data Quality Issues & Recommendations

### Current Issues

| Issue | Severity | Details | Recommendation |
|-------|----------|---------|----------------|
| **Duplicate slugs** | HIGH | 270 groups affect 621 creatures | Disambiguate by appending country: `bannick` → `bannick-usa`, `bannick-canada` |
| **Type granularity** | HIGH | 991 types, 787 with single entry | Define a controlled vocabulary of ~30–50 types; map existing values; validate new entries |
| **Region granularity** | MEDIUM | 1296 regions, 972 single-entry | Merge micro-regions into broader categories (e.g. "California" → "North American Indigenous") |
| **archetype empty** | MEDIUM | 1691 entries are "unknown" | Bulk-update by mapping type values to archetypes (spirit→Anima, trickster→Trickster) |
| **Habitat entries too short** | MEDIUM | 86 entries under 10 chars | Expand with specific geography |
| **Description length variance** | LOW | 27–1773 chars range | Target 200–500; review outliers |
| **Story summaries too short** | LOW | 72 chars avg | Target 100–200 chars |
| **Story creature refs generic** | LOW | Uses type names not slugs | Link to specific creature slugs instead of generic "spirit" |
| **AI formatting artifacts** | LOW | 352 entries use `(CAPS)` parenthetical | Clean up to standard prose |
| **Empty fields** | LOW | aliases, strengths, weaknesses, habitat_tags, behavior_tags, element, source | Prioritise `source` first (credibility), then habitat_tags + behavior_tags (faceting) |
| **All fun facts AI-generated** | LOW | All 3120 have generation timestamp | Review and rewrite with human verification |

### Recommended Controlled Vocabularies

#### Types (Target: 40–50, current: 991)

Keep high-frequency types; merge singletons into parents:

```
spirit, ghost, water-spirit, guardian, nature-spirit, deity,
trickster, giant, ancestor-spirit, demon, animal-spirit, dragon,
shapeshifter, vampire, witch, fairy, forest-spirit, serpent,
werewolf, goddess, bird, cryptid, goblin, household-spirit, beast,
bogeyman, hero, sea-monster, dwarf, mermaid, ogre, jinn, undead,
elf, nymph, chimera, phantom, wraith, zombie, kelpie, siren
```

#### Regions (Target: 100–150, current: 1296)

Group micro-regions under parent categories — e.g.:

- "California", "Great Basin", "Plains", "Southeast" → "North American Indigenous"
- "Swedish", "Norwegian", "Icelandic" → "Nordic"
- "Yoruba", "Akan", "Ewe" → "West African"

#### Archetypes (Target: 12, current: 211)

Map type values to these Campbellian / Jungian archetypes:

```
Trickster, Shadow, Anima/Animus, Mentor, Herald, Threshold Guardian,
Shapeshifter, Ally, Monster, Child, Orphan, Martyr, Sage, Ruler,
Creator, Destroyer, Outlaw, Lover, Caregiver, Jester, Everyman, Hero
```

### Slug Disambiguation

Current slug collisions happen because creatures with the same name in different countries get identical slugs. Fix:

```
Before: bannick          (for both Bannick/USA and Bannick/Canada)
After:  bannick-usa      (for USA)
        bannick-canada   (for Canada)
```

The ideal pattern: `slug-countrycode` (e.g. `anansi-ghana`, `anansi-jamaica`).

---

## 8. Database Health Dashboard

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total creatures | 3668 | — | ✅ |
| Countries | 212 | 212+ | ✅ |
| Stories | 2185 | — | ✅ |
| Stories per country | ~4.5 | 10+ | 🔶 Stories dataset needs expansion |
| Creature types | 991 | 40–50 | ❌ Needs consolidation |
| Creature regions | 1296 | 100–150 | ❌ Needs consolidation |
| Fields at 100% | 22/34 | 28/34 | 🔶 7 fields need population |
| Stories with full_text | 2185/2185 | 100% | ✅ |
| Stories with creature refs | 2062/2185 | 2185/2185 | 🔶 123 stories lack creature refs |
| Description avg length | 329 | 200–500 | ✅ Within range |
| Habitat min length | 10 chars | 50+ chars | ❌ 86 entries too short |
| Archetype populated | 45% | 100% | ❌ |
| Source cited | 0% | 100% | ❌ Credibility gap |
| Slugs unique | 82% | 100% | ❌ 270 collisions |
