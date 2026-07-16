# Creature Schema (Modern Format)

## Required Fields (always present)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "a-men-rainbow-serpent-0001" | Unique identifier |
| slug | string | "a-men-rainbow-serpent" | URL-safe, unique |
| name | string | "A-Men (Rainbow Serpent)" | Display name |
| country | string | "Australia" | Modern country or cultural region |
| region | string | "Pacific" | Cultural region |
| culture | string | "Australia" | Specific culture/tribe |
| type | string | "serpent" | Core classification |
| mythology | string | "Australia" | Broader mythological tradition |
| archetype | string | "water-spirit" | Campbellian archetype |
| description | string | long text | Main narrative description |
| appearance | string | long text | Physical description |
| behavior | string | long text | Behavioral traits |
| habitat | string | "Waterholes, sky (as rainbow)" | Environment/location |
| cultural_significance | string | 1-2 sentences | Role in culture, rituals, beliefs |
| summary | string | 1 short sentence | One-sentence summary for previews |
| fun_fact | string | text | Engaging trivia |
| fun_fact_generated | boolean | false | true if AI-generated |
| keywords | string[] | ["australia"] | Search keywords |
| search_terms | string[] | ["a-men (rainbow serpent)"] | Alternative search terms |
| schema_org_type | string | "MythicalCreature" | Schema.org type |
| seo_title | string | "A-Men (Rainbow Serpent) ..." | SEO-optimised title tag |
| seo_description | string | short text | SEO meta description |
| motifs | string[] | ["A200"] | Folklore motif indices |
| featured_in_stories | string[] | ["story20"] | Story slugs this creature appears in |
| source | string | "Aboriginal Australian folklore" | Specific source citation |
| source_quality | string | "unknown" | Reliability rating |
| source_type | string | "oral_tradition" | oral_tradition, literary, unknown |
| living_tradition | boolean | false | Is it still part of active folk belief? |
| lastUpdated | string | "2026-07-05" | Date of last update |
| version | string | "1.0.0" | Schema version |
| stories | string[] | ["story20","story227"] | Internal story IDs |
| aliases[] | string[] | ["rainbow serpent"] | Alternative names |
| related[] | string[] | ["tiddalik-the-frog"] | Related creature slugs |
| habitat_tags[] | string[] | ["water", "sky"] | Categorised environment tags |
| behavior_tags[] | string[] | ["strangling"] | Categorised behavior tags |
| strengths[] | string[] | ["storm calling"] | Abilities |
| weaknesses[] | string[] | ["drought"] | Weaknesses |
| element | string | "earth" | Classical element |
| tags[] | string[] | [] | General tags |

## Optional Fields

| Field | Type | Coverage | Notes |
|-------|------|----------|-------|
| pronunciation_ipa | string | ~14% | IPA pronunciation, e.g. "/tɔmte/" |
| country_region | string | ~3% | Specific sub-region within country |
| pronunciation_audio | string | 0% | Audio file URL for pronunciation |
