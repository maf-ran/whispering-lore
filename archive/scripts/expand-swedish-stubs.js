#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const STORIES_PATH = path.resolve(__dirname, '../../data/datasets/stories.json');
const DATA_PATH = path.resolve(__dirname, 'swedish-stories-data.json');

const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf-8'));
const expanded = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

let updated = 0;
for (const [slug, newText] of Object.entries(expanded)) {
  const story = stories.find(s => s.slug === slug);
  if (!story) { console.log('SKIP:', slug); continue; }
  const oldLen = (story.full_text || '').length;
  story.full_text = newText.trim();
  const newLen = story.full_text.length;
  console.log(`UPDATED: ${slug} | "${story.title}" | ${oldLen} -> ${newLen} chars`);
  updated++;
}

fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2) + '\n', 'utf-8');
console.log(`\nDone. ${updated} stories updated.`);
