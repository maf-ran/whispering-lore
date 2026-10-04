import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../../data/datasets/stories.json');
const configPath = resolve(__dirname, '../../data/config/story-types.json');

const stories = JSON.parse(readFileSync(dataPath, 'utf-8'));
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const mapping = config.mapping;
const canonical = new Set(config.canonical);

let changed = 0;
stories.forEach(s => {
  if (!canonical.has(s.type) && mapping[s.type]) {
    console.log(`  ${s.slug}: "${s.type}" → "${mapping[s.type]}"`);
    s.type = mapping[s.type];
    changed++;
  }
});

writeFileSync(dataPath, JSON.stringify(stories, null, 2) + '\n');
console.log(`\nDone: ${changed} stories remapped, ${stories.length} total written.`);
