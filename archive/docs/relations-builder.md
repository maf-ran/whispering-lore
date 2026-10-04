# 🔗 Relations Builder

This module creates:

- creature → story relations
- creature ↔ creature relations (via aliases)
- internal linking for API consumers

---

# How it works

1. Scans all stories for creature name mentions  
2. Adds `featured_in_stories` to each creature  
3. Uses aliases to link related creatures  
4. Writes updated dataset to `data/datasets/creatures.json`  

---

# Output Example

“featured_in_stories”: [“story-001”, “story-088”],
“related”: [“nokken-001”, “nix-001”]