# Items Schema — `data/items.json`

Reference for the Whispering Lore **items & artifacts** dataset. Mirrors the creature/story schema conventions for all shared quality and attestation fields.

## File

- **Path:** `data/items.json`
- **Format:** single flat JSON array. No shards, no manifest in this phase.
- **Current size:** ~20 seed items (Phase 1 seed), grown to ~150 via research batches.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | unique, human-readable (`mjolnir-0101`) |
| `slug` | string | yes | kebab-case, unique, matches name |
| `name` | string | yes | primary name |
| `aliases` | array of strings | no | regional variants, transliterations, alternate names |
| `country` | string | yes | must match `data/datasets/geo-countries.json` |
| `region` | string | yes | must match `data/datasets/geo-regions.json` |
| `culture` | string | yes | e.g. Old Norse, Sami, Finnish |
| `type` | string | yes | taxonomy below |
| `material` | string | no | iron, gold, bone, stone, rune-carved wood, etc. |
| `era` | string | no | mythic age / Viking age / saga / medieval / folk era |
| `maker` | string | no | credited smith/god/person |
| `powers` | string | no | what the item does |
| `associated_creature` | string \| null | no | primary creature slug (owner/creator) when it exists in creatures.json; else `null` |
| `description` | string | yes | rich description, same quality bar as creature descriptions |
| `related_creatures` | array of strings | no | creature slugs that genuinely feature this item |
| `featured_in_stories` | array of strings | no | story slugs that genuinely feature this item |
| `source` | string | no | named source (e.g. "Prose Edda (Skáldskaparmál)") |
| `source_type` | string | yes | `oral_tradition` \| `literary` \| `archaeological` \| `secondary_scholarly` |
| `source_quality` | string | yes | shared vocabulary (below) |
| `attested` | boolean \| null | yes | `true` = attested in source; `false` = uncertain/derived; `null` = none |
| `keywords` | array of strings | no | search keywords |
| `search_terms` | array of strings | no | aliases + transliterations for search |
| `version` | string | yes | e.g. `"1.0.0"` |
| `lastUpdated` | string | yes | `YYYY-MM-DD` |

## Taxonomies

### Type
`weapon`, `jewelry`, `ship`, `garment`, `tool`, `household object`, `ritual object`, `rune stave`, `musical instrument`, `other`

### Source type
`oral_tradition`, `literary`, `archaeological`, `secondary_scholarly`

### Source quality (shared with creatures)
`academic`, `documented`, `expert`, `fair`, `good`, `poor`, `primary`, `researched`, `verified`, `well-documented`

### Attested
`true` = attested in a named source; `false` = uncertain/derived (e.g. motif reconstructed from secondary sources); `null` = no attestation. Fabricated or speculative material must never be presented as fact — set `false` or `null` and mark clearly in the description.

## Bidirectional links

For each item:

- **Item → creature:** `related_creatures` holds creature slugs.
- **Item → story:** `featured_in_stories` holds story slugs.
- **Creature → item:** the creature entry gains `related_items` (array of item slugs).
- **Story → item:** the story entry gains `items` (array of item slugs).

**Rule:** links are **genuine only**. Never invent a back-reference or forward link to a slug that does not exist. If the natural owner (e.g. Thor) has no creature entry, leave the link empty rather than fabricating one.

## Example

```json
{
  "id": "mjolnir-0101",
  "slug": "mjolnir",
  "name": "Mjölnir",
  "aliases": ["Mjöllnir", "Thor's Hammer"],
  "country": "Iceland",
  "region": "Nordic",
  "culture": "Old Norse",
  "type": "weapon",
  "material": "Iron",
  "era": "Viking Age",
  "maker": "Brokkr and Sindri (dwarves)",
  "powers": "Summons thunder and lightning; returns to the thrower's hand; hallows weddings and funerals.",
  "associated_creature": null,
  "description": "The mighty hammer of Thor, forged by the dwarven brothers Brokkr and Sindri as the prize of a wager Loki made on his own head.",
  "related_creatures": ["dwarf-dvergr"],
  "featured_in_stories": [],
  "source": "Prose Edda (Skáldskaparmál)",
  "source_type": "literary",
  "source_quality": "expert",
  "attested": true,
  "keywords": ["hammer", "thor", "thunder", "dwarves", "ragnarok"],
  "search_terms": ["mjolnir", "mjöllnir", "thor hammer", "thunder god", "brokkr", "sindri"],
  "version": "1.0.0",
  "lastUpdated": "2026-08-08"
}
```

## Validation

`tests/items-data.test.js` enforces: unique ids/slugs, kebab-case slugs, required fields, geo resolution, source_type/source_quality/attested/type enums, cross-reference resolution, and back-reference integrity in both directions.
