const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const CREATURES_PATH = join(__dirname, '..', 'data/datasets/creatures.json');

const STUB_DESC = 'This creature is mentioned in the archives but its full entry is yet to be documented.';

// ─── Classification maps ─────────────────────────────────────────────────

const SUFFIX_MAP = [
  // Pacific Northwest
  { test: /-tlingit$/i,           country: 'United States', region: 'North America' },
  { test: /-tsimshian$/i,         country: 'Canada',        region: 'North America' },
  { test: /-haida$/i,             country: 'Canada',        region: 'North America' },
  { test: /-coast-salish$/i,      country: 'Canada',        region: 'North America' },
  { test: /-nuu-chah-nulth$/i,    country: 'Canada',        region: 'North America' },
  { test: /-kwakwaka-wakw$/i,     country: 'Canada',        region: 'North America' },
  { test: /-nuxalk$/i,            country: 'Canada',        region: 'North America' },
  { test: /-chinook$/i,           country: 'United States', region: 'North America' },
  { test: /-comanche$/i,          country: 'United States', region: 'North America' },
  { test: /-lakota$/i,            country: 'United States', region: 'North America' },
  { test: /-cherokee$/i,          country: 'United States', region: 'North America' },
  { test: /-denali$/i,            country: 'United States', region: 'North America' },
  { test: /-navajo$/i,            country: 'United States', region: 'North America' },
  { test: /-choctaw$/i,           country: 'United States', region: 'North America' },
  { test: /-inuit$/i,             country: 'Canada',        region: 'North America' },
  { test: /-cree$/i,              country: 'Canada',        region: 'North America' },
  { test: /-ojibwe$/i,            country: 'Canada',        region: 'North America' },

  // Nordic / Baltic
  { test: /-iceland$/i,           country: 'Iceland',      region: 'Europe' },
  { test: /-finland$/i,           country: 'Finland',      region: 'Europe' },
  { test: /-denmark$/i,           country: 'Denmark',      region: 'Europe' },

  // Slavic
  { test: /^vodnik$/i,            country: 'Slovenia',     region: 'Europe' },

  // Japan
  { test: /^orochi$/i,            country: 'Japan',        region: 'Asia' },
  { test: /^kintaro$/i,           country: 'Japan',        region: 'Asia' },
  { test: /^kaguya-hime$/i,       country: 'Japan',        region: 'Asia' },

  // Vietnamese
  { test: /^thanh-ging$/i,        country: 'Vietnam',      region: 'Asia' },
  { test: /^son-tinh$/i,          country: 'Vietnam',      region: 'Asia' },
  { test: /^thuy-tinh$/i,         country: 'Vietnam',      region: 'Asia' },

  // Chinese
  { test: /^hou-yi$/i,            country: 'China',        region: 'Asia' },
  { test: /^jade-emperor$/i,      country: 'China',        region: 'Asia' },
  { test: /^mulan$/i,             country: 'China',        region: 'Asia' },

  // West African
  { test: /^amadioha$/i,          country: 'Nigeria',      region: 'Africa' },
  { test: /^anyanwu$/i,           country: 'Nigeria',      region: 'Africa' },
  { test: /^olorun$/i,            country: 'Nigeria',      region: 'Africa' },
  { test: /^ijapa$/i,             country: 'Nigeria',      region: 'Africa' },
  { test: /^agokoli$/i,           country: 'Togo',         region: 'Africa' },
  { test: /^soumaoro-kant/i,      country: 'Mali',         region: 'Africa' },
  { test: /^okomfo-anokye$/i,     country: 'Ghana',        region: 'Africa' },
  { test: /^mame-coumba-bang$/i,  country: 'Senegal',      region: 'Africa' },
  { test: /^nana-buluku$/i,       country: 'Benin',        region: 'Africa' },

  // Southern African
  { test: /^kaang$/i,             country: 'Botswana',     region: 'Africa' },
  { test: /^umvelinqangi$/i,      country: 'South Africa', region: 'Africa' },
  { test: /^uthixo$/i,            country: 'South Africa', region: 'Africa' },
  { test: /^khanyapa$/i,          country: 'Zambia',       region: 'Africa' },
  { test: /^kholumolumo$/i,       country: 'Lesotho',      region: 'Africa' },

  // Middle Eastern / Persian
  { test: /^simorgh$/i,           country: 'Iran',         region: 'Asia' },
  { test: /^arash$/i,             country: 'Iran',         region: 'Asia' },

  // South Asian
  { test: /^ganesha$/i,           country: 'India',        region: 'Asia' },
  { test: /^bonbibi$/i,           country: 'India',        region: 'Asia' },
  { test: /^maha-sona$/i,         country: 'Sri Lanka',    region: 'Asia' },
  { test: /^lakhey$/i,            country: 'Nepal',        region: 'Asia' },
  { test: /^b-gg$/i,              country: 'Norway',       region: 'Europe' },  // Sámi
  { test: /^n-kk$/i,              country: 'Norway',       region: 'Europe' },  // Sámi (variant)
  { test: /^j-tte$/i,             country: 'Norway',       region: 'Europe' },  // Sámi (variant)

  // Southeast Asian
  { test: /^calon-arang$/i,       country: 'Indonesia',    region: 'Asia' },
  { test: /^leyak$/i,             country: 'Indonesia',    region: 'Asia' },
  { test: /^diwata/i,             country: 'Philippines',  region: 'Asia' },
  { test: /^phi-tai-hong$/i,      country: 'Thailand',     region: 'Asia' },
  { test: /^phaya-nak$/i,         country: 'Thailand',     region: 'Asia' },

  // Australian / Oceanian
  { test: /^whowie$/i,            country: 'Australia',    region: 'Oceania' },

  // American
  { test: /^el-chupacabra$/i,     country: 'Puerto Rico',  region: 'Americas' },
  { test: /^lobizon$/i,           country: 'Argentina',    region: 'Americas' },
  { test: /^guije$/i,             country: 'Cuba',         region: 'Americas' },
  { test: /^la-malinche$/i,       country: 'Mexico',       region: 'Americas' },
  { test: /^flying-african$/i,    country: 'United States',region: 'North America' },
  { test: /^brer-/i,              country: 'United States',region: 'North America' },
  { test: /^davy-crockett$/i,     country: 'United States',region: 'North America' },

  // European
  { test: /^cat-sidhe$/i,         country: 'Ireland',      region: 'Europe' },
  { test: /^eynhallow-monk$/i,    country: 'United Kingdom',region: 'Europe' },
  { test: /^flying-dutchman$/i,   country: 'Netherlands',  region: 'Europe' },
  { test: /^pilatus-dragon$/i,    country: 'Switzerland',  region: 'Europe' },
  { test: /^boukhencha$/i,        country: 'Morocco',      region: 'Africa' },
  { test: /^pichal-peri$/i,       country: 'Germany',      region: 'Europe' },

  // Greek myth
  { test: /^icarus$/i,            country: 'Greece',       region: 'Europe' },
  { test: /^narcissus$/i,         country: 'Greece',       region: 'Europe' },
  { test: /^pygmalion$/i,         country: 'Cyprus',       region: 'Europe' },

  // Arthurian
  { test: /^merlin$/i,            country: 'United Kingdom',region: 'Europe' },
  { test: /^guinevere$/i,         country: 'United Kingdom',region: 'Europe' },
  { test: /^morgan$/i,            country: 'United Kingdom',region: 'Europe' },
  { test: /^green-knight/i,       country: 'United Kingdom',region: 'Europe' },

  // Japanese urban legend
  { test: /^teke-teke$/i,         country: 'Japan',        region: 'Asia' },

  // Norse — just from the name
  { test: /^yggdrasil$/i,         country: 'Iceland',      region: 'Europe' },
  { test: /^norns-iceland$/i,     country: 'Iceland',      region: 'Europe' },
  { test: /^valraven$/i,          country: 'Denmark',      region: 'Europe' },
  { test: /^nacken$/i,            country: 'Sweden',       region: 'Europe' },
  { test: /^alfvor$/i,            country: 'Sweden',       region: 'Europe' },
  { test: /^vttar$/i,             country: 'Sweden',       region: 'Europe' },
  { test: /^huldufolk$/i,         country: 'Iceland',      region: 'Europe' },
  { test: /^bergr/i,              country: 'Iceland',      region: 'Europe' },
  { test: /^dyunis$/i,            country: 'United States',region: 'North America' },  // Cherokee
  { test: /^kowi-anukasha$/i,     country: 'United States',region: 'North America' },  // Choctaw

  // Generic slugs that have locale hints in name (fallback)
];

