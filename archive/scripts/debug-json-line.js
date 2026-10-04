const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const line10 = lines[9]; // 0-indexed
    if (line10) {
        console.log('Characters around position 2042:');
        console.log(line10.substring(2030, 2060));
    } else {
        console.log('Line 10 not found');
    }
} catch (e) {
    console.error(e);
}
