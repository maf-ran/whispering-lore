#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));
const stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));

const creatureStoryMap = {};
stories.forEach(story => {
  if (!story.creatures || !Array.isArray(story.creatures)) return;
  story.creatures.forEach(slug => {
    if (!slug) return;
    if (!creatureStoryMap[slug]) creatureStoryMap[slug] = [];
    if (!creatureStoryMap[slug].includes(story.id)) {
      creatureStoryMap[slug].push(story.id);
    }
  });
});

let patchedCount = 0;
let addedCount = 0;
creatures.forEach(c => {
  const stories = creatureStoryMap[c.slug] || [];
  if (stories.length > 0) {
    if (!c.stories || JSON.stringify(c.stories) !== JSON.stringify(stories)) {
      c.stories = stories;
      patchedCount++;
      addedCount += stories.length;
    }
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
console.log(`Patched ${patchedCount} creatures with ${addedCount} story references`);
console.log(`Unpatched: ${Object.keys(creatureStoryMap).length - patchedCount} creature slugs have stories but were already correct`);
