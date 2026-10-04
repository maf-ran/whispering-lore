const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

const newStories = [
  {
    id: 'story1835',
    slug: 'tortoise-wisdom-world',
    title: 'The Tortoise and the Wisdom of the World',
    country: 'Nigeria',
    region: 'West African',
    culture: 'Igbo',
    type: 'fable',
    summary: 'The trickster Tortoise attempts to collect all the wisdom in the world for himself.',
    full_text: 'In the early days of the world, wisdom was not distributed among the people. Instead, it floated in the air like shimmering gold dust. The Tortoise, being the most ambitious and cunning of all creatures, decided that he should possess it all. Day and night, he wandered the forests and plains, inhaling the wisdom as it drifted, storing it deep within his shell. Soon, he became the wisest being in existence; he knew the secrets of the winds, the language of the birds, and the hidden paths of the earth. But Tortoise was greedy. He feared that others might find a way to steal his hoard. He decided to store the wisdom in a large gourd and tie it to his chest. However, as he tried to climb a tall palm tree to hide the gourd in the highest fronds, he found that the gourd was so large it blocked his arms, preventing him from gripping the trunk. He struggled and slipped, tumbling back to the earth. The gourd shattered, and the wisdom he had spent years collecting exploded outward, scattering across the four corners of the world. This is why, to this day, no single person possesses all the wisdom; instead, it is shared among all people, each holding a small piece of the great truth.',
    themes: ['Greed', 'Wisdom', 'Humility'],
    moral: 'Wisdom is meant to be shared, not hoarded.',
    keywords: ['Tortoise', 'Wisdom', 'Igbo', 'Nigeria'],
    search_terms: ['Nigerian folklore', 'Igbo stories', 'Tortoise fables'],
    seo_title: 'The Tortoise and the Wisdom of the World - Nigerian Igbo Folklore',
    seo_description: 'A classic Igbo fable about the trickster Tortoise and the origin of shared wisdom.',
    schema_org_type: 'Legend',
    creatures: ['Tortoise'],
    related_stories: [],
    source: 'Oral traditions of the Igbo people',
    source_quality: 'High'
  },
  {
    id: 'story1836',
    slug: 'war-two-serpents',
    title: 'The War of the Two Serpents',
    country: 'Chile',
    region: 'South American',
    culture: 'Mapuche',
    type: 'myth',
    summary: 'The colossal serpents Trentren Vilu and Caicai Vilu clash, causing a great flood.',
    full_text: 'In the ancient times of the Mapuche, there lived two primordial serpents of immense power. Trentren Vilu dwelt in the high mountains, commanding the earth and the peaks, while Caicai Vilu resided in the depths of the ocean, ruling the tides and the abyss. For eons, they lived in a fragile balance, but a great dispute arose between them. Caicai Vilu, seeking to cleanse the land and claim it for the sea, began to strike the waters with its massive tail. Huge waves rose, swallowing the coastlines and flooding the valleys. The people fled in terror, their homes disappearing beneath the churning foam. Seeing the plight of the humans, Trentren Vilu intervened. The mountain serpent called to the people, urging them to climb the highest peaks. As Caicai Vilu raised the water levels higher and higher, Trentren Vilu made the mountains grow, lifting the land upward faster than the sea could rise. The struggle lasted for generations, a war of water and stone. Eventually, the two serpents reached a stalemate, and the waters receded, leaving behind a transformed landscape of islands and high ridges. The Mapuche believe that when the earth trembles or the sea surges, it is a reminder of the eternal tension between the serpent of the mountain and the serpent of the deep.',
    themes: ['Creation', 'Nature', 'Conflict'],
    moral: 'Balance is necessary for survival.',
    keywords: ['Trentren Vilu', 'Caicai Vilu', 'Mapuche', 'Chile'],
    search_terms: ['Chilean mythology', 'Mapuche legends', 'Serpent myth'],
    seo_title: 'The War of the Two Serpents - Mapuche Mythology of Chile',
    seo_description: 'The epic legend of Trentren Vilu and Caicai Vilu, the serpents who shaped the land of Chile.',
    schema_org_type: 'Myth',
    creatures: ['Trentren Vilu', 'Caicai Vilu'],
    related_stories: [],
    source: 'Mapuche oral history',
    source_quality: 'High'
  },
  {
    id: 'story1837',
    slug: 'legend-lord-nats',
    title: 'The Legend of the Lord of the Nats',
    country: 'Myanmar',
    region: 'Southeast Asian',
    culture: 'Burmese',
    type: 'legend',
    summary: 'The story of the 37 Nats and their relationship with the human world.',
    full_text: 'In the golden lands of Myanmar, the world is inhabited by the Nats—powerful spirits who were once human. The most revered among them are the 37 Great Nats, each with a distinct personality and a tragic end. The Lord of the Nats, a figure of immense authority, oversees the spiritual realm, ensuring that the boundaries between the living and the dead are respected. It is said that the Nats are temperamental; if honored with offerings of flowers, incense, and music, they grant prosperity and protection to the villages. But if forgotten or insulted, they may bring sickness or misfortune. One famous tale tells of a king who tried to challenge the Nats by building a temple that reached the clouds. As he laid the final stone, a great storm erupted, and the Nats tore the temple down in a single night, reminding the king that human ambition is nothing compared to the timeless power of the spirit world. Today, the shrines of the Nats stand alongside Buddhist pagodas, a testament to the enduring blend of ancestral spirit worship and the Dharma in the heart of Burma.',
    themes: ['Spirituality', 'Power', 'Respect'],
    moral: 'Respect the unseen forces of nature and ancestry.',
    keywords: ['Nats', 'Myanmar', 'Burma', 'Spirit worship'],
    search_terms: ['Burmese folklore', 'Myanmar spirits', 'Nat legends'],
    seo_title: 'The Legend of the Lord of the Nats - Myanmar Folklore',
    seo_description: 'Explore the mysterious world of the Nats, the powerful spirits of Burmese mythology.',
    schema_org_type: 'Legend',
    creatures: ['Nats'],
    related_stories: [],
    source: 'Burmese oral tradition and historical records',
    source_quality: 'Medium'
  },
  {
    id: 'story1838',
    slug: 'spirit-great-baobab',
    title: 'The Spirit of the Great Baobab',
    country: 'Senegal',
    region: 'West African',
    culture: 'Wolof',
    type: 'myth',
    summary: 'A tale of a village that learns the importance of ancestral wisdom from the spirit of a baobab tree.',
    full_text: 'In the heart of the Senegalese savannah stood a baobab tree so ancient that its bark looked like the skin of an elephant and its branches reached toward the stars like frozen lightning. The villagers believed that the tree was not merely a plant, but the dwelling place of the Great Ancestor Spirit. For generations, the village elders would gather beneath its shade to resolve disputes and seek guidance. One year, a young and arrogant chief decided that the baobab was an obstacle to progress. He ordered the tree to be cut down to make room for a grand marketplace. As the first axe struck the wood, the sky turned a bruised purple and a wind howled through the valley, carrying the voices of a thousand ancestors. The axes shattered, and the ground trembled. The spirit of the baobab spoke, its voice like the grinding of stones: \"You seek to build a market for gold, but you destroy the market of wisdom.\" The chief, humbled by the display of power, knelt before the tree and vowed to protect it forever. From that day on, the baobab became the center of the village not just for shade, but as a living archive of the people\'s history, reminding all that the roots of the past must be nurtured for the fruits of the future to grow.',
    themes: ['Ancestry', 'Nature', 'Progress'],
    moral: 'Progress without roots is hollow.',
    keywords: ['Baobab', 'Senegal', 'Wolof', 'Ancestors'],
    search_terms: ['Senegalese folklore', 'Wolof myths', 'Baobab legends'],
    seo_title: 'The Spirit of the Great Baobab - Senegalese Folklore',
    seo_description: 'A powerful tale from Senegal about the intersection of nature, ancestry, and human ambition.',
    schema_org_type: 'Myth',
    creatures: ['Ancestor Spirit'],
    related_stories: [],
    source: 'Wolof oral tales',
    source_quality: 'Medium'
  }
];

stories.push(...newStories);
fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));
console.log(`Successfully added ${newStories.length} stories.`);
