# Congo Basin Expansion (Batch 3) — Dossier for Approval

- **Date:** 2026-10-23
- **Branch:** `audit-a11y-fixes`
- **Scope:** Congo Basin gap-fill — Republic of the Congo, Democratic Republic of the Congo, Cameroon, Central African Republic, Chad
- **Current counts (master):** 3,760 creatures / 2,185 stories / 641 items (combined 5,945)
- **Target after this batch (ready):** 3,775 creatures / 2,185 stories / 641 items (combined 5,960)
- **Policy:** Only entries with real, citable sources. Dedup against existing names/aliases/slugs. Preserve schema/canonical `type` values, valid `country`/`region`. Rebuild shards/indexes. Update visible counts in every locale.

## 1) Coverage and gaps

Current counts in target countries (from `data/datasets/creatures.json`):

| Country | Current | Region | Notes |
|---------|---------|--------|-------|
| Congo | 4 | Central Africa | Lowest in the basin; no Kongo power figure or Woyo/Vili goddess. |
| Democratic Republic of the Congo | 16 | Central Africa | Large Songye/Luba/Chokwe/Pende/Tabwa gap. |
| Cameroon | 5 | Central Africa | Duala/Fang gap; several existing entries are low quality. |
| Central African Republic | 8 | Central Africa | Banda/Mandjia/Gbaya/Zande gap; existing entries include duplicates. |
| Chad | 5 | Central Africa | Hadjerai gap. |
| São Tomé and Príncipe | 1 (`ossobo`) | Central Africa | No solid named-being source found; left unchanged. |

Target after this batch:

| Country | Current | Added | Target |
|---------|---------|-------|--------|
| Congo | 4 | 2 | 6 |
| Democratic Republic of the Congo | 16 | 6 | 22 |
| Cameroon | 5 | 3 | 8 |
| Central African Republic | 8 | 3 | 11 |
| Chad | 5 | 1 | 6 |
| São Tomé and Príncipe | 1 | 0 | 1 |

## 2) Method and gates

1. **Source standard.** Every entry has a named source with a URL or DOI. Academic sources are peer-reviewed articles, monographs or museum research publications. Museum object records and named reference articles are `documented`. A secondary PDF that cites academic work is `documented`, not `academic`.
2. **Dedup.** Probes cover slug, name and every alias, with punctuation and accents normalised. `bumba`, `nkisi-nkondi`, `bunzi`, `kifwebe`, `chihongo`, `mwana-pwo`, `kipoko`, `kibawa`, `mbori`, `ngakola`, `sokai`, `talakougba`, `nyambe`, `bedimo`, `nzame`, `margai`, `mangaaka`, `nkondi`, `zagi`, `edimo` and `mpulu-bunzi` are free. `mbumba` is already an alias of `nkadi-kongo` and is not inserted again.
3. **Schema.** Each entry uses the existing fields and canonical `type` values (`object`, `creator-deity`, `deity`, `spirit`, `ancestor-spirit`, `supreme-deity`, `nature-spirit`). `country` and `region` are validated against `geo-countries.json` and `geo-regions.json`.
4. **Quality gates.** `tests/source-quality.test.js`, `tests/geo-validation.test.js`, `tests/creatures-index.test.js`, targeted Playwright, and ESLint.
5. **Rebuild.** `shard-data.mjs` → `build-creatures-index.py` → `build-search-index.py`, in that order.
6. **Count fix.** Batch 2 updated only the English strings. Spanish, Swedish and Norwegian still show 3,745 / 5,930, and `desc.bestiary`, `desc.search` and `m.dist_creatures_li11` are stale in several locales. This batch corrects all locales to 3,775 / 5,960.

## 3) Dedup results

### Excluded or folded

