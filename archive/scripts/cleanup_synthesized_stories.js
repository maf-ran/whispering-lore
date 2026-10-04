const fs = require('fs');
const path = require('path');

const MAIN_STORIES_PATH = path.join(__dirname, '../data/datasets/stories.json');

const synthesizedIds = [
  'story-trollkjerring-001',
  'story-skromt-001',
  'story-tusse-001',
  'story-jotul-001',
  'story-bergfolk-001',
  'story-eintal-001',
  'story-margyge-001',
  'story-sotrold-001',
  'story-utrostfolket-001',
  'story-kvernknurr-001',
  'story-mollergut-001',
  'story-trollkatt-001',
  'story-dradokke-001',
  'story-fjellvette-001',
  'story-gygrid-001',
  'story-gramannen-001',
  'story-hans-uredd-001',
  'story-trollkjerringene-letnes-001',
  'story-gamlingene-steinberget-001',
  'story-gondol-001',
  'story-hughaman-001',
  'story-floghamen-001',
  'story-myromskana-001',
  'story-springand-annbjor-001'
];

try {
  const stories = JSON.parse(fs.readFileSync(MAIN_STORIES_PATH, 'utf8'));
  const filteredStories = stories.filter(s => !synthesizedIds.includes(s.id));
  
  const removedCount = stories.length - filteredStories.length;
  
  fs.writeFileSync(MAIN_STORIES_PATH, JSON.stringify(filteredStories, null, 2));
  console.log(`Successfully removed ${removedCount} synthesized stories from ${MAIN_STORIES_PATH}`);
} catch (error) {
  console.error('Error filtering stories:', error);
}
