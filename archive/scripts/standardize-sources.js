const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');
const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

const TIER_KEYWORDS = {
    'tier-1': ['academic', 'museum', 'peer-reviewed', 'ethnography', 'journal', 'university press', 'archival'],
    'tier-2': ['documented', 'collected by', 'collection', 'documented oral'],
    'tier-3': ['wikipedia', 'britannica', 'encyclopedia', 'folklore website', 'online'],
};

function determineQuality(source) {
    if (!source || source.toLowerCase() === 'unknown' || source.trim() === '') return 'unknown';
    
    const s = source.toLowerCase();
    for (const [tier, keywords] of Object.entries(TIER_KEYWORDS)) {
        if (keywords.some(kw => s.includes(kw))) return tier;
    }
    
    // If it mentions a specific author or book (contains a year or "by")
    if (/\d{4}/.test(source) || s.includes(' by ')) return 'tier-2';
    
    // Generic "folklore" or "tradition" without specific citations
    if (s.includes('folklore') || s.includes('tradition')) return 'tier-3';
    
    return 'unknown';
}

try {
    const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));
    const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

    let cFixed = 0;
    const updatedCreatures = creatures.map(c => {
        const newQual = determineQuality(c.source);
        if (newQual !== c.source_quality) {
            cFixed++;
            return { ...c, source_quality: newQual };
        }
        return c;
    });

    let sFixed = 0;
    const updatedStories = stories.map(s => {
        const newQual = determineQuality(s.source);
        // stories.json might not have source_quality field
        if (newQual !== s.source_quality) {
            sFixed++;
            return { ...s, source_quality: newQual };
        }
        return s;
    });

    fs.writeFileSync(creaturesPath, JSON.stringify(updatedCreatures, null, 2));
    fs.writeFileSync(storiesPath, JSON.stringify(updatedStories, null, 2));
    
    console.log(`Updated ${cFixed} creatures and ${sFixed} stories source quality.`);
} catch (error) {
    console.error('Error standardizing quality:', error);
    process.exit(1);
}
