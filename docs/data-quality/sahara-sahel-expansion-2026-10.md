# Sahara / Sahel + North Africa — Expansion Dossier (Batch 1)

**Status:** research only — nothing inserted. Awaiting approval.
**Date:** 2026-10-23
**Scope:** Morocco, Algeria, Tunisia, Libya, Egypt, Mali, Niger, Chad, Sudan
**Deliverable:** vetted candidates mapped to the creature schema, with sources, dedup checks, and confidence.

---

## 1. Why this batch

Country coverage is uneven. The region labels are legacy composites, so several countries look covered while being effectively unreachable as individual countries.

| Country | Entries (exact `country` match) | Notes |
|---|---:|---|
| Morocco | 6 | Gnawa/Aisha Qandisha mostly |
| Algeria | 12 | Teryel, Anzar (twice), Tin Hinan… |
| Tunisia | 13 | Ghoul, Bou Saadia, Tislit n'Anzar… |
| Libya | 6 | Lamia, Tannit… |
| Egypt | 25 | well covered |
| Mali | 48 | Dogon/Bambara, but many generic animal spirits |
| Niger | 6 | Tuareg/Hausa only |
| Chad | 2 | Sun Goat, Ngabia Bate |
| Sudan | 6 | Zar and neighbours |

The strongest gaps for *named, sourced* beings: Morocco (jinn/Gnawa), Chad (Sara), Niger (Songhay), and the Dogon corpus in Mali.

---

## 2. Method

- **Sources:** peer-reviewed monographs and reference works (Dieterlen, Griaule, *Encyclopédie berbère*, Stoller, Kapchan), museum publications, and the *Encyclopedia of World Cultures*. No content farms, wikis, or listicles were used for the proposed citations.
- **Dedup:** checked against an index of 3,730 names, 6,622 aliases, and 3,730 slugs, accent- and case-insensitive. Every proposed name and slug below is absent. Near-synonyms already in the DB (Teryel, Nommo, Yurugu, Faro, Gizo, Zankallala, Chi Wara) were treated as collisions and are not duplicated.
- **Schema:** fields follow `docs/creature-schema.md`; `type` uses the canonical values in `js/shared-utils.js` (`normalizeType`); `country` and `region` exist in `data/datasets/geo-countries.json` / `geo-regions.json`.
- **Quality scale:** values allowed by `tests/source-quality.test.js`. `attested: true` only where a named source supports the entry.
- Draft descriptions are research notes, not final dataset prose. Fields the sources do not support (e.g. a fixed appearance) are marked **not specified** rather than invented.

---

## 3. Summary

| # | Proposed name | Slug | Country | Region | Culture | Type | Quality | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | Yasigi (Satimbe) | `yasigi` | Mali | West Africa | Dogon | ancestor-spirit | academic | high |
| 2 | Andoumboulou | `andoumboulou` | Mali | West Africa | Dogon | ancestor-spirit | academic | high |
| 3 | Yéban | `yeban` | Mali | West Africa | Dogon | ancestor-spirit | academic | high |
| 4 | Awaghzen | `awaghzen` | Algeria | North Africa | Kabyle / Amazigh | giant | academic | high |
| 5 | Baghalate Qbūr (Grave Mule) | `baghalate-qbur` | Morocco | North Africa | Moroccan (Arab/Amazigh) | spirit | documented | medium |
| 6 | Sidi Mimoun | `sidi-mimoun` | Morocco | North Africa | Gnawa | spirit | researched | high |
| 7 | Sidi Hamou | `sidi-hamou` | Morocco | North Africa | Gnawa | spirit | researched | high |
| 8 | Sidi Musa | `sidi-musa` | Morocco | North Africa | Gnawa | spirit | researched | medium-high |
| 9 | Lalla Mira | `lalla-mira` | Morocco | North Africa | Gnawa | spirit | researched | high |
| 10 | Besi | `besi` | Chad | Central Africa | Sara | nature-spirit | documented | high |
| 11 | Badi | `badi` | Chad | Central Africa | Sara | ancestor-spirit | documented | high |
| 12 | Nuba (Sara Creator God) | `nuba-sara-creator-god` | Chad | Central Africa | Sara | deity | documented | Medium |
| 13 | Hauka | `hauka` | Niger | West Africa | Songhay / Hausa | spirit | academic | high |
| 14 | Bouchkara | `bouchkara` | Tunisia | North Africa | Tunisian | monster | fair | medium-low |
| 15 | Kujur | `kujur` | Sudan | East Africa | Nuba | guardian | fair | **optional** |

