# 🔄 Hook: migrate-legacy-datasets

This hook performs a full migration of legacy folklore data into the modern dataset format.

---

# Steps

1. Run `extract-legacy-data.js`
2. Run `normalize-legacy-data.js`
3. Run `validate-dataset.md`
4. Run `generate-public-api.js`
5. Append migration entry to `data/research-history.md`

---

# Trigger

npm run migrate

---

# Output

- Updated datasets in `data/datasets/`
- Updated public API in `public-api/`
- Migration log entry in `data/research-history.md`

