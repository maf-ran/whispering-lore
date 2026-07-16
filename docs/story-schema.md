# Story Schema (Modern Format)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "story19" | Unique identifier |
| slug | string | "ask-and-embla" | URL-safe identifier |
| title | string | "Ask and Embla" | Properly capitalised story title |
| country | string | "Iceland" | 89 countries |
| continent | string | "Europe" | Europe, Asia, Africa, Americas, Oceania |
| region | string | "Norse" | Cultural region |
| culture | string | "Norse" | Specific culture |
| type | string | "myth" | legend, myth, fairy-tale, folklore, etc. |
| summary | string | short sentence | Story summary (72 chars avg) |
| full_text | string | long text | Full story text (1502-6064 chars) |
| themes | string[] | ["creation","humanity","gods"] | Story themes |
| moral | string | "With gifts come responsibilities." | Story moral/lesson |
| keywords | string[] | list | Search keywords |
| creatures | string[] | ["odin-norway","yggdrasil"] | Creature slugs referenced |
| source | string | "Norse Mythology (Prose Edda)" | Collection/publication source |
| source_type | string | "oral_tradition" | oral_tradition or literary |
| source_quality | string | "unknown" | Reliability rating |
| period | string | "13th century (older tradition)" | Historical period |
| lastUpdated | string | "2026-07-05" | Date of last update |
| version | string | "1.0.0" | Schema version |
