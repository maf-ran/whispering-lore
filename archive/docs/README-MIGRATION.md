# 🔄 Full Migration System — Documentation

This document explains how the full migration pipeline works.

---

# 1. Purpose

The migration system converts the legacy folklore database into a modern, structured, SEO‑optimized, AI‑friendly dataset.

---

# 2. Pipeline Steps

1. Extract legacy JS → JSON  
2. Normalize and enrich  
3. Build relations  
4. Generate archetypes  
5. Tag motifs  
6. Validate SEO  
7. Generate public API  

---

# 3. Run the full migration

```bash
# Note: The migration script (scripts/run-migration.js) is not yet implemented.
# Data is currently managed directly in data/datasets/creatures.json and data/datasets/stories.json.
```

---

# 4. Output

- `data/datasets/creatures.json`
- `data/datasets/stories.json`
- `public-api/creatures/*.json`
- `public-api/stories/*.json`
- `output/logs/seo-validation.json`

---

# 5. Notes

- Legacy files remain untouched  
- Migration is repeatable  
- All new fields are optional but recommended  
- Fun facts are auto-generated unless manually provided  
