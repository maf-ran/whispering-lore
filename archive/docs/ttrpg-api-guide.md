# 🎲 TTRPG API Guide (Tabletop Role‑Playing Games)

This guide explains how to use the **Global Folklore Public API** inside TTRPG tools, virtual tabletops, campaign managers, random generators, and digital DM screens.  
The API provides access to creatures, stories, regions, motifs, and lore for use in world‑building and gameplay.

---

# 🌐 API Base URL

Local Node.js server:  
http://localhost:3000/api/

Static JSON (no server):  
/ public-api /

---

# 📁 Endpoints Overview

Creatures:  
GET /creatures  
GET /creatures/{id}

Stories:  
GET /stories  
GET /stories/{id}

---

# 🧙 Use Cases for TTRPGs

The Folklore API is designed to support:

- Random encounter tables  
- Region‑based creature lists  
- Quest and plot generators  
- DM screen reference tools  
- NPC inspiration  
- Myth‑based world‑building  
- Cultural lore integration  
- Procedural dungeon/story creation  
- In‑game books, scrolls, legends  
- AI‑assisted GM helpers  

---

# 🐉 Example: Random Encounter Generator

## Step 1 — Fetch all creatures

fetch("http://localhost:3000/api/creatures")  
  .then(res => res.json())  
  .then(data => {  
      const random = data[Math.floor(Math.random() * data.length)]  
      console.log("Encounter:", random.name)  
  })

---

# 🌍 Region‑Based Encounter Tables

## Step 1 — Fetch creatures

fetch("/public-api/creatures.json")  
  .then(res => res.json())  
  .then(creatures => {  
      const nordic = creatures.filter(c => c.region === "Scandinavia")  
      console.log("Nordic Encounter Table:", nordic)  
  })

## Step 2 — Roll on the table

function roll(table) {  
    return table[Math.floor(Math.random() * table.length)]  
}

console.log("You encounter:", roll(nordic))

---

# 📖 Story‑Driven Quest Generator

## Step 1 — Fetch a random story

fetch("/public-api/stories.json")  
  .then(res => res.json())  
  .then(stories => {  
      const story = stories[Math.floor(Math.random() * stories.length)]  
      console.log("Quest Hook:", story.summary)  
  })

## Step 2 — Use creatures mentioned in the story

story.creatures → list of creature IDs  
Use these to spawn enemies, NPCs, or plot elements.


