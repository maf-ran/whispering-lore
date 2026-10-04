const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/stories.json');
const stories = require(filePath);

const fixes = {
  'walu-the-sun-woman': {
    summary: 'The Sun Woman who lights the world each day — a powerful Dreamtime ancestor whose daily journey across the sky sustains all life on Earth. In the Dreamtime, Walu was chosen by the sky spirits to carry the great fire across the heavens, and her golden hair became the rays that warm the land. She rises each morning from the eastern sea and descends each evening into the western waters, and the seasons turn according to her will. The Aboriginal peoples honor her with songs at dawn and ceremonies at solstice.'
  },
  'calon-arang-the-witch': {
    summary: 'Before the Maori arrived in New Zealand, the islands were already inhabited by mysterious beings whose stories predate human memory. Calon Arang is one such tale — a story of dark magic and the terror it unleashed upon an ancient kingdom.'
  }
};

let updated = 0;
stories.forEach(s => {
  if (fixes[s.slug]) {
    Object.assign(s, fixes[s.slug]);
    updated++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(stories, null, 2) + '\n');
console.log(`Fixed ${updated} summaries`);
