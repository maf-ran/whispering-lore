# Research History

Log of research passes and pipeline work for Whispering Lore datasets.

## Items & Artifacts Pipeline (Aug 2026)

**Plan:** `docs/superpowers/plans/2026-08-08-items-artifacts.md`
**Spec:** `docs/superpowers/specs/2026-08-08-items-artifacts.md`
**Schema:** `docs/items-schema.md`

### Phase 1 — Seed dataset (2026-08-08)

- Created `data/items.json` with 20 flagship Nordic artifacts (schema + integrity tests in `tests/items-data.test.js`).
- Added genuine back-references:
  - `creatures.json` `related_items`: `fenrir → gleipnir`, `dwarf-dvergr → mjolnir`, `odin-iceland / odin-norway → gungnir, draupnir, hlidskjalf`.
  - `stories.json` `items`: `ilmarinen-forges-the-sampo → sampo`, `capture-of-the-sampo → sampo`.
- Item → creature/story forward references resolve 100% against the datasets.
- Commits: `c44eac6` (schema+seed+tests), `195833e` (viewer), `f36b845` (page), `320b92f` (citations).

### Phase 2 — Research batches to ~150 items (DONE 2026-08-08)

- Pipeline: `archive/scripts/research_items_phase1.py` (validate / stage / apply / dedup). `apply` backs up to `data/backups/` then merges and adds bidirectional back-references.
- Research guide: `archive/scripts/expansions/items/guide.md`. Batches: `archive/scripts/expansions/items/batch-{1,2,3}.json`.
- **batch-1** (`02xx`, 35): Norse mythic artifacts + Icelandic rune staves — Tyrfing, Óðrœrir, Sif's golden hair, Gullinbursti, Víðarr's shoe, Drómi/Leyding, Svalinn, Gríðarvölr, Hǫfuð (Heimdall's, not Hrólf Kraki's), Lævateinn, Níðstöng, völva's staff, Hymir's cauldron, Urðarbrunnr, sun chariot, Valaskjálf/Valhalla, Nábrók + 13 Huld-manuscript staves + galdrastafir. All `attested: true`; 13 staves `secondary_scholarly` (matches vegvísir seed). Cross-links: `dwarf-dvergr`, `fenrir`, `odin-iceland`, `odin-norway` (all verified). No `featured_in_stories` (no saga stories genuinely feature them).
- **batch-2** (`03xx`, 48): Swedish folkloric objects — Grotte mill, Codex Argenteus, signbook, runkalender, brudkrona, Dala horse, nyckelharpa, majstång, julbock, graveyard silver, underjordiska pot, vittra gifts, runestone, Lund minster, and tale-linked objects (magic scythe, Ljungby horn/pipe, troll shoes, golden cradle, flower of happiness, Cat of Norrhult, Säby Creek treasure, Sea King's ring, Madonna's golden shoe, broom king, Skogsrå cowbell). Story links verified: `why-the-sea-is-salt`, `ljungby-horn-and-pipe`, `the-troll-shoes`, `the-golden-cradle`, `the-flower-of-happiness`, `the-cat-of-norrhult`, `the-treasure-in-sby-creek`, `agneta-and-the-sea-king`, `the-fiddler-who-got-the-madonnas-golden-shoe`, `the-brooms-broom-king`, `finn-the-giant-and-the-minster-of-lund`; creature `skogsra`, `tomte`.
- **batch-3** (`04xx`, 48): Norwegian + Danish (29 NO incl. 5 Sámi, 19 DK). Archaeological: Gjermundbu helmet, Oseberg/Gokstad ships, stave church, Trundholm sun chariot, Gundestrup cauldron, Nydam/Hjortspring/Roskilde boats, Dejbjerg wagon, Jelling stones, Danevirke, Kronborg, lurs. Folk: primstav, bukkehorn, nisselue, Sami drum/gákti/sieidi, troll-gold, Dovrefjell cat, tale objects (tinderbox, flying trunk, magic book, tallow candle, red shoes, Snow Queen mirror, tin soldier). Story links: `the-tinderbox`, `the-flying-trunk`, `the-magic-book`, `the-cat-on-the-dovrefjell`, `the-tallow-candle`, `the-red-shoes`, `the-snow-queen`, `the-steadfast-tin-soldier`, `jurate-and-kastytis-the-amber-legend-of-the-baltic-sea`; creatures `nisse-norway`, `troll-norway`, `underjordiske`.
- **Audit**: 131 new items → total **151**. All 3 batches pass `validate` (0 errors/warnings). `dedup` reported only shared-keyword false positives (e.g. 17 staves sharing "huld manuscript" with vegvísir; grotte-mill "magic mill" vs sampo) — no true name/alias/slug collisions. Backrefs applied to creatures.json (related_items) + stories.json (items); shards regenerated; sw.js bumped v1_0_7; 168/168 Jest.
- Fixed: `regenerate-shards.py` BASE resolution (now climbs 3 levels to project root — previously landed on `archive/`).
- Commits pending: batches + script + guide + shards + sw bump + this doc.
