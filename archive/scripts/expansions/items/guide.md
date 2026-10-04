# Items Research Guide — Phase 2 (Global)

Follow this guide exactly when producing research batch JSON files for the
Whispering Lore items dataset. Read `docs/items-schema.md` and
`data/items.json` (existing 151 items) before drafting.

## Required fields (every entry, non-empty)

`id`, `slug`, `name`, `country`, `region`, `culture`, `type`, `description`,
`source_type`, `source_quality`, `attested`, `version`, `lastUpdated`

Optional: `aliases`, `material`, `era`, `maker`, `powers`,
`associated_creature`, `related_creatures`, `featured_in_stories`,
`keywords`, `search_terms`

## Field rules

- `slug`: kebab-case, unique across the whole dataset. Never reuse a seed slug.
- `id`: unique; pattern `<slug>-NNNN` (4-digit). Batch numbering: batch-1 = `02xx`, batch-2 = `03xx`, batch-3 = `04xx`, batch-4 = `05xx`, batch-5 = `06xx`, batch-6 = `07xx`, batch-7 = `08xx`, batch-8 = `09xx`, batch-9 = `10xx`, batch-10 = `11xx`, batch-11 = `12xx`. Phase 3 (gap regions): batch-12 = `13xx` Americas, batch-13 = `14xx` Africa, batch-14 = `15xx` South Asia, batch-15 = `16xx` Oceania, batch-16 = `17xx` Eastern Europe/Baltic/Arctic.
- `attested`: JSON boolean `true` (well-attested in named primary sources) | `false` (uncertain, fabricated, or only modern/derived mention) | `null` (no attestation possible). Never present legend claims as fact when `false` — word carefully.
- `source_type`: one of `oral_tradition` | `literary` | `archaeological` | `secondary_scholarly`.
- `source_quality`: one of `academic` | `documented` | `expert` | `fair` | `good` | `poor` | `primary` | `researched` | `verified` | `well-documented`.
- `type`: one of `weapon` | `jewelry` | `ship` | `garment` | `tool` | `household object` | `ritual object` | `rune stave` | `musical instrument` | `other` | `religious object` | `crown` | `cooking vessel` | `container`.
- `country` must be exactly one of the geo-countries values.
- `region` must be exactly one of the geo-regions values.
- `description`: as much information as possible. **Target ≥500 characters; hard minimum 200; no hard upper cap** (avoid padding — quality over filler). Every entry should be a substantive mini-encyclopedia entry: what the object is, its origin/maker where known, its construction/materials, its role in folklore and ritual, regional variants, and modern status. No generic filler, no "serves as"/"embodies the" boilerplate. Mark uncertain legends honestly in the text (e.g. "is sometimes said to..."). Prefer 3-5 concrete sentences with real detail over one long run-on.
- `version`: `"1.0.0"`. `lastUpdated`: `"2026-08-08"`.
- `aliases`/`keywords`/`search_terms`: arrays of strings. `search_terms` includes transliterations and alternate spellings.

## Cross-links (genuine ONLY — never invent slugs)

- `associated_creature` / `related_creatures`: only use creature slugs you VERIFY exist by reading `data/datasets/creatures.json`. If the owner (e.g. Thor, Freyr) has no creature entry, leave the link empty.
- `featured_in_stories`: only use story slugs you VERIFY exist by reading `data/datasets/stories.json`.
- **Every entry should cross-reference the database where a genuine link exists**: if an item is used by, gifted by, owned by, made for, or central to a creature in `creatures.json`, link it via `related_creatures`; if an item appears in or is central to a story in `stories.json`, link it via `featured_in_stories`. Run `archive/scripts/expansions/items/verify-batch.mjs` and cross-check against `ref-<area>.txt` before submitting.
- No speculative linking. When in doubt, empty array.

## Country / region reference (Phase 2)

