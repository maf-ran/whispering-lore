const fs = require('fs');

const inputPath = '/Users/mafolsson/.local/share/opencode/tool-output/tool_eb9a5b87e001kBEYhcVcXsLcou';
const content = fs.readFileSync(inputPath, 'utf8');

const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
if (!jsonMatch) {
    console.error('Could not find JSON block');
    process.exit(1);
}

const data = JSON.parse(jsonMatch[1]);

fs.writeFileSync('./scripts/add_nordic_far_creatures.js', `const newCreatures = ${JSON.stringify(data.newCreatures, null, 2)};`);
fs.writeFileSync('./scripts/add_nordic_far_stories.js', `const newStories = ${JSON.stringify(data.newStories, null, 2)};`);

console.log('Successfully extracted Faroe creatures and stories');
