const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const content = fs.readFileSync(storiesPath, 'utf8');
    
    // This regex finds newlines that are NOT part of the JSON structure
    // (i.e., not preceded by a comma, brace, or bracket at the end of a line)
    // However, the safest way to fix "raw newlines in strings" in JSON
    // is to use a library or a very careful state machine.
    
    // Let's try a simpler approach: since we know it's the "full_text" field
    // that's the problem, we can try to find all strings and escape newlines in them.
    
    let sanitized = '';
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (inString) {
            if (escaped) {
                sanitized += char;
                escaped = false;
            } else if (char === '\\') {
                sanitized += char;
                escaped = true;
            } else if (char === '"') {
                sanitized += char;
                inString = false;
            } else if (char === '\n') {
                sanitized += '\\n';
            } else if (char === '\r') {
                sanitized += '\\r';
            } else {
                sanitized += char;
            }
        } else {
            if (char === '"') {
                inString = true;
            }
            sanitized += char;
        }
    }
    
    fs.writeFileSync(storiesPath, sanitized);
    console.log('Stories.json sanitized.');
} catch (e) {
    console.error('Sanitization failed:', e);
    process.exit(1);
}
