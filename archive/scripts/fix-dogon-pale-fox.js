#!/usr/bin/env node
// Re-source the third Dogon story, 2026-10-04.
//
// the-pale-fox-and-the-divination-grid cited hitchhikersguidetoreligion.com — a
// site whose stated purpose is debunking religious claims — as its authority.
// That is the same domain that was removed from the other two Dogon stories in
// this session, and it was the last one in the dataset.
//
// The divination grid (fale) and the sirige power-grid are genuine Dogon
// concepts recorded by Griaule, so the entry has a real source available.
//
// Usage: node archive/scripts/fix-dogon-pale-fox.js [--dry-run]

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const DRY = process.argv.includes('--dry-run');

const SLUG = 'the-pale-fox-and-the-divination-grid';

const SOURCE =
  'Marcel Griaule, Dieu d\'eau: Entretiens avec Ogotemmeli (Paris, 1948), and ' +
  'Le renard pale, T. I (Paris: Institut d\'Ethnologie, 1965), with Germaine ' +
  'Dieterlen; English translation, Conversations with Ogotemmeli (Oxford ' +
  'University Press, 1965). The sirige power-grid and the ale divination ' +
  'surface are described in the 1965 volume. Contested by W. E. A. van Beek, ' +
  '"Dogon Restudied", Current Anthropology 32:2 (1991) 139-167.';

const NOTES =
  'Recorded by Marcel Griaule from Ogotemmêli of the Sanga Dogon in 1946. The ' +
  'published canon is contested: W. E. A. van Beek, "Dogon Restudied", Current ' +
  'Anthropology 32:2 (1991) 139-167, could not recover this material over ten ' +
  'years of fieldwork, and argued the Dogon he interviewed did not attribute ' +
  'this significance to the Pale Fox; Andrew Apter argues in Cahiers d\'Etudes ' +
  'Africaines that deep knowledge may be fluid rather than fixed, so van Beek\'s ' +
  'null result may under-read it. The 1948 and 1965 accounts are internally ' +
  'inconsistent. Source field previously cited hitchhikersguidetoreligion.com, ' +
  'a debunking site, as its authority.';

const stories = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const entry = stories.find(s => s.slug === SLUG);

if (!entry) {
  console.log(`MISSING: ${SLUG}`);
  process.exit(1);
}

entry.source = SOURCE;
entry.source_quality = 'fair';
entry.source_type = 'literary';
entry.period = '20th-century recorded oral tradition (Griaule interviews 1946; published 1948 and 1965)';
entry.notes = NOTES;
entry.lastUpdated = '2026-10-04';

console.log(`re-sourced: ${entry.slug}`);
console.log(`  quality: unknown -> ${entry.source_quality}`);
console.log(`  period:  ancient -> ${entry.period.slice(0, 52)}...`);

if (!DRY) {
  fs.writeFileSync(FILE, JSON.stringify(stories, null, 2));
  console.log(`\nwrote ${FILE}`);
}