# Tier 3: Distinction — High Effort, Premium Feel

## Goal
Elevate Whispering Lore from a high-quality database to a "premium agency" level experience, achieving 10/10 across all evaluation perspectives.

## Scope
This tier focuses on visual distinction, academic rigor (DOI), and additive user features (pronunciation, progress tracking).

---

## T3.1: Cultural-Appropriate Creature Visuals (DEV + DESIGN)

**Files:**
- Create: `data/assets/region-glyphs/` (directory for SVG sprites)
- Modify: `js/creatures-viewer.js` (glyph selection logic)
- Modify: `css/styles.css` (glyph styling)

**Goal:** Replace the generic rune SVG placeholder with region-themed SVGs.

**Steps:**
1. **Design Glyph Sets:** Define 32 sets of symbols (one per cultural region).
2. **Implementation:**
   - Create an SVG sprite for each region.
   - In `creatures-viewer.js`, select the sprite based on `creature.region`.
   - Fallback to the diamond logo for unknown regions.
3. **Verification:** Every creature card displays a region-appropriate icon. Performance check (< 50KB impact).

---

## T3.2: Dataset DOI + Zenodo Versioning (DEV)

**Files:**
- Create: `.github/workflows/zenodo-publish.yml`
- Modify: `about.html` (display DOI)
- Modify: `js/main.js` (update JSON-LD with DOI)

**Goal:** Provide a permanent, citable identifier (DOI) for the dataset.

**Steps:**
1. **Zenodo Setup:** Configure Zenodo API tokens in GitHub Secrets.
2. **Workflow:** Create GitHub Action that:
   - Zips the `data/` directory.
   - Publishes to Zenodo API on tagged releases.
3. **UI Update:** Display the DOI on the About page and in the metadata footer of entries.
4. **Verification:** DOI resolves to the current dataset version on Zenodo.

---

## T3.3: Pronunciation Guides (CONTENT + DEV)

**Files:**
- Modify: `data/datasets/creatures.json` (add `pronunciation_ipa`, `pronunciation_audio`)
- Modify: `bestiary.html` (add pronunciation trigger)
- Modify: `js/creatures-viewer.js` (render IPA and play audio)

**Goal:** Help users pronounce complex mythical names.

**Steps:**
1. **Data Collection:** Add IPA (International Phonetic Alphabet) strings to 500+ entries.
2. **Audio Implementation:**
   - Implement simple TTS or hosted audio files for the top 100 entries.
   - Add a "speaker" icon next to the name in the detail view.
3. **Verification:** Audio plays correctly; IPA is rendered in a clear, muted font.

---

## T3.4: Reading Progress Tracking (DEV)

**Files:**
- Modify: `js/mylore.js` (track viewed slugs)
- Modify: `mylore.html` (add progress bar)
- Modify: `js/creatures-viewer.js` & `js/stories-viewer.js` (mark as viewed)

**Goal:** Motivate exploration by showing a "X of Y explored" metric.

**Steps:**
1. **Tracking:** In the detail view's entry point, add the slug to a `viewed` array in `LoreBox` (localStorage).
2. **UI:** On the My Lore page, add a progress bar showing the percentage of total creatures/stories viewed.
3. **Verification:** Viewing a creature marks it as explored; count updates immediately.

---

## T3.5: Editorial Board / Contributors (CONTENT)

**Files:**
- Modify: `about.html` (add contributors section)

**Goal:** Increase academic trust by listing the human expertise behind the project.

**Steps:**
1. **Content:** Create a list of contributors, reviewers, and subject-matter experts.
2. **Implementation:** Add a "Contributors & Editorial Board" section to the about page.
3. **Verification:** Page renders correctly with a clean, professional layout.

---

## Execution Order & Verification

1. **T3.4 (Progress Tracking)** $\rightarrow$ Quick win, high user value.
2. **T3.5 (Editorial Board)** $\rightarrow$ Quick content update.
3. **T3.1 (Visuals)** $\rightarrow$ Major visual lift.
4. **T3.3 (Pronunciation)** $\rightarrow$ Content-heavy, iterative.
5. **T3.2 (DOI)** $\rightarrow$ Final academic seal.

**Post-Task Verification:**
- `npx jest --testPathIgnorePatterns='tests/e2e/'`
- `npx playwright test tests/e2e/`
