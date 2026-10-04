# 🔍 SEO Validator

Ensures all entries have:

- slug
- SEO title
- SEO description (≤ 160 chars)

---

# Output

Writes issues to:

output/logs/seo-validation.json

---

# Example Issue

{
“id”: “aswang-001”,
“errors”: [“SEO description too long”]
}