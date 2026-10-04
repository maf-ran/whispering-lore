const fs = require('fs');

function analyzeStories() {
    console.log('Analyzing stories.json...');
    try {
        const data = JSON.parse(fs.readFileSync('data/datasets/stories.json'));
        const total = data.length;
        const missingSlugs = data.filter(s => !s.slug).length;
        const uniqueTitles = new Set(data.map(s => s.title)).size;
        const uniqueIds = new Set(data.map(s => s.id)).size;
        
        console.log(`Total entries: ${total}`);
        console.log(`Missing slugs: ${missingSlugs}`);
        console.log(`Unique titles: ${uniqueTitles}`);
        console.log(`Unique IDs: ${uniqueIds}`);
        
        if (uniqueTitles < total) {
            console.log(`Actual duplicate titles found: ${total - uniqueTitles}`);
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

analyzeStories();
