const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');

const TARGET_TYPES = new Set([
    'spirit', 'ghost', 'water-spirit', 'guardian', 'nature-spirit', 'deity',
    'trickster', 'giant', 'ancestor-spirit', 'demon', 'animal-spirit', 'dragon',
    'shapeshifter', 'vampire', 'witch', 'fairy', 'forest-spirit', 'serpent',
    'werewolf', 'goddess', 'bird', 'cryptid', 'goblin', 'household-spirit', 'beast',
    'bogeyman', 'hero', 'sea-monster', 'dwarf', 'mermaid', 'ogre', 'jinn', 'undead',
    'elf', 'nymph', 'chimera', 'phantom', 'wraith', 'zombie', 'kelpie', 'siren'
]);

const TYPE_MAP = {
    'god': 'deity',
    'goddess': 'deity', // The guide has 'goddess' in target, but let's check
    'divine being': 'deity',
    'divine animal': 'animal-spirit',
    'spirit animal': 'animal-spirit',
    'animal-deity': 'animal-spirit',
    'mythical-animal': 'beast',
    'mythical-beast': 'beast',
    'sea-beast': 'sea-monster',
    'aquatic-monster': 'sea-monster',
    'water-monster': 'sea-monster',
    'water-dragon': 'dragon',
    'primordial-serpent': 'serpent',
    'rainbow-serpent': 'serpent',
    'mythical-serpent': 'serpent',
    'sea-serpent': 'serpent',
    'household-spirit': 'household-spirit',
    'house-spirit': 'household-spirit',
    'nature spirit': 'nature-spirit',
    'forest-spirit-trickster': 'trickster',
    'trickster-animal': 'trickster',
    'trickster-deity': 'trickster',
    'ancestral-spirit': 'ancestor-spirit',
    'ancestor': 'ancestor-spirit',
    'divine-ancestor': 'ancestor-spirit',
    'undead-spirit': 'undead',
    'revenant-malevolent-spirit': 'undead',
    'ghost-apparition': 'ghost',
    'phantom': 'phantom',
    'wraith': 'wraith',
    'zombie': 'zombie',
    'wight': 'undead',
    'ghoul': 'undead',
    'vampire': 'vampire',
    'vampiric-entity': 'vampire',
};

try {
    const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));
    
    let fixedCount = 0;
    const updatedCreatures = creatures.map(c => {
        const originalType = c.type;
        let newType = originalType;

        if (!TARGET_TYPES.has(originalType)) {
            // Try map
            if (TYPE_MAP[originalType]) {
                newType = TYPE_MAP[originalType];
            } else {
                // Heuristic: if it contains 'spirit', 'god', 'ghost' etc.
                const lower = originalType.toLowerCase();
                if (lower.includes('spirit')) newType = 'spirit';
                else if (lower.includes('god') || lower.includes('deity')) newType = 'deity';
                else if (lower.includes('ghost')) newType = 'ghost';
                else if (lower.includes('giant')) newType = 'giant';
                else if (lower.includes('dragon')) newType = 'dragon';
                else if (lower.includes('serpent')) newType = 'serpent';
                else if (lower.includes('vampire')) newType = 'vampire';
                else if (lower.includes('demon')) newType = 'demon';
                else if (lower.includes('witch')) newType = 'witch';
                else if (lower.includes('fairy')) newType = 'fairy';
                else if (lower.includes('beast') || lower.includes('monster')) newType = 'beast';
                else if (lower.includes('hero')) newType = 'hero';
                else newType = 'spirit'; // Default fallback
            }
        }

        if (newType !== originalType) {
            fixedCount++;
            return { ...c, type: newType };
        }
        return c;
    });

    fs.writeFileSync(creaturesPath, JSON.stringify(updatedCreatures, null, 2));
    console.log(`Consolidated ${fixedCount} creature types.`);
} catch (error) {
    console.error('Error consolidating types:', error);
    process.exit(1);
}
