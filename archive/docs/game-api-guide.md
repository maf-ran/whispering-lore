# 🎮 Game API Guide (Unity, Godot, Unreal)

This guide explains how to use the **Global Folklore Public API** inside game engines such as Unity, Godot, and Unreal Engine.  
The API provides access to creatures, stories, metadata, and world‑building information for use in RPGs, narrative games, procedural generators, and AI‑driven systems.

---

# 🌐 API Base URL

Local Node.js server:  
http://localhost:3000/api/

Static JSON (no server):  
/public-api/

---

# 🐉 Endpoints

Creatures:  
GET /creatures  
GET /creatures/{id}

Stories:  
GET /stories  
GET /stories/{id}

---

# 🎮 Unity (C#)

## Fetch a creature

using UnityEngine;  
using System.Collections;

public class CreatureLoader : MonoBehaviour  
{  
    IEnumerator Start()  
    {  
        string url = "http://localhost:3000/api/creatures/troll";  
        var request = UnityEngine.Networking.UnityWebRequest.Get(url);  
        yield return request.SendWebRequest();  

        if (!request.isNetworkError)  
        {  
            Debug.Log(request.downloadHandler.text);  
        }  
    }  
}

---

## Parse JSON into a C# class

[System.Serializable]  
public class Creature  
{  
    public string id;  
    public string name;  
    public string country;  
    public string region;  
    public string type;  
    public string description;  
}

Creature creature = JsonUtility.FromJson<Creature>(jsonString);

---

# 🐱 Godot (GDScript)

## Fetch a creature

extends Node

func _ready():  
    var url = "http://localhost:3000/api/creatures/troll"  
    var http = HTTPRequest.new()  
    add_child(http)  
    http.request(url)

func _on_HTTPRequest_request_completed(result, response_code, headers, body):  
    var data = JSON.parse(body.get_string_from_utf8())  
    print(data.result)

---

# 🦾 Unreal Engine (Blueprints)

1. Add a **GET Request** using "HTTP Request" node  
2. Set URL to:  
   http://localhost:3000/api/creatures/troll  
3. On "On Process Request Complete":  
   - Convert response to string  
   - Use "JSON Deserialize"  
   - Map fields to variables or structs  

Recommended struct fields:  
id, name, country, region, type, description, motifs

---

# 🧩 Example Use Cases in Games

## Procedural Generation
- Generate random encounters based on creature type  
- Spawn region‑specific folklore creatures  
- Create dynamic quests using story summaries  

## Dialogue & Lore Systems
- NPCs can reference creatures from the API  
- Books, scrolls, lore tablets can auto‑populate from stories  

## AI‑Driven Characters
- Use creature descriptions to generate behavior trees  
- Use story morals to influence NPC alignment  

## World‑Building Tools
- In‑engine editors can fetch creatures for designers  
- Quest designers can browse stories directly in the editor  

---

# 🧪 Testing in Game Engines

Test URLs in your browser first:

http://localhost:3000/api/creatures  
http://localhost:3000/api/creatures/troll  
http://localhost:3000/api/stories  
http://localhost:3000/api/stories/story1  

If these work, the game engine will work too.

---

# 📌 Tips for Production

- Cache API responses locally  
- Bundle static JSON for offline play  
- Use versioned endpoints for stability  
- Avoid blocking the main thread during fetches  

---

# 📦 Summary

This guide shows how to integrate the Folklore API into:

- Unity (C#)  
- Godot (GDScript)  
- Unreal Engine (Blueprints)  

The API is designed to be lightweight, fast, and compatible with all major game engines.

---

# 🧭 Notes

- All data comes from the public API layer  
- Internal research metadata is removed  
- Safe for use in commercial and non‑commercial games  

