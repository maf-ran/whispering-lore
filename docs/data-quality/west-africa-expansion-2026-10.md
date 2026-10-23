# West Africa Expansion (Batch 2) — Dossier for Approval

- **Date:** 2026-10-23
- **Branch:** `audit-a11y-fixes`
- **Scope:** West/Central Africa gap-fill — Sierra Leone, Guinea, Liberia, Guinea-Bissau, Gabon, Equatorial Guinea
- **Current counts (master):** 3,745 creatures / 2,185 stories / 641 items (combined 5,930)
- **Target after this batch (ready):** 3,760 creatures / 2,185 stories / 641 items (combined 5,945)
- **Policy:** Only entries with real, citable sources. Dedup against existing names/aliases/slugs. Preserve schema/canonical `type` values, valid `country`/`region`. Rebuild shards/indexes. Update visible counts.

## 1) Coverage and gaps

Current counts in target countries (from `data/datasets/creatures.json`):

| Country | Current | Region | Notes |
|---------|---------|--------|-------|
| Sierra Leone | 1 (`butu`) | West Africa | Large Mende/Bullom/Sherbro gap. |
| Guinea | 1 (`nimba`) | West Africa | Baga/Nalu gap; Somtup/Kakilambe largely missing. |
| Liberia | 2 (`mamiwata-liberia`, `gbahali`) | West Africa | Dan/Gle gap. |
| Guinea-Bissau | 3 (`mama-djombo`, `kibati`, `ira`) | West Africa | Bijago gap; existing `ira` is a low-detail entry about ancestor figures/statuettes. |
| Gabon | 3 (`mbwiri`, `mokelembembe-gabon`, `bwiti`) | Central Africa | Fang/Punu/Kota gap. |
| Equatorial Guinea | 3 (`ekong`, `ebigane`, `evus`) | Central Africa | Bubi gap (Rupé/Bisila/Ommuá Tao missing). |

Gaps identified and addressed below.

## 2) Method and gates

- Research-first with exact citations (books, journal articles with DOIs, museum objects, heritage glossaries).
- Dedup check against `data/datasets/creatures.json` (name/alias/slug, case/diacritic-insensitive).
- Follow insertion pattern in `archive/scripts/add_sahara_sahel_creatures.js` (idempotent append, rebuild shards/indexes, rebuild search/index).
- Gates: `tests/source-quality.test.js`, `tests/geo-validation.test.js`, `tests/creatures-index.test.js`, targeted Playwright, ESLint.
- Update visible counts in `js/i18n.js` (`about.p2`, `m.verify_p2`, `desc.search` for en/es/sv/no, distribution lines `m.dist_creatures_li5`/`li6`/`li11`).
- No push/deploy until credentials available.

## 3) Dedup results

No exact slug/name/alias collisions found for the ready candidates. Substring noise only (`kibanda` contains "banda", many global `gle`/`eri`/`poto` substrings) — none exact.

Notes on existing `ira` (Guinea-Bissau, ancestor-spirit): describes Bijago ancestor spirits/figures (`irã`/statuettes). The optional `Orebuko` is conceptually related to the same category but was not added to avoid semantic duplication with the existing low-detail entry. If desired, `Orebuko` could be added later with explicit differentiation or by merging/enriching `ira`.

## 4) Candidate set (ready vs optional)

### Ready (15 entries)

