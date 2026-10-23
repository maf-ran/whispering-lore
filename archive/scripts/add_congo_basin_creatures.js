const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', '..', 'data', 'datasets', 'creatures.json')
const DATE = '2026-10-23'

const entries = [
  {
    id: 'nkisi-nkondi-001',
    slug: 'nkisi-nkondi',
    name: 'Nkisi Nkondi',
    country: 'Congo',
    region: 'Central Africa',
    culture: 'Kongo (Yombe)',
    type: 'object',
    mythology: 'Kongo',
    archetype: 'power-figure',
    element: 'spirit',
    aliases: ["Nkisi N'Kondi", 'Mangaaka', 'Nkondi'],
    related: ['bunzi', 'nkadi-kongo'],
    description:
      "An nkisi nkondi is a Kongo power figure: a carved wooden vessel charged by a ritual specialist (nganga) to house a specific spirit. The nkondi ('hunter') type was used to hunt witches and wrongdoers and to witness and bind agreements. A nail or blade driven into the figure activates its force and recalls the oath; the metal also invokes the ancestor spirit. The Mangaaka figures of the Chiloango River region are the most ambitious class, with an aggressive stance, mpu headdress, beard and abdominal cavity for medicines; they were the preeminent force of jurisprudence, represented as a presiding authority.",
    appearance:
      'Carved wood figure, often with a prominent abdomen, beard, mpu headdress, and accumulations of nails and blades.',
    behavior:
      'Hunts witches and wrongdoers; witnesses oaths and agreements; punishes violations through spirit force.',
    habitat: 'Kongo villages and shrines of the lower Congo and Chiloango River region.',
    habitat_tags: ['village', 'shrine'],
    behavior_tags: ['judgment', 'oath', 'protection'],
    strengths: ['witchcraft detection', 'oath enforcement', 'judicial authority'],
    weaknesses: [],
    cultural_significance:
      'Nkisi nkondi is a Kongo power figure used for witchcraft detection, oath enforcement and jurisprudence; Mangaaka is its most authoritative form.',
    summary:
      'Kongo power figure charged to hunt witches, witness oaths and enforce agreements.',
    fun_fact:
      'A nail or blade is driven into the figure to activate its force and recall the oath.',
    fun_fact_generated: false,
    keywords: ['nkisi nkondi', 'mangaaka', 'kongo', 'congo', 'power figure', 'nkisi'],
    search_terms: ['nkisi nkondi mangaaka kongo power figure oath'],
    tags: ['kongo', 'congo', 'object', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Nkisi Nkondi – Kongo Power Figure',
    seo_description:
      'Nkisi nkondi, the Kongo power figure charged to hunt witches, witness oaths and enforce agreements, with Mangaaka as its preeminent form.',
    motifs: [],
    featured_in_stories: [],
    source:
      "The Metropolitan Museum of Art, 'Mangaaka Power Figure (Nkisi N'Kondi)', 320053, https://www.metmuseum.org/art/collection/search/320053; Brooklyn Museum, 'Nkisi Nkondi (Power Figure)', 2957, https://www.brooklynmuseum.org/objects/2957; Fine Arts Museums of San Francisco, 'Nkisi Nkondi (Power Figure)', https://www.famsf.org/artworks/nkisi-nkondi-power-figure",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'bumba-001',
    slug: 'bumba',
    name: 'Bumba',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Kuba',
    type: 'creator-deity',
    mythology: 'Kuba',
    archetype: 'creator-god',
    element: 'water',
    aliases: [],
    related: ['bunzi', 'nkadi-kongo'],
    description:
      'Bumba is the creator in the Kuba creation story of the Democratic Republic of the Congo. At the beginning of time he was seized by painful cramps and vomited the sun, the moon and the stars; the sun evaporated the waters, and he vomited again, bringing forth nine animals and then a great number of people. The myth belongs to a wide Bantu complex in which the python or rainbow serpent is the supreme being or chief of the terrestrial animals; de Heusch identifies the Kuba Bumba with Mbumba, the rainbow serpent of the western Bantu.',
    appearance:
      'No fixed form; a creator whose body brings forth celestial bodies and living things.',
    behavior:
      'Creates the sun, moon, stars, animals and humans by vomiting them; the myth explains the origin of the world.',
    habitat: 'Kuba country, DR Congo; the primordial waters.',
    habitat_tags: ['wilderness'],
    behavior_tags: ['creation'],
    strengths: ['creation'],
    weaknesses: [],
    cultural_significance:
      'Bumba is the Kuba creator whose vomiting produces the celestial bodies, animals and humans.',
    summary:
      'Kuba creator deity who vomits the sun, moon, stars, animals and humans.',
    fun_fact:
      'Bumba creates by vomiting: first the sun, moon and stars, then nine animals and a great number of people.',
    fun_fact_generated: false,
    keywords: ['bumba', 'kuba', 'dr congo', 'creator', 'creation myth', 'mbumba'],
    search_terms: ['bumba kuba creator god creation myth democratic republic of the congo'],
    tags: ['kuba', 'democratic-republic-of-the-congo', 'creator-deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Bumba – Kuba Creator Deity',
    seo_description:
      'Bumba, the Kuba creator who vomited the sun, moon, stars, animals and humans, identified by de Heusch with Mbumba.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Luc de Heusch, 'Essai sur la mythologie bantoue', Journal des Africanistes (2012), https://journals.openedition.org/africanistes/4408, citing Torday and Joyce (1911): 20",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'bunzi-001',
    slug: 'bunzi',
    name: 'Bunzi',
    country: 'Congo',
    region: 'Central Africa',
    culture: 'Woyo and Vili (Loango)',
    type: 'deity',
    mythology: 'Woyo and Vili',
    archetype: 'earth-goddess',
    element: 'earth',
    aliases: ['Mpulu Bunzi'],
    related: ['bumba', 'nkisi-nkondi'],
    description:
      "Bunzi is a supreme female deity of the Woyo and Vili of the Loango kingdom, in present-day Republic of the Congo. She is the queen of all earth spirits and the mistress of the aquatic spirits; in the Yombe version of the myth she was male, and the change of sex is a recurring feature of these superior spirits. The cult of Mbumba and Bunzi once extended across much of the Kongo linguistic area, sometimes together and sometimes separately. Among the Woyo, a nkisi animated by Mbumba protected warriors, and Mbumba was invoked at clan-chief installations 'so that he may help the children'.",
    appearance:
      'No fixed form; a supreme earth deity, sometimes represented through the serpent Mbumba.',
    behavior:
      'Rules the earth spirits and aquatic spirits; receives cult; protects warriors and children through Mbumba.',
    habitat: 'Loango coast, Congo; earth and water.',
    habitat_tags: ['coast', 'village'],
    behavior_tags: ['ceremonial', 'protection'],
    strengths: ['rule over earth spirits', 'rule over aquatic spirits', 'protection'],
    weaknesses: [],
    cultural_significance:
      'Bunzi is the Woyo/Vili queen of earth spirits and mistress of aquatic spirits, central to the Loango cult of Mbumba and Bunzi.',
    summary:
      'Woyo/Vili supreme earth goddess, queen of earth spirits and mistress of aquatic spirits.',
    fun_fact:
      'In the Yombe version of the myth Bunzi was male; the change of sex recurs among these superior spirits.',
    fun_fact_generated: false,
    keywords: ['bunzi', 'mpulu bunzi', 'woyo', 'vili', 'loango', 'congo', 'earth goddess'],
    search_terms: ['bunzi woyo vili loango earth goddess congo'],
    tags: ['woyo', 'vili', 'congo', 'deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Bunzi – Woyo/Vili Earth Goddess',
    seo_description:
      'Bunzi, the Woyo/Vili supreme earth goddess of Loango, queen of earth spirits and mistress of aquatic spirits.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Luc de Heusch, 'Essai sur la mythologie bantoue', Journal des Africanistes (2012), https://journals.openedition.org/africanistes/4408",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'kifwebe-001',
    slug: 'kifwebe',
    name: 'Kifwebe',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Songye and Luba',
    type: 'spirit',
    mythology: 'Songye and Luba',
    archetype: 'masked-sorcery-spirit',
    element: 'spirit',
    aliases: ['Kifwebe mask', 'Bwadi bwa Kifwebe'],
    related: ['chihongo', 'mwana-pwo', 'kipoko'],
    description:
      'Kifwebe (pl. bifwebe) is the striated mask and masquerade of the Songye and Luba peoples of the Democratic Republic of the Congo. The masks are performed by the bwadi bwa kifwebe association, a regulatory body with political and judicial functions. Among the eastern Songye, kifwebe masks are associated with the control of sorcery and witchcraft; in Luba areas, maskers are said to cleanse villages of evil spirits. They appear at the investiture and death of chiefs, at the new moon, at initiations and circumcisions, and at communal work; male and female masks are distinguished by their crests, colors and features.',
    appearance:
      'Striated wooden mask, male and female variants with different crests and color conventions.',
    behavior:
      'Regulates sorcery; cleanses villages; performs at chiefly, initiatory and communal events.',
    habitat: 'Songye and Luba villages, DR Congo.',
    habitat_tags: ['village', 'forest'],
    behavior_tags: ['ceremonial', 'judgment', 'purify'],
    strengths: ['sorcery control', 'village purification', 'ritual authority'],
    weaknesses: [],
    cultural_significance:
      'Kifwebe is the Songye/Luba striated masquerade that regulates sorcery and marks chiefly and initiatory rites.',
    summary:
      'Songye/Luba striated mask and masquerade that regulates sorcery and marks rites of passage.',
    fun_fact:
      'Kifwebe masks appear at the new moon as well as at chiefly investitures, initiations and communal work.',
    fun_fact_generated: false,
    keywords: ['kifwebe', 'songye', 'luba', 'dr congo', 'mask', 'bwadi bwa kifwebe'],
    search_terms: ['kifwebe songye luba mask masquerade democratic republic of the congo'],
    tags: ['songye', 'luba', 'democratic-republic-of-the-congo', 'spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Kifwebe – Songye/Luba Masquerade Spirit',
    seo_description:
      'Kifwebe, the striated Songye/Luba mask and masquerade that regulates sorcery and marks chiefly and initiatory rites.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Dunja Hersak, 'Further Perspectives on Kifwebe Masquerades', African Arts (2020), doi:10.1162/afar_a_00511",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'chihongo-001',
    slug: 'chihongo',
    name: 'Chihongo',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Chokwe',
    type: 'ancestor-spirit',
    mythology: 'Chokwe',
    archetype: 'male-ancestor-mask',
    element: 'earth',
    aliases: ['Chihongo mask'],
    related: ['mwana-pwo', 'kifwebe'],
    description:
      "Chihongo is the male mask character of the Chokwe peoples of the Democratic Republic of the Congo and Angola, the male counterpart of the female mwana pwo. The Chokwe use masquerades to engage their ancestors, asking them to guide, protect and educate the living. Chihongo's feathered headdress, red coloring, scarification patterns, stylized beard and filed teeth evoke wisdom, leadership and status. Both characters perform at male initiation rites, but chihongo also appears at events where a chief's affirmation is desired.",
    appearance:
      'Male face mask with feathered headdress, red coloring, scarification, stylized beard and filed teeth.',
    behavior:
      'Represents male ancestors; affirms chiefs; participates in male initiation.',
    habitat: 'Chokwe villages of the DR Congo–Angola borderlands.',
    habitat_tags: ['village'],
    behavior_tags: ['ceremonial', 'initiation'],
    strengths: ['chiefly affirmation', 'male initiation'],
    weaknesses: [],
    cultural_significance:
      'Chihongo is the Chokwe male ancestor mask, the counterpart of mwana pwo, affirming chiefs and initiating men.',
    summary:
      'Chokwe male ancestor mask character, counterpart of mwana pwo, linked to chiefship and male initiation.',
    fun_fact:
      "Chihongo's filed teeth, stylized beard and red coloring signal wisdom, leadership and status.",
    fun_fact_generated: false,
    keywords: ['chihongo', 'chokwe', 'dr congo', 'angola', 'mask', 'ancestor'],
    search_terms: ['chihongo chokwe male ancestor mask democratic republic of the congo'],
    tags: ['chokwe', 'democratic-republic-of-the-congo', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Chihongo – Chokwe Male Ancestor Mask',
    seo_description:
      'Chihongo, the Chokwe male ancestor mask and counterpart of mwana pwo, affirming chiefs and initiating men.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Art Institute of Chicago, 'Male Face Mask (Chihongo)', 2003.174, https://www.artic.edu/artworks/181740",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'mwana-pwo-001',
    slug: 'mwana-pwo',
    name: 'Mwana Pwo',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Chokwe',
    type: 'ancestor-spirit',
    mythology: 'Chokwe',
    archetype: 'female-ancestor-mask',
    element: 'earth',
    aliases: ['Mwana Pwo mask', 'Pwo'],
    related: ['chihongo', 'kifwebe'],
    description:
      'Mwana Pwo is the female ancestor mask character of the Chokwe peoples of the Democratic Republic of the Congo and Angola. A popular and frequent figure in entertainment masquerades, mwana pwo is always worn by a male dancer. The mask represents a female ancestor and symbolizes fecundity and the prominent role of women in Chokwe society. Although idealized, its features suggest the individuality of a portrait, and it often carries elements of beauty such as scarification and elaborate hairstyles.',
    appearance:
      'Female face mask with idealized features, scarification and elaborate hairstyle.',
    behavior:
      'Represents female ancestors; promotes fecundity; performs in entertainment and initiation masquerades.',
    habitat: 'Chokwe villages of the DR Congo–Angola borderlands.',
    habitat_tags: ['village'],
    behavior_tags: ['ceremonial', 'initiation'],
    strengths: ['fecundity', 'female ancestral authority'],
    weaknesses: [],
    cultural_significance:
      'Mwana Pwo is the Chokwe female ancestor mask, symbolizing fecundity and the role of women.',
    summary:
      "Chokwe female ancestor mask character, danced by men and linked to fecundity and women's roles.",
    fun_fact:
      'Mwana Pwo is always worn by a male dancer, even though the mask represents a female ancestor.',
    fun_fact_generated: false,
    keywords: ['mwana pwo', 'pwo', 'chokwe', 'dr congo', 'angola', 'mask', 'ancestor'],
    search_terms: ['mwana pwo chokwe female ancestor mask democratic republic of the congo'],
    tags: ['chokwe', 'democratic-republic-of-the-congo', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Mwana Pwo – Chokwe Female Ancestor Mask',
    seo_description:
      'Mwana Pwo, the Chokwe female ancestor mask danced by men, symbolizing fecundity and the role of women.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Art Institute of Chicago, 'Female Face Mask (Mwana Pwo)', 1992.731, https://www.artic.edu/artworks/120215",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'kipoko-001',
    slug: 'kipoko',
    name: 'Kipoko',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Eastern Pende',
    type: 'ancestor-spirit',
    mythology: 'Pende',
    archetype: 'chief-mask',
    element: 'earth',
    aliases: ['Kipoko mask'],
    related: ['kifwebe', 'chihongo'],
    description:
      "Kipoko is a helmet mask of the Eastern Pende peoples of the Democratic Republic of the Congo. It is a chief's crest mask, danced at the appointment of a new village chief and linked to the world of the dead. Kipoko also plays an important role in the circumcision camp (mukanda): at the end of initiation, the boys must grab food from the edge of the mask as a final test. The mask's rounded form and painted features are associated with chiefly authority and the transition from boyhood to manhood.",
    appearance:
      'Rounded helmet mask with painted features, worn as a crest.',
    behavior:
      'Installs chiefs; links the living to the dead; tests initiates at the end of mukanda.',
    habitat: 'Eastern Pende villages, DR Congo.',
    habitat_tags: ['village', 'initiation-camp'],
    behavior_tags: ['ceremonial', 'initiation', 'authority'],
    strengths: ['chiefly installation', 'initiation testing'],
    weaknesses: [],
    cultural_significance:
      'Kipoko is the Eastern Pende chief-making mask and a final test in the mukanda initiation camp.',
    summary:
      'Eastern Pende helmet mask used to install chiefs and test initiates at the end of mukanda.',
    fun_fact:
      'At the end of initiation, Pende boys must grab food from the edge of the kipoko mask as a final test.',
    fun_fact_generated: false,
    keywords: ['kipoko', 'pende', 'dr congo', 'mask', 'chief', 'mukanda'],
    search_terms: ['kipoko eastern pende chief mask mukanda democratic republic of the congo'],
    tags: ['pende', 'democratic-republic-of-the-congo', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Kipoko – Eastern Pende Chief Mask',
    seo_description:
      'Kipoko, the Eastern Pende helmet mask that installs chiefs and tests initiates at the end of mukanda.',
    motifs: [],
    featured_in_stories: [],
    source:
      "New Orleans Museum of Art, 'Helmet Mask (kipoko)', 88.46, https://noma.org/collection/helmet-mask-kipoko/; Museum Rietberg, 'Helmmaske, kipoko', 2016.151, https://rietberg.ch/en/collections/2016-151; Oberhofer, 'Pende Initiation Masks: Art That Makes Men out of Boys', Africa Art Archive, https://africa-art-archive.ch/en/multiple-readings/pende-initiation-masks-art-that-makes-men-out-of-boys",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'kibawa-001',
    slug: 'kibawa',
    name: 'Kibawa',
    country: 'Democratic Republic of the Congo',
    region: 'Central Africa',
    culture: 'Tabwa and eastern Luba',
    type: 'spirit',
    mythology: 'Tabwa and Luba',
    archetype: 'possession-spirit',
    element: 'earth',
    aliases: [],
    related: [],
    description:
      'Kibawa is a great earth spirit worshipped by some Tabwa and eastern Luba peoples of the Democratic Republic of the Congo. Devotion to Kibawa centers on spiritual possession as a means of personal salvation: adepts are possessed by the spirit and receive supernatural guidance and support. They are required to reject nontraditional cultural imports such as Swahili, the language of colonial missionaries and coastal traders. Ritual instruments associated with the cult include rattles and colorful beaded headdresses decorated with geometric designs and fringed with fur or feathers.',
    appearance:
      'No fixed form; manifests through possession and ritual instruments.',
    behavior:
      'Possesses adepts; offers personal salvation and guidance; demands rejection of foreign imports.',
    habitat: 'Tabwa and eastern Luba country, DR Congo.',
    habitat_tags: ['village', 'wilderness'],
    behavior_tags: ['possession', 'salvation'],
    strengths: ['spirit possession', 'supernatural guidance'],
    weaknesses: [],
    cultural_significance:
      'Kibawa is the great earth spirit of the Tabwa/eastern Luba possession cult, a traditionalist movement of personal salvation.',
    summary:
      'Tabwa/eastern Luba earth spirit worshipped through possession and rejection of foreign imports.',
    fun_fact:
      'Kibawa adepts were required to reject Swahili, the language of colonial missionaries and coastal traders.',
    fun_fact_generated: false,
    keywords: ['kibawa', 'tabwa', 'luba', 'dr congo', 'possession', 'earth spirit'],
    search_terms: ['kibawa tabwa luba possession earth spirit democratic republic of the congo'],
    tags: ['tabwa', 'luba', 'democratic-republic-of-the-congo', 'spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Kibawa – Tabwa/Luba Possession Spirit',
    seo_description:
      'Kibawa, the great earth spirit of the Tabwa and eastern Luba, worshipped through possession and traditionalist revival.',
    motifs: [],
    featured_in_stories: [],
    source:
      "The Metropolitan Museum of Art, 'Central Africa, 1800–1900 A.D.', Heilbrunn Timeline of Art History, https://www.metmuseum.org/toah/ht/10/afc",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'mbori-001',
    slug: 'mbori',
    name: 'Mbori',
    country: 'Central African Republic',
    region: 'Central Africa',
    culture: 'Zande',
    type: 'supreme-deity',
    mythology: 'Zande',
    archetype: 'supreme-being',
    element: 'spirit',
    aliases: ['Zagi'],
    related: ['ngakola', 'kibawa'],
    description:
      'Mbori is the supreme being of the Zande peoples of the Central African Republic, South Sudan and the Democratic Republic of the Congo. Zande belief holds that the souls of the dead become ghosts, which inhabit earth caverns in the bush; Mbori also dwells there and partakes of their ghostly nature. In Nzakara-speaking areas the supreme being is called Zagi, a term that also denotes the outside universe. Under missionary influence Mbori has become almost universally identified with the Christian God, while ghosts once regarded as benevolent ancestors are increasingly associated with evil.',
    appearance:
      'No fixed form; a supreme being with a ghostly nature.',
    behavior:
      'Dwells in earth caverns with the ghosts; receives Zande belief and, later, Christian identification.',
    habitat: 'Earth caverns in the bush; Zande country of CAR, South Sudan and DR Congo.',
    habitat_tags: ['wilderness', 'cave'],
    behavior_tags: ['creation', 'judgment'],
    strengths: ['supreme authority'],
    weaknesses: [],
    cultural_significance:
      'Mbori is the Zande supreme being, associated with ghosts and later identified with the Christian God.',
    summary:
      'Zande supreme being who dwells in earth caverns with the ghosts; called Zagi among the Nzakara.',
    fun_fact:
      'In Nzakara-speaking areas the supreme being is called Zagi, a term that also denotes the outside universe.',
    fun_fact_generated: false,
    keywords: ['mbori', 'zagi', 'zande', 'central african republic', 'supreme being'],
    search_terms: ['mbori zande supreme being central african republic zagi'],
    tags: ['zande', 'central-african-republic', 'supreme-deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Mbori – Zande Supreme Being',
    seo_description:
      'Mbori, the Zande supreme being who dwells in earth caverns with the ghosts and is called Zagi among the Nzakara.',
    motifs: [],
    featured_in_stories: [],
    source:
      "E. E. Evans-Pritchard, Witchcraft, Oracles and Magic among the Azande (Oxford: Clarendon Press, 1937); Everyculture, 'Zande: Religion and Expressive Culture', https://www.everyculture.com/Africa-Middle-East/Zande-Religion-and-Expressive-Culture.html",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'ngakola-001',
    slug: 'ngakola',
    name: 'Ngakola',
    country: 'Central African Republic',
    region: 'Central Africa',
    culture: 'Banda and Mandjia',
    type: 'deity',
    mythology: 'Banda and Mandjia',
    archetype: 'bush-god',
    element: 'forest',
    aliases: [],
    related: ['sokai', 'mbori'],
    description:
      'Ngakola is the bush god of the Banda and Mandjia peoples of the Central African Republic. He is a spirit of the wilderness with a divine essence and vital force, able to answer the essential needs of human life: health, protection and education. Ngakola is not a distant or self-sufficient god; he requires offerings and sacrifices from his devotees in return for what they receive from him. The Banda and Mandjia occupy the centre and south-west of the Central African Republic.',
    appearance:
      'No fixed form; a bush god.',
    behavior:
      'Grants health, protection and education; requires offerings and sacrifices.',
    habitat: 'Bush and savanna of the central and south-western CAR.',
    habitat_tags: ['forest', 'savanna'],
    behavior_tags: ['ceremonial', 'protection'],
    strengths: ['health', 'protection', 'education'],
    weaknesses: [],
    cultural_significance:
      'Ngakola is the Banda/Mandjia bush god who grants health, protection and education in exchange for offerings.',
    summary:
      'Banda/Mandjia bush god of health, protection and education, requiring offerings and sacrifice.',
    fun_fact:
      'Ngakola is not self-sufficient: he needs offerings and sacrifices to sustain his relation with devotees.',
    fun_fact_generated: false,
    keywords: ['ngakola', 'banda', 'mandjia', 'central african republic', 'bush god'],
    search_terms: ['ngakola banda mandjia bush god central african republic'],
    tags: ['banda', 'mandjia', 'central-african-republic', 'deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Ngakola – Banda/Mandjia Bush God',
    seo_description:
      'Ngakola, the Banda/Mandjia bush god of health, protection and education, who requires offerings and sacrifice.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Jimi Zacka, Mythes et cosmogonies en Centrafrique (PDF), https://www.luebo.org/biblio/docs/AFR085-MYTHES_ET_COSMOGONIES_EN_CENTRAFRIQUE_CR.pdf, citing Andrea Ceriana Mayneri, La rhétorique de la dépossession (PhD thesis, Université Aix-Marseille, 2010), 167",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'sokai-001',
    slug: 'sokai',
    name: 'Sokaï',
    country: 'Central African Republic',
    region: 'Central Africa',
    culture: 'Gbaya and Mandja',
    type: 'nature-spirit',
    mythology: 'Gbaya and Mandja',
    archetype: 'bush-genie',
    element: 'earth',
    aliases: ['Talakougba', 'Sokai'],
    related: ['ngakola', 'mbori'],
    description:
      "Sokaï (also called Talakougba) are small, human-shaped genies described by the Gbaya and Mandja peoples of the Central African Republic. They have long hair falling to their shoulders and white skin, the colour of the inhabitants of the other world. Their favourite places are the hollows of rocks and great trees and the edges of water, where they like to rest. They can make people disappear and reappear, and can even take them hostage for a long period.",
    appearance:
      'Small human-shaped genies with long white hair and white skin.',
    behavior:
      'Haunt rocks, trees and water edges; can abduct people and make them reappear.',
    habitat: 'Rock hollows, great trees and water edges in the CAR.',
    habitat_tags: ['forest', 'coast', 'cave'],
    behavior_tags: ['abduction', 'trickery'],
    strengths: ['invisibility', 'abduction'],
    weaknesses: [],
    cultural_significance:
      'Sokaï are Gbaya/Mandja bush genies associated with rocks, trees and water, feared for abducting people.',
    summary:
      'Gbaya/Mandja bush genies with long white hair who haunt rocks, trees and water and can abduct people.',
    fun_fact:
      'Sokaï are white because white is the colour of the inhabitants of the other world.',
    fun_fact_generated: false,
    keywords: ['sokai', 'sokaï', 'talakougba', 'gbaya', 'mandja', 'central african republic'],
    search_terms: ['sokai talakougba gbaya mandja bush genie central african republic'],
    tags: ['gbaya', 'mandja', 'central-african-republic', 'nature-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Sokaï – Gbaya/Mandja Bush Genies',
    seo_description:
      'Sokaï (Talakougba), the small white-haired Gbaya/Mandja bush genies who haunt rocks, trees and water and can abduct people.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Jimi Zacka, Mythes et cosmogonies en Centrafrique (PDF), https://www.luebo.org/biblio/docs/AFR085-MYTHES_ET_COSMOGONIES_EN_CENTRAFRIQUE_CR.pdf, citing A. Raponda-Walker and R. Sillans, Rites et croyances des peuples du Gabon (Paris: Présence Africaine, 1962)",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'nyambe-001',
    slug: 'nyambe',
    name: 'Nyambe',
    country: 'Cameroon',
    region: 'Central Africa',
    culture: 'Duala',
    type: 'supreme-deity',
    mythology: 'Duala',
    archetype: 'supreme-being',
    element: 'sky',
    aliases: ['Ňambe'],
    related: ['bedimo', 'nzame'],
    description:
      'Nyambe (Ňambe) is the supreme being of the Duala and related Bantu peoples of southern Cameroon. He is the first cause and creator of the universe and of everything it contains, and the generator of humankind. Nyambe is also called the father of the baweňa, the living, and of the bedimo, the dead. In Duala thought the living are pure and preserved from corruption, while the bedimo are the dead in the other world; the two categories stand in opposition and define the place of the ancestors.',
    appearance:
      'No fixed form; a supreme creator.',
    behavior:
      'Creates the universe and humankind; fathers both the living and the dead.',
    habitat: 'Sky and the Duala homeland of southern Cameroon.',
    habitat_tags: ['sky'],
    behavior_tags: ['creation'],
    strengths: ['creation', 'supreme authority'],
    weaknesses: [],
    cultural_significance:
      'Nyambe is the Duala supreme being, creator of the universe and father of the living and the dead.',
    summary:
      'Duala supreme being, first cause and creator, father of the living (baweňa) and the dead (bedimo).',
    fun_fact:
      'Nyambe is called the father of both the baweňa (the living) and the bedimo (the dead).',
    fun_fact_generated: false,
    keywords: ['nyambe', 'ňambe', 'duala', 'cameroon', 'supreme being', 'creator'],
    search_terms: ['nyambe duala supreme being creator cameroon bedimo'],
    tags: ['duala', 'cameroon', 'supreme-deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Nyambe – Duala Supreme Being',
    seo_description:
      'Nyambe, the Duala supreme being and creator, father of the living (baweňa) and the dead (bedimo).',
    motifs: [],
    featured_in_stories: [],
    source:
      "Jean-Calvin Bahoken, 'La notion de bedimo chez les Bantu du Cameroun', Journal de la Société des Africanistes 31, no. 1 (1961): 91–96, https://www.persee.fr/doc/jafr_0037-9166_1961_num_31_1_1932",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'bedimo-001',
    slug: 'bedimo',
    name: 'Bedimo',
    country: 'Cameroon',
    region: 'Central Africa',
    culture: 'Duala and related Bantu',
    type: 'ancestor-spirit',
    mythology: 'Duala',
    archetype: 'ancestor-spirit',
    element: 'spirit',
    aliases: ['Edimo'],
    related: ['nyambe', 'nzame'],
    description:
      "Bedimo (sing. edimo) are the dead and ancestral spirits of the Duala and related Bantu peoples of southern Cameroon. They are defined in opposition to the baweňa, the living, who are pure and preserved from corruption; Nyambe is called the father of both. The bedimo are the dead in their other-world condition, and they remain in relation to the living through ancestor rites and offerings. The notion is central to Bahoken's account of Duala cosmology and the place of the dead.",
    appearance:
      'No fixed form; ancestral spirits.',
    behavior:
      'Remain in relation to the living; receive ancestor rites and offerings.',
    habitat: 'The other world and the Duala homeland.',
    habitat_tags: ['spirit-world', 'village'],
    behavior_tags: ['ancestral', 'ceremonial'],
    strengths: ['ancestral mediation'],
    weaknesses: [],
    cultural_significance:
      'Bedimo are the Duala dead and ancestral spirits, defined in opposition to the living and central to ancestor rites.',
    summary:
      'Duala ancestral spirits of the dead, opposed to the living and honored through ancestor rites.',
    fun_fact:
      "The bedimo are the dead in the other world, while the baweňa are the living 'pure and preserved from corruption'.",
    fun_fact_generated: false,
    keywords: ['bedimo', 'edimo', 'duala', 'cameroon', 'ancestor', 'dead'],
    search_terms: ['bedimo edimo duala ancestor spirits cameroon'],
    tags: ['duala', 'cameroon', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Bedimo – Duala Ancestral Spirits',
    seo_description:
      'Bedimo (sing. edimo), the Duala ancestral spirits of the dead, opposed to the living and honored through ancestor rites.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Jean-Calvin Bahoken, 'La notion de bedimo chez les Bantu du Cameroun', Journal de la Société des Africanistes 31, no. 1 (1961): 91–96, https://www.persee.fr/doc/jafr_0037-9166_1961_num_31_1_1932",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'nzame-001',
    slug: 'nzame',
    name: 'Nzame',
    country: 'Cameroon',
    region: 'Central Africa',
    culture: 'Fang',
    type: 'creator-deity',
    mythology: 'Fang',
    archetype: 'creator-god',
    element: 'sky',
    aliases: [],
    related: ['nyambe', 'bedimo'],
    description:
      'Nzame is the first person of the Fang trinity and the creator-father of Fang tradition. The Fang, who migrated from Cameroon toward Gabon, developed the trinity as a syncretic form drawing on their own mythology, Mitsogho and Mpongwe beliefs, and Christianity. Nzame Mebeghe holds the powers of the Father; Mebeghe is compared to Jesus Christ, and Gningone Mebeghe to Eve, the Virgin or the Holy Spirit. The trinity is the subject of theological speculation and of myths known to the fully initiated.',
    appearance:
      'No fixed form; a creator-father.',
    behavior:
      'Creates and fathers; the first person of the Fang trinity.',
    habitat: 'Fang country of southern Cameroon and Gabon.',
    habitat_tags: ['sky', 'forest'],
    behavior_tags: ['creation'],
    strengths: ['creation', 'supreme authority'],
    weaknesses: [],
    cultural_significance:
      'Nzame is the first person of the Fang trinity, a syncretic creator-father shaped by Fang, Mitsogho and Christian thought.',
    summary:
      'Fang creator-father and first person of the Fang trinity, a syncretic figure.',
    fun_fact:
      'The Fang trinity reinterprets the Catholic Trinity through Nzame Mebeghe, Mebeghe and Gningone Mebeghe.',
    fun_fact_generated: false,
    keywords: ['nzame', 'fang', 'cameroon', 'gabon', 'creator', 'trinity'],
    search_terms: ['nzame fang creator trinity cameroon gabon'],
    tags: ['fang', 'cameroon', 'creator-deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Nzame – Fang Creator and Trinity',
    seo_description:
      'Nzame, the Fang creator-father and first person of the syncretic Fang trinity.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Stanisław Świderski, 'Aperçu sur la trinité et la pensée triadique chez les Fang au Gabon', Canadian Journal of African Studies (1975), doi:10.1080/00083968.1975.10804457",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'margai-001',
    slug: 'margai',
    name: 'Margaï',
    country: 'Chad',
    region: 'Central Africa',
    culture: 'Hadjerai',
    type: 'nature-spirit',
    mythology: 'Hadjerai',
    archetype: 'local-spirit',
    element: 'earth',
    aliases: ['Margai', 'Margay'],
    related: ['ngakola'],
    description:
      'Margaï are the local spirits of the Hadjerai peoples of the Guéra and Salamat regions of Chad. They are present in family and village altars, often small pots called bourmas, and are served by ritual specialists known as the "masters of Margaï." The cult addresses health, marriage, birth, death, solemn oaths and the agricultural cycle, including the first storms and the harvest. Margaï are plural, can be benevolent or malevolent, and stand in relation to a supreme god; some are associated with panthers and lions.',
    appearance:
      'No fixed form; present in altars and small pots (bourmas).',
    behavior:
      'Receives sacrifice and consultation for health, oaths, harvest and social rites; can be benevolent or malevolent.',
    habitat: 'Hadjerai country of Guéra and Salamat, Chad.',
    habitat_tags: ['village', 'farm', 'mountain'],
    behavior_tags: ['ceremonial', 'heal', 'oath'],
    strengths: ['healing', 'oath enforcement', 'agricultural protection'],
    weaknesses: [],
    cultural_significance:
      'Margaï are the Hadjerai local spirits of family and village altars, central to health, oaths and the agricultural cycle.',
    summary:
      'Hadjerai local spirits served at family and village altars for health, oaths and harvest.',
    fun_fact:
      'Margaï altars are often small pots called bourmas, tended by the "masters of Margaï".',
    fun_fact_generated: false,
    keywords: ['margai', 'margaï', 'hadjerai', 'chad', 'local spirit', 'bourma'],
    search_terms: ['margai hadjerai local spirits chad bourma'],
    tags: ['hadjerai', 'chad', 'nature-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Margaï – Hadjerai Local Spirits',
    seo_description:
      'Margaï, the Hadjerai local spirits of family and village altars, consulted for health, oaths and the harvest.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Jeanne-Françoise Vincent, 'Les Margaï du pays Hadjeraï (Tchad)', Bulletin de l'Institut de Recherches Scientifiques au Congo 1 (1962), https://horizon.documentation.ird.fr/exl-doc/pleins_textes/divers15-11/15192.pdf",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  }
]

const seen = new Set()
for (const entry of entries) {
  if (seen.has(entry.slug)) throw new Error(`duplicate slug in batch: ${entry.slug}`)
  seen.add(entry.slug)
}

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const have = new Set(data.map((c) => c.slug))
const added = entries.filter((e) => !have.has(e.slug))

data.push(...added)
fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n')
console.log(`added ${added.length} creatures; total ${data.length}`)
