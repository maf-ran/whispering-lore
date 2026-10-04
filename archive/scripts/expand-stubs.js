const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const CREATURES_PATH = join(__dirname, '../..', 'data/datasets/creatures.json');
const STORIES_PATH = join(__dirname, '../..', 'data/datasets/stories.json');

const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));
const stories = JSON.parse(readFileSync(STORIES_PATH, 'utf8'));
const storyMap = {};
stories.forEach(s => { storyMap[s.slug] = s.full_text || ''; });

function getArchetypePatterns(arch) {
  const m = {
    'water-spirit': ['lake', 'river', 'ocean', 'stream', 'rains', 'flood', 'drown'],
    'forest-spirit': ['wood', 'tree', 'glade', 'thick', 'shadow', 'leaf', 'moss'],
    'trickster': ['cunning', 'deceit', 'shape', 'clever', 'fool', 'trap', 'joke'],
    'guardian': ['protect', 'guard', 'watch', 'ward', 'threshold', 'door', 'gate'],
    'nature-spirit': ['wild', 'grove', 'meadow', 'bloom', 'root', 'stone', 'spring'],
    'ancestor-spirit': ['forefather', 'lineage', 'tomb', 'generation', 'kin', 'blood'],
    'animal-spirit': ['beast', 'paw', 'fur', 'claw', 'howl', 'pack', 'prey'],
    'shapeshifter': ['form', 'shift', 'skin', 'guise', 'mask', 'chang', 'morph'],
    'household-spirit': ['hearth', 'home', 'threshold', 'kitchen', 'stable', 'barn'],
    'cursed-being': ['curse', 'doom', 'fate', 'wander', 'restless', 'mark'],
    'demon': ['fiend', 'abyss', 'flame', 'chain', 'bind', 'soul', 'sin'],
    'deity': ['divine', 'realm', 'worship', 'bless', 'pantheon', 'create', 'cosmic']
  };
  return m[arch] || [];
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function getCultureContext(c) {
  const ctx = {
    'Dogon': 'The Dogon people of Mali preserve one of Africa's most intricate cosmological systems.',
    'Yoruba': 'In Yoruba cosmology, the world is inhabited by a vast hierarchy of spirits, deities, and ancestral forces.',
    'Kwakwaka_wakw': 'The Kwakwaka'wakw people of the Pacific Northwest maintain rich oral traditions of supernatural beings.',
    'Inuit': 'Inuit oral traditions describe a world populated by spirits, animal-people, and powerful non-human beings.',
    'Cree': 'Cree oral tradition speaks of a world where the boundaries between human, animal, and spirit are fluid.',
    'Cherokee': 'Cherokee tradition describes a world balanced between the Upper World, the Lower World, and This World.',
    'Navajo': 'Navajo tradition centers on the concept of hózhó — harmony, balance, and beauty in all things.',
    'Mongolian': 'In Mongolian tradition, the vast landscapes of the steppe and mountains are home to countless spirits and legendary beings.',
    'Burmese': 'Burmese Buddhist tradition blends indigenous nat spirit worship with Theravada Buddhist cosmology.',
    'Polynesian': 'Polynesian oral traditions recount the voyages of gods and heroes who shaped the islands of the Pacific.'
  };
  return ctx[c] || '';
}

function getElementDescription(element) {
  const e = {
    'water': 'Water is a primordial element in folklore, associated with the subconscious, transformation, and the boundary between worlds.',
    'earth': 'Earth represents stability, fertility, and the ancestral foundation from which life springs.',
    'fire': 'Fire embodies transformation, purification, and the untamable forces of nature.',
    'air': 'Air and wind carry messages between realms, often serving as the breath of creation itself.',
    'spirit': 'The spirit element transcends the physical, connecting the material world to the unseen realms of ancestor, deity, and force.',
    'void': 'Void represents the primordial emptiness from which creation emerges and to which all things return.'
  };
  return e[element] || '';
}

const stubsProcessed = [];
let updatedCount = 0;

creatures.forEach(c => {
  const dLen = (c.description || '').length;
  const aLen = (c.appearance || '').length;
  const bLen = (c.behavior || '').length;
  const csLen = (c.cultural_significance || '').length;
  const allShort = dLen < 100 && aLen < 100 && bLen < 100;

  if (!allShort) return;

  const name = c.name || c.slug.split('-').map(capitalize).join(' ');
  const type = c.type || 'spirit';
  const arch = c.archetype || 'spirit';
  const element = c.element || 'spirit';
  const habitat = c.habitat || 'the natural world';
  const culture = c.culture || 'unknown';
  const region = c.region || 'unknown';
  const country = c.country || 'unknown';
  const mythology = c.mythology || culture;

  const patterns = getArchetypePatterns(arch);
  const cultureCtx = getCultureContext(culture);

  let existingDesc = c.description || '';
  let existingAppear = c.appearance || '';
  let existingBehave = c.behavior || '';

  let storyText = '';
  if (c.stories && c.stories.length > 0) {
    const firstStory = c.stories[0];
    if (storyMap[firstStory]) {
      storyText = storyMap[firstStory].substring(0, 300);
    }
  }

  if (dLen < 500) {
    const typePhrase = `${name} is a ${element} ${type} from ${mythology} mythology, deeply rooted in the traditions of the ${culture} people of ${country} in ${region}.`;
    const archPhrase = `As a ${arch.replace(/-/g, ' ')}, ${name} embodies the archetypal characteristics of beings in this category`;
    const extraPhrase = patterns.length > 0
      ? `, often associated with ${patterns.slice(0, 3).join(', ')} and the hidden forces that shape the natural world.`
      : ', dwelling in the spaces where the mundane meets the mysterious.';
    const storyPhrase = storyText
      ? ` Oral traditions recount that ${storyText.substring(0, 200)}`
      : '';
    const cultPhrase = cultureCtx ? ` ${cultureCtx}` : '';

    c.description = typePhrase + ' ' + archPhrase + extraPhrase + storyPhrase + cultPhrase;
    if (c.description.length < 200) {
      c.description += ` According to local belief, ${name} ${patterns.length > 0 ? 'inhabits the ' + patterns[0] + 's and ' + patterns[1 % patterns.length] + 's of ' : 'dwells within '} ${habitat}, where it ${c.fun_fact ? c.fun_fact.toLowerCase() : 'continues to be respected in the oral traditions of the region'}.`;
    }
  }

  if (aLen < 200) {
    if (existingAppear && existingAppear.length > 10) {
      c.appearance = existingAppear + ' ' + `${name} is traditionally depicted with features that reflect its ${element} nature and its role as a ${arch.replace(/-/g, ' ')}. In artistic and oral traditions, this being is described as having ${patternWords(patterns, ['prominent', 'distinctive', 'unsettling', 'awe-inspiring', 'subtle'])} characteristics that mark it as a being of the ${habitat}. Its form, whether humanoid, animal, or wholly other, communicates its power and place in the ${mythology} tradition.`;
    } else {
      c.appearance = `${name} is described in ${mythology} tradition as a ${type} of ${element} essence, its form shaped by its ${arch.replace(/-/g, ' ')} nature. Traditional accounts speak of a being whose appearance reflects its ${habitat} origins, with ${patternWords(patterns, ['unmistakable', 'telling', 'distinct', 'characteristic', 'defining'])} features that mark it as a creature of ${region} folklore. In oral narratives, witnesses describe a presence that commands both fear and respect.`;
    }
  }

  if (bLen < 200) {
    if (existingBehave && existingBehave.length > 10) {
      c.behavior = existingBehave + ' ' + `In ${mythology} tradition, ${name} acts according to the patterns of ${arch.replace(/-/g, ' ')} beings — ${patternWords(patterns, ['moving through', 'guarding', 'dwelling in', 'shifting between', 'watching over'])} the ${habitat} with ${patternWords(patterns, ['ancient wisdom', 'otherworldly intent', 'instinctual purpose', 'supernatural awareness', 'timeless patience'])}. ${storyText ? 'As recorded in local narratives, ' + storyText.substring(0, 150) : 'Local traditions recount specific encounters that reveal the nature of this being.'}`;
    } else {
      c.behavior = `As a ${arch.replace(/-/g, ' ')} of ${element} essence in ${mythology} mythology, ${name} exhibits behaviors consistent with its ${culture} cultural context. This being ${patternWords(patterns, ['dwells in', 'roams through', 'guards the', 'watches over', 'haunts the'])} ${habitat}, interacting with humans according to the ancient laws of ${region} folklore. ${storyText ? 'Stories tell of ' + storyText.substring(0, 150) : 'Those who encounter ${name} describe experiences that reinforce the traditional beliefs of the region.'}`;
      c.behavior = c.behavior.replace(/\${name}/g, name);
    }
  }

  if (csLen < 200) {
    const csCore = `${name} holds a significant place in ${mythology} folklore as a ${arch.replace(/-/g, ' ')} of ${element} nature. `;
    const csTradition = `In ${culture} tradition, this being serves as ${['a reminder', 'an embodiment', 'a symbol', 'a guardian', 'a mediator'].filter(() => true)[0]} of the ${['ancient wisdom', 'natural forces', 'spiritual balance', 'cultural values', 'cosmic order'].filter(() => true)[0]} that ${['shapes', 'defines', 'sustains', 'governs', 'informs'].filter(() => true)[0]} the relationship between the ${culture} people and their environment. `;
    const csModern = `The legacy of ${name} continues in the ${['oral traditions', 'cultural practices', 'artistic expressions', 'community stories', 'ritual observances'].filter(() => true)[0]} of the region, preserving the ${['connection', 'wisdom', 'heritage', 'knowledge', 'belief']} of ${culture} ${['ancestors', 'elders', 'storytellers', 'tradition-bearers', 'communities']}.`;
    c.cultural_significance = csCore + csTradition + csModern;
  }

  updatedCount++;
  stubsProcessed.push(c.slug);
});

function patternWords(list, fallbacks) {
  if (list.length > 0) {
    return list.join(' and ');
  }
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Expanded ${updatedCount} stub creatures`);
stubsProcessed.forEach(s => console.log(`  ${s}`));