| Candidate | Reason |
|-----------|--------|
| **Mbumba** | Already an alias of `nkadi-kongo` (Kongo rainbow serpent). Adding it as a separate entry would duplicate. Replaced with **Bumba**, the Kuba creator name used in the same de Heusch article. The entry explains de Heusch's identification of Bumba with Mbumba, but does not reuse the alias. |
| **Biloko** | Plural of **Eloko**, which already has five entries. No new entry. |
| **Mizimu** | Overlaps existing `imizimu` (Burundi). |
| **Kôro** | Overlaps Nyambe/Nzambé. |
| **Mangaaka** | Folded into `nkisi-nkondi` as an alias and described as the preeminent jurisprudence figure, not a separate being. |
| **São Tomé** | No solid named-being source. The fauna thesis covers animal characters; the performing-arts PDF names story genres (`soia`) and angry spirits but no named being. Left at one entry rather than padding. |

### Final 15

| # | Name | Slug | Country | Type | Quality | Primary source |
|---|------|------|---------|------|---------|----------------|
| 1 | Nkisi Nkondi (Mangaaka) | `nkisi-nkondi` | Congo | object | documented | Met 320053; Brooklyn 2957 |
| 2 | Bumba | `bumba` | DR Congo | creator-deity | academic | de Heusch 2012 |
| 3 | Bunzi | `bunzi` | Congo | deity | academic | de Heusch 2012 |
| 4 | Kifwebe | `kifwebe` | DR Congo | spirit | academic | Hersak 2020 |
| 5 | Chihongo | `chihongo` | DR Congo | ancestor-spirit | documented | Art Institute 181740 |
| 6 | Mwana Pwo | `mwana-pwo` | DR Congo | ancestor-spirit | documented | Art Institute 120215 |
| 7 | Kipoko | `kipoko` | DR Congo | ancestor-spirit | documented | NOMA 88.46; Rietberg 2016.151 |
| 8 | Kibawa | `kibawa` | DR Congo | spirit | documented | Met Timeline |
| 9 | Mbori | `mbori` | CAR | supreme-deity | academic | Evans-Pritchard 1937 |
| 10 | Ngakola | `ngakola` | CAR | deity | documented | Jimi Zacka, citing Mayneri 2010 |
| 11 | Sokaï | `sokai` | CAR | nature-spirit | documented | Jimi Zacka, citing Raponda-Walker & Sillans 1962 |
| 12 | Nyambe | `nyambe` | Cameroon | supreme-deity | academic | Bahoken 1961 |
| 13 | Bedimo | `bedimo` | Cameroon | ancestor-spirit | academic | Bahoken 1961 |
| 14 | Nzame | `nzame` | Cameroon | creator-deity | academic | Świderski 1975 |
| 15 | Margaï | `margai` | Chad | nature-spirit | academic | Vincent 1962 |

## 4) Entry details

### 1. Nkisi Nkondi (Mangaaka) — `nkisi-nkondi`

- **Country / region / culture:** Congo / Central Africa / Kongo (Yombe)
- **Type / archetype / element:** `object` / power-figure / spirit
- **Aliases:** Nkisi N'Kondi, Mangaaka, Nkondi
- **Related:** `bunzi`, `nkadi-kongo`
- **Description:** An nkisi nkondi is a Kongo power figure: a carved wooden vessel charged by a ritual specialist (nganga) to house a specific spirit. The nkondi ("hunter") type was used to hunt witches and wrongdoers and to witness and bind agreements. A nail or blade driven into the figure activates its force and recalls the oath; the metal also invokes the ancestor spirit. The Mangaaka figures of the Chiloango River region are the most ambitious class, with an aggressive stance, mpu headdress, beard and abdominal cavity for medicines; they were the preeminent force of jurisprudence, represented as a presiding authority.
- **Appearance:** Carved wood figure, often with a prominent abdomen, beard, mpu headdress, and accumulations of nails and blades.
- **Behavior:** Hunts witches and wrongdoers; witnesses oaths and agreements; punishes violations through spirit force.
- **Habitat:** Kongo villages and shrines of the lower Congo and Chiloango River region.
- **Source:** The Metropolitan Museum of Art, "Mangaaka Power Figure (Nkisi N'Kondi)," 320053, https://www.metmuseum.org/art/collection/search/320053; Brooklyn Museum, "Nkisi Nkondi (Power Figure)," 2957, https://www.brooklynmuseum.org/objects/2957; Fine Arts Museums of San Francisco, "Nkisi Nkondi (Power Figure)," https://www.famsf.org/artworks/nkisi-nkondi-power-figure.
- **Caveat:** Yombe/Kongo culture spans Congo, DR Congo and Angola; assigned to Congo to fill the lowest basin gap. Mangaaka is treated as an alias, not a separate entry.

