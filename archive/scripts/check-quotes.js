const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const content = fs.readFileSync(storiesPath, 'utf8');
    const lines = content.split('\n');
    const line10 = lines[9];
    
    // Find all quotes in line 10 and see if they are escaped
    let quoteCount = 0;
    for (let i = 0; i < line10.length; i++) {
        if (line10[i] === '"') {
            if (i === 0 || line10[i-1] !== '\\') {
                quoteCount++;
                console.log(`Unescaped quote at position ${i}: ...${line10.substring(Math.max(0, i-20), Math.min(line10.length, i+20))}...`);
            }
        }
    }
    console.log(`Total unescaped quotes in line 10: ${quoteCount}`);
} catch (e) {
    console.error(e);
}