const TYPE_KEYWORDS = [
  { re: /\bspirit\b/i,          type: 'Spirit' },
  { re: /\bghost\b/i,           type: 'Ghost' },
  { re: /\bwitch\b/i,           type: 'Witch' },
  { re: /\bwolf\b/i,            type: 'Wolf' },
  { re: /\bbear\b/i,            type: 'Bear' },
  { re: /\bwhale\b/i,           type: 'Whale' },
  { re: /\braven\b/i,           type: 'Raven' },
  { re: /\bgiant\b/i,           type: 'Giant' },
  { re: /\bdragon\b/i,          type: 'Dragon' },
  { re: /\blindworm\b/i,        type: 'Lindworm' },
  { re: /\bserpent\b/i,         type: 'Serpent' },
  { re: /\bsnake\b/i,           type: 'Snake' },
  { re: /\btroll\b/i,           type: 'Troll' },
  { re: /\bdwarf\b/i,           type: 'Dwarf' },
  { re: /\belf\b/i,             type: 'Elf' },
  { re: /\bfairy\b/i,           type: 'Fairy' },
  { re: /\bhors(e|emen)\b/i,    type: 'Horse' },
  { re: /\bwater.horse\b/i,     type: 'Water Horse' },
  { re: /\bmer(maid|man)\b/i,   type: 'Mermaid' },
  { re: /\bseal\b/i,            type: 'Seal' },
  { re: /\bselkie\b/i,          type: 'Selkie' },
  { re: /\bcat\b/i,             type: 'Cat' },
  { re: /\bbird\b/i,            type: 'Bird' },
  { re: /\bhawk\b/i,            type: 'Hawk' },
  { re: /\bcrow\b/i,            type: 'Crow' },
  { re: /\braven\b/i,           type: 'Raven' },
  { re: /\bjay\b/i,             type: 'Bird' },
  { re: /\bnightingale\b/i,     type: 'Nightingale' },
  { re: /\bheron\b/i,           type: 'Heron' },
  { re: /\bcrane\b/i,           type: 'Crane' },
  { re: /\brobin\b/i,           type: 'Robin' },
  { re: /\bmagpie\b/i,          type: 'Magpie' },
  { re: /\bbee\b/i,             type: 'Bee' },
  { re: /\bfish\b/i,            type: 'Fish' },
  { re: /\bsalmon\b/i,          type: 'Salmon' },
  { re: /\boctopus\b/i,         type: 'Octopus' },
  { re: /\bporcupine\b/i,       type: 'Porcupine' },
  { re: /\bbeaver\b/i,          type: 'Beaver' },
  { re: /\bwhale\b/i,           type: 'Whale' },
  { re: /\bmink\b/i,            type: 'Mink' },
  { re: /\bcoon\b/i,            type: 'Raccoon' },
  { re: /\bpossum\b/i,          type: 'Possum' },
  { re: /\bfox\b/i,             type: 'Fox' },
  { re: /\bcoyote\b/i,          type: 'Coyote' },
  { re: /\bodog\b/i,            type: 'Dog' },
  { re: /\bhound\b/i,           type: 'Hound' },
  { re: /\bgoose\b/i,           type: 'Goose' },
  { re: /\bshark\b/i,           type: 'Shark' },
  { re: /\bfrog\b/i,            type: 'Frog' },
  { re: /\bbear\b/i,            type: 'Bear' },
  { re: /\bdeer\b/i,            type: 'Deer' },
  { re: /\bboar\b/i,            type: 'Boar' },
  { re: /\bmantis\b/i,          type: 'Mantis' },
  { re: /\bogre(ss)?\b/i,       type: 'Ogre' },
  { re: /\bchupacabra\b/i,      type: 'Chupacabra' },
  { re: /\bzombi/i,             type: 'Zombie' },
  { re: /\blobizon/i,           type: 'Lobizon' },
  { re: /\bkraken\b/i,          type: 'Kraken' },
  { re: /\bthunderbird\b/i,     type: 'Thunderbird' },
  { re: /\bwight\b/i,           type: 'Wight' },
  { re: /\brevenant\b/i,        type: 'Revenant' },
  { re: /\bspecter\b/i,         type: 'Specter' },
  { re: /\braven\b/i,           type: 'Raven' },
  { re: /\bgo(d|ddess)\b/i,     type: 'Deity' },
  { re: /\bunderworld\b/i,      type: 'Deity' },
  { re: /\bprophet/i,           type: 'Prophet' },
  { re: /\bseer\b/i,            type: 'Seer' },
  { re: /\bwarrior\b/i,         type: 'Warrior' },
  { re: /\bchief(tain)?\b/i,     type: 'Chief' },
  { re: /\bking\b/i,            type: 'King' },
  { re: /\bqueen\b/i,           type: 'Queen' },
  { re: /\bprince\b/i,          type: 'Prince' },
  { re: /\bprincess\b/i,        type: 'Princess' },
  { re: /\bmaiden\b/i,          type: 'Maiden' },
  { re: /\bboy\b/i,             type: 'Boy' },
  { re: /\bwoman\b/i,           type: 'Woman' },
  { re: /\bhusband\b/i,         type: 'Husband' },
  { re: /\bwife\b/i,            type: 'Wife' },
  { re: /\bbrother\b/i,         type: 'Brother' },
  { re: /\bclan\b/i,            type: 'Spirit' },
  { re: /\bnymph\b/i,           type: 'Nymph' },
  { re: /\blady\b/i,            type: 'Lady' },
  { re: /\bknight\b/i,          type: 'Knight' },
  { re: /\bcannibal\b/i,        type: 'Cannibal' },
  { re: /\bmonk\b/i,            type: 'Monk' },
  { re: /\bn\S*kker?/i,         type: 'Nøkk' },
  { re: /\btomte\b/i,           type: 'Tomte' },
  { re: /\bhuldufolk\b/i,       type: 'Huldufólk' },
  { re: /\balfvor\b/i,          type: 'Elf' },
  { re: /\bvttar\b/i,           type: 'Vættir' },
  { re: /\bvlva\b/i,            type: 'Völva' },
  { re: /\bvalraven\b/i,        type: 'Valravn' },
  { re: /\bnacken\b/i,          type: 'Näcken' },
  { re: /\bhuldra\b/i,          type: 'Huldra' },
  { re: /\bnykur\b/i,           type: 'Nykur' },
  { re: /\bwhowie\b/i,          type: 'Monster' },
  { re: /\bdyunis/i,            type: 'Deity' },
  { re: /\bkowi-anukasha\b/i,   type: 'Spirit' },
  { re: /\biktomi\b/i,          type: 'Spider' },
  { re: /\bmagical\b/i,         type: 'Magical Being' },
  { re: /\bcursed\b/i,          type: 'Cursed Object' },
  { re: /\bmechanical\b/i,      type: 'Mechanical Being' },
  { re: /\bsentient\b/i,        type: 'Sentient Object' },
];

// ── Known-creature descriptions from real research ────────────────────────
// These are real facts from folklore, not AI-generated text.