| # | Slug | Name | Country | Region | Culture/Mythology | Type | Quality | Living | Attested | Notes |
|---|------|------|---------|--------|-------------------|------|---------|--------|----------|-------|
| 1 | `njayekoi` | Njayekoi | Sierra Leone | West Africa | Mende | spirit | academic | true | true | Njayei society masked spirit; diagnoses/purifies ritual pollution. |
| 2 | `gbeni-gbini` | Gbeni/Gbini | Sierra Leone | West Africa | Mende | spirit | academic | true | true | Poro chief masker with Qur'an-inscribed panels. |
| 3 | `sowei` | Sowei | Sierra Leone | West Africa | Mende/Sande | water-spirit | documented | true | true | Sande water spirit embodied by ndoli jowei mask. |
| 4 | `krifi` | Krifi | Sierra Leone | West Africa | Mende | ancestor-spirit | academic | true | true | Spirits of the dead represented by nomoli figures. |
| 5 | `somtup` | Somtup | Guinea | West Africa | Baga/Nalu | deity | academic | true | true | Highest male spirit after Kanu; 20m cage, visits every 7 years. |
| 6 | `banda` | Banda | Guinea | West Africa | Baga/Nalu | spirit | documented | true | true | Simo society mask (crocodile/shark/chameleon/antelope hybrid). |
| 7 | `gle` | Gle | Liberia | West Africa | Dan | deity | academic | true | true | Supreme force manifested through Dan masks (dean gle/bu gle). |
| 8 | `nindu` | Nindu | Guinea-Bissau | West Africa | Bijago (Añaki) | deity | academic | true | true | Distant creator sky god; cult via arebuko. |
| 9 | `kanogo` | Kanogo | Guinea-Bissau | West Africa | Bijago (Añaki) | nature-spirit | academic | true | true | Named women's arebuko/rock power on Canhabaque. |
| 10 | `ngil` | Ngil | Gabon | Central Africa | Fang | spirit | documented | false | true | Judicial/gorilla mask society (banned 1910). |
| 11 | `mukudj` | Mukudj | Gabon | Central Africa | Punu/Ogooué | ancestor-spirit | documented | true | true | White kaolin stilt mask of Mukuji funerary rites (okuyi). |
| 12 | `mbulu-ngulu` | Mbulu Ngulu | Gabon | Central Africa | Kota | guardian | documented | false | true | Reliquary guardian figures (copper/brass over wood). |
| 13 | `rupe` | Rupé | Equatorial Guinea | Central Africa | Bubi | deity | academic | true | true | Invisible sexless creator (Rupé/Rúppé/Eri/Poto), dwells at Pico Basilé. |
| 14 | `ommua-tao` | Ommuá Tao | Equatorial Guinea | Central Africa | Bubi | ancestor-spirit | academic | true | true | Legal father ancestor spirit receiving yam offerings. |
| 15 | `bisila` | Bisila | Equatorial Guinea | Central Africa | Bubi | deity | academic | true | true | Goddess of life/fertility; Bötöí/malanga cult, syncretic with Virgin Mary. |

### Optional / deferred (2)

| # | Slug | Name | Country | Region | Culture/Mythology | Type | Quality | Living | Attested | Notes |
|---|------|------|---------|--------|-------------------|------|---------|--------|----------|-------|
| 16 | `geh-naw` | Geh-naw | Liberia | West Africa | Mano (or related) | spirit | documented | true | true | Documented masquerade/spirit (Smithsonian EEPA 1973-001 ref20135). Considered weaker as a "named spirit being" than masquerade; may be better documented as masquerade tradition. |
| 17 | `orebuko` | Orebuko | Guinea-Bissau | West Africa | Bijago (Añaki) | ancestor-spirit | academic | true | true | Central concept (soul/revenant/object-power) from Henry (1993). Conceptually overlaps with existing `ira` (ancestor figures/statuettes); recommend not adding unless merged/enriched. |

### Optional alias expansion (existing entry)

- **`ninki-nanka`** (Gambia/Senegal): add aliases `Ninkinanka`, `Landouman`, `Niniganné`, `Ninger`, `Ningiri`, `Rianséou` based on Appia (1944). Source-only addition; no new entry.

## 5) Entry details (for insertion)

