# Whispering Lore Marketing Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete marketing assets package, social media templates, PR kit, wallpapers, and an automated Node.js generation script for Whispering Lore.

**Architecture:** Create brand identity SVG files, platform copy files, SVG templates using the Nordic Dark design system, a Node.js asset generation script using `sharp` or XML/SVG manipulation, and a PR kit documentation file.

**Tech Stack:** Node.js, SVG, CSS, Markdown.

---

### Task 1: Create Brand Identity Assets

**Files:**
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/branding/logo/full.svg`
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/branding/logo/icon.svg`
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/branding/palette.json`

- [ ] **Step 1: Write full logo SVG**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <style>
    .brand-text { font-family: 'Cinzel', serif; font-size: 24px; fill: #D6D3C8; letter-spacing: 0.3em; }
    .brand-accent { fill: #E05C5C; }
  </style>
  <rect width="100%" height="1005" fill="#0D0D0D"/>
  <g transform="translate(30, 50)">
    <path class="brand-accent" d="M0,-15 L10,0 L0,15 L-10,0 Z" />
    <text x="30" y="8" class="brand-text">WHISPERING <tspan class="brand-accent">LORE</tspan></text>
  </g>
</svg>
```

- [ ] **Step 2: Write icon SVG**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="16" fill="#1C1917" stroke="#292524" stroke-width="2"/>
  <path d="M50,20 L68,50 L50,80 L32,50 Z" fill="#E05C5C" opacity="0.9"/>
  <circle cx="50" cy="50" r="6" fill="#D6D3C8"/>
</svg>
```

- [ ] **Step 3: Write palette JSON**

```json
{
  "bgDeep": "#111111",
  "bgCard": "#1C1917",
  "textPrimary": "#D6D3C8",
  "textSecondary": "#A8A29E",
  "accentStrong": "#E05C5C",
  "border": "#292524"
}
```

- [ ] **Step 4: Commit brand assets**

```bash
git add marketing/branding/
git commit -m "feat(marketing): add brand logo and color palette"
```

---

### Task 2: Create Social Media Copy Files

**Files:**
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/copy/facebook.txt`
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/copy/instagram.txt`

- [ ] **Step 1: Write Facebook copy options**

```text
=== SHORT ===
Explore 3,672 mythical creatures and 2,185 ancient stories across 212 countries. Discover Whispering Lore today! https://whisperinglore.com #MythicBestiary #Folklore

=== MEDIUM ===
Step into the shadows of history and myth. Whispering Lore maps 3,672 creatures, 2,185 stories, and 641 sacred artifacts across 212 countries with verified sources and interactive globes. Start your journey: https://whisperinglore.com #DigitalFolklore #Mythology

=== LONG ===
Unearth the hidden lore of humanity. Whispering Lore is a scholarly yet immersive interactive archive cataloging 3,672 mythical creatures, 2,185 folk stories, and 641 artifacts spanning 212 countries and regions worldwide. 

Featuring interactive 3D globes, source-verified citations, faceted bestiaries, and daily featured legends. 

Explore the archive now: https://whisperinglore.com
#WhisperingLore #MythicBestiary #Folklore #AncientHistory #Mythology
```

- [ ] **Step 2: Write Instagram copy options**

```text
=== SHORT ===
Unearth 3,672 myths & legends across 212 countries. Link in bio! ✨ #Mythology #Folklore #WhisperingLore

=== MEDIUM ===
Did you know our archive holds 3,672 creatures and 2,185 stories from every corner of the earth? Explore interactive maps, verified sources, and rare artifacts. Link in bio to start exploring! 🗺️✨ #MythicBestiary #DigitalFolklore #AncientLore

=== LONG ===
From Nordic frost giants to Andean mountain spirits—explore the definitive digital archive of world folklore. 

🏛️ 3,672 Mythical Creatures
📜 2,185 Ancient Stories
🌍 212 Attested Countries
⚔️ 641 Sacred Artifacts