14 ready + 1 optional. Items 5 and 14 are deliberately rated below `academic`; item 15 is not a creature and needs your call.

---

## 4. Candidate detail

### 1. Yasigi (Satimbe) — Mali, Dogon

- **slug:** `yasigi`
- **type:** `ancestor-spirit` · **mythology:** Dogon · **archetype:** primordial-ancestor · **element:** earth
- **description:** Yasigi is the female twin of Ogo (the Pale Fox) in Dogon cosmology. She belonged to the generation of Nommo and the Fox — the oldest generation of all. At the first sigi ceremony she acted as an elder, bringing and distributing the beer made by the women; the drink was consumed by all participants to celebrate the revelation of "speech" transmitted by Nommo. Yasigi became the first dignitary of the ceremony. The female figure on the satimbe mask represents her, holding a calabash that recalls her role at that first sigi.
- **appearance:** As represented on the satimbe mask: a female figure in a skirt and ornaments of red fibre, with a hood of braided black fibre, forearms raised, a calabash in her left hand and an imitation flywhisk in her right.
- **behavior:** Ceremonial elder; distributes the sigi beer; ancestral founder of the sigi office.
- **habitat:** Dogon country, Bandiagara escarpment; sigi ceremonies.
- **aliases:** `Satimbe` (mask name), `Yasigi`
- **related:** `yurugu-dogon`, `nommo`, `amma-dogon`
- **source:** Dieterlen, "Masks and Mythology among the Dogon," *African Arts* 22:3 (1989): 34–43, 87–88. doi:10.2307/3336777
- **source_type:** literary · **source_quality:** academic · **attested:** true · **living_tradition:** true
- **dedup:** name/alias/slug absent. Satimbe is the mask that represents her, not a separate being — do **not** add it separately.

### 2. Andoumboulou — Mali, Dogon

- **slug:** `andoumboulou`
- **type:** `ancestor-spirit` · **mythology:** Dogon · **archetype:** primordial-being · **element:** earth
- **description:** The Andoumboulou are the primordial beings of Dogon mythology, described as the descendants of Ogo before his transformation into the Pale Fox. The first level of interpretation of the satimbe mask places the figure in their domain: an Andoumboulou woman was the first to discover the red fibres and used them to mask herself and frighten the men. The men took the fibres from her, affirming their authority, but she was named "sister" of the masks to commemorate the discovery.
- **appearance:** Not specified as individuals; represented through the satimbe mask.
- **behavior:** Foundational ancestors of the mask institution; associated with the discovery of red fibres and the origin of masking.
- **habitat:** Dogon cosmology; Bandiagara.
- **aliases:** `Andoumbulu` (variant transliteration)
- **related:** `yasigi`, `yurugu-dogon`
- **source:** Dieterlen, "Masks and Mythology among the Dogon," *African Arts* 22:3 (1989); Griaule, *Masques dogons* (1938; 2nd ed. 1963).
- **source_type:** literary · **source_quality:** academic · **attested:** true · **living_tradition:** true
- **dedup:** absent.

### 3. Yéban — Mali, Dogon