### 1) Njayekoi
- **Slug:** `njayekoi`
- **Name:** Njayekoi
- **Country:** Sierra Leone | **Region:** West Africa | **Culture:** Mende | **Mythology:** Mende
- **Type:** spirit | **Archetype:** masked-healing-spirit | **Element:** spirit
- **Aliases:** ["Njokoi"]
- **Related:** ["gbeni-gbini", "sowei", "krifi"]
- **Description:** Njayekoi (also Njokoi) is the masked spirit of the Njayei society among the Mende of southern Sierra Leone. Njayei is a cult association with its own spiritual power (halei) used to diagnose various kinds of ritual pollution and to purify those who have incurred it; its sacred house is daubed with white, red and black spots, and its sculptures are typically a male and female pair. Njayekoi's mask is the society's spirit mask, and its form varies from place to place.
- **Appearance:** A regionally variable mask worn by the Njayei society; associated with the spotted sacred house.
- **Behavior:** Diagnoses and purifies ritual pollution (including forms of mental derangement/illness) through Njayei rites; appears as a masked spirit.
- **Habitat:** Mende country, southern Sierra Leone; Njayei sacred house and ritual grounds.
- **Source:** Sierra Leone Heritage, 'Njayekoi', https://sierraleoneheritage.org/glossary/njayekoi; A.J. Gittins, *Mende Religion* (Nettetal: Steyler, 1987), 145–147; W.A. Hart, 'Sculptures of the Njayei Society among the Mende of Sierra Leone', *African Arts* 26, no. 3 (1993): 46–53, doi:10.2307/3337151.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 2) Gbeni/Gbini
- **Slug:** `gbeni-gbini`
- **Name:** Gbeni/Gbini
- **Country:** Sierra Leone | **Region:** West Africa | **Culture:** Mende | **Mythology:** Mende
- **Type:** spirit | **Archetype:** poro-masker | **Element:** spirit
- **Aliases:** ["Gbini"]
- **Related:** ["njayekoi", "sowei"]
- **Description:** Gbeni (Gbini) is the chief masker associated with the men's Poro society among the Mende of Sierra Leone. He wears a long cape of undyed raffia and raffia leggings; the broad cylindrical flat-topped headpiece is decorated with animal skin, cowrie shells and mirrors, with a small gap at the front through which he sees. A panel hangs from the collar over the chest and midriff (generally faced with leopard skin and ornamented with cowries). At the back, small wooden panels inscribed with sentences from the Qur'an are suspended and knock together as he moves.
- **Appearance:** Raffia cape/leggings; broad cylindrical flat-topped headpiece decorated with animal skin, cowries, mirrors; chest panel; back panels inscribed with Qur'an verses.
- **Behavior:** Chief masked figure of Poro ceremonies; his presence enforces Poro authority.
- **Habitat:** Poro bush and Mende villages, Sierra Leone.
- **Source:** Sierra Leone Heritage, 'Gbeni/Gbini', https://sierraleoneheritage.org/glossary/gbeni-gbini; T.J. Alldridge, *The Sherbro and Its Hinterland* (London: Macmillan, 1901), ch. 13; W. Siegmann and J. Perani, 'Men's Masquerades of Sierra Leone and Liberia', *Ethnologische Zeitschrift Zürich* 1 (1980): 25–40.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 3) Sowei
- **Slug:** `sowei`
- **Name:** Sowei
- **Country:** Sierra Leone | **Region:** West Africa | **Culture:** Mende/Sande | **Mythology:** Mende
- **Type:** water-spirit | **Archetype:** initiation-guardian | **Element:** water
- **Aliases:** ["Sowei mask", "Sande society mask"]
- **Related:** ["njayekoi", "gbeni-gbini"]
- **Description:** Sowei is the water spirit of the Sande women's society, embodied in the black wooden helmet mask worn by the ndoli jowei ('dancing sowei'). The masquerade represents a water spirit emanating from rivers and lakes; it is activated through dance and accompanied by musicians and attendants to teach female initiates about morality and ways of living. In Mende usage, 'Sowei' also names a senior Sande member and, by extension, the mask.
- **Appearance:** Black helmet mask with downcast eyes, small mouth, broad forehead and elaborate coiffure; worn with blackened raffia and cloth costume.
- **Behavior:** Appears at Sande initiations, funerals and installations of chiefs; teaches morality and ideal womanhood through dance.
- **Habitat:** Rivers and lakes; Sande society shrines and ceremonies in Sierra Leone and western Liberia.
- **Source:** Brooklyn Museum, 'Sande society mask (sowei)', https://www.brooklynmuseum.org/objects/4809; Sierra Leone Heritage, 'Sowei', https://sierraleoneheritage.org/glossary/sowei.
- **Source quality:** documented | **Living tradition:** true | **Attested:** true