### 2. Bumba — `bumba`

- **Country / region / culture:** DR Congo / Central Africa / Kuba
- **Type / archetype / element:** `creator-deity` / creator-god / water
- **Aliases:** none (avoids the existing `mbumba` alias on `nkadi-kongo`)
- **Related:** `bunzi`, `nkadi-kongo`
- **Description:** Bumba is the creator in the Kuba creation story of the Democratic Republic of the Congo. At the beginning of time he was seized by painful cramps and vomited the sun, the moon and the stars; the sun evaporated the waters, and he vomited again, bringing forth nine animals and then a great number of people. The myth belongs to a wide Bantu complex in which the python or rainbow serpent is the supreme being or chief of the terrestrial animals; de Heusch identifies the Kuba Bumba with Mbumba, the rainbow serpent of the western Bantu.
- **Appearance:** No fixed form; a creator whose body brings forth celestial bodies and living things.
- **Behavior:** Creates the sun, moon, stars, animals and humans by vomiting them; the myth explains the origin of the world.
- **Habitat:** Kuba country, DR Congo; the primordial waters.
- **Source:** Luc de Heusch, "Essai sur la mythologie bantoue," *Journal des Africanistes* (2012), https://journals.openedition.org/africanistes/4408, citing Torday and Joyce (1911): 20.
- **Caveat:** De Heusch treats Bumba and Mbumba as the same Bantu complex. The existing `nkadi-kongo` entry already carries "Mbumba" as an alias for the Kongo rainbow serpent. This entry uses the Kuba name **Bumba** and does not repeat the alias, so it adds the Kuba creation narrative without creating a duplicate lookup.

### 3. Bunzi — `bunzi`

- **Country / region / culture:** Congo / Central Africa / Woyo and Vili (Loango)
- **Type / archetype / element:** `deity` / earth-goddess / earth
- **Aliases:** Mpulu Bunzi
- **Related:** `bumba`, `nkisi-nkondi`
- **Description:** Bunzi is a supreme female deity of the Woyo and Vili of the Loango kingdom, in present-day Republic of the Congo. She is the queen of all earth spirits and the mistress of the aquatic spirits; in the Yombe version of the myth she was male, and the change of sex is a recurring feature of these superior spirits. The cult of Mbumba and Bunzi once extended across much of the Kongo linguistic area, sometimes together and sometimes separately. Among the Woyo, a nkisi animated by Mbumba protected warriors, and Mbumba was invoked at clan-chief installations "so that he may help the children."
- **Appearance:** No fixed form; a supreme earth deity, sometimes represented through the serpent Mbumba.
- **Behavior:** Rules the earth spirits and aquatic spirits; receives cult; protects warriors and children through Mbumba.
- **Habitat:** Loango coast, Congo; earth and water.
- **Source:** Luc de Heusch, "Essai sur la mythologie bantoue," *Journal des Africanistes* (2012), https://journals.openedition.org/africanistes/4408.
- **Caveat:** Mpulu Bunzi is the rain master and friend of Mbumba in the same article; the alias is included because the names are used together in the cult.

### 4. Kifwebe — `kifwebe`

