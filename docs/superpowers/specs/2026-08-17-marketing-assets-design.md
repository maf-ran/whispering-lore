# Design Spec: Whispering Lore Marketing Assets & PR Kit

**Author:** AI Agent (OpenCode)
**Date:** August 17, 2026
**Status:** Approved

## 1. Objective
Build a comprehensive marketing assets package, social media content templates, pre-written copy, device wallpapers, and PR kit for **Whispering Lore**, adhering strictly to the Nordic Dark design system (deep charcoal, ash, crimson accent, `Cinzel` & `Lora` typography).

## 2. Target Platforms & Dimensions
- **Facebook:**
  - Feed Post: 1200 × 630 px
  - Story / Reel: 1080 × 1920 px
  - Cover / Header: 820 × 312 px
- **Instagram:**
  - Feed Post: 1080 × 1080 px
  - Story / Reel: 1080 × 1920 px
- **Wallpapers:**
  - Desktop HD: 1920 × 1080 px
  - Desktop QHD: 2560 × 1440 px
  - Mobile HD: 1080 × 1920 px

## 3. Architecture & Components
- **Brand Assets (`marketing/branding/`):**
  - `logo/full.svg` & `logo/icon.svg`: Derived from the inline rune-diamond (`✦`) and site styling.
  - `palette.json` & `palette.css`: Extracted CSS design tokens.
- **Copy (`marketing/copy/`):**
  - Platform-specific copy blocks (short, medium, long) with hashtags and CTAs for Facebook and Instagram.
- **Templates (`marketing/templates/`):**
  - SVG templates with CSS variable bindings for dynamic text insertion.
- **Asset Generation Script (`marketing/scripts/generate-assets.js`):**
  - Node.js script using `sharp` or SVG-to-PNG rendering to batch generate all target asset sizes from templates and copy.
- **PR Kit & Documentation (`marketing/docs/`):**
  - Press release, elevator pitch, media kit summary, and usage guide.