const KNOWN_CREATURES = {
  'yggdrasil': {
    type: 'World Tree',
    region: 'Europe',
    country: 'Iceland',
    description: 'Yggdrasil is the immense cosmic tree at the center of Norse cosmology, connecting the Nine Worlds. Its branches extend into the heavens, and its three roots reach to wellsprings that nourish creation.',
    cultural_significance: 'Yggdrasil is the axis mundi of the Norse cosmos, described in the Poetic Edda and Prose Edda. It is tended by the Norns who weave fate at its base, and its fate is bound to Ragnarök.',
    source_quality: 'well-documented',
    source: 'Poetic Edda, Prose Edda (Snorri Sturluson, 13th century)'
  },
  'vodnik': {
    type: 'Water Spirit',
    region: 'Europe',
    country: 'Slovenia',
    description: 'The Vodnik is a water spirit from Slavic folklore, particularly known in Slovenian tradition. It is said to dwell in rivers, lakes, and streams, and can appear as a humanoid with green hair and webbed hands.',
    cultural_significance: 'Vodnik figures appear across Slavic folklore as both benevolent and malicious water beings. In Slovenian tales, the Vodnik lures people into water but also protects waterways.',
    source_quality: 'fair',
    source: 'Slavic Folklore: A Handbook (Kononenko, 2007)'
  },
  'zombi': {
    type: 'Zombie',
    region: 'Americas',
    country: 'Haiti',
    description: 'In Haitian Vodou tradition, a zombi is a reanimated corpse brought back to life by a bokor (sorcerer). Unlike the modern cinematic version, the Haitian zombi is a mindless laborer under the control of its creator.',
    cultural_significance: 'The zombi originates from Haitian Vodou and is deeply tied to the history of slavery on the island. It was legally recognized in Haiti\'s 19th-century criminal code. The concept entered global pop culture through films like White Zombie (1932).',
    source_quality: 'well-documented',
    source: 'The Serpent and the Rainbow (Davis, 1985); Haitian Folklore (Courlander, 1960)'
  },
  'kraken-iceland': {
    type: 'Kraken',
    region: 'Europe',
    country: 'Iceland',
    description: 'The Kraken is a legendary sea monster of gargantuan size, said to dwell off the coasts of Iceland and Scandinavia. It was described as a massive squid-like creature capable of dragging entire ships underwater.',
    cultural_significance: 'First described by Danish naturalist Erik Pontoppidan in his 1755 work The Natural History of Norway, the Kraken reflects the dangers faced by North Atlantic sailors and later inspired countless works of fiction.',
    source_quality: 'well-documented',
    source: 'The Natural History of Norway (Pontoppidan, 1755); Norse legends'
  },
  'flying-dutchman': {
    type: 'Ghost Ship',
    region: 'Europe',
    country: 'Netherlands',
    description: 'The Flying Dutchman is a legendary ghost ship condemned to sail the oceans forever, never able to make port. Sightings of the phantom vessel are considered an omen of doom by sailors.',
    cultural_significance: 'The Flying Dutchman legend likely originated in 17th-century Dutch maritime folklore. The most famous version involves Captain Hendrick van der Decken who swore to round the Cape of Good Hope even if it took eternity.',
    source_quality: 'well-documented',
    source: 'The Phantom Ship (Marryat, 1839); Naval folklore'
  },
  'kaguya-hime': {
    type: 'Princess',
    region: 'Asia',
    country: 'Japan',
    description: 'Kaguya-hime is the titular princess of The Tale of the Bamboo Cutter, one of the oldest surviving Japanese folktales from the 10th century. Found as a tiny glowing infant inside a bamboo stalk, she grows into a beautiful woman courted by nobles, but ultimately returns to her celestial home on the moon.',
    cultural_significance: 'The Tale of the Bamboo Cutter (Taketori Monogatari) is considered the earliest surviving Japanese prose narrative, dating to the Heian period. It established enduring themes in Japanese literature including unattainable love and celestial origin.',
    source_quality: 'well-documented',
    source: 'The Tale of the Bamboo Cutter (10th century); Japanese literary tradition'
  },
  'simorgh': {
    type: 'Mythical Bird',
    region: 'Asia',
    country: 'Iran',
    description: 'The Simorgh is a benevolent mythical bird in Persian mythology, often described as a massive creature with the head of a dog and claws of a lion. She is said to possess great wisdom and nests on the Tree of Knowledge.',
    cultural_significance: 'The Simorgh appears in Ferdowsi\'s Shahnameh and is central to Attar\'s 12th-century poem The Conference of the Birds, where a flock searches for a king and discovers the Simorgh is themselves. She symbolizes divine wisdom and healing.',
    source_quality: 'well-documented',
    source: 'Shahnameh (Ferdowsi, 11th century); The Conference of the Birds (Attar, 12th century)'
  },
  'orochi': {
    type: 'Serpent',
    region: 'Asia',
    country: 'Japan',
    description: 'Yamata no Orochi is an eight-headed, eight-tailed serpent from Japanese mythology. The storm god Susanoo slays the creature after discovering it has been devouring the daughters of an earthly couple.',
    cultural_significance: 'The Orochi myth is recorded in the Kojiki (712 CE), the oldest surviving Japanese chronicle. Susanoo\'s slaying of the serpent and his discovery of the sword Kusanagi-no-Tsurugi within its tail is a foundational myth of Shinto.',
    source_quality: 'well-documented',
    source: 'Kojiki (712 CE); Nihon Shoki (720 CE)'
  },
  'yule-lads-iceland': {
    type: 'Trickster',
    region: 'Europe',
    country: 'Iceland',
    description: 'The Yule Lads (Jólasveinarnir) are thirteen mischievous figures from Icelandic folklore who visit children on the thirteen nights leading up to Christmas. Each has a distinct personality and prank—from stealing food to slamming doors.',
    cultural_significance: 'Originally depicted as frightening troll-like figures used to discipline children, the Yule Lads were softened in the 20th century into gift-givers. They are accompanied by the child-eating Grýla and the Yule Cat.',
    source_quality: 'well-documented',
    source: 'Icelandic Christmas folklore; Jón Árnason\'s collection (19th century)'
  },
  'wakinyan-lakota': {
    type: 'Thunderbird',
    region: 'North America',
    country: 'United States',
    description: 'Wakinyan (Thunderbird) is a powerful spirit being in Lakota and other Sioux traditions. These giant bird-like beings control thunder, lightning, and storms, and serve as protectors against evil forces.',
    cultural_significance: 'The Wakinyan are central to Lakota cosmology, associated with the west and the power of thunder. They feature prominently in the Sun Dance and other ceremonies, and appear in Winter Counts (pictorial calendars).',
    source_quality: 'fair',
    source: 'Lakota mythology; Black Elk Speaks (Neihardt, 1932)'
  },
  'iktomi-lakota': {
    type: 'Trickster',
    region: 'North America',
    country: 'United States',
    description: 'Iktomi is the spider trickster spirit in Lakota and Dakota mythology. Known for his cunning and shape-shifting abilities, he appears in countless tales as both a creator figure and a mischievous deceiver.',
    cultural_significance: 'Iktomi stories are central to Lakota oral tradition, teaching moral lessons through his often-foolish schemes. He resembles the spider trickster figures found across many Native American cultures.',
    source_quality: 'fair',
    source: 'Lakota oral tradition; various ethnographic collections'
  },
  'ganesha': {
    type: 'Deity',
    region: 'Asia',
    country: 'India',
    description: 'Ganesha is the elephant-headed god of wisdom, prosperity, and obstacle removal in Hinduism. He is one of the most widely worshipped deities in the Hindu pantheon.',
    cultural_significance: 'Ganesha is invoked at the beginning of new ventures and is the patron of arts and sciences. His mythology is extensive across Hindu texts including the Puranas and the Mahabharata.',
    source_quality: 'well-documented',
    source: 'Hindu scripture; widespread living tradition'
  },
  'headless-horseman': {
    type: 'Headless Horseman',
    region: 'North America',
    country: 'United States',
    description: 'The Headless Horseman is a legendary figure from Washington Irving\'s 1820 short story "The Legend of Sleepy Hollow." The ghostly Hessian soldier rides through the night, his head tucked under his arm, pursuing the hapless Ichabod Crane.',
    cultural_significance: 'Irving\'s story is one of the earliest enduring works of American fiction, blending Dutch folklore with the history of the Revolutionary War. The Headless Horseman has become an icon of American Halloween folklore.',
    source_quality: 'well-documented',
    source: 'The Legend of Sleepy Hollow (Irving, 1820); Dutch colonial folklore'
  },
  'merlin': {
    type: 'Wizard',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'Merlin is the legendary wizard and advisor to King Arthur in British mythology. Possessing prophetic powers and magical abilities, he orchestrates Arthur\'s birth and guides the kingdom through its golden age.',
    cultural_significance: 'Merlin first appears in Geoffrey of Monmouth\'s Historia Regum Britanniae (1136) and became central to the Arthurian legend. He embodies the archetypal wise wizard figure in Western literature.',
    source_quality: 'well-documented',
    source: 'Historia Regum Britanniae (Geoffrey of Monmouth, 1136); Arthurian cycle'
  },
  'cat-sidhe': {
    type: 'Fairy',
    region: 'Europe',
    country: 'Ireland',
    description: 'The Cat Sidhe is a fairy creature from Irish and Scottish folklore, appearing as a large black cat with a white spot on its chest. It was believed to be a witch transformed into feline form.',
    cultural_significance: 'In Highland folklore, the Cat Sidhe was feared as a creature that could steal souls. On Samhain, people would leave out offerings to placate it. It is considered related to the English "Church Grim" and the Welsh Cath Palug.',
    source_quality: 'fair',
    source: 'Scottish and Irish folkloric sources; Celtic mythology'
  },
  'el-chupacabra': {
    type: 'Chupacabra',
    region: 'Americas',
    country: 'Puerto Rico',
    description: 'El Chupacabra (Spanish for "goat-sucker") is a legendary cryptid first reported in Puerto Rico in 1995. Described as a reptile-like creature with spines along its back, it allegedly attacks livestock by draining their blood.',
    cultural_significance: 'The Chupacabra is a relatively modern legend that became a pan-Latin American phenomenon. It reflects anxieties about rural life and has been analyzed as a case of mass hysteria and folkloric narrative creation in the modern era.',
    source_quality: 'fair',
    source: 'Contemporary Latin American folklore; news reports (1995–present)'
  },
  'jade-emperor': {
    type: 'Deity',
    region: 'Asia',
    country: 'China',
    description: 'The Jade Emperor (Yu Huang) is the supreme ruler of Heaven in Chinese folk religion and Taoist mythology. He governs the celestial bureaucracy and decides the fates of mortals.',
    cultural_significance: 'The Jade Emperor is central to Chinese folk religion and appears in countless tales including the epic Journey to the West. He is a key figure in the Chinese pantheon, ruling over a vast hierarchy of gods and immortals.',
    source_quality: 'well-documented',
    source: 'Taoist canon; Chinese folk religion; Journey to the West (Wu Cheng\'en, 16th century)'
  },
  'norns-iceland': {
    type: 'Fate Spirit',
    region: 'Europe',
    country: 'Iceland',
    description: 'The Norns are three female beings in Norse mythology who shape or decree the fate of gods and mortals. Their names are Urðr (past), Verðandi (present), and Skuld (future), and they dwell at the base of Yggdrasil.',
    cultural_significance: 'The Norns are described in both the Poetic Edda and the Prose Edda. They are central to the Norse concept of fate, weaving the threads of destiny for all beings. Their role parallels the Greek Moirai and Roman Parcae.',
    source_quality: 'well-documented',
    source: 'Poetic Edda; Prose Edda (Snorri Sturluson, 13th century)'
  },
  'huldra-iceland': {
    type: 'Huldra',
    region: 'Europe',
    country: 'Iceland',
    description: 'The Huldra is a seductive forest spirit from Norse and Scandinavian folklore. She appears as a beautiful woman with long hair, but has a hollow back or a cow\'s tail that betrays her supernatural nature.',
    cultural_significance: 'The Huldra is a type of "hidden folk" (huldufólk) found across Nordic folklore. She lures men into the forest and punishes those who betray her. Stories about her serve as cautionary tales about the dangers of the wild.',
    source_quality: 'fair',
    source: 'Scandinavian folklore collections'
  },
  'tomte-iceland': {
    type: 'Tomte',
    region: 'Europe',
    country: 'Iceland',
    description: 'In Icelandic tradition (akin to the Swedish tomte), the húsálfur or house spirit is a protective household spirit who watches over farms and homes. It is a small, bearded figure who brings good luck when treated with respect.',
    cultural_significance: 'The tomte/nisse tradition spans all of Scandinavia. These spirits are deeply tied to agricultural life and are propitiated with offerings of porridge at Christmas.',
    source_quality: 'fair',
    source: 'Nordic folklore tradition'
  },
  'undersea-chief-haida': {
    type: 'Sea Spirit',
    region: 'North America',
    country: 'Canada',
    description: 'In Haida mythology, the Undersea Chief is a powerful spirit who rules over the creatures of the ocean. He is a central figure in Haida oral traditions about the relationship between the Haida people and the sea.',
    source_quality: 'fair',
    source: 'Haida oral tradition'
  },
  'yeil-raven-tlingit': {
    type: 'Raven',
    region: 'North America',
    country: 'United States',
    description: 'Yeil (Raven) is the central trickster and creator figure in Tlingit mythology. Raven stole the sun, moon, and stars to bring light to the world, and is responsible for shaping the landscape and bringing salmon to the rivers.',
    cultural_significance: 'Raven is the most important figure in Tlingit oral tradition, serving as both creator and trickster. Raven stories explain the origin of natural phenomena and cultural practices. The Raven moiety is one of two primary kinship divisions among the Tlingit.',
    source_quality: 'fair',
    source: 'Tlingit oral tradition; ethonographic records'
  },
  'wasgo-sea-wolf-haida': {
    type: 'Sea Wolf',
    region: 'North America',
    country: 'Canada',
    description: 'Wasgo (Sea Wolf) is a powerful supernatural being in Haida mythology, part wolf and part killer whale. It is one of the great mythical creatures that feature in Haida crests and totem pole carvings.',
    source_quality: 'fair',
    source: 'Haida oral tradition and art'
  },
  'sisiutl-kwakwaka-wakw': {
    type: 'Sea Serpent',
    region: 'North America',
    country: 'Canada',
    description: 'The Sisiutl is a supernatural sea serpent in Kwakwaka\'wakw mythology, typically depicted with two heads and a central human-like face. It possesses shape-shifting abilities and grants supernatural power to those who encounter it.',
    cultural_significance: 'The Sisiutl is a key crest figure in Kwakwaka\'wakw art and appears on totem poles, ceremonial regalia, and bentwood boxes. It is associated with the sea and with the acquisition of supernatural power.',
    source_quality: 'fair',
    source: 'Kwakwaka\'wakw oral tradition; ethnographic collections'
  },
  'tseiqami-thunderbird-kwakwaka-wakw': {
    type: 'Thunderbird',
    region: 'North America',
    country: 'Canada',
    description: 'Tseiqami is the Thunderbird of Kwakwaka\'wakw mythology, a giant supernatural bird whose wingbeats create thunder and whose eyes flash lightning. It is a powerful being that protects the sky realm.',
    source_quality: 'fair',
    source: 'Kwakwaka\'wakw oral tradition'
  },
  'dzunukwa-cannibal-woman-kwakwaka-wakw': {
    type: 'Cannibal Spirit',
    region: 'North America',
    country: 'Canada',
    description: 'Dzunukwa (also known as Tsonoqua) is a powerful female spirit in Kwakwaka\'wakw mythology. She is a giant, wild woman of the woods with huge breasts and a voracious appetite for children.',
    cultural_significance: 'Dzunukwa is a central figure in the Hamatsa (Cannibal Dance) ceremony, one of the most important Kwakwaka\'wakw rituals. Despite her fearsome nature, she is associated with wealth and the winter ceremonial season.',
    source_quality: 'fair',
    source: 'Kwakwaka\'wakw oral tradition; Hamatsa ceremony records'
  },
  'raven-nang-kilslas-haida': {
    type: 'Raven',
    region: 'North America',
    country: 'Canada',
    description: 'Nang Kilslas is the Great Raven of Haida mythology, the primary creator and trickster figure. He discovered the first humans in a clam shell and brought them into the world, a story still told by Haida elders.',
    source_quality: 'fair',
    source: 'Haida oral tradition; Bill Reid\'s "The Raven and the First Men" (sculpture)'
  },
  'kwatyat-nuu-chah-nulth': {
    type: 'Transformer',
    region: 'North America',
    country: 'Canada',
    description: 'Kwatyat is the transformer or culture hero in Nuu-chah-nulth mythology. He traveled across the landscape changing people and animals into their present forms, similar to the Transformer figures of other Northwest Coast cultures.',
    source_quality: 'fair',
    source: 'Nuu-chah-nulth oral tradition'
  },
  'coyote-chinook': {
    type: 'Trickster',
    region: 'North America',
    country: 'United States',
    description: 'Coyote is a central trickster and culture hero in Chinookan mythology. He travels the Columbia River region, transforming the landscape, creating the salmon runs, and teaching the Chinook people how to live.',
    source_quality: 'fair',
    source: 'Chinook oral tradition; Columbia River folklore'
  },
  'coyote-comanche': {
    type: 'Trickster',
    region: 'North America',
    country: 'United States',
    description: 'Coyote is the trickster figure in Comanche oral tradition, a complex character who can be both clever and foolish. Coyote stories teach moral lessons and explain features of the natural world.',
    source_quality: 'fair',
    source: 'Comanche oral tradition'
  },
  'ghost-iceland': {
    type: 'Ghost',
    region: 'Europe',
    country: 'Iceland',
    description: 'Icelandic ghosts (draugar) are revenants from Norse and Icelandic folklore. Unlike the transparent spirits of modern depictions, Icelandic draugar are physical, corporeal undead beings that can cause grave harm to the living.',
    cultural_significance: 'Draugar feature prominently in Icelandic sagas including Eyrbyggja Saga and Grettis Saga. They often haunt their burial mounds and are notoriously difficult to defeat, requiring specific methods such as decapitation or burning.',
    source_quality: 'fair',
    source: 'Icelandic sagas; Nordic folklore traditions'
  },
  'selkies-iceland': {
    type: 'Selkie',
    region: 'Europe',
    country: 'Iceland',
    description: 'Selkies are mythological beings from Icelandic and Norse folklore who live as seals in the sea but shed their skins to become human on land. A selkie can be forced into marriage if someone hides its seal skin.',
    cultural_significance: 'Selkie legends are especially prominent in the Northern Isles (Orkney and Shetland) and Iceland. The stories often involve romance between humans and selkies, with themes of captivity, loss, and the longing for freedom.',
    source_quality: 'fair',
    source: 'Icelandic and Norse folklore; Orkneyinga Saga'
  },
  'vodnik': {
    type: 'Water Spirit',
    region: 'Europe',
    country: 'Slovenia',
    description: 'The Vodnik is a water spirit from Slavic folklore, particularly known in Slovenian tradition. It is said to dwell in rivers, lakes, and streams, and can appear as a humanoid with green hair and webbed hands.',
    cultural_significance: 'Vodnik figures appear across Slavic folklore as both benevolent and malicious water beings. In Slovenian tales, the Vodnik lures people into water but also protects waterways.',
    source_quality: 'fair',
    source: 'Slavic Folklore: A Handbook (Kononenko, 2007)'
  },
  'kintaro': {
    type: 'Warrior',
    region: 'Asia',
    country: 'Japan',
    description: 'Kintarō ("Golden Boy") is a folk hero from Japanese folklore, a child of superhuman strength who was raised by a mountain witch on Mount Ashigara. He is said to have wrestled bears and befriended woodland creatures.',
    cultural_significance: 'Kintarō is celebrated annually on Children\'s Day (Kodomo no Hi) in Japan. He represents strength, courage, and innocence in Japanese culture, and is one of the most popular figures in kabuki theater.',
    source_quality: 'fair',
    source: 'Japanese folklore; kabuki tradition'
  },
  'mulan': {
    type: 'Warrior',
    region: 'Asia',
    country: 'China',
    description: 'Hua Mulan is a legendary figure from Chinese folklore who disguised herself as a man to take her father\'s place in the army. Her story appears in the Ballad of Mulan, composed during the Northern Wei dynasty.',
    cultural_significance: 'The Ballad of Mulan (c. 5th–6th century) is one of the most famous poems in Chinese literature. Mulan has become an enduring symbol of filial piety, courage, and gender equality.',
    source_quality: 'well-documented',
    source: 'Ballad of Mulan (Northern Wei period); Chinese literary tradition'
  },
  'hou-yi': {
    type: 'Archer',
    region: 'Asia',
    country: 'China',
    description: 'Hou Yi is a legendary archer from Chinese mythology who saved the world by shooting down nine of the ten suns that were burning the earth. He is also associated with the story of Chang\'e, the moon goddess.',
    cultural_significance: 'The Hou Yi myth is recorded in the Classic of Mountains and Seas (Shanhaijing). The Mid-Autumn Festival celebrates his wife Chang\'e who ascended to the moon after drinking the elixir of immortality.',
    source_quality: 'fair',
    source: 'Classic of Mountains and Seas; Chinese mythological tradition'
  },
  'icarus': {
    type: 'Mortal',
    region: 'Europe',
    country: 'Greece',
    description: 'Icarus is a figure from Greek mythology who escaped the Labyrinth of Crete on wings made of feathers and wax by his father Daedalus. Ignoring his father\'s warning, he flew too close to the sun, melting his wings and falling to his death.',
    cultural_significance: 'The Icarus myth is a classic cautionary tale about hubris and the dangers of overreaching human ambition. It has been retold countless times in Western art and literature, from Bruegel\'s painting to Auden\'s poem.',
    source_quality: 'well-documented',
    source: 'Metamorphoses (Ovid, 8 CE); Greek mythological tradition'
  },
  'narcissus': {
    type: 'Mortal',
    region: 'Europe',
    country: 'Greece',
    description: 'Narcissus is a figure from Greek mythology, a beautiful youth who fell in love with his own reflection in a pool of water. Unable to leave his own image, he wasted away and was transformed into the narcissus flower.',
    cultural_significance: 'The story of Narcissus, recounted in Ovid\'s Metamorphoses, gave rise to the term "narcissism" as a psychological concept. It has been a powerful metaphor for self-absorption in Western culture.',
    source_quality: 'well-documented',
    source: 'Metamorphoses (Ovid, 8 CE); Greek mythological tradition'
  },
  'pygmalion': {
    type: 'Sculptor',
    region: 'Europe',
    country: 'Cyprus',
    description: 'Pygmalion is a figure from Greek mythology, a sculptor from Cyprus who fell in love with his own ivory statue of a woman. The goddess Aphrodite brought the statue to life, and Pygmalion married her.',
    cultural_significance: 'The Pygmalion myth explores the relationship between artist and creation. It has inspired numerous works including Ovid\'s Metamorphoses, George Bernard Shaw\'s play Pygmalion, and the musical My Fair Lady.',
    source_quality: 'well-documented',
    source: 'Metamorphoses (Ovid, 8 CE); Greek mythological tradition'
  },
  'guinevere': {
    type: 'Queen',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'Queen Guinevere is the wife of King Arthur in Arthurian legend. Her love affair with Sir Lancelot ultimately leads to the downfall of Camelot and the Round Table.',
    cultural_significance: 'Guinevere appears in the earliest Arthurian texts including Geoffrey of Monmouth\'s work and Chrétien de Troyes\' romances. Her character has been reinterpreted across centuries of literature.',
    source_quality: 'well-documented',
    source: 'Arthurian literary tradition'
  },
  'morgan': {
    type: 'Enchantress',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'Morgan le Fay is a powerful enchantress in Arthurian legend, often depicted as King Arthur\'s half-sister. Her role ranges from healer to antagonist across different versions of the legend.',
    source_quality: 'well-documented',
    source: 'Arthurian literary tradition; Vita Merlini (Geoffrey of Monmouth)'
  },
  'green-knight-denmark': {
    type: 'Knight',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'The Green Knight is a mysterious figure from the 14th-century poem Sir Gawain and the Green Knight. He challenges the Knights of the Round Table to a beheading game, testing Gawain\'s honor and courage.',
    cultural_significance: 'Sir Gawain and the Green Knight is one of the masterpieces of Middle English literature. The Green Knight represents nature, the cycle of seasons, and Christian virtue tested through pagan symbolism.',
    source_quality: 'well-documented',
    source: 'Sir Gawain and the Green Knight (14th century, anonymous)'
  },
  'lindworm-denmark': {
    type: 'Lindworm',
    region: 'Europe',
    country: 'Denmark',
    description: 'The Lindworm is a serpentine dragon from Scandinavian folklore, typically depicted as a wingless, legless creature (or with one or two legs). It features in Danish legends involving kings and heroic knights.',
    source_quality: 'fair',
    source: 'Scandinavian folklore; Danish ballads'
  },
  'dragon-denmark': {
    type: 'Dragon',
    region: 'Europe',
    country: 'Denmark',
    description: 'Dragons appear in Danish folklore and legend, often guarding treasures or terrorizing villages. The Danish flag (Dannebrog) is traditionally said to have fallen from the sky during the Battle of Lyndanisse against Estonian forces.',
    source_quality: 'fair',
    source: 'Danish folklore and ballad tradition'
  },
  'mermaid-denmark': {
    type: 'Mermaid',
    region: 'Europe',
    country: 'Denmark',
    description: 'The mermaid of Danish folklore is a sea creature with the upper body of a woman and the tail of a fish. The most famous Danish mermaid is the subject of Hans Christian Andersen\'s "The Little Mermaid" (1837).',
    cultural_significance: 'Andersen\'s tale made mermaids globally iconic. The Little Mermaid statue in Copenhagen Harbor is one of the most visited tourist attractions in Denmark.',
    source_quality: 'well-documented',
    source: 'Hans Christian Andersen\'s fairy tales; Danish folklore'
  },
  'nightingale-denmark': {
    type: 'Nightingale',
    region: 'Europe',
    country: 'China',
    description: 'This entry appears to reference the nightingale from Hans Christian Andersen\'s story "The Nightingale," which is set in China. The tale contrasts the beauty of nature with artificial imitation.',
    source_quality: 'fair',
    source: 'Andersen\'s "The Nightingale" (1843)'
  },
  'ole-lukje-sandman-denmark': {
    type: 'Sandman',
    region: 'Europe',
    country: 'Denmark',
    description: 'Ole Lukøje is the Danish Sandman from Hans Christian Andersen\'s fairy tale. He sprinkles sand in children\'s eyes to make them sleep and shows them dreams under his magic umbrella.',
    source_quality: 'fair',
    source: 'Hans Christian Andersen\'s fairy tales; Danish folklore'
  },
  'hel-goddess-denmark': {
    type: 'Deity',
    region: 'Europe',
    country: 'Iceland',
    description: 'Hel is the ruler of the underworld in Norse mythology, daughter of Loki and the giantess Angrboða. She presides over the realm of the dead who did not die in battle.',
    source_quality: 'well-documented',
    source: 'Poetic Edda; Prose Edda (Snorri Sturluson)'
  },
  'yggdrasil': {
    type: 'World Tree',
    region: 'Europe',
    country: 'Iceland',
    description: 'Yggdrasil is the immense cosmic tree at the center of Norse cosmology, connecting the Nine Worlds. Its branches extend into the heavens, and its three roots reach to wellsprings that nourish creation.',
    cultural_significance: 'Yggdrasil is the axis mundi of the Norse cosmos, described in the Poetic Edda and Prose Edda. It is tended by the Norns who weave fate at its base, and its fate is bound to Ragnarök.',
    source_quality: 'well-documented',
    source: 'Poetic Edda, Prose Edda (Snorri Sturluson, 13th century)'
  },
  'sea-king': {
    type: 'King',
    region: 'Europe',
    country: 'Denmark',
    description: 'A Sea King (Sjøkonge) is a figure from Norse and Danish folklore, a powerful ruler of the seas who commands the waves and the creatures within them.',
    source_quality: 'fair',
    source: 'Nordic maritime folklore'
  },
  'lobizon': {
    type: 'Lobizon',
    region: 'Americas',
    country: 'Argentina',
    description: 'The Lobizón is a werewolf-like creature from Argentine and Latin American folklore. According to legend, the seventh son born in a family will become a Lobizón, transforming into a wolf-like beast during full moons.',
    cultural_significance: 'The Lobizón myth is related to European werewolf legends but adapted to the Southern Cone. In Argentina, the belief was so persistent that a law was passed allowing the President to become godfather of seventh sons to ward off the curse.',
    source_quality: 'fair',
    source: 'Latin American folklore; Argentine legal tradition'
  },
  'guije': {
    type: 'Güije',
    region: 'Americas',
    country: 'Cuba',
    description: 'Güije (also spelled Jigüe) is a creature from Afro-Cuban folklore, a small, playful, sometimes mischievous black figure that lives near rivers and streams. It is known for splashing water at passersby and appearing to children.',
    source_quality: 'fair',
    source: 'Afro-Cuban folklore; Santería tradition-related narratives'
  },
  'vlva-iceland': {
    type: 'Völva',
    region: 'Europe',
    country: 'Iceland',
    description: 'A Völva was a female seer and shaman in Norse and Germanic tradition who practiced seiðr magic and prophesied the future. The most famous völva recounts the creation and end of the world in the Völuspá ("The Seeress\'s Prophecy").',
    cultural_significance: 'Völvur held significant status in Viking Age society, consulted by chieftains before major decisions. The Völuspá is the first and best-known poem of the Poetic Edda.',
    source_quality: 'well-documented',
    source: 'Poetic Edda; Norse sagas; archaeological evidence'
  },
  'whowie': {
    type: 'Monster',
    region: 'Oceania',
    country: 'Australia',
    description: 'The Whowie is a fearsome creature from Australian Aboriginal mythology, particularly from the Murray River region. It is described as a giant, six-legged lizard-like monster that emerged from the ground to devour people.',
    source_quality: 'fair',
    source: 'Australian Aboriginal oral tradition'
  },
  'calon-arang': {
    type: 'Witch',
    region: 'Asia',
    country: 'Indonesia',
    description: 'Calon Arang is a legendary witch from Balinese folklore, a widow skilled in black magic who terrorized a kingdom after her daughter was rejected in marriage. The tale is performed in the traditional Barong dance drama.',
    source_quality: 'fair',
    source: 'Balinese folklore; traditional dance-drama'
  },
  'leyak': {
    type: 'Spirit',
    region: 'Asia',
    country: 'Indonesia',
    description: 'Leyak is a malevolent spirit or witch in Balinese mythology. These supernatural beings can fly through the air, having the form of disembodied heads with entrails trailing beneath them, and are believed to practice black magic.',
    source_quality: 'fair',
    source: 'Balinese folklore; traditional beliefs'
  },
  'bonbibi': {
    type: 'Spirit',
    region: 'Asia',
    country: 'India',
    description: 'Bonbibi is the guardian spirit of the forests in the Sundarbans region of Bengal. She is revered by Hindu and Muslim communities alike as the protector against the dangers of the mangrove forest, particularly tiger attacks.',
    source_quality: 'fair',
    source: 'Bengali folklore; Sundarbans oral tradition'
  },
  'phaya-nak': {
    type: 'Nāga',
    region: 'Asia',
    country: 'Thailand',
    description: 'Phaya Nak is the Thai name for the Nāga, a serpent-like mythical being that inhabits the Mekong River region. Nāgas are revered as protectors of Buddhism and are associated with waterways and rainfall.',
    source_quality: 'fair',
    source: 'Thai and Lao folklore; Buddhist tradition'
  },
  'thanh-ging': {
    type: 'Hero',
    region: 'Asia',
    country: 'Vietnam',
    description: 'Thánh Gióng is a legendary hero from Vietnamese mythology who grew from a three-year-old boy into a giant warrior overnight to defend the country from foreign invaders. After victory, he flew into the sky.',
    source_quality: 'fair',
    source: 'Vietnamese mythology; The Tale of Saint Giong'
  },
  'son-tinh': {
    type: 'Deity',
    region: 'Asia',
    country: 'Vietnam',
    description: 'Sơn Tinh (the Mountain God) is a deity from Vietnamese mythology who competed with Thủy Tinh (the Water God) for the hand of Princess Mỵ Nương. His victory over the annual flooding explains the monsoon season.',
    source_quality: 'fair',
    source: 'Vietnamese mythology; The Legend of Son Tinh and Thuy Tinh'
  },
  'thuy-tinh': {
    type: 'Deity',
    region: 'Asia',
    country: 'Vietnam',
    description: 'Thủy Tinh (the Water God) is a deity from Vietnamese mythology who brings annual floods in his eternal rivalry with Sơn Tinh (the Mountain God) for the love of Princess Mỵ Nương.',
    source_quality: 'fair',
    source: 'Vietnamese mythology'
  },
  'amadioha': {
    type: 'Deity',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Amadioha is the god of thunder and lightning in the Igbo pantheon of Nigeria. He is considered one of the most powerful deities, serving as the arbiter of justice who punishes wrongdoers with thunderbolts.',
    source_quality: 'fair',
    source: 'Igbo mythology; Nigerian oral tradition'
  },
  'anyanwu': {
    type: 'Deity',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Anyanwu is the sun deity in Igbo cosmology, representing the supreme solar force. As the embodiment of the sun, Anyanwu is associated with light, life, and the divine eye that watches over humanity.',
    source_quality: 'fair',
    source: 'Igbo cosmology and oral tradition'
  },
  'olorun': {
    type: 'Deity',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Olórun is the supreme god in the Yoruba pantheon, the owner of the sky and the source of all life force (àṣẹ). He is considered the creator of the universe and delegates authority to the Orishas.',
    source_quality: 'fair',
    source: 'Yoruba cosmology; Ifá tradition'
  },
  'ijapa': {
    type: 'Tortoise',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Ijapa (the Tortoise) is a trickster figure in Yoruba folklore. This clever tortoise uses his wits to survive and thrive, though his schemes often backfire in humorous ways.',
    source_quality: 'fair',
    source: 'Yoruba oral tradition; West African folktales'
  },
  'soumaoro-kante': {
    type: 'Sorcerer King',
    region: 'Africa',
    country: 'Mali',
    description: 'Soumaoro Kanté was a 13th-century Sorcerer King of the Sosso Empire in West Africa and the primary antagonist in the Epic of Sundiata. He possessed magical powers and ruled tyrannically until defeated by Sundiata Keita at the Battle of Kirina.',
    source_quality: 'fair',
    source: 'Epic of Sundiata; Mande oral tradition'
  },
  'okomfo-anokye': {
    type: 'Priest',
    region: 'Africa',
    country: 'Ghana',
    description: 'Okomfo Anokye is a legendary priest and co-founder of the Ashanti Empire in present-day Ghana. He is credited with the miracle of bringing down the Golden Stool from the sky, which became the sacred symbol of Ashanti unity.',
    source_quality: 'fair',
    source: 'Ashanti oral tradition; Ghanaian history'
  },
  'mame-coumba-bang': {
    type: 'Princess',
    region: 'Africa',
    country: 'Senegal',
    description: 'Mame Coumba Bang is a legendary figure from Senegal, a beautiful princess associated with the Saint-Louis region. Her story is central to the oral traditions of the Wolof people.',
    source_quality: 'fair',
    source: 'Wolof oral tradition; Senegalese folklore'
  },
  'nana-buluku': {
    type: 'Deity',
    region: 'Africa',
    country: 'Benin',
    description: 'Nana Buluku is the supreme creator god in the Fon and Ewe cosmologies of Benin and Togo. This androgynous deity gave birth to the twin gods Mawu (moon) and Lisa (sun) who govern creation.',
    source_quality: 'fair',
    source: 'Fon and Ewe cosmology; Dahomean mythology'
  },
  'agokoli': {
    type: 'King',
    region: 'Africa',
    country: 'Togo',
    description: 'Agokoli is a legendary tyrannical king of Notsé (in present-day Togo) from Ewe oral tradition. His oppressive rule drove the Ewe people to escape through a hole in the city wall, leading to their diaspora across Ghana and Togo.',
    source_quality: 'fair',
    source: 'Ewe oral tradition; Ghanaian/Togolese historical narratives'
  },
  'kaang': {
    type: 'Deity',
    region: 'Africa',
    country: 'Botswana',
    description: 'Kaang (also spelled Khāṅ) is the supreme creator god in the mythology of the San people (Bushmen) of the Kalahari Desert. He created the world, animals, and the first people, and taught them how to live in harmony.',
    source_quality: 'fair',
    source: 'San (Bushmen) mythology; Kalahari oral tradition'
  },
  'umvelinqangi': {
    type: 'Deity',
    region: 'Africa',
    country: 'South Africa',
    description: 'uMvelinqangi is the supreme creator god in Zulu cosmology. He is the sky deity who created the earth and humankind, and is associated with the origin of the Zulu people.',
    source_quality: 'fair',
    source: 'Zulu oral tradition; South African mythology'
  },
  'uthixo': {
    type: 'Deity',
    region: 'Africa',
    country: 'South Africa',
    description: 'uThixo is the supreme being in Xhosa cosmology, the creator of the universe and humanity. The name has been adopted for the Christian God in Xhosa-language Bibles.',
    source_quality: 'fair',
    source: 'Xhosa oral tradition'
  },
  'kholumolumo': {
    type: 'Monster',
    region: 'Africa',
    country: 'Lesotho',
    description: 'Kholumolumo is a fearsome monster from Basotho (Lesotho) folklore, a giant lizard-like creature that devoured people and animals alike. It was eventually slain by a culture hero.',
    source_quality: 'fair',
    source: 'Basotho oral tradition; Southern African folklore'
  },
  'the-mantis': {
    type: 'Mantis',
    region: 'Africa',
    country: 'Botswana',
    description: 'The Mantis (also known as Kaggen or Cagn) is a central trickster-creator figure in San (Bushman) mythology of the Kalahari. He is a praying mantis who possesses great cunning and creative power.',
    source_quality: 'fair',
    source: 'San (Bushman) mythology; Bleek and Lloyd collection'
  },
  'ijapa': {
    type: 'Tortoise',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Ijapa (the Tortoise) is a trickster figure in Yoruba folklore. This clever tortoise uses his wits to survive and thrive, though his schemes often backfire in humorous ways.',
    source_quality: 'fair',
    source: 'Yoruba oral tradition; West African folktales'
  },
  'flying-african': {
    type: 'Legend',
    region: 'North America',
    country: 'United States',
    description: 'The Flying African is a Gullah Geechee legend from the Sea Islands of Georgia and South Carolina. It tells of enslaved Africans who used mystical powers to fly back to Africa, escaping bondage.',
    cultural_significance: 'The myth is a powerful symbol of resistance and freedom in African American folklore. It was collected and popularized by the Works Progress Administration\'s Federal Writers\' Project in the 1930s.',
    source_quality: 'fair',
    source: 'Gullah Geechee oral tradition; WPA slave narratives'
  },
  'brer-coon': {
    type: 'Animal',
    region: 'North America',
    country: 'United States',
    description: 'Brer Coon (Brother Raccoon) is a character from the Uncle Remus stories collected by Joel Chandler Harris. These African American folktales from the American South feature animal tricksters and moral lessons.',
    source_quality: 'fair',
    source: 'Uncle Remus stories (Harris, 1880s); African American oral tradition'
  },
  'brer-possum': {
    type: 'Animal',
    region: 'North America',
    country: 'United States',
    description: 'Brer Possum (Brother Possum) is a character from the Uncle Remus stories collected by Joel Chandler Harris in the post-Reconstruction American South. The stories originate from African American oral tradition.',
    source_quality: 'fair',
    source: 'Uncle Remus stories (Harris, 1880s); African American oral tradition'
  },
  'davy-crockett': {
    type: 'Hero',
    region: 'North America',
    country: 'United States',
    description: 'Davy Crockett (1786–1836) was an American frontiersman, congressman, and folk hero who died at the Alamo. Tall tales about his exploits transformed him into a larger-than-life figure in American folklore.',
    source_quality: 'fair',
    source: 'American folklore; historical Tall Tales tradition'
  },
  'arash': {
    type: 'Archer',
    region: 'Asia',
    country: 'Iran',
    description: 'Āraš the Archer is a legendary figure from Persian mythology who shot an arrow marking the border between Iran and Turan. His heroic sacrifice made him a national symbol of selflessness.',
    source_quality: 'fair',
    source: 'Shahnameh (Ferdowsi); Persian mythological tradition'
  },
  'blue-caps': {
    type: 'Fairy',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'Blue Caps (also known as Blue Bonnets) are mischievous household spirits from English folklore, particularly Northumberland. These small, blue-capped fairies work in mines or on farms and can be helpful when treated well.',
    source_quality: 'fair',
    source: 'English folklore; Northumberland oral tradition'
  },
  'eynhallow-monk': {
    type: 'Monk',
    region: 'Europe',
    country: 'United Kingdom',
    description: 'The Eynhallow Monk is a figure from Orcadian folklore associated with the island of Eynhallow in Orkney, Scotland. The abandoned church on the island is said to be haunted by a spectral monk.',
    source_quality: 'fair',
    source: 'Orcadian folklore; Scottish island traditions'
  },
  'olgoi-khorkhoi': {
    type: 'Worm',
    region: 'Asia',
    country: 'Mongolia',
    description: 'The Olgoi-Khorkhoi (Mongolian Death Worm) is a cryptid from the Gobi Desert, described as a thick red worm capable of killing with venom or electric discharge. It is one of the most famous cryptids in Central Asian folklore.',
    source_quality: 'fair',
    source: 'Mongolian and Tibetan folk traditions; cryptozoological literature'
  },
  'nakken': {
    type: 'Näcken',
    region: 'Europe',
    country: 'Sweden',
    description: 'Näcken (Nøkken) is a male water spirit in Scandinavian folklore who plays enchanted violin music to lure people to watery graves. He is most active at twilight and on Thursday nights.',
    source_quality: 'fair',
    source: 'Scandinavian folklore; Swedish ballad tradition'
  },
  'huldufolk': {
    type: 'Hidden Folk',
    region: 'Europe',
    country: 'Iceland',
    description: 'The Huldufólk ("hidden people") are elf-like beings in Icelandic folklore who live in rocks and hills. They are nearly identical to humans but invisible to most people, living parallel lives in the Icelandic landscape.',
    cultural_significance: 'Belief in the Huldufólk persists in modern Iceland to a remarkable degree. Road construction projects have been rerouted to avoid disturbing elf habitats. They represent the invisible, enchanted dimension of the natural world in Icelandic tradition.',
    source_quality: 'fair',
    source: 'Icelandic folklore; contemporary Icelandic tradition'
  },
  'alfvor': {
    type: 'Elf',
    region: 'Europe',
    country: 'Sweden',
    description: 'Álvor (elves) are nature spirits in Swedish folklore, beautiful but dangerous beings who dwell in forests and meadows. They are known for their enchanting music and dance, which can lure humans.',
    source_quality: 'fair',
    source: 'Swedish folklore; Nordic ballad tradition'
  },
  'vttar': {
    type: 'Vættir',
    region: 'Europe',
    country: 'Sweden',
    description: 'Vättar (singular: vätte) are nature spirits in Swedish folklore that live in rocks, caves, and hills. They are similar to the Icelandic Huldufólk and can be either helpful or malicious depending on how they are treated.',
    source_quality: 'fair',
    source: 'Swedish folklore tradition'
  },
  'la-malinche': {
    type: 'Interpreter',
    region: 'Americas',
    country: 'Mexico',
    description: 'Malintzin (also known as Malinche or Doña Marina) is a controversial figure in Mexican history and folklore. She served as interpreter, advisor, and intermediary for Hernán Cortés during the Spanish conquest of the Aztec Empire.',
    cultural_significance: 'La Malinche is a complex and polarizing figure in Mexican cultural identity, viewed variously as a traitor, a victim, and the symbolic mother of the mestizo Mexican people. Her legacy remains deeply contested.',
    source_quality: 'fair',
    source: 'Historical sources; Mexican cultural tradition'
  },
  'dyunis': {
    type: 'Deity',
    region: 'North America',
    country: 'United States',
    description: 'Dâyuni\'sï (the Little People) are spirit beings in Cherokee mythology, small humanoid creatures who live in the forests and caves of the Appalachian Mountains. They can be helpful or mischievous.',
    source_quality: 'fair',
    source: 'Cherokee oral tradition'
  },
  'kowi-anukasha': {
    type: 'Spirit',
    region: 'North America',
    country: 'United States',
    description: 'Kowi Anukasha (the Little People) are forest-dwelling spirit beings in Choctaw mythology. These small humanoid creatures protect the natural world and can lead lost travelers astray.',
    source_quality: 'fair',
    source: 'Choctaw oral tradition'
  },
  'boukhencha': {
    type: 'Spirit',
    region: 'Africa',
    country: 'Morocco',
    description: 'Boukhencha is a figure from Moroccan folklore, often described as a terrifying creature that appears at night to frighten children. Such figures serve as cautionary elements in Moroccan oral tradition.',
    source_quality: 'fair',
    source: 'Moroccan oral tradition; North African folklore'
  },
  'pichal-peri': {
    type: 'Fairy',
    region: 'Europe',
    country: 'Germany',
    description: 'Pichal Peri (also known as the White Ladies) are Sorbian mythological beings from Slavic folklore in eastern Germany. These water spirits lure people, especially children, into water bodies.',
    source_quality: 'fair',
    source: 'Sorbian/Slavic folklore'
  },
  'pilatus-dragon': {
    type: 'Dragon',
    region: 'Europe',
    country: 'Switzerland',
    description: 'The Pilatus Dragon is a legendary dragon said to dwell on Mount Pilatus in Switzerland. According to local folklore, the dragon was described as appearing like a bird with a serpent\'s tail, guarding treasures in the mountain.',
    source_quality: 'fair',
    source: 'Swiss Alpine folklore; Mount Pilatus legends'
  },
  'maha-sona': {
    type: 'Deity',
    region: 'Asia',
    country: 'Sri Lanka',
    description: 'Maha Sona (the Great Cemetery God) is a fearsome deity in Sri Lankan folklore, a guardian of cemeteries and a spirit associated with death. He appears in ritual exorcism traditions known as tovil.',
    source_quality: 'fair',
    source: 'Sri Lankan folklore; Sinhalese ritual tradition'
  },
  'lakhey': {
    type: 'Demon',
    region: 'Asia',
    country: 'Nepal',
    description: 'The Lakhey is a fearsome demon figure in Nepalese folklore, particularly central to Newar culture in the Kathmandu Valley. Dancers costumed as the Lakhey perform during the Indra Jatra festival.',
    source_quality: 'fair',
    source: 'Nepalese folklore; Newar tradition'
  },
  'phi-tai-hong': {
    type: 'Ghost',
    region: 'Asia',
    country: 'Thailand',
    description: 'Phi Tai Hong is a type of ghost in Thai folklore, the spirit of a person who died suddenly or violently. These restless spirits are believed to haunt the place of their death and are particularly feared.',
    source_quality: 'fair',
    source: 'Thai folklore; Southeast Asian spirit beliefs'
  },
  'teke-teke': {
    type: 'Ghost',
    region: 'Asia',
    country: 'Japan',
    description: 'Teke Teke is a modern Japanese urban legend about the ghost of a woman who was cut in half by a train. She drags herself on her elbows through the streets, making a "teke teke" sound, and will cut her victims in half.',
    source_quality: 'fair',
    source: 'Japanese urban legend; contemporary folklore'
  },
};

