const fs = require('fs');
const path = require('path');

const MAIN_STORIES_PATH = path.join(__dirname, '../data/datasets/stories.json');
const BATCH_PATH = path.join(__dirname, '../data/stories_batch_1_nordic_part6.json');

try {
  const mainStories = JSON.parse(fs.readFileSync(MAIN_STORIES_PATH, 'utf8'));
  const batchStories = JSON.parse(fs.readFileSync(BATCH_PATH, 'utf8'));

  const updatedStories = [...mainStories, ...batchStories];

  fs.writeFileSync(MAIN_STORIES_PATH, JSON.stringify(updatedStories, null, 2));
  console.log(`Successfully added ${batchStories.length} stories to ${MAIN_STORIES_PATH}`);
} catch (error) {
  console.error('Error appending stories:', error);
}
