# generate-public-api

## Purpose
Convert internal research datasets into public API JSON files.

## Behavior
1. Read all datasets from `data/datasets/`.
2. Transform each dataset into a simplified public format:
   - Remove internal metadata
   - Remove confidence scores
   - Remove source fingerprints
   - Keep only public-facing fields
3. Generate:
   - `public-api/creatures.json`
   - `public-api/stories.json`
   - `public-api/creatures/{id}.json`
   - `public-api/stories/{id}.json`
4. Save files to `public-api/`.

## Notes
- This creates a clean API layer for games, apps, and tools.