- **Country / region / culture:** DR Congo / Central Africa / Songye and Luba
- **Type / archetype / element:** `spirit` / masked-sorcery-spirit / spirit
- **Aliases:** Kifwebe mask, Bwadi bwa Kifwebe
- **Related:** `chihongo`, `mwana-pwo`, `kipoko`
- **Description:** Kifwebe (pl. bifwebe) is the striated mask and masquerade of the Songye and Luba peoples of the Democratic Republic of the Congo. The masks are performed by the bwadi bwa kifwebe association, a regulatory body with political and judicial functions. Among the eastern Songye, kifwebe masks are associated with the control of sorcery and witchcraft; in Luba areas, maskers are said to cleanse villages of evil spirits. They appear at the investiture and death of chiefs, at the new moon, at initiations and circumcisions, and at communal work; male and female masks are distinguished by their crests, colors and features.
- **Appearance:** Striated wooden mask, male and female variants with different crests and color conventions.
- **Behavior:** Regulates sorcery; cleanses villages; performs at chiefly, initiatory and communal events.
- **Habitat:** Songye and Luba villages, DR Congo.
- **Source:** Dunja Hersak, "Further Perspectives on Kifwebe Masquerades," *African Arts* (2020), doi:10.1162/afar_a_00511.

### 5. Chihongo — `chihongo`

- **Country / region / culture:** DR Congo / Central Africa / Chokwe
- **Type / archetype / element:** `ancestor-spirit` / male-ancestor-mask / earth
- **Aliases:** Chihongo mask
- **Related:** `mwana-pwo`, `kifwebe`
- **Description:** Chihongo is the male mask character of the Chokwe peoples of the Democratic Republic of the Congo and Angola, the male counterpart of the female mwana pwo. The Chokwe use masquerades to engage their ancestors, asking them to guide, protect and educate the living. Chihongo's feathered headdress, red coloring, scarification patterns, stylized beard and filed teeth evoke wisdom, leadership and status. Both characters perform at male initiation rites, but chihongo also appears at events where a chief's affirmation is desired.
- **Appearance:** Male face mask with feathered headdress, red coloring, scarification, stylized beard and filed teeth.
- **Behavior:** Represents male ancestors; affirms chiefs; participates in male initiation.
- **Habitat:** Chokwe villages of the DR Congo–Angola borderlands.
- **Source:** Art Institute of Chicago, "Male Face Mask (Chihongo)," 2003.174, https://www.artic.edu/artworks/181740.
- **Caveat:** The museum object was made in Angola; the Chokwe cultural area spans the DR Congo–Angola border. Assigned to DR Congo to fill the DR Congo gap.

### 6. Mwana Pwo — `mwana-pwo`

- **Country / region / culture:** DR Congo / Central Africa / Chokwe
- **Type / archetype / element:** `ancestor-spirit` / female-ancestor-mask / earth
- **Aliases:** Mwana Pwo mask, Pwo
- **Related:** `chihongo`, `kifwebe`
- **Description:** Mwana Pwo is the female ancestor mask character of the Chokwe peoples of the Democratic Republic of the Congo and Angola. A popular and frequent figure in entertainment masquerades, mwana pwo is always worn by a male dancer. The mask represents a female ancestor and symbolizes fecundity and the prominent role of women in Chokwe society. Although idealized, its features suggest the individuality of a portrait, and it often carries elements of beauty such as scarification and elaborate hairstyles.
- **Appearance:** Female face mask with idealized features, scarification and elaborate hairstyle.
- **Behavior:** Represents female ancestors; promotes fecundity; performs in entertainment and initiation masquerades.
- **Habitat:** Chokwe villages of the DR Congo–Angola borderlands.
- **Source:** Art Institute of Chicago, "Female Face Mask (Mwana Pwo)," 1992.731, https://www.artic.edu/artworks/120215.
- **Caveat:** The museum object was made in Angola; assigned to DR Congo for the same cross-border reason as Chihongo.

### 7. Kipoko — `kipoko`