### 4) Krifi
- **Slug:** `krifi`
- **Name:** Krifi
- **Country:** Sierra Leone | **Region:** West Africa | **Culture:** Mende | **Mythology:** Mende
- **Type:** ancestor-spirit | **Archetype:** ancestral-spirit | **Element:** earth
- **Aliases:** []
- **Related:** ["njayekoi", "sowei"]
- **Description:** Krifi are spirits of the dead among the Mende of southern Sierra Leone, known especially through nomoli stone figures. Atherton and Kalous argue that nomoli were originally ancestor figures; after they were lost, stolen or forgotten, they came to be regarded as material representations of krifi. The 'monstrous' appearance of many nomoli may reflect how some krifi were imagined, or may show heads of secret societies. The figures are still used as 'swearing' devices and to help increase agricultural yields.
- **Appearance:** Represented by nomoli stone statuettes, often with monstrous or distorted features.
- **Behavior:** Spirits of the dead; invoked in oaths and agricultural fertility rites through nomoli figures.
- **Habitat:** Mende country, southern Sierra Leone; fields and shrines where nomoli are kept.
- **Source:** John H. Atherton and Milan Kalous, 'Nomoli', *Journal of African History* 11, no. 3 (1970): 303–317, doi:10.1017/S0021853700010161.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 5) Somtup
- **Slug:** `somtup`
- **Name:** Somtup
- **Country:** Guinea | **Region:** West Africa | **Culture:** Baga/Nalu | **Mythology:** Baga
- **Type:** deity | **Archetype:** high-spirit | **Element:** sky
- **Aliases:** ["wu-Them", "a-Mantsho-ngö-Pön", "a-Mantsho-ño-Pön", "a-Paran", "Kakilambe"]
- **Related:** ["banda", "nimba"]
- **Description:** Somtup is the highest male spirit recognized by the Baga of coastal Guinea after the creator god Kanu. Alternate names include wu-Them ('the Patriarch'), a-Mantsho-ngö-Pön/a-Mantsho-ño-Pön ('the Great Chief/Prophet'), a-Paran ('the Grandfather'), and the Susu name Kakilambe. He was represented by a portable construction about twenty metres high—a massive raffia-covered cage surmounted by a bird head and carried by about twenty men. Somtup is the spirit of the masculine line and patron of the men's initiation society; he is said to reside in the Fouta Djallon and to visit the coast only every seven years.
- **Appearance:** Twenty-metre raffia-covered cage topped by a bird head, carried by about twenty men; otherwise not depicted.
- **Behavior:** Patron of male initiation; spirit of the masculine line; visits the coast every seven years.
- **Habitat:** Fouta Djallon and the Baga coast, Guinea; initiation groves.
- **Source:** Frederick Lamp, 'The Art of the Baga: A Preliminary Inquiry', *African Arts* 19, no. 2 (1986): 64–67, 92; Frederick Lamp, *Art of the Baga: A Drama of Cultural Reinvention* (New York: Museum for African Art; Munich: Prestel, 1996), 57–60; mandebala.net, 'kakilambe', https://www.mandebala.net/references/kakilambe.php.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 6) Banda
- **Slug:** `banda`
- **Name:** Banda
- **Country:** Guinea | **Region:** West Africa | **Culture:** Baga/Nalu | **Mythology:** Baga/Nalu
- **Type:** spirit | **Archetype:** masked-ancestor | **Element:** earth
- **Aliases:** []
- **Related:** ["somtup", "nimba"]
- **Description:** Banda is the name of a masked supernatural being among the Baga and Nalu of coastal Guinea. The mask combines human features with those of a crocodile or shark, teeth bared, the tail of a chameleon, the horns and ears of an antelope, and features of less identifiable animals. It is worn horizontally on top of the head and attached to a skirt of vegetal fibres that covers the wearer's body. Banda masks were the property of the Simo men's society, which historically regulated fertility and initiation ceremonies; after conversion to Islam, the masks were danced mainly for entertainment.
- **Appearance:** Composite mask (human, crocodile/shark, chameleon tail, antelope horns/ears, other animals), worn horizontally on the head with a vegetal fibre skirt.
- **Behavior:** Historically regulated fertility and initiation through the Simo society; now performed mainly for entertainment.
- **Habitat:** Coastal Guinea; Simo society grounds.
- **Source:** Brooklyn Museum, 'Banda Mask', https://www.brooklynmuseum.org/objects/2984.
- **Source quality:** documented | **Living tradition:** true | **Attested:** true

