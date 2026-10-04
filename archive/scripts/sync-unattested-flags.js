#!/usr/bin/env node
// Sync source_quality/attested with the description-research pass annotations.
//
// The August 2026 description-research pass wrote its verdict into each entry's
// own text: entries that could not be independently attested begin with
// "Not independently attested" (description) and/or carry a source beginning
// "No verifiable source". Their machine-readable flags were never updated, so
// unattested entries still shipped as source_quality "fair" / attested true.
//
// This aligns the flags with the annotation already in the data and with the
// published methodology (methodology.html), which defines source_quality
// "unknown" as "pending verification".
//
// Usage: node archive/scripts/sync-unattested-flags.js [--dry-run]

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', '..');
const MASTERS = [
  { label: 'creatures', file: path.join(BASE, 'data', 'datasets', 'creatures.json') },
  { label: 'stories', file: path.join(BASE, 'data', 'datasets', 'stories.json') },
  { label: 'items', file: path.join(BASE, 'data', 'items.json') },
];

const DRY = process.argv.includes('--dry-run');

const UNATTESTED_DESC = 'Not independently attested';
const UNATTESTED_SOURCE = 'No verifiable source';

function isUnattested(entry) {
  const src = String(entry.source || '');
  const desc = String(entry.description || entry.summary || '');
  return src.startsWith(UNATTESTED_SOURCE) || desc.startsWith(UNATTESTED_DESC);
}

let grandTotal = 0;
let grandChanged = 0;

for (const { label, file } of MASTERS) {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  let flagged = 0;
  let changed = 0;

  for (const entry of data) {
    if (!isUnattested(entry)) continue;
    flagged += 1;
    if (entry.source_quality !== 'unknown' || entry.attested !== false) {
      entry.source_quality = 'unknown';
      entry.attested = false;
      changed += 1;
    }
  }

  grandTotal += flagged;
  grandChanged += changed;

  const pct = ((flagged / data.length) * 100).toFixed(1);
  console.log(
    `${label}: ${flagged}/${data.length} (${pct}%) self-declared unattested, ${changed} flag(s) updated`
  );

  if (!DRY && changed > 0) {
    // Masters are written as indent=2, ensure_ascii=false, no trailing newline.
    // Match that exactly so the diff contains only the updated entries.
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

console.log(
  `\n${DRY ? '[dry-run] would update' : 'updated'} ${grandChanged} of ${grandTotal} annotated entries`
);
if (grandTotal === 0) console.log('Lean already — no annotations found.');