- **Country / region / culture:** DR Congo / Central Africa / Eastern Pende
- **Type / archetype / element:** `ancestor-spirit` / chief-mask / earth
- **Aliases:** Kipoko mask
- **Related:** `kifwebe`, `chihongo`
- **Description:** Kipoko is a helmet mask of the Eastern Pende peoples of the Democratic Republic of the Congo. It is a chief's crest mask, danced at the appointment of a new village chief and linked to the world of the dead. Kipoko also plays an important role in the circumcision camp (mukanda): at the end of initiation, the boys must grab food from the edge of the mask as a final test. The mask's rounded form and painted features are associated with chiefly authority and the transition from boyhood to manhood.
- **Appearance:** Rounded helmet mask with painted features, worn as a crest.
- **Behavior:** Installs chiefs; links the living to the dead; tests initiates at the end of mukanda.
- **Habitat:** Eastern Pende villages, DR Congo.
- **Source:** New Orleans Museum of Art, "Helmet Mask (kipoko)," 88.46, https://noma.org/collection/helmet-mask-kipoko/; Museum Rietberg, "Helmmaske, kipoko," 2016.151, https://rietberg.ch/en/collections/2016-151; Oberhofer, "Pende Initiation Masks: Art That Makes Men out of Boys," Africa Art Archive, https://africa-art-archive.ch/en/multiple-readings/pende-initiation-masks-art-that-makes-men-out-of-boys.

### 8. Kibawa — `kibawa`

- **Country / region / culture:** DR Congo / Central Africa / Tabwa and eastern Luba
- **Type / archetype / element:** `spirit` / possession-spirit / earth
- **Aliases:** none
- **Related:** none
- **Description:** Kibawa is a great earth spirit worshipped by some Tabwa and eastern Luba peoples of the Democratic Republic of the Congo. Devotion to Kibawa centers on spiritual possession as a means of personal salvation: adepts are possessed by the spirit and receive supernatural guidance and support. They are required to reject nontraditional cultural imports such as Swahili, the language of colonial missionaries and coastal traders. Ritual instruments associated with the cult include rattles and colorful beaded headdresses decorated with geometric designs and fringed with fur or feathers.
- **Appearance:** No fixed form; manifests through possession and ritual instruments.
- **Behavior:** Possesses adepts; offers personal salvation and guidance; demands rejection of foreign imports.
- **Habitat:** Tabwa and eastern Luba country, DR Congo.
- **Source:** The Metropolitan Museum of Art, "Central Africa, 1800–1900 A.D.," Heilbrunn Timeline of Art History, https://www.metmuseum.org/toah/ht/10/afc.

### 9. Mbori — `mbori`

- **Country / region / culture:** Central African Republic / Central Africa / Zande
- **Type / archetype / element:** `supreme-deity` / supreme-being / spirit
- **Aliases:** Zagi
- **Related:** `ngakola`, `kibawa`
- **Description:** Mbori is the supreme being of the Zande peoples of the Central African Republic, South Sudan and the Democratic Republic of the Congo. Zande belief holds that the souls of the dead become ghosts, which inhabit earth caverns in the bush; Mbori also dwells there and partakes of their ghostly nature. In Nzakara-speaking areas the supreme being is called Zagi, a term that also denotes the outside universe. Under missionary influence Mbori has become almost universally identified with the Christian God, while ghosts once regarded as benevolent ancestors are increasingly associated with evil.
- **Appearance:** No fixed form; a supreme being with a ghostly nature.
- **Behavior:** Dwells in earth caverns with the ghosts; receives Zande belief and, later, Christian identification.
- **Habitat:** Earth caverns in the bush; Zande country of CAR, South Sudan and DR Congo.
- **Source:** E. E. Evans-Pritchard, *Witchcraft, Oracles and Magic among the Azande* (Oxford: Clarendon Press, 1937); Everyculture, "Zande: Religion and Expressive Culture," https://www.everyculture.com/Africa-Middle-East/Zande-Religion-and-Expressive-Culture.html.
- **Caveat:** The Zande are cross-border; assigned to CAR to fill the CAR gap. "Zagi" is the Nzakara name, not a separate being.

