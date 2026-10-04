const fs = require('fs');

function analyzeCreatures() {
    console.log('Analyzing creatures.json...');
    try {
        const data = JSON.parse(fs.readFileSync('data/datasets/creatures.json'));
        const total = data.length;
        const slugs = data.map(c => c.slug);
        const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
        const uniqueSlugs = new Set(slugs).size;
        const uniqueIds = new Set(data.map(c => c.id)).size;
        const uniqueNames = new Set(data.map(c => c.name)).size;

        console.log(`Total entries: ${total}`);
        console.log(`Unique slugs: ${uniqueSlugs}`);
        console.log(`Unique IDs: ${uniqueIds}`);
        console.log(`Unique names: ${uniqueNames}`);
        console.log(`Duplicates found in slugs: ${dups.length}`);
        if (dups.length > 0) {
            console.log('Duplicate slugs:', [...new Set(dups)]);
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

analyzeCreatures();
