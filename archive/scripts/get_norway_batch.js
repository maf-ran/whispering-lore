const fs = require('fs');
const path = require('path');

const GAP_PATH = path.join(__dirname, '../data/missing_stories_gap.json');

try {
  const offset = parseInt(process.argv[2]) || 0;
  const limit = parseInt(process.argv[3]) || 10;
  const data = JSON.parse(fs.readFileSync(GAP_PATH, 'utf8'));
  const norwayMissing = data.missing.filter(c => c.country === 'Norway').slice(offset, offset + limit);
  console.log(JSON.stringify(norwayMissing, null, 2));
} catch (e) {
  console.error(e);
}