### 10. Ngakola — `ngakola`

- **Country / region / culture:** Central African Republic / Central Africa / Banda and Mandjia
- **Type / archetype / element:** `deity` / bush-god / forest
- **Aliases:** none
- **Related:** `sokai`, `mbori`
- **Description:** Ngakola is the bush god of the Banda and Mandjia peoples of the Central African Republic. He is a spirit of the wilderness with a divine essence and vital force, able to answer the essential needs of human life: health, protection and education. Ngakola is not a distant or self-sufficient god; he requires offerings and sacrifices from his devotees in return for what they receive from him. The Banda and Mandjia occupy the centre and south-west of the Central African Republic.
- **Appearance:** No fixed form; a bush god.
- **Behavior:** Grants health, protection and education; requires offerings and sacrifices.
- **Habitat:** Bush and savanna of the central and south-western CAR.
- **Source:** Jimi Zacka, *Mythes et cosmogonies en Centrafrique* (PDF), https://www.luebo.org/biblio/docs/AFR085-MYTHES_ET_COSMOGONIES_EN_CENTRAFRIQUE_CR.pdf, citing Andrea Ceriana Mayneri, *La rhétorique de la dépossession* (PhD thesis, Université Aix-Marseille, 2010), 167.
- **Quality note:** The PDF is secondary, so this is `documented` rather than `academic`, even though it cites a doctoral thesis.

### 11. Sokaï — `sokai`

- **Country / region / culture:** Central African Republic / Central Africa / Gbaya and Mandja
- **Type / archetype / element:** `nature-spirit` / bush-genie / earth
- **Aliases:** Talakougba, Sokai
- **Related:** `ngakola`, `mbori`
- **Description:** Sokaï (also called Talakougba) are small, human-shaped genies described by the Gbaya and Mandja peoples of the Central African Republic. They have long hair falling to their shoulders and white skin, the colour of the inhabitants of the other world. Their favourite places are the hollows of rocks and great trees and the edges of water, where they like to rest. They can make people disappear and reappear, and can even take them hostage for a long period.
- **Appearance:** Small human-shaped genies with long white hair and white skin.
- **Behavior:** Haunt rocks, trees and water edges; can abduct people and make them reappear.
- **Habitat:** Rock hollows, great trees and water edges in the CAR.
- **Source:** Jimi Zacka, *Mythes et cosmogonies en Centrafrique* (PDF), https://www.luebo.org/biblio/docs/AFR085-MYTHES_ET_COSMOGONIES_EN_CENTRAFRIQUE_CR.pdf, citing A. Raponda-Walker and R. Sillans, *Rites et croyances des peuples du Gabon* (Paris: Présence Africaine, 1962).
- **Quality note:** Secondary PDF citing a named monograph; `documented`, not `academic`.

### 12. Nyambe — `nyambe`

- **Country / region / culture:** Cameroon / Central Africa / Duala
- **Type / archetype / element:** `supreme-deity` / supreme-being / sky
- **Aliases:** Ňambe
- **Related:** `bedimo`, `nzame`
- **Description:** Nyambe (Ňambe) is the supreme being of the Duala and related Bantu peoples of southern Cameroon. He is the first cause and creator of the universe and of everything it contains, and the generator of humankind. Nyambe is also called the father of the baweňa, the living, and of the bedimo, the dead. In Duala thought the living are pure and preserved from corruption, while the bedimo are the dead in the other world; the two categories stand in opposition and define the place of the ancestors.
- **Appearance:** No fixed form; a supreme creator.
- **Behavior:** Creates the universe and humankind; fathers both the living and the dead.
- **Habitat:** Sky and the Duala homeland of southern Cameroon.
- **Source:** Jean-Calvin Bahoken, "La notion de bedimo chez les Bantu du Cameroun," *Journal de la Société des Africanistes* 31, no. 1 (1961): 91–96, https://www.persee.fr/doc/jafr_0037-9166_1961_num_31_1_1932.

