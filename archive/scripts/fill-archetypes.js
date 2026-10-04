const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../../data/datasets/creatures.json');
const creatures = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const typeToArchetype = {
  spirit: 'Spirit', 'nature-spirit': 'Spirit', 'water-spirit': 'Spirit',
  'forest-spirit': 'Spirit', 'ancestor-spirit': 'Spirit', 'household-spirit': 'Spirit',
  'animal-spirit': 'Spirit', 'spirit-animal': 'Spirit',
  deity: 'Ruler', god: 'Ruler', goddess: 'Ruler',
  'creator-deity': 'Ruler', 'supreme-deity': 'Ruler',
  trickster: 'Trickster', shapeshifter: 'Trickster',
  guardian: 'Guardian', protector: 'Guardian',
  monster: 'Shadow', beast: 'Shadow', 'sea-monster': 'Shadow',
  giant: 'Shadow', ogre: 'Shadow',
  serpent: 'Shadow', dragon: 'Shadow',
  ghost: 'Threshold', undead: 'Threshold', vampire: 'Threshold', zombie: 'Threshold',
  healer: 'Mentor', sage: 'Mentor', 'wise-being': 'Mentor',
  hero: 'Hero', champion: 'Hero',
  villain: 'Shadow', demon: 'Shadow',
};

let filled = 0;
creatures.forEach(c => {
  const current = (c.archetype || '').toLowerCase();
  if (current === 'unknown' || current === 'none' || current === '' || !c.archetype) {
    const baseType = (c.type || '').split('-')[0];
    c.archetype = typeToArchetype[c.type] || typeToArchetype[baseType] || 'Shadow';
    filled++;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Filled ${filled} archetypes, ${creatures.length} total written.`);

// Verify
const verify = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const remaining = verify.filter(c => {
  const v = (c.archetype || '').toLowerCase();
  return v === 'unknown' || v === 'none' || v === '' || !c.archetype;
});
console.log(`Remaining empty/unknown archetypes: ${remaining.length}`);