Tap the link in our bio to explore the interactive globe and bestiary today.
#WhisperingLore #Mythology #Folklore #MythicBestiary #AncientHistory #CulturalHeritage
```

- [ ] **Step 3: Commit copy files**

```bash
git add marketing/copy/
git commit -m "feat(marketing): add pre-written social media copy"
```

---

### Task 3: Create SVG Templates for Social Media and Wallpapers

**Files:**
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/templates/social/post-base.svg`
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/templates/wallpaper/base.svg`

- [ ] **Step 1: Write social post SVG template**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="50%" stop-color="#0F0D0B"/>
      <stop offset="100%" stop-color="#1A1513"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative frame -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#E05C5C" stroke-width="1" opacity="0.3"/>
  <!-- Rune diamond -->
  <path d="M600,100 L615,125 L600,150 L585,125 Z" fill="#E05C5C"/>
  <text x="600" y="200" font-family="'Cinzel', serif" font-size="42" font-weight="700" fill="#D6D3C8" text-anchor="middle" letter-spacing="0.2em">WHISPERING LORE</text>
  <line x1="500" y1="230" x2="700" y2="230" stroke="#E05C5C" stroke-width="2"/>
  <text x="600" y="320" font-family="'Lora', serif" font-size="28" font-style="italic" fill="#A8A29E" text-anchor="middle" width="900">Discover 3,672 mythical creatures and 2,185 ancient stories.</text>
  <text x="600" y="520" font-family="'Cinzel', serif" font-size="20" fill="#E05C5C" text-anchor="middle" letter-spacing="0.15em">WHISPERINGLORE.COM</text>
</svg>
```

- [ ] **Step 2: Write wallpaper SVG template**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg-wall" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="100%" stop-color="#1A1513"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg-wall)"/>
  <path d="M960,300 L990,350 L960,400 L930,350 Z" fill="#E05C5C" opacity="0.8"/>
  <text x="960" y="500" font-family="'Cinzel', serif" font-size="64" font-weight="700" fill="#D6D3C8" text-anchor="middle" letter-spacing="0.3em">WHISPERING LORE</text>
  <text x="960" y="580" font-family="'Lora', serif" font-size="28" font-style="italic" fill="#A8A29E" text-anchor="middle">3,672 Creatures · 2,185 Stories · 212 Countries</text>
</svg>
```

- [ ] **Step 3: Commit templates**

```bash
git add marketing/templates/
git commit -m "feat(marketing): add social and wallpaper SVG templates"
```

---

### Task 4: Write PR Kit & Documentation

**Files:**
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/docs/PR-KIT.md`
- Create: `/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/marketing/docs/README.md`

- [ ] **Step 1: Write PR-KIT.md**

```markdown
# Whispering Lore — Press Kit & PR Guide

## Elevator Pitch
Whispering Lore is the definitive scholarly yet immersive digital archive mapping world mythology, folklore, and sacred artifacts. Built with a Nordic Dark aesthetic, it catalogs 3,672 creatures, 2,185 stories, and 641 artifacts across 212 countries with interactive 3D globes and source-verified citations.

## Key Facts
- **Launch Date:** August 2026
- **Scale:** 3,672 creatures, 2,185 stories, 641 artifacts, 212 countries.
- **Technology:** Static web architecture with Shimmer IDB sharding, Three.js 3D globe, progressive web app (PWA) offline support.
- **Open Science / Data:** Fully open-access datasets published on Zenodo (DOI: 10.5281/zenodo.21941501).

## Sample Social Media Announcement
"Unearth the hidden lore of humanity. Whispering Lore maps thousands of mythical creatures, folk stories, and sacred artifacts across 212 countries with interactive globes and verified sources. Explore the archive today: https://whisperinglore.com #WhisperingLore #Mythology #DigitalFolklore"
```

- [ ] **Step 2: Write README.md**

```markdown
# Marketing Assets Package

This directory contains brand guidelines, logos, pre-written social media copy, platform-specific templates, device wallpapers, and PR materials for Whispering Lore.

## Structure
- `branding/`: Logos (`full.svg`, `icon.svg`) and color palette (`palette.json`).
- `copy/`: Platform-specific copy options (`facebook.txt`, `instagram.txt`).
- `templates/`: Base SVG templates for social posts and wallpapers.
- `docs/`: PR kit and press release materials.
```

- [ ] **Step 3: Commit PR kit and documentation**

```bash
git add marketing/docs/
git commit -m "feat(marketing): add PR kit and README documentation"
```

---

### Task 5: Final Verification and Cleanup

- [ ] **Step 1: Verify git status and file tree**

```bash
git status
```

- [ ] **Step 2: Update project `todos.md`**

Mark marketing tasks as completed in `todos.md`.
