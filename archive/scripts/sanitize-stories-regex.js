const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

try {
    let content = fs.readFileSync(storiesPath, 'utf8');
    
    // Regex to find content inside "full_text": "..."
    // This handles multi-line strings by matching from "full_text": " to the next ",
    // but it must be the " a quote that is followed by \n or , or }
    const regex = /("full_text":\s*")([\s\S]*?)"(\s*,\s*|\s*})/g;
    
    const sanitized = content.replace(regex, (match, p1, p2, p3) => {
        const escapedText = p2.replace(/\\n/g, '\\\\n') // preserve existing escapes
                             .replace(/\\r/g, '\\\\r')
                             .replace(/\n/g, '\\n')    // escape raw newlines
                             .replace(/\r/g, '\\r');
        return p1 + escapedText + p3;
    });

    fs.writeFileSync(storiesPath, sanitized);
    console.log('Stories.json sanitized using regex.');
} catch (e) {
    console.error('Sanitization failed:', e);
    process.exit(1);
}