- **slug:** `yeban`
- **type:** `ancestor-spirit` · **mythology:** Dogon · **archetype:** ancestral-genie · **element:** earth
- **description:** In the era when men were immortal, they transformed into great serpents and then into Yéban genies. The ancestor who "returned" in this form is the Binou — literally "the one who has returned" — and the stone that carries his soul (*kikinu say*) and *nyama* becomes the focus of the Binou cult. The Yéban therefore belong to a world separate from humans; contact with them is re-established through sacrifice and the respect of interdictions, and is understood as a beneficial return of the ancestor.
- **appearance:** Great serpents in the first transformation, then genies; no fixed form.
- **behavior:** Guardians of their descendants; receive sacrifices; dwell apart.
- **habitat:** Totemic stones and shrines; the bush; the ancestral world.
- **aliases:** `Yeban`, `Yéban`
- **related:** `nommo`, `lebe`
- **source:** Griaule, *Masques dogons* (1938; 2nd ed. 1963), chapter on the Binou cult. Full text: https://monoskop.org/images/7/72/Griaule_Marcel_Masques_Dogons_2nd_ed_1963.pdf
- **source_type:** literary · **source_quality:** academic · **attested:** true · **living_tradition:** true
- **dedup:** absent. `Binou`/`Binu` is the returned ancestor and the cult, not a synonym for the genie class; mention it in the description rather than creating a second entry.

### 4. Awaghzen — Algeria, Kabyle

- **slug:** `awaghzen`
- **type:** `giant` (ogre) · **mythology:** Kabyle / Amazigh · **archetype:** ogre · **element:** earth
- **description:** Awaghzen is the male ogre of Kabyle and wider Berber oral tales. The most widespread Kabyle terms are *awaɣzəniw* and *wagɣzən*; regional variants include *aruliw* and *arariw*, and dialectal Arabic *lɣul*. Ogres and ogresses live in the wild, have a devouring appetite and are stupid: they do not master fire or cooking and eat their prey raw and alive. They are solitary, asocial, incapable of forming a family, and their main weapons are fear and devouring. Heroes and heroines routinely outwit them, demonstrating the superiority of civilized life. In Kabylie the ogress (Teryel) is the favourite figure of women storytellers; the male ogre is more frequent in Morocco and southern Algeria.
- **appearance:** Giant; noisy even in sleep; wild and unkempt.
- **behavior:** Cannibal, solitary, antisocial, sterile; stupid and gullible; outwitted by heroes.
- **habitat:** Caves, mountains, forests, remote wilderness.
- **aliases:** `Awaɣzəniw`, `Wagɣzən`, `Wagzen`, `Aruliw`
- **related:** `teryel`
- **source:** Lacoste-Dujardin, "Ogre et ogresse (Kabylie)," *Encyclopédie berbère* 35 (2013): 5720–5721. doi:10.4000/encyclopedieberbere.2807
- **source_type:** literary · **source_quality:** academic · **attested:** true · **living_tradition:** false
- **dedup:** absent. Distinct from Teryel (the Kabyle ogress already in the DB) — male counterpart, not a synonym.

### 5. Baghalate Qbūr (Grave Mule) — Morocco

- **slug:** `baghalate-qbur`
- **type:** `spirit` · **mythology:** Moroccan · **archetype:** taboo-punisher · **element:** earth
- **description:** The Grave Mule (*Baghalate Qbūr*) is a spectral, mule-like being in Moroccan folk belief, tied to death, taboo and moral boundaries. It punishes individuals who transgress ritual obligations associated with death and burial. Its affliction is understood as a spirit-induced illness and is treated through ritual healing. Scholarship pairs it with Aisha Qandisha as two complementary figures through which Moroccan cosmology explains illness and enforces social norms — one seductive, one punitive.
- **appearance:** A mule-like spectral entity.
- **behavior:** Punishes burial and death taboos; causes illness; enforces moral boundaries.
- **habitat:** Graveyards, burial paths, liminal places.
- **aliases:** `Grave Mule`, `Baghalate Qbur`, `Baghlat al-Qubur`
- **related:** `aisha-kandisha-algeria`
- **source:** El Gaoual & Berkane, "Spirit-Induced Illness in Moroccan Folk Belief: A Comparative Study of Aisha Qandisha and the Grave Mule," *International Journal of Environmental Sciences* (2025). doi:10.64252/c6mfyd61. The article synthesizes Westermarck (1935), Crapanzano (1973) and later ethnography; cite Westermarck as the classic primary source once the relevant passage is checked.
- **source_type:** literary · **source_quality:** documented · **attested:** true · **living_tradition:** true
- **dedup:** absent.
- **flag:** the journal is low-profile and the article is a synthesis, not fieldwork. Rated `documented`, not `academic`. Medium confidence.