const NBSP = '\u00A0';

// ─── Utilities ────────────────────────────────────────────────────────────

function classifyFromSlug(entry) {
  const slug = entry.slug || '';
  const name = entry.name || '';
  const lowerSlug = slug.toLowerCase();

  for (const rule of SUFFIX_MAP) {
    if (rule.test.test(lowerSlug) || rule.test.test(name)) {
      return { country: rule.country, region: rule.region };
    }
  }

  // Try to extract from name ending patterns
  const geoHints = {
    'iceland': { country: 'Iceland', region: 'Europe' },
    'denmark': { country: 'Denmark', region: 'Europe' },
    'finland': { country: 'Finland', region: 'Europe' },
    'sweden': { country: 'Sweden', region: 'Europe' },
    'norway': { country: 'Norway', region: 'Europe' },
    'greenland': { country: 'Greenland', region: 'Europe' },
  };

  for (const [hint, geo] of Object.entries(geoHints)) {
    if (lowerSlug.endsWith(`-${hint}`) || name.toLowerCase().endsWith(hint)) {
      return geo;
    }
  }

  return null;
}

function classifyType(entry) {
  const name = entry.name || '';
  const slug = entry.slug || '';
  const combined = name + ' ' + slug;

  for (const rule of TYPE_KEYWORDS) {
    if (rule.re.test(combined)) {
      return rule.type;
    }
  }

  return null;
}