- **05xx Celtic/Germanic** — Countries: `Ireland`, `Scotland`, `Wales`, `England`, `Isle of Man`, `United Kingdom`, `Germany`, `Netherlands`, `Belgium`, `Switzerland`, `Austria`, `France`, `Czech Republic`, `Poland`, `Hungary`, `Luxembourg`. Regions: `Celtic`, `Germanic`, `Europe`, `Northern Europe`, `Slavic`.
- **06xx Mediterranean** — Countries: `Greece`, `Italy`, `Spain`, `Portugal`, `Malta`, `Cyprus`, `Turkey`, `Croatia`. Regions: `Mediterranean`, `Europe`, `Balkan`.
- **07xx Egyptian/Levantine (MENA)** — Countries: `Egypt`, `Israel`, `Palestine`, `Lebanon`, `Syria`, `Jordan`, `Iraq`, `Iran`, `Morocco`, `Algeria`, `Tunisia`, `Libya`, `Saudi Arabia`, `Oman`, `United Arab Emirates`, `Yemen`. Regions: `Middle East and North Africa`, `North Africa`, `Egyptian`, `Persian`, `Mediterranean`, `Middle East`, `North Africa`, `West Asia`.
- **08xx East Asian** — Countries: `Japan`, `China`, `Korea`, `South Korea`, `North Korea`, `Taiwan`, `Tibet`, `Vietnam`, `Thailand`, `Cambodia`, `Myanmar`, `Laos`, `Mongolia`. Regions: `East Asia and Pacific`, `East Asia`, `Southeast Asia`, `Asia`, `Chinese`, `Japanese`, `Korean`, `Mongolian`, `Thai`.

Full values must match `data/datasets/geo-regions.json` and `data/datasets/geo-countries.json`. Verified cross-link slugs for each area are in `ref-<area>.txt` next to this guide — use them to build `related_creatures` / `featured_in_stories` (genuine only; leave empty when nothing fits).

## Country / region reference (Phase 3 — gap regions)

- **13xx Americas** — Countries: `Mexico`, `Guatemala`, `United States`, `Canada`, `Peru`, `Brazil`, `Argentina`, `Chile`, `Bolivia`, `Colombia`, `Venezuela`, `Ecuador`, `Haiti`, `Cuba`, `Puerto Rico`, `Jamaica`, `Greenland`, `Honduras`, `Panama`, `Costa Rica`, `Uruguay`, `Paraguay`. Regions: `Mesoamerica`, `North America`, `South America`, `Caribbean`, `Amazonian`, `Arctic`, `Latin America and Caribbean`, `Americas`, `Quechua`.
- **14xx Africa** — Countries: `Nigeria`, `Ghana`, `Kenya`, `South Africa`, `Zimbabwe`, `Ethiopia`, `Senegal`, `Mali`, `Benin`, `Ivory Coast`, `Congo`, `Democratic Republic of the Congo`, `Tanzania`, `Uganda`, `Rwanda`, `Madagascar`, `Zambia`, `Malawi`, `Mozambique`, `Angola`, `Cameroon`, `Niger`, `Chad`, `Sudan`, `Somalia`, `Morocco`, `Algeria`, `Tunisia`, `Egypt`. Regions: `West Africa`, `East Africa`, `Central Africa`, `Southern Africa`, `Sub-Saharan Africa`, `North Africa`, `African`, `World`.
- **15xx South Asia** — Countries: `India`, `Sri Lanka`, `Pakistan`, `Nepal`, `Bangladesh`, `Bhutan`, `Afghanistan`. Regions: `South Asia`, `Asia`, `Sherpa`.
- **16xx Oceania** — Countries: `Australia`, `New Zealand`, `Fiji`, `Papua New Guinea`, `Samoa`, `Tonga`, `Hawaii`, `Solomon Islands`, `Vanuatu`, `Cook Islands`, `French Polynesia`, `Tuvalu`, `Nauru`, `Palau`, `Micronesia`, `Marshall Islands`. Regions: `Oceania`, `Pacific`, `Aboriginal`, `Polynesian`.
- **17xx Eastern Europe / Baltic / Arctic** — Countries: `Russia`, `Ukraine`, `Belarus`, `Lithuania`, `Latvia`, `Estonia`, `Poland`, `Romania`, `Bulgaria`, `Hungary`, `Czech Republic`, `Georgia`, `Armenia`, `Azerbaijan`, `Kazakhstan`, `Tatarstan (Russia)`, `Russia (Sakha Republic)`, `Russia (Buryatia)`, `Russia (Tuva)`, `Russia (Siberia)`. Regions: `Slavic`, `Baltic`, `Arctic`, `Caucasus`, `Central Asia`, `Eastern Europe`, `Northern Europe`, `Europe`.

## Output

Write a JSON **array** of full item objects to your assigned batch file path.
Do NOT modify `data/items.json` — a separate script validates and applies the
batch.