### 6. Sidi Mimoun — Morocco, Gnawa

- **slug:** `sidi-mimoun`
- **type:** `spirit` · **mythology:** Gnawa · **archetype:** mluk-spirit · **element:** earth
- **description:** Sidi Mimoun is one of the *mluk* — "the possessors" — the jnun of the Moroccan Gnawa pantheon. He is a black spirit; possession by him often obliges the possessed to cut themselves with knives. Like the other mluk he has his own songs, colour, incense and offerings, invoked during the *lila* ceremony. The Gnawa are descendants of sub-Saharan Africans brought to Morocco as slaves; the names of the mluk preserve Hausa, Fulani and Bambara origins.
- **appearance:** No fixed form; black is his colour.
- **behavior:** Possesses; demands self-cutting/blood; afflicts those who neglect him.
- **habitat:** Lila ceremonies, shrines.
- **aliases:** `Sidi Mimun`, `Mimoun`
- **related:** `sidi-hamou`, `lalla-mira`, `sidi-musa`
- **source:** Kapchan, "Moroccan Gnawa and Transglobal Trance," *Expedition* 46(3) (2004), Penn Museum. https://www.penn.museum/sites/expedition/moroccan-gnawa-and-transglobal-trance/
- **source_type:** literary · **source_quality:** researched · **attested:** true · **living_tradition:** true
- **dedup:** absent. `Sidi Mimoun` is also a place/saint name in Morocco; the entry is the mluk spirit, not the saint.

### 7. Sidi Hamou — Morocco, Gnawa

- **slug:** `sidi-hamou`
- **type:** `spirit` · **mythology:** Gnawa · **archetype:** mluk-spirit · **element:** fire
- **description:** Sidi Hamou belongs to the red pantheon of the Moroccan Gnawa mluk. He is the spirit of the slaughterhouse: harsh and angry, a demanding master who exacts blood sacrifice. He is considered difficult to manage, and his colour, songs and offerings are distinct from those of the other spirits.
- **appearance:** No fixed form; red is his colour.
- **behavior:** Demands blood sacrifice; harsh, angry, difficult.
- **habitat:** Slaughterhouse; lila ceremonies.
- **aliases:** `Sidi Hamu`
- **related:** `sidi-mimoun`, `lalla-mira`, `sidi-musa`
- **source:** Kapchan, "Moroccan Gnawa and Transglobal Trance," *Expedition* 46(3) (2004).
- **source_type:** literary · **source_quality:** researched · **attested:** true · **living_tradition:** true
- **dedup:** absent.

### 8. Sidi Musa — Morocco, Gnawa

- **slug:** `sidi-musa`
- **type:** `spirit` · **mythology:** Gnawa · **archetype:** mluk-spirit · **element:** water
- **description:** Sidi Musa is the "blue spirit" of the Moroccan Gnawa pantheon. He is identified with a thirteenth-century figure whose sanctuary is at Salé. Invoked in the *lila*, he is one of the named jnun whose cult the Gnawa preserve; the jazz pianist Randy Weston described his encounter with "the blue spirit, Sidi Musa" as decisive in his musical path.
- **appearance:** No fixed form; blue is his colour.
- **behavior:** Possesses; protects; associated with music and well-being.
- **habitat:** Salé sanctuary; lila ceremonies.
- **aliases:** `Sidi Moussa`, `Sidi Musa`
- **related:** `sidi-mimoun`, `sidi-hamou`, `lalla-mira`
- **source:** Aubin-Boltanski, review of Kapchan, *Traveling Spirit Masters*, *Gradhiva* (2008). doi:10.4000/gradhiva.1149; Kapchan, *Expedition* (2004).
- **source_type:** literary · **source_quality:** researched · **attested:** true · **living_tradition:** true
- **dedup:** absent. Medium-high confidence: the sources agree on the name and colour, but the saint/spirit boundary is fuzzy.

### 9. Lalla Mira — Morocco, Gnawa

