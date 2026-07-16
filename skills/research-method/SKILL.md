# Research Method Skill

## Purpose
Provide a complete, multi-layered research methodology for collecting, verifying, and expanding folklore knowledge. Ensure the agent performs academically reliable research using known sources first, then discovers new sources while avoiding duplicates.

---

## Core Principles
1. **Known sources first**  
2. **New sources only after exclusion**  
3. **Multi-pass research**  
4. **Cross-language search**  
5. **Regional → national → subregional → village-level depth**  
6. **Academic-first prioritization**  
7. **Source scoring and freshness tracking**  
8. **Duplicate detection**  
9. **Translation normalization**  
10. **Incremental knowledge expansion**

---

## Research Workflow

### 1. Load Known Sources
- Read and parse `data/sources.md`.
- Extract:
  - URLs
  - fingerprints
  - credibility scores
  - categories
  - last_checked dates
- Use these sources for initial verification.

### 2. Extract Information from Known Sources
Extract:
- name  
- description  
- country  
- region  
- type  
- habitat  
- behavior  
- cultural significance  
- appearance  
- motifs  
- aliases  
- historical notes  

### 3. Identify Missing Information
Before searching the web, determine:
- missing fields  
- unclear fields  
- contradictory fields  
- low-confidence areas  

### 4. Multi-Pass Internet Research
Perform research in layers:

#### Pass A — Regional Search
Search in:
- local language(s)
- dialect spellings
- historical spellings
- regional archives
- regional folklore societies

#### Pass B — National Search
Search:
- national libraries
- national folklore archives
- academic institutions
- folklore researchers by name

#### Pass C — International Search
Search:
- global academic databases
- folklore journals
- museum collections
- cross-cultural parallels

#### Pass D — General Web Search
Use:
- at least 10 search engines
- up to 100 hits per engine
- synonyms, aliases, motif numbers, collector names

### 5. Exclusion Rules
During all web searches:
- **Exclude all URLs already in `sources.md`**
- Exclude URLs with matching fingerprints
- Exclude URLs with low credibility scores (if known)

### 6. New Source Handling
For each new source:
- evaluate credibility  
- assign score (0.0–1.0)  
- generate fingerprint  
- categorize (primary/secondary/tertiary)  
- add to `sources.md`  

### 7. Translation & Normalization
- Translate non-English sources
- Normalize spelling
- Merge duplicate names
- Merge duplicate descriptions

### 8. Final Verification
- Re-check all extracted data against both old and new sources
- Mark contradictions
- Assign confidence score

---

## Output Requirements
- Structured summary  
- Article draft (via `folklore-entry`)  
- JSON dataset (via `dataset-builder`)  
- List of new sources  
- Updated `sources.md`  

---

## Restrictions
- Do not invent facts  
- Do not merge unrelated entities  
- Always mark uncertainty  
