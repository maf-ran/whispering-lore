# 📘 Folklore API Specification (v1)

OpenAPI‑style documentation for the Global Folklore Public API.  
This API provides access to creatures and stories for use in games, apps, tools, and world‑building systems.

---

## 🌐 Base URL

Local development (Node.js server):  
http://localhost:3000/api/

Static JSON access (no server):  
/public-api/

---

## 📁 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /creatures | Returns all creatures |
| GET | /creatures/{id} | Returns a single creature |
| GET | /stories | Returns all stories |
| GET | /stories/{id} | Returns a single story |

---

# 🐉 GET /creatures

### Description
Returns the full list of creatures in the public API database.

### Response Example
[
  {
    "id": "troll",
    "name": "Troll",
    "country": "Sweden",
    "region": "Scandinavia",
    "type": "Giant",
    "description": "A large supernatural being...",
    "motifs": ["G200", "F300"]
  }
]

---

# 🐺 GET /creatures/{id}

### Description
Returns a single creature by ID.

### Path Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Creature ID (e.g., "troll", "nacken") |

### Response Example
{
  "id": "nacken",
  "name": "Näcken",
  "country": "Sweden",
  "region": "Scandinavia",
  "type": "Water Spirit",
  "description": "A supernatural being who plays enchanted violin music...",
  "motifs": ["A200", "D200"]
}

---

# 📚 GET /stories

### Description
Returns the full list of stories.

### Response Example
[
  {
    "id": "story1",
    "title": "The Troll Bride",
    "country": "Sweden",
    "region": "Dalarna",
    "summary": "A young man encounters a troll woman...",
    "creatures": ["troll"]
  }
]

---

# 📖 GET /stories/{id}

### Description
Returns a single story by ID.

### Path Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Story ID (e.g., "story1") |

### Response Example
{
  "id": "story1",
  "title": "The Troll Bride",
  "country": "Sweden",
  "region": "Dalarna",
  "summary": "A young man encounters a troll woman...",
  "full_text": "...",
  "creatures": ["troll"]
}

---

# 🧩 Data Schemas

## Creature Schema
{
  "id": "string",
  "name": "string",
  "country": "string",
  "region": "string",
  "type": "string",
  "description": "string",
  "appearance": "string (optional)",
  "behavior": "string (optional)",
  "motifs": ["string"]
}

## Story Schema
{
  "id": "string",
  "title": "string",
  "country": "string",
  "region": "string",
  "summary": "string",
  "full_text": "string",
  "creatures": ["string"]
}

---

# 🧪 Testing the API

Fetch all creatures:  
GET http://localhost:3000/api/creatures

Fetch a single creature:  
GET http://localhost:3000/api/creatures/troll

Fetch all stories:  
GET http://localhost:3000/api/stories

Fetch a single story:  
GET http://localhost:3000/api/stories/story1

---

# 🎮 Usage in Games & Tools

This API is designed for:

- RPG world‑building tools  
- Game engines (Unity, Godot, Unreal)  
- Chatbots / AI companions  
- Web apps  
- Mobile apps  
- TTRPG generators  

See docs/game-api-guide.md for Unity/Godot examples.

---

# 📌 Versioning

- Version: 1.0  
- Status: Stable  
- Format: JSON  
- Transport: HTTP / static file access  

---

# 🧭 Notes

- This API is generated automatically from the research datasets.  
- Internal metadata (sources, fingerprints, confidence scores) is removed.  
- Only public‑facing fields are included.  
