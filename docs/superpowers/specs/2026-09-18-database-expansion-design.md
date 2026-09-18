# Database Expansion Design: Targeted Country Gap-Filling

## 1. Overview
Expand the Whispering Lore folklore database (creatures, stories, items) focusing on targeted country gap-filling and verified regional additions, ensuring adherence to normalized shard structures and full index regeneration.

## 2. Scope & Target Regions
- Identify regions with sparse or missing folklore coverage.
- Add curated entries following existing schema in `shard-data.mjs` and related data stores.
- Run canonical data shard and index build scripts (`shard-data.mjs`, python index builders).

## 3. Data Flow & Verification
1. Append records to master/shard datasets.
2. Regenerate shards (`node archive/scripts/shard-data.mjs` or equivalent).
3. Rebuild indices (`python3 archive/scripts/build-*.py`).
4. Execute test suite (`npm test`) and verify 0 regressions.

## 4. Testing & Verification Plan
- Run unit tests (`jest`).
- Verify cross-references and sitemap generation.
