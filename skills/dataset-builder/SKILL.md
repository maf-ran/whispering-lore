# Dataset Builder Skill

## Purpose
Create structured, validated datasets for folklore entries.

---

## Fields to Extract
- name  
- aliases  
- description  
- country  
- region  
- subregion  
- type  
- habitat  
- behavior  
- cultural_significance  
- appearance  
- motifs  
- evidence  
- confidence_score  
- sources  

---

## JSON Structure

```json
{
  "name": "",
  "aliases": [],
  "description": "",
  "country": "",
  "region": "",
  "subregion": "",
  "type": "",
  "habitat": "",
  "behavior": "",
  "cultural_significance": "",
  "appearance": "",
  "motifs": [],
  "evidence": {
    "first_recorded": "",
    "recorded_by": "",
    "recorded_in": "",
    "historical_notes": ""
  },
  "confidence_score": 0.0,
  "sources": []
}

### Validation
- Use **json-schema-tools**
- Report missing fields
- Suggest improvements

---

### Batch Processing
- split text
- extract per segment
- merge
- validate

---

### Source Management
- Load `sources.md` first
- Use known sources for verification
- Exclude known sources during web search
- Add new sources to the archive

---

### Output
- JSON or Markdown tables
- Always structured

---

### Restrictions
- No fields without sources
- Mark uncertainty