### 13. Bedimo — `bedimo`

- **Country / region / culture:** Cameroon / Central Africa / Duala and related Bantu
- **Type / archetype / element:** `ancestor-spirit` / ancestor-spirit / spirit
- **Aliases:** Edimo
- **Related:** `nyambe`, `nzame`
- **Description:** Bedimo (sing. edimo) are the dead and ancestral spirits of the Duala and related Bantu peoples of southern Cameroon. They are defined in opposition to the baweňa, the living, who are pure and preserved from corruption; Nyambe is called the father of both. The bedimo are the dead in their other-world condition, and they remain in relation to the living through ancestor rites and offerings. The notion is central to Bahoken's account of Duala cosmology and the place of the dead.
- **Appearance:** No fixed form; ancestral spirits.
- **Behavior:** Remain in relation to the living; receive ancestor rites and offerings.
- **Habitat:** The other world and the Duala homeland.
- **Source:** Jean-Calvin Bahoken, "La notion de bedimo chez les Bantu du Cameroun," *Journal de la Société des Africanistes* 31, no. 1 (1961): 91–96, https://www.persee.fr/doc/jafr_0037-9166_1961_num_31_1_1932.

### 14. Nzame — `nzame`

- **Country / region / culture:** Cameroon / Central Africa / Fang
- **Type / archetype / element:** `creator-deity` / creator-god / sky
- **Aliases:** none
- **Related:** `nyambe`, `bedimo`
- **Description:** Nzame is the first person of the Fang trinity and the creator-father of Fang tradition. The Fang, who migrated from Cameroon toward Gabon, developed the trinity as a syncretic form drawing on their own mythology, Mitsogho and Mpongwe beliefs, and Christianity. Nzame Mebeghe holds the powers of the Father; Mebeghe is compared to Jesus Christ, and Gningone Mebeghe to Eve, the Virgin or the Holy Spirit. The trinity is the subject of theological speculation and of myths known to the fully initiated.
- **Appearance:** No fixed form; a creator-father.
- **Behavior:** Creates and fathers; the first person of the Fang trinity.
- **Habitat:** Fang country of southern Cameroon and Gabon.
- **Source:** Stanisław Świderski, "Aperçu sur la trinité et la pensée triadique chez les Fang au Gabon," *Canadian Journal of African Studies* (1975), doi:10.1080/00083968.1975.10804457.
- **Caveat:** The article is focused on Fang in Gabon. Assigned to Cameroon because the Fang migrated from Cameroon and the tradition spans the border; this is the least clean country assignment in the batch.

### 15. Margaï — `margai`

- **Country / region / culture:** Chad / Central Africa / Hadjerai
- **Type / archetype / element:** `nature-spirit` / local-spirit / earth
- **Aliases:** Margai, Margay
- **Related:** `ngakola`
- **Description:** Margaï are the local spirits of the Hadjerai peoples of the Guéra and Salamat regions of Chad. They are present in family and village altars, often small pots called bourmas, and are served by ritual specialists known as the "masters of Margaï." The cult addresses health, marriage, birth, death, solemn oaths and the agricultural cycle, including the first storms and the harvest. Margaï are plural, can be benevolent or malevolent, and stand in relation to a supreme god; some are associated with panthers and lions.
- **Appearance:** No fixed form; present in altars and small pots (bourmas).
- **Behavior:** Receives sacrifice and consultation for health, oaths, harvest and social rites; can be benevolent or malevolent.
- **Habitat:** Hadjerai country of Guéra and Salamat, Chad.
- **Source:** Jeanne-Françoise Vincent, "Les Margaï du pays Hadjeraï (Tchad)," *Bulletin de l'Institut de Recherches Scientifiques au Congo* 1 (1962), https://horizon.documentation.ird.fr/exl-doc/pleins_textes/divers15-11/15192.pdf.
- **Note:** "Margaï" is the Arabic term used in the article; each Hadjerai language has its own terms for the divinity, the altar and the objects.

