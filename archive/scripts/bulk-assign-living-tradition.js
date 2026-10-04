#!/usr/bin/env node
// scripts/bulk-assign-living-tradition.js
// Assigns living_tradition based on region/type heuristics.
// Entries from cultures with actively practiced traditions are flagged.
// Manual review notes are added for all assignments.

var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Cultures with actively practiced folk traditions (non-exhaustive, starting point)
var LIVELY_REGIONS = {
  'East Asia': true,      // Shinto, folk Buddhism, Shenism
  'South Asia': true,     // Hinduism, folk Islam
  'Southeast Asia': true, // Indigenous animism, syncretic traditions
  'Pacific': true,        // Active island traditions
  'Sub-Saharan Africa': true, // Active oral traditions
  'Northern America': true,   // Indigenous traditions (some)
  'Southern America': true,   // Syncretic + Indigenous
  'Central America': true,    // Syncretic + Indigenous
  'Middle East': true     // Folk Islam, Zoroastrian remnants
};

// Types commonly associated with living traditions
var LIVELY_TYPES = {
  'household-spirit': true,
  'ancestor-spirit': true,
  'nature-spirit': true,
  'guardian': true,
  'trickster': true,
  'culture-hero': true
};

// NOTE: This is a heuristic starting point. Every flagged entry needs manual review.
// The script outputs a list of entries requiring verification.
var output = [];
var flagged = 0;
var total = 0;

creatures.forEach(function(c) {
  var living = false;
  var reasons = [];

  // Heuristic 1: region with active traditions
  if (c.region && LIVELY_REGIONS[c.region]) {
    living = true;
    reasons.push('region: ' + c.region);
  }

  // Heuristic 2: type commonly associated with active folk belief
  if (c.type && LIVELY_TYPES[c.type]) {
    living = true;
    reasons.push('type: ' + c.type);
  }

  // Heuristic 3: source_quality === 'verified' + source mentions modern belief
  // (can't auto-detect, but flagged for manual review)

  if (living) {
    c.living_tradition = true;
    flagged++;
  } else {
    c.living_tradition = false;
  }
  total++;
  output.push({ slug: c.slug, name: c.name, living_tradition: c.living_tradition, reasons: reasons });
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');

// Output review guide
var reviewDir = path.join(__dirname, '..', 'docs', 'data-quality');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir, { recursive: true });
}

fs.writeFileSync(
  path.join(reviewDir, 'living-tradition-review.md'),
  '# Living Tradition Flag — Manual Review Guide\n\n' +
  'The following entries were flagged as `living_tradition: true` by heuristic rules.\n' +
  'Each needs manual verification: is this creature/entity still part of active folk belief?\n\n' +
  '| Slug | Name | Reasons |\n|------|------|--------|\n' +
  output.filter(function(o) { return o.living_tradition; })
    .map(function(o) { return '| ' + o.slug + ' | ' + o.name + ' | ' + o.reasons.join(', ') + ' |'; })
    .join('\n') + '\n'
);

console.log('Total: ' + total);
console.log('Flagged as living_tradition: ' + flagged);
console.log('Not flagged: ' + (total - flagged));
console.log('Review file: docs/data-quality/living-tradition-review.md');