- **slug:** `lalla-mira`
- **type:** `spirit` · **mythology:** Gnawa · **archetype:** jinniya · **element:** air
- **description:** Lalla Mira is a feminine jinn (*jinniya*) of the Moroccan Gnawa pantheon, associated with the colour yellow. She is a laughing, joyous spirit who likes perfume, henna and pretty clothes; her incense is musk. When her music is played and women begin to giggle and laugh, she is understood to be making herself known. Each spirit in the pantheon has its own colour, song, incense, and food or drink.
- **appearance:** No fixed form; yellow is her colour.
- **behavior:** Joyous possession; laughter; loves perfume, henna, pretty clothes.
- **habitat:** Lila ceremonies; baths and celebrations.
- **aliases:** `Lalla Mira`
- **related:** `sidi-mimoun`, `sidi-hamou`, `sidi-musa`
- **source:** Kapchan, interview "Deborah Kapchan on the Gnawa of Morocco," Afropop Worldwide (2023). https://www.afropop.org/articles/deborah-kapchan-on-the-gnawa-of-morocco; Aubin-Boltanski, *Gradhiva* (2008).
- **source_type:** literary · **source_quality:** researched · **attested:** true · **living_tradition:** true
- **dedup:** absent. Note: `Lalla Mimouna` and `Lalla Malika` are separate spirits mentioned in the same source; not included here because the source gives no traits.

### 10. Besi — Chad, Sara

- **slug:** `besi`
- **type:** `nature-spirit` · **mythology:** Sara · **archetype:** place-spirit · **element:** earth
- **description:** A *besi* is a spirit immanent in, symbolized by, and named after a natural object — especially a tree — or a social activity such as initiation. The plural, *besigi*, interfere in people's lives by bringing misfortune; some are not powerful, while others can influence entire clans or villages. A besi is "owned" by a religious specialist who sacrifices on its behalf, and illness is diagnosed by divination to identify the attacking spirit.
- **appearance:** Immanent in natural objects, especially trees; no separate anthropomorphic form.
- **behavior:** Brings misfortune; intervenes in individual and clan life; receives sacrifices.
- **habitat:** Trees, natural objects, initiation grounds, villages.
- **aliases:** `Besigi` (plural)
- **source:** "Sara: Religion and Expressive Culture," *Encyclopedia of World Cultures* (everyculture.com). https://www.everyculture.com/Africa-Middle-East/Sara-Religion-and-Expressive-Culture.html
- **source_type:** literary · **source_quality:** documented · **attested:** true · **living_tradition:** true
- **dedup:** absent.

### 11. Badi — Chad, Sara

- **slug:** `badi`
- **type:** `ancestor-spirit` · **mythology:** Sara · **archetype:** ancestral-dead · **element:** earth
- **description:** *Badigi* (singular *badi*) are the dead conceived of in their afterlife. A badi is usually a deceased father or mother, and can attack people and bring misfortune in the same way as a besi. Proper mortuary ritual transforms the deceased into a badi; without it, the dead do not attain that status. Illness is believed to result from the action of a besi, a badi, or a sorcerer, and divination identifies which.
- **appearance:** The dead in their afterlife; no fixed form.
- **behavior:** Attacks the living; causes misfortune and illness; requires propitiation.
- **habitat:** The ancestral realm; the bush outside the village.
- **aliases:** `Badigi` (plural)
- **related:** `besi`
- **source:** "Sara: Religion and Expressive Culture," *Encyclopedia of World Cultures*.
- **source_type:** literary · **source_quality:** documented · **attested:** true · **living_tradition:** true
- **dedup:** absent.

### 12. Nuba (Sara Creator God) — Chad

- **slug:** `nuba-sara-creator-god`
- **type:** `deity` · **mythology:** Sara · **archetype:** creator-god · **element:** sky
- **description:** Nuba is the otiose high god of the Sara of Chad: he created the world and then withdrew from active intervention in human affairs. Shrines to him are uncommon, and people appeal instead to the lesser spirits — the besigi and badigi. When missionaries arrived in southern Chad they often used the local name of this high god for the Christian God, which facilitated conversion and encouraged syncretism.
- **appearance:** Not specified; a distant, immaterial creator.
- **behavior:** Created the world; withdrew; does not intervene directly.
- **habitat:** Sky / the distant divine.
- **aliases:** `Nuba`
- **related:** `besi`, `badi`
- **source:** "Sara: Religion and Expressive Culture," *Encyclopedia of World Cultures*; "Chad — Classical African Religions," *Chad: A Country Study* (Library of Congress). https://www.countrystudies.us/chad/27.htm
- **source_type:** literary · **source_quality:** documented · **attested:** true · **living_tradition:** true
- **dedup:** absent as a creature name. **Naming warning:** "Nuba" also names the Nuba Mountains and people of Sudan; the display name and slug must disambiguate, and the description must not conflate the two.