## 5) Dataset impact

| Metric | Current | After | Delta |
|--------|---------|-------|-------|
| Creatures | 3,760 | 3,775 | +15 |
| Stories | 2,185 | 2,185 | 0 |
| Items | 641 | 641 | 0 |
| Combined | 5,945 | 5,960 | +15 |
| Academic | 115 | 123 | +8 |
| Documented | 77 | 84 | +7 |

New entries by country: Congo 2, DR Congo 6, Cameroon 3, CAR 3, Chad 1.

### Visible count strings to update

All four locales (`en`, `es`, `sv`, `no`):

- `about.p2`: creatures 3,760/3,745 → **3,775**
- `m.verify_p2`: creatures 3,760/3,745 → **3,775**; combined 5,945/5,930 → **5,960**
- `m.dist_creatures_li11`: 3,760/3,745 → **3,775**
- `desc.bestiary` (es/sv/no): 3,745 → **3,775**
- `desc.search` (es/sv/no): 3,745 → **3,775**
- `m.dist_creatures_li5`: academic 115 → **123**
- `m.dist_creatures_li6`: documented 77 → **84**

`m.dist_stories_li7` stays 2,185. After editing, grep for `3,745`, `3 745`, `3,760`, `3 760`, `5,930`, `5 930`, `5,945`, `5 945`, `115`, `77` to catch stragglers.

## 6) Implementation plan

1. Create `archive/scripts/add_congo_basin_creatures.js` modeled on `add_west_africa_creatures.js`; idempotent by slug; 15 entries.
2. Run the script; confirm total 3,775.
3. `node archive/scripts/shard-data.mjs`
4. `python3 archive/scripts/build-creatures-index.py`
5. `python3 archive/scripts/build-search-index.py`
6. Update `js/i18n.js` count strings for all four locales.
7. Run `npx jest tests/source-quality.test.js tests/geo-validation.test.js tests/creatures-index.test.js`.
8. Run targeted Playwright and ESLint.
9. Commit with a Conventional Commit message, e.g. `feat(creatures): add Congo Basin creatures batch 3`.
10. Push and deploy remain deferred until credentials are available.

## 7) Risks and open questions

1. **Bumba vs Mbumba.** Bumba is the Kuba creator; de Heusch identifies him with Mbumba, which is already an alias of `nkadi-kongo`. The entry is differentiated by culture and narrative and does not reuse the alias. If strict identity is preferred, drop Bumba and reduce the batch to 14 rather than duplicate.
2. **Nzame country.** The source is Gabon-focused. Cameroon is chosen because the Fang migrated from Cameroon and the tradition spans the border. If strict source-country matching is preferred, change to Gabon (already at 6 after batch 2) and accept a Cameroon count of 7.
3. **Chihongo/Mwana Pwo country.** The museum objects were made in Angola, but the Chokwe cultural area spans the DR Congo–Angola border. Assigned to DR Congo to fill the DR Congo gap.
4. **Nkisi Nkondi country.** Yombe/Kongo cross-border; assigned to Congo to fill the lowest basin gap.
5. **Mbori country.** Zande cross-border; assigned to CAR.
6. **São Tomé.** Left at one entry because no solid named-being source was found. No padding.
7. **Count bug.** Batch 2 left es/sv/no stale; this batch fixes all locales. The fix is included in the same commit so the visible counts match the dataset.

## Approval request

Approve this 15-entry batch as listed, or adjust the country assignments / Bumba decision before insertion. On approval I will write the insertion script, rebuild shards and indexes, update all locale counts, run the gates, and commit locally. Push and deploy stay deferred.
