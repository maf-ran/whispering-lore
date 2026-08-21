# Whispering Lore – Project Analysis & Change Options

---

## 📂 Directory Overview (Mermaid)
```mermaid
flowchart TB
    root[Whispering Lore]
    subgraph HTML[HTML Pages]
        index(index.html)
        about(about.html)
        bestiary(bestiary.html)
        items(items.html)
        stories(stories.html)
        world(world.html)
        quiz(quiz.html)
        mylore(mylore.html)
        methodology(methodology.html)
        404(404.html)
    end
    subgraph CSS[Styling]
        styles(css/styles.css)
    end
    subgraph JS[JavaScript]
        main(js/main.js)
        themeToggle(js/theme-toggle.js)
        worldViewer(js/world-viewer.js)
        itemsViewer(js/items-viewer.js)
        viewerBase(js/viewer-base.js)
        creaturesViewer(js/creatures-viewer.js)
        regionGlyphs(js/region-glyphs.js)
        citations(js/citations.js)
        dailyFeature(js/daily-feature.js)
        mylore(js/mylore.js)
        quiz(js/quiz.js)
        globe(js/globe.js)
        storiesViewer(js/stories-viewer.js)
        runeScatter(js/rune-scatter.js)
        sharedUtils(js/shared-utils.js)
    end
    subgraph Data[Data (JSON)]
        itemsData(data/items.staged.json)
        creatures(data/datasets/creatures.json)
        stories(data/datasets/stories.json)
        regions(data/datasets/geo-regions.json)
        countries(data/datasets/geo-countries.json)
        quizPool(data/quiz-pool)
    end
    subgraph Config[Config & Build]
        pkg[package.json]
        lock[package-lock.json]
        netlify[netlify.toml]
        prettierrc[.prettierrc]
        gitignore[.gitignore]
        ci[.github/workflows/ci.yml]
        zenodo[.github/workflows/zenodo-publish.yml]
    end
    subgraph Assets[Assets]
        og[og-image.svg]
        placeholder[images/placeholder-creature.svg]
        robots[robots.txt]
        sitemap[sitemap.xml]
    end
    subgraph Tests[Tests]
        jest[tests/*.test.js]
        e2e[tests/e2e/*.spec.js]
    end
    subgraph Docs[Documentation]
        readme[README.md]
        citation[CITATION.cff]
        license[LICENSE]
        todos[todos.md]
    end
    subgraph Archive[Archive]
        lib[archive/lib]
        backups[ data/backups ]
    end
    subgraph Skills[Skills]
        uiux[skills/ui-ux-pro-max]
        research[skills/research-method]
        dataset[skills/dataset-builder]
        folklore[skills/folklore-entry]
    end
    root --> HTML
    root --> CSS
    root --> JS
    root --> Data
    root --> Config
    root --> Assets
    root --> Tests
    root --> Docs
    root --> Archive
    root --> Skills
```

---

## 📊 Code‑base Statistics
| Type | Files | Total Lines |
|------|-------|-------------|
| **HTML** | 11 | 2,472 |
| **CSS** | 1 | 3,516 |
| **JavaScript** | 15+ | 5,758 |
| **JSON Data** | ~30 (large) | 2,514,272 |
| **Other (Markdown, Config, etc.)** | 12 | ~300 |

> **Note:** The JSON data files dominate line count (> 98 % of total lines) because they store the complete folklore dataset (3,668 creatures, 2,185 stories, 641 items). All functional code lives in ~10 k lines, making it easy to reason about.

---

## 🎯 Why We Want the Recommended Changes
| Change Group | Business / UX Impact | Technical Benefit |
|--------------|----------------------|-------------------|
| **SEO Foundations** (JSON‑LD, SearchAction, FAQs) | Improves organic discoverability; richer SERP snippets → higher click‑through rate. | Google can index individual entities; improves crawl efficiency.
| **Content & Engagement** (blog, related‑items, Q&A) | Keeps visitors on the site longer, encourages repeat visits, creates natural backlink opportunities. | Generates fresh content for search engines; internal linking boosts page‑rank flow.
| **Performance** (inline critical CSS, gzip, cache‑control) | Faster page loads, especially on slow mobile connections; better Core Web Vitals → SEO advantage. | Reduces LCP, bandwidth usage; improves perceived responsiveness.
| **Accessibility** (ARIA, focus‑visible, aXe audit) | Makes the site usable for screen‑reader users and keyboard‑only navigation; complies with WCAG AA. | Reduces legal risk, widens audience.
| **Analytics & Monitoring** (GSC/GA4, Lighthouse CI) | Provides data to measure traffic, conversion, and performance trends. | Early detection of regressions; data‑driven iteration.
| **Internationalisation** | Opens the site to non‑English audiences, a potential new user base. | Adds `hreflang` and translation scaffolding.
| **Structural Improvements** (static‑site generator, API endpoint, image pipeline) | Future‑proofs the project, simplifies data handling, and enables richer templating. | Reduces manual build steps; easier to scale.

---

## ✅ Choose Your Starting Points
Select one or more of the options below.  The unchecked items will be written to **FUTURE_IMPROVEMENTS.md** for later work.

- [ ] **SEO Foundations** – add `WebSite` + `SearchAction` JSON‑LD, per‑entity schema, FAQ schema.
- [ ] **Content & Engagement** – launch a weekly blog, add related‑items component, create a Q&A widget.
- [ ] **Performance Boost** – inline critical hero CSS, enable gzip/Brotli, add cache‑control headers, run PurgeCSS.
- [ ] **Accessibility Upgrade** – full aXe audit, ARIA labels for SVG icons, improved focus outlines.
- [ ] **Analytics & Monitoring** – embed GA4/GSC tags, set up Lighthouse CI, build a performance dashboard.
- [ ] **Internationalisation** – add language selector, `hreflang` tags, translation scaffolding.
- [ ] **Structural Refactor** – migrate to a static‑site generator, create a small API for JSON data, automated image optimisation.

*Reply with the numbers or names of the items you want to begin with.*

---

## 📄 What’s Saved for Later
All items that are **not** selected now are recorded in **[FUTURE_IMPROVEMENTS.md](FUTURE_IMPROVEMENTS.md)**.

---

*Generated on $(date).*