### 7) Gle
- **Slug:** `gle`
- **Name:** Gle
- **Country:** Liberia | **Region:** West Africa | **Culture:** Dan | **Mythology:** Dan
- **Type:** deity | **Archetype:** supreme-being | **Element:** spirit
- **Aliases:** ["Ge"]
- **Related:** []
- **Description:** Gle (Ge among the northern Dan) is the supreme being or supernatural force of the Dan, whose manifestation is the mask and the masked performer. Gle encompasses a history, a system and a philosophy in Dan thought. Masks are divided into dean gle (used for initiations and entertainment) and bu gle (associated with warriors and leadership). Each Gle has a yinannu ('translation') that determines its importance, including joy and dance, reading a person's destiny, and success in war. One Gle called Kong is presided over solely by women and concerns initiation, excision, childbirth and other matters traditionally assigned to women.
- **Appearance:** Wooden or metal mask with oval head, slit rectangular eyes, metal strip teeth and jutting lower lip, in an idealised Dan form; worn with raffia, fur and feather costume.
- **Behavior:** Manifests through masked performance; dean gle for initiation/entertainment, bu gle for war/leadership; yinannu define function; Kong (women's Gle) concerns women's rites.
- **Habitat:** Dan country in Côte d'Ivoire, Liberia and Guinea; masquerade arenas and sacred groves.
- **Source:** Sainsbury Centre, '210 – Dan Mask', https://sainsburycentre.ac.uk/art-and-objects/210-mask/, citing Barbara C. Johnson, *Four Dan Sculptors: Continuity and Change* (San Francisco: Fine Arts Museums of San Francisco, 1986), and Daniel B. Reed, *Dan Ge Performance: Masks and Music in Contemporary Côte d'Ivoire* (Bloomington: Indiana University Press, 2003).
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 8) Nindu
- **Slug:** `nindu`
- **Name:** Nindu
- **Country:** Guinea-Bissau | **Region:** West Africa | **Culture:** Bijago (Añaki) | **Mythology:** Bijago
- **Type:** deity | **Archetype:** creator-god | **Element:** sky
- **Aliases:** []
- **Related:** ["kanogo"]
- **Description:** Nindu is the creator sky god of the Añaki, the Bijago of Canhabaque in Guinea-Bissau. He is a distant god who is not invoked directly; the cult is addressed to intermediate powers called arebuko (sing. orebuko). Nindu gave the arebuko to humans. These powers take the form of natural or manufactured objects, some with proper names and others known only by a common noun.
- **Appearance:** No fixed form; a distant sky god.
- **Behavior:** Creator of the arebuko; receives no direct cult, only through the arebuko.
- **Habitat:** The sky; Canhabaque Island, Bijago archipelago, Guinea-Bissau.
- **Source:** Christine Henry, 'Les arebuko des Bijogo (Guinée-Bissau): Culte de possession, objets de puissance', *Systèmes de pensée en Afrique noire* 12 (1993): 39–64, doi:10.4000/span.1319.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 9) Kanogo
- **Slug:** `kanogo`
- **Name:** Kanogo
- **Country:** Guinea-Bissau | **Region:** West Africa | **Culture:** Bijago (Añaki) | **Mythology:** Bijago
- **Type:** nature-spirit | **Archetype:** rock-power | **Element:** earth
- **Aliases:** []
- **Related:** ["nindu"]
- **Description:** Kanogo is a named arebuko (object-power) of the Añaki/Bijago on Canhabaque Island, Guinea-Bissau. It is a standing rock, about the height of a man, on a forested beach; the villagers say it was not set there by human hands. Kanogo is a women's power: a woman is its guardian and sacrificer, and only women attend its ceremonies. Offerings of cooked rice, palm wine and chickens are made, and the rock is addressed in a commanding tone rather than a prayer. During one recorded ceremony, a woman fell into trance and was possessed by the orebuko (returning dead) she had initiated, who spoke through her.
- **Appearance:** Man-high standing rock on a forested beach, with a cutlass and small stools placed before it during rites.
- **Behavior:** Women's power receiving sacrifices for fertility, protection and requests; can be eclipsed by possession by a returning orebuko.
- **Habitat:** Canhabaque Island, Bijago archipelago, Guinea-Bissau.
- **Source:** Christine Henry, 'Les arebuko des Bijogo (Guinée-Bissau): Culte de possession, objets de puissance', *Systèmes de pensée en Afrique noire* 12 (1993): 39–64, doi:10.4000/span.1319.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 10) Ngil
- **Slug:** `ngil`
- **Name:** Ngil
- **Country:** Gabon | **Region:** Central Africa | **Culture:** Fang | **Mythology:** Fang
- **Type:** spirit | **Archetype:** judicial-mask-spirit | **Element:** spirit
- **Aliases:** ["Ngil mask"]
- **Related:** ["mukudj", "mbulu-ngulu"]
- **Description:** Ngil is the terrifying spirit embodied in the mask of the Ngil secret society of the Fang in Gabon. The society's name means 'gorilla', and the mask's elongated face, broad forehead, curved eyebrows and jutting mouth may reference a gorilla. The mask was whitened with kaolin, a colour the Fang associate with ancestral spirits, death and male virility. Ngil members were judicial authorities; the mask's intimidating presence helped resolve conflicts and identify sorcery. The French colonial administration banned Ngil societies in 1910, and use of the mask declined.
- **Appearance:** Elongated whitened face with broad forehead, curved eyebrows and jutting mouth, worn with a full costume.
- **Behavior:** Judicial authority; resolves conflict; identifies sorcery; appears at nighttime ceremonies.
- **Habitat:** Fang country, Gabon; nighttime ceremonies and initiations.
- **Source:** Denver Art Museum, 'Ngil Mask', https://www.denverartmuseum.org/en/object/1942.443; Kreeger Museum, 'Face Mask (Ngil)', https://www.kreegermuseum.org/about-us/collection/african-collection/Fang-artist_Face-Mask-Ngil.
- **Source quality:** documented | **Living tradition:** false | **Attested:** true

### 11) Mukudj
- **Slug:** `mukudj`
- **Name:** Mukudj
- **Country:** Gabon | **Region:** Central Africa | **Culture:** Punu/Ogooué | **Mythology:** Punu
- **Type:** ancestor-spirit | **Archetype:** ancestral-mask-spirit | **Element:** earth
- **Aliases:** ["Okuyi", "Mukudj mask"]
- **Related:** ["ngil", "mbulu-ngulu"]
- **Description:** Mukudj (also okuyi) is the white-faced mask and stilt dance of the Punu and related Ogooué River peoples of southern Gabon. The masks are said to embody the personas of past community elders and were worn by costumed stilt dancers at Mukuji society funerary rites. The creator of a mukudj mask tried to capture the likeness of the most beautiful woman in his community, then transformed her into a transcendent being by applying kaolin from riverbeds, a material associated with healing and the ancestral realm. The mask has a three-part black coiffure, arching brows over slit eyes, and pursed red lips.
- **Appearance:** White kaolin face with three-part black coiffure, arching brows, slit eyes and pursed red lips.
- **Behavior:** Performed by male stilt dancers at Mukuji funerary rites; embodies past elders and idealised womanhood.
- **Habitat:** Ngounié River region and southern Gabon; Punu and related Ogooué River communities.
- **Source:** Museum of Fine Arts, Boston, 'Punu Mask (Okuyi)', https://collections.mfa.org/objects/4748; Metropolitan Museum of Art, 'Mukudj (mask)', https://www.metmuseum.org/art/collection/search/318667.
- **Source quality:** documented | **Living tradition:** true | **Attested:** true

