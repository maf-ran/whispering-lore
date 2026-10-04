#!/usr/bin/env node
// scripts/bulk-assign-source-type.js
// Assigns source_type based on existing source and region metadata.
// Values: oral_tradition, literary, archaeological, syncretic, unknown

var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Heuristic patterns
var patterns = {
  oral_tradition: [
    /folklore/i, /folk tale/i, /folktale/i, /oral/i, /legend/i,
    /myth/i, /fairy.?tale/i, /traditional/i, /tale/i
  ],
  literary: [
    /chronicle/i, /epic/i, /poem/i, /saga/i, /edda/i,
    /literary/i, /written/i, /manuscript/i, /text/i,
    /gospel/i, /scripture/i
  ],
  archaeological: [
    /archaeolog/i, /inscription/i, /artifact/i, /petroglyph/i,
    /cave.?painting/i, /rune.?stone/i, /stele/i
  ],
  syncretic: [
    /syncretic/i, /fusion/i, /christianiz/i, /islamiz/i,
    /hybrid/i
  ]
};

// Region-based defaults (when no source field exists)
var regionDefaults = {
  'Pacific': 'oral_tradition',
  'Sub-Saharan Africa': 'oral_tradition',
  'Northern America': 'oral_tradition',  // indigenous
  'Southern America': 'oral_tradition',  // indigenous + syncretic
  'Central America': 'oral_tradition',   // indigenous
  'Arctic': 'oral_tradition',
  'Antarctic': 'oral_tradition',
  'East Asia': 'literary',       // early written records
  'South Asia': 'literary',      // ancient texts
  'Middle East': 'literary',     // ancient texts
  'Nordic': 'literary',          // sagas, eddas
  'Celtic': 'literary',          // medieval manuscripts
  'European': 'literary'         // medieval + classical texts
};

var unknownDefault = 'unknown';

var counts = { oral_tradition: 0, literary: 0, archaeological: 0, syncretic: 0, unknown: 0 };

creatures.forEach(function(c) {
  if (c.source_type) {
    // Already assigned, count and skip
    if (counts[c.source_type] !== undefined) counts[c.source_type]++;
    else counts.unknown++;
    return;
  }

  var source = c.source || '';
  var assigned = false;

  // Try pattern matching on source field
  Object.keys(patterns).forEach(function(type) {
    if (assigned) return;
    var found = patterns[type].some(function(re) { return re.test(source); });
    if (found) {
      c.source_type = type;
      counts[type]++;
      assigned = true;
    }
  });

  if (assigned) return;

  // Fallback to region default
  if (c.region && regionDefaults[c.region]) {
    c.source_type = regionDefaults[c.region];
    counts[c.source_type]++;
    return;
  }

  // Last resort
  c.source_type = unknownDefault;
  counts.unknown++;
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');

Object.keys(counts).forEach(function(k) {
  console.log(k + ': ' + counts[k]);
});
console.log('Total: ' + creatures.length);
