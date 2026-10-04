const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const buffer = fs.readFileSync(filePath);
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte < 32 && byte !== 10 && byte !== 13 && byte !== 9) {
            console.log(`Found control char 0x${byte.toString(16)} at position ${i}`);
        }
    }
} catch (e) {
    console.error(e);
}