### 13. Hauka — Niger, Songhay / Hausa

- **slug:** `hauka`
- **type:** `spirit` · **mythology:** Songhay / Hausa · **archetype:** colonial-mimicry-spirit · **element:** earth
- **description:** The Hauka are possession spirits of the Songhay of Niger (and related Hausa contexts) who grotesquely mimic and mock Europeans of the colonial epoch. They speak in the body of human mediums, parody colonial officials and military men, and turn colonial power into ritual comedy. Paul Stoller, himself initiated into a possession troupe, treats the Hauka as embodied memory of colonialism; the movement also spread to the Gold Coast.
- **appearance:** Manifest through the possessed medium, who mimics a European colonial figure.
- **behavior:** Possesses mediums; mimics and mocks colonial officials; satirical, theatrical.
- **habitat:** Possession ceremonies and villages of Niger.
- **aliases:** `Hauka`
- **source:** Stoller, *Embodying Colonial Memories: Spirit Possession, Power, and the Hauka in West Africa* (Routledge, 1996); cf. Stoller, *Fusion of the Worlds* (1989), ch. 7.
- **source_type:** literary · **source_quality:** academic · **attested:** true · **living_tradition:** true
- **dedup:** absent.

### 14. Bouchkara — Tunisia

- **slug:** `bouchkara`
- **type:** `monster` · **mythology:** Tunisian · **archetype:** child-snatcher · **element:** earth
- **description:** Bouchkara is a Tunisian bogey figure invoked to frighten disobedient children. The familiar threat is that "Bouchkara will put you in her sack" if you do not behave; she is part of the same nursery-terror repertoire as the Ghoula. She is described in Tunisian popular articles and in Yassine Ellil's bilingual *Monstres fantastiques tunisiens* (2012) as one of the recurring figures of Tunisian oral and written tales.
- **appearance:** Not specified in the sources consulted; a sack is her defining attribute.
- **behavior:** Carries off misbehaving children in her sack; invoked as a threat.
- **habitat:** Domestic/night-time; the nursery imagination.
- **aliases:** `Bouchkara`
- **source:** Tekiano, "Ghoula, Obitha, Bouchkara… A la rencontre des monstres fantastiques tunisiens" (2014). https://www.tekiano.com/2014/01/25/ghoula-obitha-bouchkara-a-la-rencontre-des-monstres-fantastiques-tunisiens/; Wepost Tunisia, "Bouchkara: Le Mythe De La Terreur" (2023). https://wepostmag.com/bouchkara-le-mythe-de-la-terreur/; Ellil, *Monstres fantastiques tunisiens* (2012), not directly consulted.
- **source_type:** literary · **source_quality:** fair · **attested:** true · **living_tradition:** true
- **dedup:** absent.
- **flag:** popular-press sourcing only; no academic treatment found. Medium-low confidence. Include only if `fair` entries are acceptable for this batch.

### 15. Kujur — Sudan, Nuba (optional — not a creature)

