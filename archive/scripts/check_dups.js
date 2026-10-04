const fs = require('fs');

function checkDups(filePath) {
    console.log(`Checking ${filePath}...`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        const slugs = data.map(item => item.slug);
        const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
        if (dups.length > 0) {
            console.log(`Found ${dups.length} duplicates:`, dups);
        } else {
            console.log('No duplicates found.');
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e.message);
    }
}

checkDups('data/datasets/creatures.json');
checkDups('data/datasets/stories.json');