### 12) Mbulu Ngulu
- **Slug:** `mbulu-ngulu`
- **Name:** Mbulu Ngulu
- **Country:** Gabon | **Region:** Central Africa | **Culture:** Kota | **Mythology:** Kota
- **Type:** guardian | **Archetype:** reliquary-guardian | **Element:** earth
- **Aliases:** ["Mbulu Ngulu reliquary", "Kota reliquary guardian"]
- **Related:** ["ngil", "mukudj"]
- **Description:** Mbulu ngulu are Kota reliquary guardian figures that ornamented baskets holding the relics of ancestors. A group of three—male, senior female and junior female—represented ideal ancestors whose relics were held in a basket below. The faces would have glimmered inside a dimly lit room; the lower half of the diamond-shaped support was placed inside the reliquary basket, not exposed as in museum displays. Kota communities moved every few years when the soil no longer guaranteed abundant crops, and the reliquary baskets helped families maintain a memorial to their dead when they moved. After conversion to Christianity from 1900, reliquaries were no longer kept and the figures were abandoned or destroyed, often under missionary pressure.
- **Appearance:** Wood covered with sheets/strips of brass and copper, convex face, semicircular hair, small spool earrings; diamond-shaped support fits into the reliquary basket.
- **Behavior:** Guards ancestral relics; represents ideal ancestors; serves as a memorial for mobile families.
- **Habitat:** Kota country, Gabon; reliquary baskets.
- **Source:** Museum of Fine Arts, Boston, 'Reliquary Figure (Mbulu Ngulu)', https://collections.mfa.org/objects/23992.
- **Source quality:** documented | **Living tradition:** false | **Attested:** true

