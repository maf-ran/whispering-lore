#!/usr/bin/env node
// Two data repairs found 2026-10-04.
//
// A. Mami Wata: nine near-identical entries, six sharing the exact same summary
//    string, sourced to "Wikipedia" / "Liberia coastal folklore" / "Gambian oral
//    tradition", five of them marked source_quality "verified". None carry a real
//    citation. The being is documented as a Vodun figure of Benin whose two-tailed
//    mermaid motif is localised there, with related but distinct traditions in
//    Nigeria (Igbo, Ijaw) and elsewhere in the Gulf of Guinea; the Liberian,
//    Gambian, Senegalese, Ivorian and Burkinabe attributions are secondary
//    diffusion at best. Flags are corrected and the duplication recorded. No entry
//    is deleted or merged here — that is a separate editorial decision.
//
// B. Eight stories carry comma-joined country strings ("Morocco, Algeria, Tunisia,
//    Libya"), which render as one junk facet and cannot be placed on the world map.
//    Normalised to a canonical country plus a countries array.
//
// Usage: node archive/scripts/fix-duplicate-and-country-fields.js [--dry-run]

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', '..');
const DRY = process.argv.includes('--dry-run');

// --- A. Mami Wata ------------------------------------------------------------

const MAMI_SLUGS = [
  'mami-wata',
  'mamiwata-nigeria',
  'mamiwata-liberia',
  'mami-wata-senegal',
  'senegal-mami-wata',
  'gambia-mami-wata',
  'ivory-coast-mami-wata',
  'benin-mami-wata',
  'burkina-faso-mami-wata',
];

const MAMI_SOURCE =
  'Henry John Drewal et al., African Mermaids and Mami Wata (Indiana University Press, ' +
  '2015); Robert F. Drewal on the Benin/Vodun localisation of the two-tailed mermaid ' +
  'motif. No primary citation was present in the previous entry.';

const MAMI_NOTE =
  'One of nine entries for this being, several sharing an identical summary string. The ' +
  'figure is documented as a Vodun being of Benin; related but distinct mermaid and ' +
  'water-spirit traditions exist in Nigeria (Igbo, Ijaw, Delta) and elsewhere in the ' +
  'Gulf of Guinea. Earlier attributions to Liberia, Gambia, Senegal, Ivory Coast and ' +
  'Burkina Faso are secondary diffusion. These entries duplicate each other and require ' +
  'an editorial merge; the flags below record that they are not independently attested.';

function fixMami(creatures) {
  let changed = 0;
  for (const entry of creatures) {
    if (!MAMI_SLUGS.includes(entry.slug)) continue;
    entry.source = MAMI_SOURCE;
    entry.source_quality = 'unknown';
    entry.attested = false;
    entry.notes = MAMI_NOTE;
    entry.lastUpdated = '2026-10-04';
    changed += 1;
  }
  console.log(`Mami Wata: ${changed}/${MAMI_SLUGS.length} entries re-sourced and flagged unknown`);
  return changed;
}

// --- B. comma-joined country strings ------------------------------------------

function fixCountries(stories) {
  let changed = 0;
  for (const entry of stories) {
    const raw = String(entry.country || '');
    if (!raw.includes(',')) continue;
    const parts = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    entry.countries = parts;
    entry.country = parts[0];
    entry.lastUpdated = '2026-10-04';
    changed += 1;
    console.log(`  ${entry.slug}: ${JSON.stringify(raw)} -> country=${parts[0]} countries=[${parts.length}]`);
  }
  console.log(`country strings: ${changed} normalised`);
  return changed;
}

// --- run ---------------------------------------------------------------------

const creatureFile = path.join(BASE, 'data', 'datasets', 'creatures.json');
const storyFile = path.join(BASE, 'data', 'datasets', 'stories.json');

const creatures = JSON.parse(fs.readFileSync(creatureFile, 'utf8'));
const stories = JSON.parse(fs.readFileSync(storyFile, 'utf8'));

const total = fixMami(creatures) + fixCountries(stories);

if (!DRY) {
  fs.writeFileSync(creatureFile, JSON.stringify(creatures, null, 2));
  fs.writeFileSync(storyFile, JSON.stringify(stories, null, 2));
}
console.log(`\n${DRY ? '[dry-run] would update' : 'updated'} ${total} entries`);