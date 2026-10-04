const fs = require('fs');
const path = require('path');

const paths = {
  creaturesJson: path.join(__dirname, '..', 'data', 'datasets', 'creatures.json'),
  storiesJson: path.join(__dirname, '..', 'data', 'datasets', 'stories.json'),
  allCreaturesJson: path.join(__dirname, '..', 'data', 'datasets', 'by-region', '_all.json'),
  creaturesJs: path.join(__dirname, '..', 'js', 'creatures-data.js'),
  storiesJs: path.join(__dirname, '..', 'js', 'stories-data.js'),
};

function sync() {
  try {
    console.log('🚀 Starting dataset synchronization...');

    // 1. Sync creatures.json -> _all.json
    const creaturesData = fs.readFileSync(paths.creaturesJson, 'utf8');
    fs.writeFileSync(paths.allCreaturesJson, creaturesData);
    console.log('✅ Synced creatures.json -> _all.json');

    // 2. Sync creatures.json -> js/creatures-data.js
    const creaturesParsed = JSON.parse(creaturesData);
    fs.writeFileSync(paths.creaturesJs, `window.__CREATURES_DATA = ${JSON.stringify(creaturesParsed, null, 2)};`);
    console.log('✅ Synced creatures.json -> js/creatures-data.js');

    // 3. Sync stories.json -> js/stories-data.js
    const storiesData = fs.readFileSync(paths.storiesJson, 'utf8');
    const storiesParsed = JSON.parse(storiesData);
    fs.writeFileSync(paths.storiesJs, `window.__STORIES_DATA = ${JSON.stringify(storiesParsed, null, 2)};`);
    console.log('✅ Synced stories.json -> js/stories-data.js');

    console.log('✨ Synchronization complete!');
  } catch (err) {
    console.error('❌ Synchronization failed:', err);
    process.exit(1);
  }
}

sync();
