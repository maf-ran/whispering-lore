const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', '..', 'data', 'datasets', 'creatures.json')
const DATE = '2026-10-23'

const entries = [
  {
    id: 'njayekoi-001',
    slug: 'njayekoi',
    name: 'Njayekoi',
    country: 'Sierra Leone',
    region: 'West Africa',
    culture: 'Mende',
    type: 'spirit',
    mythology: 'Mende',
    archetype: 'masked-healing-spirit',
    element: 'spirit',
    aliases: ['Njokoi'],
    related: ['gbeni-gbini', 'sowei', 'krifi'],
    description:
      "Njayekoi (also Njokoi) is the masked spirit of the Njayei society among the Mende of southern Sierra Leone. Njayei is a cult association with its own spiritual power (halei) used to diagnose various kinds of ritual pollution and to purify those who have incurred it; its sacred house is daubed with white, red and black spots, and its sculptures are typically a male and female pair. Njayekoi's mask is the society's spirit mask, and its form varies from place to place.",
    appearance:
      'A regionally variable mask worn by the Njayei society; associated with the spotted sacred house.',
    behavior:
      'Diagnoses and purifies ritual pollution (including forms of mental derangement/illness) through Njayei rites; appears as a masked spirit.',
    habitat: 'Mende country, southern Sierra Leone; Njayei sacred house and ritual grounds.',
    habitat_tags: ['village', 'forest', 'wilderness'],
    behavior_tags: ['ceremonial', 'heal', 'purify'],
    strengths: ['diagnosis of ritual pollution', 'purification'],
    weaknesses: [],
    cultural_significance:
      "Njayekoi is the masked spirit of the Njayei society, central to healing and purification rites.",
    summary: 'Mende masked spirit of the Njayei society who diagnoses and purifies ritual pollution.',
    fun_fact:
      "The Njayei sacred house is distinguished by walls daubed with white, red and black spots, earning it the name 'society of spots'.",
    fun_fact_generated: false,
    keywords: ['njayekoi', 'njokoi', 'mende', 'sierra leone', 'njayei', 'mask'],
    search_terms: ['njayekoi njayei mende mask spirit sierra leone'],
    tags: ['mende', 'sierra-leone', 'spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Njayekoi – Mende Masked Spirit of the Njayei Society',
    seo_description:
      'Njayekoi, the masked spirit of the Njayei society of the Mende, who diagnoses and purifies ritual pollution.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Sierra Leone Heritage, 'Njayekoi', https://sierraleoneheritage.org/glossary/njayekoi; A.J. Gittins, Mende Religion (Nettetal: Steyler, 1987), 145–147; W.A. Hart, 'Sculptures of the Njayei Society among the Mende of Sierra Leone', African Arts 26, no. 3 (1993): 46–53, doi:10.2307/3337151",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'gbeni-gbini-001',
    slug: 'gbeni-gbini',
    name: 'Gbeni/Gbini',
    country: 'Sierra Leone',
    region: 'West Africa',
    culture: 'Mende',
    type: 'spirit',
    mythology: 'Mende',
    archetype: 'poro-masker',
    element: 'spirit',
    aliases: ['Gbini'],
    related: ['njayekoi', 'sowei'],
    description:
      "Gbeni (Gbini) is the chief masker associated with the men's Poro society among the Mende of Sierra Leone. He wears a long cape of undyed raffia and raffia leggings; the broad cylindrical flat-topped headpiece is decorated with animal skin, cowrie shells and mirrors, with a small gap at the front through which he sees. A panel hangs from the collar over the chest and midriff (generally faced with leopard skin and ornamented with cowries). At the back, small wooden panels inscribed with sentences from the Qur'an are suspended and knock together as he moves.",
    appearance:
      'Raffia cape/leggings; broad cylindrical flat-topped headpiece decorated with animal skin, cowries, mirrors; chest panel; back panels inscribed with Qur\'an verses.',
    behavior: "Chief masked figure of Poro ceremonies; his presence enforces Poro authority.",
    habitat: 'Poro bush and Mende villages, Sierra Leone.',
    habitat_tags: ['village', 'forest'],
    behavior_tags: ['ceremonial', 'authority'],
    strengths: ['ritual authority'],
    weaknesses: [],
    cultural_significance:
      'Gbeni is the chief masker of the Mende Poro society.',
    summary: 'Mende Poro chief masker with raffia costume and Qur\'an-inscribed panels.',
    fun_fact:
      "Small wooden panels inscribed with sentences from the Qur'an are suspended at the back of Gbeni's headpiece and knock together as he moves.",
    fun_fact_generated: false,
    keywords: ['gbeni', 'gbini', 'mende', 'sierra leone', 'poro', 'mask'],
    search_terms: ['gbeni gbini mende poro chief masker sierra leone'],
    tags: ['mende', 'sierra-leone', 'spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Gbeni/Gbini – Mende Poro Chief Masker',
    seo_description:
      'Gbeni/Gbini, the chief masker of the Mende Poro society in Sierra Leone with his distinctive raffia costume and Qur\'an-inscribed panels.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Sierra Leone Heritage, 'Gbeni/Gbini', https://sierraleoneheritage.org/glossary/gbeni-gbini; T.J. Alldridge, The Sherbro and Its Hinterland (London: Macmillan, 1901), ch. 13; W. Siegmann and J. Perani, 'Men's Masquerades of Sierra Leone and Liberia', Ethnologische Zeitschrift Zürich 1 (1980): 25–40",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'sowei-001',
    slug: 'sowei',
    name: 'Sowei',
    country: 'Sierra Leone',
    region: 'West Africa',
    culture: 'Mende/Sande',
    type: 'water-spirit',
    mythology: 'Mende',
    archetype: 'initiation-guardian',
    element: 'water',
    aliases: ['Sowei mask', 'Sande society mask'],
    related: ['njayekoi', 'gbeni-gbini'],
    description:
      "Sowei is the water spirit of the Sande women's society, embodied in the black wooden helmet mask worn by the ndoli jowei ('dancing sowei'). The masquerade represents a water spirit emanating from rivers and lakes; it is activated through dance and accompanied by musicians and attendants to teach female initiates about morality and ways of living. In Mende usage, 'Sowei' also names a senior Sande member and, by extension, the mask.",
    appearance:
      'Black helmet mask with downcast eyes, small mouth, broad forehead and elaborate coiffure; worn with blackened raffia and cloth costume.',
    behavior:
      'Appears at Sande initiations, funerals and installations of chiefs; teaches morality and ideal womanhood through dance.',
    habitat: 'Rivers and lakes; Sande society shrines and ceremonies in Sierra Leone and western Liberia.',
    habitat_tags: ['river', 'lake', 'village'],
    behavior_tags: ['ceremonial', 'teach', 'protect'],
    strengths: ['initiation teaching', 'moral authority'],
    weaknesses: [],
    cultural_significance:
      'Sowei is the water spirit of the Sande society, central to female initiation.',
    summary: 'Sande water spirit embodied by the black helmet mask of the ndoli jowei.',
    fun_fact:
      "In Mende, 'Sowei' can refer to a senior Sande member as well as the mask itself.",
    fun_fact_generated: false,
    keywords: ['sowei', 'sande', 'mende', 'sierra leone', 'water spirit', 'mask'],
    search_terms: ['sowei sande ndoli jowei water spirit sierra leone'],
    tags: ['mende', 'sierra-leone', 'water-spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Sowei – Sande Water Spirit of Sierra Leone',
    seo_description:
      'Sowei, the water spirit of the Sande society embodied in the black helmet mask worn by the ndoli jowei.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Brooklyn Museum, 'Sande society mask (sowei)', https://www.brooklynmuseum.org/objects/4809; Sierra Leone Heritage, 'Sowei', https://sierraleoneheritage.org/glossary/sowei",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'krifi-001',
    slug: 'krifi',
    name: 'Krifi',
    country: 'Sierra Leone',
    region: 'West Africa',
    culture: 'Mende',
    type: 'ancestor-spirit',
    mythology: 'Mende',
    archetype: 'ancestral-spirit',
    element: 'earth',
    aliases: [],
    related: ['njayekoi', 'sowei'],
    description:
      'Krifi are spirits of the dead among the Mende of southern Sierra Leone, known especially through nomoli stone figures. Atherton and Kalous argue that nomoli were originally ancestor figures; after they were lost, stolen or forgotten, they came to be regarded as material representations of krifi. The "monstrous" appearance of many nomoli may reflect how some krifi were imagined, or may show heads of secret societies. The figures are still used as "swearing" devices and to help increase agricultural yields.',
    appearance: 'Represented by nomoli stone statuettes, often with monstrous or distorted features.',
    behavior: 'Spirits of the dead; invoked in oaths and agricultural fertility rites through nomoli figures.',
    habitat: 'Mende country, southern Sierra Leone; fields and shrines where nomoli are kept.',
    habitat_tags: ['village', 'farm'],
    behavior_tags: ['ceremonial', 'protect', 'prophetic'],
    strengths: ['oath enforcement', 'agricultural fertility'],
    weaknesses: [],
    cultural_significance:
      'Krifi are the spirits of the dead represented by nomoli stone figures.',
    summary: 'Mende spirits of the dead represented by nomoli stone figures.',
    fun_fact:
      'Nomoli stone figures were originally ancestor figures but came to be regarded as representations of krifi.',
    fun_fact_generated: false,
    keywords: ['krifi', 'nomoli', 'mende', 'sierra leone', 'ancestor spirit'],
    search_terms: ['krifi nomoli mende ancestor spirit sierra leone'],
    tags: ['mende', 'sierra-leone', 'ancestor-spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Krifi – Mende Spirits of the Dead',
    seo_description:
      'Krifi, Mende spirits of the dead represented by nomoli stone figures used in oaths and fertility rites.',
    motifs: [],
    featured_in_stories: [],
    source:
      "John H. Atherton and Milan Kalous, 'Nomoli', Journal of African History 11, no. 3 (1970): 303–317, doi:10.1017/S0021853700010161",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'somtup-001',
    slug: 'somtup',
    name: 'Somtup',
    country: 'Guinea',
    region: 'West Africa',
    culture: 'Baga/Nalu',
    type: 'deity',
    mythology: 'Baga',
    archetype: 'high-spirit',
    element: 'sky',
    aliases: ['wu-Them', 'a-Mantsho-ngö-Pön', 'a-Mantsho-ño-Pön', 'a-Paran', 'Kakilambe'],
    related: ['banda', 'nimba'],
    description:
      "Somtup is the highest male spirit recognized by the Baga of coastal Guinea after the creator god Kanu. Alternate names include wu-Them ('the Patriarch'), a-Mantsho-ngö-Pön/a-Mantsho-ño-Pön ('the Great Chief/Prophet'), a-Paran ('the Grandfather'), and the Susu name Kakilambe. He was represented by a portable construction about twenty metres high—a massive raffia-covered cage surmounted by a bird head and carried by about twenty men. Somtup is the spirit of the masculine line and patron of the men's initiation society; he is said to reside in the Fouta Djallon and to visit the coast only every seven years.",
    appearance:
      'Twenty-metre raffia-covered cage topped by a bird head, carried by about twenty men; otherwise not depicted.',
    behavior:
      "Patron of male initiation; spirit of the masculine line; visits the coast every seven years.",
    habitat: 'Fouta Djallon and the Baga coast, Guinea; initiation groves.',
    habitat_tags: ['forest', 'coast'],
    behavior_tags: ['ceremonial', 'initiation'],
    strengths: ['patron of male initiation'],
    weaknesses: [],
    cultural_significance:
      'Somtup is the highest male spirit of the Baga, represented by the massive Kakilambe structure.',
    summary: 'Baga highest male spirit after Kanu, represented by a 20m raffia cage called Kakilambe.',
    fun_fact:
      'No photograph of Somtup was ever taken, as the Baga say photography would have been frustrated by his elusive nature.',
    fun_fact_generated: false,
    keywords: ['somtup', 'kakilambe', 'baga', 'guinea', 'male spirit', 'initiation'],
    search_terms: ['somtup kakilambe baga male spirit guinea'],
    tags: ['baga', 'guinea', 'deity', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Somtup – Baga Highest Male Spirit',
    seo_description:
      'Somtup, the highest male spirit of the Baga of Guinea, represented by the massive twenty-metre Kakilambe structure.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Frederick Lamp, 'The Art of the Baga: A Preliminary Inquiry', African Arts 19, no. 2 (1986): 64–67, 92; Frederick Lamp, Art of the Baga: A Drama of Cultural Reinvention (New York: Museum for African Art; Munich: Prestel, 1996), 57–60; mandebala.net, 'kakilambe', https://www.mandebala.net/references/kakilambe.php",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'banda-001',
    slug: 'banda',
    name: 'Banda',
    country: 'Guinea',
    region: 'West Africa',
    culture: 'Baga/Nalu',
    type: 'spirit',
    mythology: 'Baga/Nalu',
    archetype: 'masked-ancestor',
    element: 'earth',
    aliases: [],
    related: ['somtup', 'nimba'],
    description:
      "Banda is the name of a masked supernatural being among the Baga and Nalu of coastal Guinea. The mask combines human features with those of a crocodile or shark, teeth bared, the tail of a chameleon, the horns and ears of an antelope, and features of less identifiable animals. It is worn horizontally on top of the head and attached to a skirt of vegetal fibres that covers the wearer's body. Banda masks were the property of the Simo men's society, which historically regulated fertility and initiation ceremonies; after conversion to Islam, the masks were danced mainly for entertainment.",
    appearance:
      'Composite mask (human, crocodile/shark, chameleon tail, antelope horns/ears, other animals), worn horizontally on the head with a vegetal fibre skirt.',
    behavior:
      'Historically regulated fertility and initiation through the Simo society; now performed mainly for entertainment.',
    habitat: 'Coastal Guinea; Simo society grounds.',
    habitat_tags: ['coast', 'village'],
    behavior_tags: ['ceremonial', 'initiation'],
    strengths: ['fertility regulation'],
    weaknesses: [],
    cultural_significance:
      'Banda is a composite mask of the Baga/Nalu Simo society.',
    summary: 'Composite Simo society mask of the Baga/Nalu combining crocodile, shark, chameleon and antelope features.',
    fun_fact:
      'The Banda mask is worn horizontally on top of the head, not covering the face.',
    fun_fact_generated: false,
    keywords: ['banda', 'baga', 'nalu', 'guinea', 'simo', 'mask'],
    search_terms: ['banda mask baga nalu simo guinea'],
    tags: ['baga', 'guinea', 'spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Banda – Baga/Nalu Simo Society Mask',
    seo_description:
      'Banda, the composite mask of the Baga and Nalu Simo society combining features of crocodile, shark, chameleon and antelope.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Brooklyn Museum, 'Banda Mask', https://www.brooklynmuseum.org/objects/2984",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'gle-001',
    slug: 'gle',
    name: 'Gle',
    country: 'Liberia',
    region: 'West Africa',
    culture: 'Dan',
    type: 'deity',
    mythology: 'Dan',
    archetype: 'supreme-being',
    element: 'spirit',
    aliases: ['Ge'],
    related: [],
    description:
      "Gle (Ge among the northern Dan) is the supreme being or supernatural force of the Dan, whose manifestation is the mask and the masked performer. Gle encompasses a history, a system and a philosophy in Dan thought. Masks are divided into dean gle (used for initiations and entertainment) and bu gle (associated with warriors and leadership). Each Gle has a yinannu ('translation') that determines its importance, including joy and dance, reading a person's destiny, and success in war. One Gle called Kong is presided over solely by women and concerns initiation, excision, childbirth and other matters traditionally assigned to women.",
    appearance:
      'Wooden or metal mask with oval head, slit rectangular eyes, metal strip teeth and jutting lower lip, in an idealised Dan form; worn with raffia, fur and feather costume.',
    behavior:
      "Manifests through masked performance; dean gle for initiation/entertainment, bu gle for war/leadership; yinannu define function; Kong (women's Gle) concerns women's rites.",
    habitat: "Dan country in Côte d'Ivoire, Liberia and Guinea; masquerade arenas and sacred groves.",
    habitat_tags: ['forest', 'village'],
    behavior_tags: ['ceremonial', 'prophetic'],
    strengths: ['supreme manifestation'],
    weaknesses: [],
    cultural_significance:
      'Gle is the supreme force of the Dan manifested through the mask institution.',
    summary: 'Dan supreme being/supernatural force manifested through masks.',
    fun_fact:
      "One Dan Gle called Kong is presided over solely by women and concerns initiation, excision, childbirth and other women's matters.",
    fun_fact_generated: false,
    keywords: ['gle', 'ge', 'dan', 'liberia', 'mask', 'supreme being'],
    search_terms: ['gle ge dan mask supreme being liberia'],
    tags: ['dan', 'liberia', 'deity', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Gle – Dan Supreme Being Manifested Through Masks',
    seo_description:
      'Gle, the supreme being or supernatural force of the Dan, manifested through their masked performances.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Sainsbury Centre, '210 – Dan Mask', https://sainsburycentre.ac.uk/art-and-objects/210-mask/, citing Barbara C. Johnson, Four Dan Sculptors: Continuity and Change (San Francisco: Fine Arts Museums of San Francisco, 1986), and Daniel B. Reed, Dan Ge Performance: Masks and Music in Contemporary Côte d'Ivoire (Bloomington: Indiana University Press, 2003)",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'nindu-001',
    slug: 'nindu',
    name: 'Nindu',
    country: 'Guinea-Bissau',
    region: 'West Africa',
    culture: 'Bijago (Añaki)',
    type: 'deity',
    mythology: 'Bijago',
    archetype: 'creator-god',
    element: 'sky',
    aliases: [],
    related: ['kanogo'],
    description:
      "Nindu is the creator sky god of the Añaki, the Bijago of Canhabaque in Guinea-Bissau. He is a distant god who is not invoked directly; the cult is addressed to intermediate powers called arebuko (sing. orebuko). Nindu gave the arebuko to humans. These powers take the form of natural or manufactured objects, some with proper names and others known only by a common noun.",
    appearance: 'No fixed form; a distant sky god.',
    behavior: 'Creator of the arebuko; receives no direct cult, only through the arebuko.',
    habitat: 'The sky; Canhabaque Island, Bijago archipelago, Guinea-Bissau.',
    habitat_tags: ['sky', 'coast'],
    behavior_tags: ['creative'],
    strengths: ['creator of the arebuko'],
    weaknesses: [],
    cultural_significance:
      'Nindu is the distant creator of the Bijago, approached through the arebuko powers.',
    summary: 'Distant creator sky god of the Bijago who gave the arebuko powers to humans.',
    fun_fact:
      'The Bijago do not invoke Nindu directly; their cult is addressed to the arebuko intermediate powers.',
    fun_fact_generated: false,
    keywords: ['nindu', 'bijago', 'guinea-bissau', 'creator god', 'arebuko'],
    search_terms: ['nindu bijago arebuko creator god guinea-bissau'],
    tags: ['bijago', 'guinea-bissau', 'deity', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Nindu – Bijago Creator Sky God',
    seo_description:
      'Nindu, the distant creator sky god of the Bijago of Guinea-Bissau, who gave the arebuko powers to humans.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Christine Henry, 'Les arebuko des Bijogo (Guinée-Bissau): Culte de possession, objets de puissance', Systèmes de pensée en Afrique noire 12 (1993): 39–64, doi:10.4000/span.1319",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'kanogo-001',
    slug: 'kanogo',
    name: 'Kanogo',
    country: 'Guinea-Bissau',
    region: 'West Africa',
    culture: 'Bijago (Añaki)',
    type: 'nature-spirit',
    mythology: 'Bijago',
    archetype: 'rock-power',
    element: 'earth',
    aliases: [],
    related: ['nindu'],
    description:
      "Kanogo is a named arebuko (object-power) of the Añaki/Bijago on Canhabaque Island, Guinea-Bissau. It is a standing rock, about the height of a man, on a forested beach; the villagers say it was not set there by human hands. Kanogo is a women's power: a woman is its guardian and sacrificer, and only women attend its ceremonies. Offerings of cooked rice, palm wine and chickens are made, and the rock is addressed in a commanding tone rather than a prayer. During one recorded ceremony, a woman fell into trance and was possessed by the orebuko (returning dead) she had initiated, who spoke through her.",
    appearance:
      'Man-high standing rock on a forested beach, with a cutlass and small stools placed before it during rites.',
    behavior:
      "Women's power receiving sacrifices for fertility, protection and requests; can be eclipsed by possession by a returning orebuko.",
    habitat: 'Canhabaque Island, Bijago archipelago, Guinea-Bissau.',
    habitat_tags: ['beach', 'forest'],
    behavior_tags: ['ceremonial', 'possessive'],
    strengths: ["women's power"],
    weaknesses: [],
    cultural_significance:
      "Kanogo is a named arebuko and women's power on Canhabaque Island.",
    summary: "Bijago women's arebuko rock power on Canhabaque Island.",
    fun_fact:
      "Only women attend Kanogo's ceremonies, and the rock is addressed in a commanding tone rather than a prayer.",
    fun_fact_generated: false,
    keywords: ['kanogo', 'bijago', 'guinea-bissau', 'arebuko', 'rock spirit'],
    search_terms: ['kanogo bijago arebuko rock power guinea-bissau'],
    tags: ['bijago', 'guinea-bissau', 'nature-spirit', 'west-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Kanogo – Bijago Women\'s Rock Power',
    seo_description:
      "Kanogo, a named arebuko rock power of the Bijago on Canhabaque Island, guarded and sacrificed to only by women.",
    motifs: [],
    featured_in_stories: [],
    source:
      "Christine Henry, 'Les arebuko des Bijogo (Guinée-Bissau): Culte de possession, objets de puissance', Systèmes de pensée en Afrique noire 12 (1993): 39–64, doi:10.4000/span.1319",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'ngil-001',
    slug: 'ngil',
    name: 'Ngil',
    country: 'Gabon',
    region: 'Central Africa',
    culture: 'Fang',
    type: 'spirit',
    mythology: 'Fang',
    archetype: 'judicial-mask-spirit',
    element: 'spirit',
    aliases: ['Ngil mask'],
    related: ['mukudj', 'mbulu-ngulu'],
    description:
      "Ngil is the terrifying spirit embodied in the mask of the Ngil secret society of the Fang in Gabon. The society's name means 'gorilla', and the mask's elongated face, broad forehead, curved eyebrows and jutting mouth may reference a gorilla. The mask was whitened with kaolin, a colour the Fang associate with ancestral spirits, death and male virility. Ngil members were judicial authorities; the mask's intimidating presence helped resolve conflicts and identify sorcery. The French colonial administration banned Ngil societies in 1910, and use of the mask declined.",
    appearance:
      'An elongated whitened face with a broad forehead, curved eyebrows and jutting mouth, worn with a full costume.',
    behavior:
      'Judicial authority; resolves conflict; identifies sorcery; appears at nighttime ceremonies.',
    habitat: 'Fang country, Gabon; nighttime ceremonies and initiations.',
    habitat_tags: ['forest', 'village'],
    behavior_tags: ['ceremonial', 'authority'],
    strengths: ['judicial authority'],
    weaknesses: [],
    cultural_significance:
      'Ngil was the judicial mask of the Fang Ngil society, banned by French colonial administration in 1910.',
    summary: 'Fang gorilla-like judicial mask spirit whitened with kaolin.',
    fun_fact:
      'The French colonial administration banned Ngil societies in 1910.',
    fun_fact_generated: false,
    keywords: ['ngil', 'fang', 'gabon', 'mask', 'judicial'],
    search_terms: ['ngil fang mask society gabon judicial'],
    tags: ['fang', 'gabon', 'spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Ngil – Fang Judicial Mask Spirit',
    seo_description:
      'Ngil, the terrifying gorilla-like judicial mask spirit of the Fang Ngil society in Gabon, banned by French colonial authorities in 1910.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Denver Art Museum, 'Ngil Mask', https://www.denverartmuseum.org/en/object/1942.443; Kreeger Museum, 'Face Mask (Ngil)', https://www.kreegermuseum.org/about-us/collection/african-collection/Fang-artist_Face-Mask-Ngil",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: false,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'mukudj-001',
    slug: 'mukudj',
    name: 'Mukudj',
    country: 'Gabon',
    region: 'Central Africa',
    culture: 'Punu/Ogooué',
    type: 'ancestor-spirit',
    mythology: 'Punu',
    archetype: 'ancestral-mask-spirit',
    element: 'earth',
    aliases: ['Okuyi', 'Mukudj mask'],
    related: ['ngil', 'mbulu-ngulu'],
    description:
      "Mukudj (also okuyi) is the white-faced mask and stilt dance of the Punu and related Ogooué River peoples of southern Gabon. The masks are said to embody the personas of past community elders and were worn by costumed stilt dancers at Mukuji society funerary rites. The creator of a mukudj mask tried to capture the likeness of the most beautiful woman in his community, then transformed her into a transcendent being by applying kaolin from riverbeds, a material associated with healing and the ancestral realm. The mask has a three-part black coiffure, arching brows over slit eyes, and pursed red lips.",
    appearance:
      'White kaolin face with three-part black coiffure, arching brows, slit eyes and pursed red lips.',
    behavior:
      'Performed by male stilt dancers at Mukuji funerary rites; embodies past elders and idealised womanhood.',
    habitat: 'Ngounié River region and southern Gabon; Punu and related Ogooué River communities.',
    habitat_tags: ['river', 'forest'],
    behavior_tags: ['ceremonial', 'dance'],
    strengths: ['funerary rites'],
    weaknesses: [],
    cultural_significance:
      'Mukudj masks embody past community elders at Punu funerary rites.',
    summary: 'White kaolin Punu stilt mask embodying past elders at funerary rites.',
    fun_fact:
      'Mukudj masks are said to have been created by transforming the likeness of the most beautiful woman in the community.',
    fun_fact_generated: false,
    keywords: ['mukudj', 'okuyi', 'punu', 'gabon', 'mask', 'stilt dance'],
    search_terms: ['mukudj okuyi punu mask stilt dance gabon'],
    tags: ['punu', 'gabon', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Mukudj – Punu White-Faced Stilt Mask',
    seo_description:
      'Mukudj (okuyi), the white kaolin mask and stilt dance of the Punu people of Gabon, embodying past community elders.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Museum of Fine Arts, Boston, 'Punu Mask (Okuyi)', https://collections.mfa.org/objects/4748; Metropolitan Museum of Art, 'Mukudj (mask)', https://www.metmuseum.org/art/collection/search/318667",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'mbulu-ngulu-001',
    slug: 'mbulu-ngulu',
    name: 'Mbulu Ngulu',
    country: 'Gabon',
    region: 'Central Africa',
    culture: 'Kota',
    type: 'guardian',
    mythology: 'Kota',
    archetype: 'reliquary-guardian',
    element: 'earth',
    aliases: ['Mbulu Ngulu reliquary', 'Kota reliquary guardian'],
    related: ['ngil', 'mukudj'],
    description:
      "Mbulu ngulu are Kota reliquary guardian figures that ornamented baskets holding the relics of ancestors. A group of three—male, senior female and junior female—represented ideal ancestors whose relics were held in a basket below. The faces would have glimmered inside a dimly lit room; the lower half of the diamond-shaped support was placed inside the reliquary basket, not exposed as in museum displays. Kota communities moved every few years when the soil no longer guaranteed abundant crops, and the reliquary baskets helped families maintain a memorial to their dead when they moved. After conversion to Christianity from 1900, reliquaries were no longer kept and the figures were abandoned or destroyed, often under missionary pressure.",
    appearance:
      'Wood covered with sheets/strips of brass and copper, convex face, semicircular hair, small spool earrings; diamond-shaped support fits into the reliquary basket.',
    behavior:
      'Guards ancestral relics; represents ideal ancestors; serves as a memorial for mobile families.',
    habitat: 'Kota country, Gabon; reliquary baskets.',
    habitat_tags: ['forest'],
    behavior_tags: ['protect'],
    strengths: ['ancestral guardianship'],
    weaknesses: [],
    cultural_significance:
      'Mbulu ngulu guard Kota ancestral relics in mobile reliquary baskets.',
    summary: 'Kota copper/brass-covered reliquary guardian figures.',
    fun_fact:
      'Kota reliquaries were often a group of three figures (male, senior female, junior female).',
    fun_fact_generated: false,
    keywords: ['mbulu ngulu', 'kota', 'gabon', 'reliquary', 'guardian'],
    search_terms: ['mbulu ngulu kota reliquary guardian gabon'],
    tags: ['kota', 'gabon', 'guardian', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Mbulu Ngulu – Kota Reliquary Guardian Figures',
    seo_description:
      'Mbulu ngulu, the copper and brass-covered Kota reliquary figures that guard ancestral relics.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Museum of Fine Arts, Boston, 'Reliquary Figure (Mbulu Ngulu)', https://collections.mfa.org/objects/23992",
    source_quality: 'documented',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: false,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'rupe-001',
    slug: 'rupe',
    name: 'Rupé',
    country: 'Equatorial Guinea',
    region: 'Central Africa',
    culture: 'Bubi',
    type: 'deity',
    mythology: 'Bubi',
    archetype: 'creator-god',
    element: 'sky',
    aliases: ['Rúppé', 'Eri', 'Poto', 'Potó'],
    related: ['ommua-tao', 'bisila'],
    description:
      "Rupé (also Rúppé, Eri or Poto) is the supreme creator god of the Bubi of Bioko, Equatorial Guinea. He is invisible, has no fixed gender, and no image of him is made; he dwells beyond the sky and is the source of all energy (töú). Bubi cosmogonic narratives say he either descended from the sky and moulded the first two people from red clay, or created them in his transcendental space, breathed a spirit into them and sent them down to earth. He can manifest in the world as fiery lightning, tornadoes and thunder. In the north he is called Rupé, in the south Poto; Eri is another name. Missionaries identified him with the Christian God, and Bubi beliefs hold that the spirits of the dead travel to Pico Basilé, the sacred mountain where God dwells.",
    appearance: 'None; invisible, sexless and without images.',
    behavior:
      'Creator and source of energy; manifests in storms; receives cult through ancestors and spirits rather than direct images.',
    habitat: 'Beyond the sky; Pico Basilé, Bioko, Equatorial Guinea.',
    habitat_tags: ['sky', 'mountain'],
    behavior_tags: ['creative'],
    strengths: ['creator and source of energy'],
    weaknesses: [],
    cultural_significance:
      'Rupé is the supreme creator god of the Bubi, invisible and sexless.',
    summary: 'Invisible sexless Bubi creator god who dwells at Pico Basilé.',
    fun_fact:
      'Rupé is the source of all energy (töú) and can manifest as lightning, tornadoes and thunder.',
    fun_fact_generated: false,
    keywords: ['rupe', 'rupé', 'bubi', 'equatorial guinea', 'creator god'],
    search_terms: ['rupe ruppe bubi creator god equatorial guinea'],
    tags: ['bubi', 'equatorial-guinea', 'deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Rupé – Bubi Invisible Creator God',
    seo_description:
      'Rupé, the invisible, sexless supreme creator god of the Bubi of Bioko, Equatorial Guinea.',
    motifs: [],
    featured_in_stories: [],
    source:
      "José L. Sánchez Vega, 'Bioko a través de la naturaleza y la cultura', Observatorio Medioambiental 21 (2018): 271–328, doi:10.5209/OBMD.62662; Renata Díaz-Szmidt, 'Między kolonialną glottofagią, postkolonialną traumą a indygeniczną podmiotowością: Rdzenny system wiedzy o świecie i człowieku Bubi', Teksty Drugie 6 (2024): 46–65, doi:10.18318/td.2024.6.3",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'ommua-tao-001',
    slug: 'ommua-tao',
    name: 'Ommuá Tao',
    country: 'Equatorial Guinea',
    region: 'Central Africa',
    culture: 'Bubi',
    type: 'ancestor-spirit',
    mythology: 'Bubi',
    archetype: 'legal-ancestor',
    element: 'earth',
    aliases: ['Ommua Tao'],
    related: ['rupe', 'bisila'],
    description:
      "Ommuá tao is the Bubi spirit of the deceased legal father and the most venerated of the immediate ancestors. In Bubi kinship, a woman may be given a spirit husband (mochucu) chosen by oracle; this spirit is the legal father of her children and gives them their patriclan. The child's ritual obligations to this father-spirit culminate in offerings of yams during the annual yam cycle. 'Ommuá' is a respectful term for a deceased father, while 'tao' refers to the ancestors who were heads of patriclan lineages. Ommuá tao belongs to the wider category of barimó ancestor spirits, which are spirits of human origin and are closer to the living than clan founders.",
    appearance: 'No fixed form; a named ancestor spirit.',
    behavior:
      'Grants legal paternity and patriclan membership; receives yam offerings; mediates between the living and the ancestral realm.',
    habitat: 'Patriclan shrines and yam fields in Moka, Bioko, Equatorial Guinea.',
    habitat_tags: ['farm', 'village'],
    behavior_tags: ['ceremonial'],
    strengths: ['legal paternity', 'patriclan membership'],
    weaknesses: [],
    cultural_significance:
      "Ommuá tao is the spirit of the deceased legal father, central to Bubi patriclan membership.",
    summary: 'Bubi legal father ancestor spirit receiving yam offerings.',
    fun_fact:
      'A woman may be given a spirit husband (mochucu) who becomes the legal father of her children.',
    fun_fact_generated: false,
    keywords: ['ommua tao', 'bubi', 'equatorial guinea', 'ancestor spirit', 'legal father'],
    search_terms: ['ommua tao bubi legal father ancestor spirit'],
    tags: ['bubi', 'equatorial-guinea', 'ancestor-spirit', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Ommuá Tao – Bubi Legal Father Ancestor Spirit',
    seo_description:
      'Ommuá tao, the Bubi spirit of the deceased legal father who grants patriclan membership and receives yam offerings.',
    motifs: [],
    featured_in_stories: [],
    source:
      "Nuria Fernández Moreno, 'Raíces para los espíritus: el ciclo agrícola del ñame en Bioko, Guinea Ecuatorial', Anales del Museo Nacional de Antropología 15 (2013), https://e-spacio.uned.es/bitstreams/b1d6bc37-b670-4687-badf-bd46090dd82f/download",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  },
  {
    id: 'bisila-001',
    slug: 'bisila',
    name: 'Bisila',
    country: 'Equatorial Guinea',
    region: 'Central Africa',
    culture: 'Bubi',
    type: 'deity',
    mythology: 'Bubi',
    archetype: 'life-goddess',
    element: 'earth',
    aliases: ['Mother Bisila', 'Virgen Bisila'],
    related: ['rupe', 'ommua-tao'],
    description:
      "Bisila is a Bubi goddess of life and the patroness of Bioko, Equatorial Guinea. She is honored in the rites of malanga (taro), a crop symbolically linked to women and the matriclan; each family offers its first tubers to Bisila and the spirits of the matriclan in the Ripelo ceremony, asking for fertility and abundant harvests. In the Bötöí fertility ritual, women collect seawater and offer it to Bisila for the fertility of crops and women. From the 1960s, Catholic missionaries promoted her identification with the Virgin Mary, and the feast of the Virgin Bisila is celebrated in August with a procession and Mass. Her cult has become a focus of Bubi identity and cultural resistance, and is celebrated in Equatorial Guinea and among Bubi in Catalonia.",
    appearance: 'No fixed traditional form; in the Catholic image she is represented as the Virgin Mary.',
    behavior:
      'Grants fertility to women and crops; receives seawater, first tubers and August celebrations.',
    habitat: 'Bioko, Equatorial Guinea; malanga fields and Pico Basilé.',
    habitat_tags: ['farm', 'coast', 'mountain'],
    behavior_tags: ['ceremonial'],
    strengths: ['fertility'],
    weaknesses: [],
    cultural_significance:
      'Bisila is the Bubi goddess of life, syncretized with the Virgin Mary and central to Bubi identity.',
    summary: 'Bubi goddess of life and patroness of Bioko, syncretized with the Virgin Mary.',
    fun_fact:
      'In the Bötöí ritual, women collect seawater and offer it to Bisila for the fertility of crops and women.',
    fun_fact_generated: false,
    keywords: ['bisila', 'bubi', 'equatorial guinea', 'goddess of life', 'virgin mary'],
    search_terms: ['bisila bubi goddess life equatorial guinea virgin bisila'],
    tags: ['bubi', 'equatorial-guinea', 'deity', 'central-africa'],
    schema_org_type: 'MythicalCreature',
    seo_title: 'Bisila – Bubi Goddess of Life',
    seo_description:
      'Bisila, the Bubi goddess of life and patroness of Bioko, honored in malanga rites and syncretized with the Virgin Mary.',
    motifs: [],
    featured_in_stories: [],
    source:
      "José L. Sánchez Vega, 'Bioko a través de la naturaleza y la cultura', Observatorio Medioambiental 21 (2018): 271–328, doi:10.5209/OBMD.62662; Nuria Fernández Moreno, 'Raíces para los espíritus: el ciclo agrícola del ñame en Bioko, Guinea Ecuatorial', Anales del Museo Nacional de Antropología 15 (2013), https://e-spacio.uned.es/bitstreams/b1d6bc37-b670-4687-badf-bd46090dd82f/download; Celeste Muñoz and Roger Canals, 'Between Cosmopolitanism and Ethnic Dissolution: Politics, Religion and Iconic Reappropriation in the Cult of the Mother of God of Bisila in Equatorial Guinea and Catalonia', Social Dynamics 46, no. 2 (2020): 219–239, doi:10.1080/02533952.2020.1820156",
    source_quality: 'academic',
    stories: [],
    version: '1.0.0',
    lastUpdated: DATE,
    living_tradition: true,
    source_type: 'literary',
    attested: true
  }
]

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const have = new Set(data.map((c) => c.slug))
const added = entries.filter((e) => !have.has(e.slug))

data.push(...added)

// Add aliases to existing ninki-nanka
const ninki = data.find((c) => c.slug === 'ninki-nanka')
if (ninki) {
  for (const alias of ['Ninkinanka', 'Landouman', 'Niniganné', 'Ninger', 'Ningiri', 'Rianséou']) {
    if (!ninki.aliases.includes(alias)) {
      ninki.aliases.push(alias)
    }
  }
}

fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n')
console.log(`added ${added.length} creatures; total ${data.length}`)
if (ninki) console.log(`updated ninki-nanka aliases to: ${ninki.aliases.join(', ')}`)