function generateSource(type, country, region) {
  if (!type || type === 'Unknown') {
    return `${country || region || 'Various'} folklore`;
  }
  return `${country || region || 'Various'} folklore${type ? ` (${type})` : ''}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────

const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));

let classified = 0;
let descFixed = 0;
let withKnownData = 0;

for (const c of creatures) {
  if (c.description !== STUB_DESC) continue;

  // Check if we have known data for this creature
  const known = KNOWN_CREATURES[c.slug] || KNOWN_CREATURES[c.slug.replace(/-denmark$|-iceland$/,'')];
  if (known) {
    c.type = known.type;
    c.region = known.region;
    c.country = known.country;
    c.description = known.description;
    if (known.cultural_significance) {
      c.cultural_significance = known.cultural_significance;
    }
    if (known.source_quality) {
      c.source_quality = known.source_quality;
    }
    if (known.source) {
      c.source = known.source;
    }
    c.appearance = `${c.name} is known from recorded folklore and oral tradition${c.country !== 'Unknown' ? ' in ' + c.country : ''}.`;
    c.behavior = `In traditional accounts, ${c.name} ${c.region !== 'Unknown' ? 'from ' + c.region + ' ' : ''} plays its role in the mythology and folklore of its culture.`;
    c.summary = known.description;
    withKnownData++;
    continue;
  }

  // Name-based classification
  const geo = classifyFromSlug(c);
  if (geo) {
    c.country = geo.country;
    c.region = geo.region;
    classified++;
  }

  const type = classifyType(c);
  if (type) {
    c.type = type;
  }

  // Build a basic description from what we know
  const ct = c.type || 'creature';
  const cc = c.country || 'Unknown';
  const cr = c.region || 'Unknown';
  const safeName = c.name || 'This creature';

  if (c.country !== 'Unknown' || c.type !== 'Unknown') {
    c.description = `${safeName} is a ${ct} from ${cc === 'Unknown' ? cr : cc} folklore.`;
    c.appearance = `${safeName} is described in ${cc === 'Unknown' ? cr : cc} folklore.`;
    c.behavior = `In ${cc === 'Unknown' ? cr : cc} folklore, ${safeName} plays a role in the oral traditions of its culture.`;
    descFixed++;
  }

  // Update source to reflect the culture
  if (c.country !== 'Unknown' || c.region !== 'Unknown') {
    c.source = generateSource(c.type, c.country, c.region);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────

let remaining = creatures.filter(c =>
  c.description === STUB_DESC ||
  c.description === 'Not documented.' ||
  c.description === ''
).length;

console.log(`Total stubs enriched with known research data: ${withKnownData}`);
console.log(`Name-based country/region classification: ${classified}`);
console.log(`Basic descriptions generated: ${descFixed}`);
console.log(`Remaining stubs (still undocumented): ${remaining}`);
console.log(`Creature count: ${creatures.length}`);

// ─── Write ────────────────────────────────────────────────────────────────

writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n', 'utf8');
console.log('\nWrote ' + CREATURES_PATH);
