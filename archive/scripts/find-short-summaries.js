const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
    const shortSummaries = stories
        .filter(s => s.summary && s.summary.length < 100)
        .map(s => ({ slug: s.slug, length: s.summary.length, summary: s.summary }));

    console.log(JSON.stringify(shortSummaries, null, 2));
} catch (e) {
    console.error(e);
}