- **slug:** `kujur`
- **type:** `guardian` · **mythology:** Nuba · **archetype:** spirit-medium · **element:** earth
- **description:** Among the Nuba of the Nuba Mountains, a *kujur* is a man or woman whose power is granted by God and through whom the Nuba know God. The kujur is the most sacred person, able to bring prosperity and lift suffering after natural crisis; each Nuba tribe has one, and ritual performance differs from tribe to tribe. A council of kujurs appoints the supreme Kujur, the *Tabowake*, who calls the community to prepare for rain and directs agricultural work.
- **appearance:** A living human ritual specialist.
- **behavior:** Divines, blesses, calls rain, mediates with God.
- **habitat:** Nuba Mountains, villages and shrines.
- **aliases:** `Kujur`, `Tabowake` (supreme kujur)
- **source:** "The Kujur," *Nuba Vision* 1:3, Nuba Survival. https://www.nubasurvival.org/Nuba%20Vision/Vol%201%20Issue%203/9%20The%20Kujur.htm
- **source_type:** literary · **source_quality:** fair · **attested:** true · **living_tradition:** true
- **dedup:** absent.
- **flag:** this is a living religious office, not a monster or spirit. It fits the site only if ritual specialists/guardians are in scope. Recommended: hold unless you explicitly want it.

---

## 5. Deferred / rejected (and why)

| Name | Where | Why deferred |
|---|---|---|
| Tamza / Thamza | Morocco (Rif) | In the Rif tale the name simply means "the ogress"; same archetype as Teryel. Recommend adding as an **alias of Teryel**, not a new entry. |
| Satimbe | Mali (Dogon) | Mask name; at the "clear speech" level it represents Yasigi. Use as an alias, not a separate creature. |
| Binou / Binu | Mali (Dogon) | The returned ancestor and the cult around him, closely tied to Yéban. Mention in the Yéban description; a separate entry would overlap. |
| Holey / holey hoori | Niger (Songhay) | The phrase names a possession **cult**, not an individual being; no named spirits sourced. |
| Gyinou | Mali (Dogon) | Named in Dieterlen's chapter list, but no accessible description found. Needs the printed volume. |
| Umm al-Ṣibyān | Egypt/Yemen | Strong figure, but the sources attest Yemen and Iran, not Egypt. Out of region for this batch. |
| Obitha | Tunisia | Named in the Tunisian press alongside Bouchkara, but no description located. Needs Ellil's book. |
| Fir'awn | Sudan/Nubia | No reliable source found for the supernatural figure. |
| Libyan candidates | Libya | Nothing new beyond the ghoul, Lamia and Tannit already in the DB. |
| Lalla Mimouna / Lalla Malika | Morocco (Gnawa) | Named in Kapchan's interview but without traits. Could be added later with the book. |

**Coverage note:** this batch does not fix the Libya and Niger gaps. Niger gets one entry (Hauka); Libya gets none. Tunisia gets one low-confidence entry (Bouchkara). A later batch should target Libyan Amazigh/Tuareg material and Niger's Zarma/Hausa pantheon with library access.

---

## 6. Insertion plan (only after approval)

1. Build the 14 ready entries (and Kujur only if approved) with the fields above. Keep `fun_fact_generated: false` unless a sourced fact is written; do not invent `appearance` where the source is silent — use a short, honest line instead.
2. Source strings follow the repo convention: `Author, Title (year), DOI/URL`.
3. Rebuild shards and indexes with the existing scripts:
   - `node archive/scripts/shard-data.mjs`
   - `python3 archive/scripts/build-creatures-index.py`
   - `python3 archive/scripts/build-search-index.py`
   - `python3 archive/scripts/build-stories-index.py` / `build-items-index.py` only if needed.
4. Run the gates:
   - `npx jest tests/source-quality.test.js tests/geo-validation.test.js tests/creatures-index.test.js tests/creatures-filter.test.js`
   - `npx eslint` on changed JS if any.
   - Targeted Playwright: bestiary filter, creature detail page, search.
5. Update hardcoded counts:
   - `js/i18n.js` → `about.p2`, `m.verify_p2`, `m.dist_creatures_*` (4 languages).
   - Any other hardcoded 3,730/2,185 references (grep before editing).
6. Do not touch story data or methodology percentages unless the new entries change the distribution claims.

---

## 7. Decisions needed

1. **Approve the 14 ready entries?** Or trim the Gnawa cluster (4 spirits from one pantheon) to two?
2. **Bouchkara:** accept a `fair`-quality entry, or defer until the Ellil book is checked?
3. **Kujur:** include a living ritual specialist, or keep the bestiary to beings?
4. **Tamza:** add as an alias of Teryel (recommended), or leave untouched?

*Research only. No dataset files were modified.*
