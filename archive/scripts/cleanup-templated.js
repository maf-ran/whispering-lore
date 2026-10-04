const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/creatures.json');
const creatures = require(filePath);

let descFixed = 0;
let appFixed = 0;
let behFixed = 0;

creatures.forEach(c => {
  if (!c.description) return;
  
  // === DESCRIPTION CLEANUP ===
  let desc = c.description;
  
  // Pattern 1: "X is a TYPE from COUNTRY folklore. CONTENT. It is said to dwell in HABITAT."
  // Keep only the unique content before the template suffixes
  const dwellMatch = desc.match(/^(.+?)\.?\s*It is said to dwell in\s+.+$/s);
  const assocMatch = desc.match(/^(.+?)\.?\s*Associated behaviors include\s+.+$/s);
  
  if (dwellMatch && assocMatch) {
    // Both patterns present — take the first one, strip second
    desc = dwellMatch[1];
  } else if (dwellMatch) {
    desc = dwellMatch[1];
  } else if (assocMatch) {
    desc = assocMatch[1];
  }
  
  // Pattern 2: Remove "X is a TYPE from COUNTRY folklore. " prefix if followed by unique content
  // But keep the intro sentence if it has useful info
  // Just clean trailing periods
  desc = desc.replace(/\.\s*$/, '').trim();
  
  if (desc !== c.description) {
    c.description = desc;
    descFixed++;
  }
  
  // === APPEARANCE CLEANUP ===
  if (c.appearance) {
    let app = c.appearance;
    // Pattern: "Typical appearance matches its role as a X and Y being."
    if (app.match(/^Typical appearance matches its role as/i)) {
      // Replace with: extract the behavior tags to create a basic appearance hint
      // or use the description's unique content
      const behaviorDesc = c.behavior || '';
      // Extract meaningful phrases from description
      const descPhrases = c.description.split(/[.!]/).filter(p => 
        p.length > 20 && 
        !p.includes('is a ') && 
        !p.includes('from ') &&
        !p.includes('It is known')
      );
      if (descPhrases.length > 0) {
        app = descPhrases[0].trim() + '.';
      } else {
        app = `${c.name} is a ${c.type || 'being'} from ${c.country || 'unknown'} folklore.`;
      }
    }
    // Pattern: "X takes the form of a TYPE known in COUNTRY folklore." — generic
    if (app.match(/takes the form of a .+ known in .+ folklore/)) {
      const descPhrases = c.description.split(/[.!]/).filter(p => 
        p.length > 20 && 
        !p.match(/is a .+ from .+ folklore/)
      );
      if (descPhrases.length > 0) {
        app = descPhrases[0].trim() + '.';
      }
    }
    // Remove "It is said to dwell in" from appearance
    app = app.replace(/\.?\s*It is said to dwell in\s+.+$/, '').trim();
    
    if (app !== c.appearance) {
      c.appearance = app;
      appFixed++;
    }
  }
  
  // === BEHAVIOR CLEANUP ===
  if (c.behavior) {
    let beh = c.behavior;
    // Pattern: "X is adj1, adj2, adj3 in COUNTRY folklore." — templated
    const behMatch = beh.match(/^(.+?)\s+is\s+([\w, ]+)\s+in\s+\w+\s+folklore\.?$/);
    if (behMatch && behMatch[2].split(',').length >= 2) {
      // This is a templated behavior — replace with extracted content from description
      const descPhrases = c.description.split(/[.!]/).filter(p => 
        p.length > 15 && 
        !p.match(/is a .+ from .+ folklore/) &&
        !p.includes('It is known')
      );
      if (descPhrases.length > 0) {
        beh = descPhrases.slice(0, 2).join('. ').trim() + '.';
      }
    }
    // Remove "It is said to dwell in" from behavior
    beh = beh.replace(/\.?\s*It is said to dwell in\s+.+$/, '').trim();
    // Remove "X is known to be Y" duplicates
    beh = beh.replace(/\.?\s*It is known to be\s+[\w, ]+\.?/g, '').trim();
    // Remove duplicate sentences
    const sentences = beh.split(/\.\s+/);
    const unique = [...new Set(sentences.map(s => s.trim()))];
    beh = unique.join('. ').trim();
    if (!beh.endsWith('.')) beh += '.';
    
    if (beh !== c.behavior) {
      c.behavior = beh;
      behFixed++;
    }
  }
});

fs.writeFileSync(filePath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Description fixes: ${descFixed}`);
console.log(`Appearance fixes: ${appFixed}`);
console.log(`Behavior fixes: ${behFixed}`);