### 13) Rupé
- **Slug:** `rupe`
- **Name:** Rupé
- **Country:** Equatorial Guinea | **Region:** Central Africa | **Culture:** Bubi | **Mythology:** Bubi
- **Type:** deity | **Archetype:** creator-god | **Element:** sky
- **Aliases:** ["Rúppé", "Eri", "Poto", "Potó"]
- **Related:** ["ommua-tao", "bisila"]
- **Description:** Rupé (also Rúppé, Eri or Poto) is the supreme creator god of the Bubi of Bioko, Equatorial Guinea. He is invisible, has no fixed gender, and no image of him is made; he dwells beyond the sky and is the source of all energy (töú). Bubi cosmogonic narratives say he either descended from the sky and moulded the first two people from red clay, or created them in his transcendental space, breathed a spirit into them and sent them down to earth. He can manifest in the world as fiery lightning, tornadoes and thunder. In the north he is called Rupé, in the south Poto; Eri is another name. Missionaries identified him with the Christian God, and Bubi beliefs hold that the spirits of the dead travel to Pico Basilé, the sacred mountain where God dwells.
- **Appearance:** None; invisible, sexless and without images.
- **Behavior:** Creator and source of energy; manifests in storms; receives cult through ancestors and spirits rather than direct images.
- **Habitat:** Beyond the sky; Pico Basilé, Bioko, Equatorial Guinea.
- **Source:** José L. Sánchez Vega, 'Bioko a través de la naturaleza y la cultura', *Observatorio Medioambiental* 21 (2018): 271–328, doi:10.5209/OBMD.62662; Renata Díaz-Szmidt, 'Między kolonialną glottofagią, postkolonialną traumą a indygeniczną podmiotowością: Rdzenny system wiedzy o świecie i człowieku Bubi', *Teksty Drugie* 6 (2024): 46–65, doi:10.18318/td.2024.6.3.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 14) Ommuá Tao
- **Slug:** `ommua-tao`
- **Name:** Ommuá Tao
- **Country:** Equatorial Guinea | **Region:** Central Africa | **Culture:** Bubi | **Mythology:** Bubi
- **Type:** ancestor-spirit | **Archetype:** legal-ancestor | **Element:** earth
- **Aliases:** ["Ommua Tao"]
- **Related:** ["rupe", "bisila"]
- **Description:** Ommuá tao is the Bubi spirit of the deceased legal father and the most venerated of the immediate ancestors. In Bubi kinship, a woman may be given a spirit husband (mochucu) chosen by oracle; this spirit is the legal father of her children and gives them their patriclan. The child's ritual obligations to this father-spirit culminate in offerings of yams during the annual yam cycle. 'Ommuá' is a respectful term for a deceased father, while 'tao' refers to the ancestors who were heads of patriclan lineages. Ommuá tao belongs to the wider category of barimó ancestor spirits, which are spirits of human origin and are closer to the living than clan founders.
- **Appearance:** No fixed form; a named ancestor spirit.
- **Behavior:** Grants legal paternity and patriclan membership; receives yam offerings; mediates between the living and the ancestral realm.
- **Habitat:** Patriclan shrines and yam fields in Moka, Bioko, Equatorial Guinea.
- **Source:** Nuria Fernández Moreno, 'Raíces para los espíritus: el ciclo agrícola del ñame en Bioko, Guinea Ecuatorial', *Anales del Museo Nacional de Antropología* 15 (2013), https://e-spacio.uned.es/bitstreams/b1d6bc37-b670-4687-badf-bd46090dd82f/download.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### 15) Bisila
- **Slug:** `bisila`
- **Name:** Bisila
- **Country:** Equatorial Guinea | **Region:** Central Africa | **Culture:** Bubi | **Mythology:** Bubi
- **Type:** deity | **Archetype:** life-goddess | **Element:** earth
- **Aliases:** ["Mother Bisila", "Virgen Bisila"]
- **Related:** ["rupe", "ommua-tao"]
- **Description:** Bisila is a Bubi goddess of life and the patroness of Bioko, Equatorial Guinea. She is honored in the rites of malanga (taro), a crop symbolically linked to women and the matriclan; each family offers its first tubers to Bisila and the spirits of the matriclan in the Ripelo ceremony, asking for fertility and abundant harvests. In the Bötöí fertility ritual, women collect seawater and offer it to Bisila for the fertility of crops and women. From the 1960s, Catholic missionaries promoted her identification with the Virgin Mary, and the feast of the Virgin Bisila is celebrated in August with a procession and Mass. Her cult has become a focus of Bubi identity and cultural resistance, and is celebrated in Equatorial Guinea and among Bubi in Catalonia.
- **Appearance:** No fixed traditional form; in the Catholic image she is represented as the Virgin Mary.
- **Behavior:** Grants fertility to women and crops; receives seawater, first tubers and August celebrations.
- **Habitat:** Bioko, Equatorial Guinea; malanga fields and Pico Basilé.
- **Source:** José L. Sánchez Vega, 'Bioko a través de la naturaleza y la cultura', *Observatorio Medioambiental* 21 (2018): 271–328, doi:10.5209/OBMD.62662; Nuria Fernández Moreno, 'Raíces para los espíritus: el ciclo agrícola del ñame en Bioko, Guinea Ecuatorial', *Anales del Museo Nacional de Antropología* 15 (2013), https://e-spacio.uned.es/bitstreams/b1d6bc37-b670-4687-badf-bd46090dd82f/download; Celeste Muñoz and Roger Canals, 'Between Cosmopolitanism and Ethnic Dissolution: Politics, Religion and Iconic Reappropriation in the Cult of the Mother of God of Bisila in Equatorial Guinea and Catalonia', *Social Dynamics* 46, no. 2 (2020): 219–239, doi:10.1080/02533952.2020.1820156.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true

### Optional: Geh-naw (Liberia)
- **Slug:** `geh-naw`
- **Name:** Geh-naw
- **Country:** Liberia | **Region:** West Africa | **Culture:** Mano (or related) | **Mythology:** Mano
- **Type:** spirit | **Archetype:** masquerade-spirit | **Element:** spirit
- **Aliases:** ["Geh-naw mask"]
- **Related:** ["gle"]
- **Description:** Geh-naw is a documented Mano masquerade/spirit known from museum collections (Smithsonian EEPA 1973-001). The available documentation describes a wooden mask associated with the Geh-naw masquerade; published details are limited compared to other Dan/Mano masks. Given the current evidence, it reads more as a masquerade tradition than a fully detailed named spirit being.
- **Appearance:** Wooden mask (documented in Smithsonian collection).
- **Behavior:** Associated with Geh-naw masquerade performances.
- **Habitat:** Mano country, Liberia.
- **Source:** Smithsonian Institution, National Museum of African Art, EEPA 1973-001, ref20135 (Geh-naw mask), https://www.si.edu/object/archives/components/sova-eepa-1973-001-ref20135; see also museum catalog entries for Geh-naw masks (Hahner-Herzog et al., references cited in collection records).
- **Source quality:** documented | **Living tradition:** true | **Attested:** true
- **Note:** Optional; inclusion recommended only if you want maximum coverage despite limited published detail.

