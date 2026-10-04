#!/usr/bin/env node
// Phase A of the Wikipedia citation repair, 2026-10-04.
//
// 135 stories carried an en.wikipedia.org URL in their source field. Ten of
// those also carried a real reference alongside the link, where the link added
// nothing a reader could not get from the citation itself:
//
//   8 genuine citations  -> drop the redundant Wikipedia URL, keep the citation
//   1 silkroadfoundation -> trusted primary-text collection, drop the wiki URL
//   1 hitchhikersguidetoreligion.com -> a site whose purpose is debunking
//      religious claims, cited as authority on the Buryat Geser epic. Third
//      occurrence in this dataset after the two Dogon stories. Replaced with
//      Walter Kirby's critical edition.
//
// This phase leaves the 125 entries whose source is nothing but a Wikipedia URL
// untouched; those need real research, not string surgery.
//
// Usage: node archive/scripts/fix-wikipedia-citations.js [--dry-run]

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const DRY = process.argv.includes('--dry-run');

// Stories whose source is "<wiki url>; <real citation>" - the citation is the
// source, the link is noise.
const KEEP_CITATION = [
  'la-llorona-as-la-malinches-curse',
  'el-chupacabra--the-goat-sucker',
  'el-chupacabra-in-the-texas-borderlands',
  'tonantzin-and-our-lady-of-guadalupe--the-sacred-syncretism',
  'el-nahual--the-shapeshifting-witch',
  'santa-muerte--holy-death',
  'don-pedrito-jaramillo--the-healer-of-los-olmos',
  'aztln--the-mythical-homeland-of-the-aztecs',
];

const REPLACE = {
  'the-epic-of-geser-khan':
    "Walter Kirby, The Buryat Epic of Geser-Khan: The Buryat Version, " +
    'Oral Traditions of Central Asia no. 1 (Umea: Department of Social and ' +
    'Political Anthropology, University of Umea, 1979), with later volumes in ' +
    'the same series. Zhukovsky and others published Buryat recensions from the ' +
    'early 20th century; Geser is still recited by Buryat performers.',
  'the-epic-of-manas-the-birth-of-the-hero':
    'Silk Road Foundation, Manas epic collection: ' +
    'http://www.silkroadfoundation.org/folklore/manas/manasintro.html',
};

const stories = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let stripped = 0;
let replaced = 0;

for (const entry of stories) {
  if (!String(entry.source || '').includes('wikipedia')) continue;

  if (KEEP_CITATION.includes(entry.slug)) {
    const kept = String(entry.source)
      .replace(/https?:\/\/en\.wikipedia\.org\/wiki\/[^;,\s]+/, '')
      .replace(/^[\s;,]+/, '')
      .trim();
    entry.source = kept;
    entry.lastUpdated = '2026-10-04';
    stripped += 1;
    console.log(`  stripped wiki link: ${entry.slug}`);
    console.log(`      -> ${kept.slice(0, 92)}`);
  }

  if (REPLACE[entry.slug]) {
    entry.source = REPLACE[entry.slug];
    entry.source_quality = 'documented';
    entry.lastUpdated = '2026-10-04';
    replaced += 1;
    console.log(`  re-sourced: ${entry.slug}`);
  }
}

const remaining = stories.filter(s => String(s.source || '').startsWith('http')).length;
console.log(`\nwiki links stripped: ${stripped}`);
console.log(`entries re-sourced:  ${replaced}`);
console.log(`bare-URL sources remaining: ${remaining} (125 needing research + wikipedia)`);

if (!DRY) {
  fs.writeFileSync(FILE, JSON.stringify(stories, null, 2));
  console.log(`\nwrote ${FILE}`);
}
