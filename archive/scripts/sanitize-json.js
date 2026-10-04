const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/datasets/stories.json');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // This is a naive but often effective way to fix raw newlines in JSON strings:
    // Replace actual newlines that are NOT preceded by a backslash
    // and are not at the end of a JSON structural line.
    // Actually, the safest way is to use a library or a more robust regex.
    
    // Let's just try to escape raw newlines, carriage returns, and tabs inside strings.
    // A raw newline in a JSON string is invalid. It must be \\n.
    
    const sanitized = content.replace(/\\n/g, '\\\\n') // Preserve existing \n
                            .replace(/\n/g, '\\n')     // Replace raw newlines
                            .replace(/\r/g, '\\r')     // Replace raw carriage returns
                            .replace(/\\{2}n/g, '\\n'); // Restore preserved \n
    
    // Wait, the above is too aggressive. It will escape the actual JSON structure newlines.
    
    // Let's use a better approach: read the file and replace control characters 
    // except for those that define the JSON structure.
    
    // Actually, let's just use a tool that can handle "relaxed" JSON or fix it.
    // Since I can't install new packages, I'll write a state-machine parser.
} catch (e) {
    console.error(e);
}