### Optional: Orebuko (Guinea-Bissau)
- **Slug:** `orebuko`
- **Name:** Orebuko
- **Country:** Guinea-Bissau | **Region:** West Africa | **Culture:** Bijago (Añaki) | **Mythology:** Bijago
- **Type:** ancestor-spirit | **Archetype:** soul-power | **Element:** spirit
- **Aliases:** ["Arebuko"]
- **Related:** ["nindu", "kanogo"]
- **Description:** Orebuko (pl. arebuko) is the Bijago concept of an intermediate power/returning dead soul that can become attached to objects or manifest through possession. According to Henry, arebuko are given by Nindu to humans; they take the form of natural or manufactured objects, some with proper names and others known only by a common noun. They receive sacrifices and can possess initiates. The term overlaps with irã in kriol usage.
- **Appearance:** Usually invisible; may manifest through a possessed person or through a named object/rock.
- **Behavior:** Object-power/soul of returning dead; receives sacrifices; can possess initiates.
- **Habitat:** Canhabaque Island, Bijago archipelago, Guinea-Bissau.
- **Source:** Christine Henry, 'Les arebuko des Bijogo (Guinée-Bissau): Culte de possession, objets de puissance', *Systèmes de pensée en Afrique noire* 12 (1993): 39–64, doi:10.4000/span.1319.
- **Source quality:** academic | **Living tradition:** true | **Attested:** true
- **Note:** Conceptually related to existing `ira` (ancestor figures/statuettes); recommend holding off to avoid duplication.

## 6) Dataset impact

Assuming approval of the 15 ready entries (and no optional):

| Metric | Current | After | Delta |
|--------|---------|-------|-------|
| Creatures | 3,745 | 3,760 | +15 |
| Stories | 2,185 | 2,185 | 0 |
| Items | 641 | 641 | 0 |
| Combined | 5,930 | 5,945 | +15 |

**Source quality distribution (creatures) — projected:**
- Academic: 105 → 115 (+10: Njayekoi, Gbeni, Krifi, Somtup, Gle, Nindu, Kanogo, Rupé, Ommuá Tao, Bisila)
- Documented: 72 → 77 (+5: Sowei, Banda, Ngil, Mukudj, Mbulu Ngulu)

If adding Geh-naw only: documented → 78. If adding Orebuko only: academic → 116. Visible counts in `js/i18n.js` need updating accordingly.

**Geographic coverage improvement:**
- Sierra Leone: 1 → 5
- Guinea: 1 → 3
- Liberia: 2 → 3
- Guinea-Bissau: 3 → 5 (plus optional Orebuko)
- Gabon: 3 → 6
- Equatorial Guinea: 3 → 6

## 7) Implementation plan

1. **Approve**: Review this dossier; approve/reject optional entries (`Geh-naw`, `Orebuko`) and optional alias expansion for `ninki-nanka`.
2. **Insert**: Create `archive/scripts/add_west_africa_creatures.js` modeled on `add_sahara_sahel_creatures.js`, append 15 ready entries (plus any approved optional), update aliases if approved.
3. **Rebuild**: Run `node archive/scripts/shard-data.mjs`, `python3 archive/scripts/build-creatures-index.py`, `python3 archive/scripts/build-search-index.py`.
4. **Update counts**: Update `js/i18n.js` for all 4 languages (`en`, `es`, `sv`, `no`) — `about.p2`, `m.verify_p2`, `desc.search`, `m.dist_creatures_li5`/`li6`/`li11` (and any other hardcoded totals).
5. **Verify**: Run `npx jest tests/source-quality.test.js tests/geo-validation.test.js tests/creatures-index.test.js` (and other data gates), run targeted Playwright smoke tests.
6. **Commit**: Conventional Commit (e.g., `feat(data): add West Africa creatures batch 2`).
7. **Publish**: Push when credentials available; confirm CI; deploy; verify live. (Deferred per current notes.)

## 8) Risks and open questions

- **Alias collisions**: `Gle`/`Ge` appear as substrings globally; ensured no exact match.
- **Living flag for danced vs believed**: Somtup no longer danced but spirit still recognized → marked `true` (consistent with other folkloric entries).
- **Ngil/Mbulu Ngulu**: Society/baskets abandoned → `living_tradition: false`.
- **`ira` overlap**: Existing entry is low-detail; Orebuko would overlap conceptually. Recommend deferring or merging later.
- **Counts in UI**: Must update all 4 locales and distribution lines to avoid stale numbers.
- **Untracked files**: Many unrelated files present in working tree; do not touch them.

## Approval request

**Ready to insert:** 15 entries listed above (Njayekoi, Gbeni/Gbini, Sowei, Krifi, Somtup, Banda, Gle, Nindu, Kanogo, Ngil, Mukudj, Mbulu Ngulu, Rupé, Ommuá Tao, Bisila).

**Decisions needed:**
1. Approve adding **Geh-naw** (Liberia) as a 16th entry? (Recommended: no, weak documentation; consider later if better sources found)
2. Approve adding **Orebuko** (Guinea-Bissau) as 16th? (Recommended: no, conceptual overlap with existing `ira`)
3. Approve alias expansion for existing **`ninki-nanka`** with Appia (1944) variants? (Recommended: yes, source-only, no new entry)

Reply with approval/revisions and I’ll proceed with insertion, rebuild, count updates, and verification.
