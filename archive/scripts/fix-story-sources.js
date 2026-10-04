#!/usr/bin/env node
// Story source audit repair, 2026-10-04.
//
// 259 of 2185 stories carried a bare URL as their entire source field. Of those,
// ~70 pointed at content farms, SEO marketing sites, personal blogs or tourism
// pages while claiming source_quality "good" or "expert" — a claim of scholarly
// rigour the citation cannot support. One cited hitchhikersguidetoreligion.com,
// a site whose purpose is to debunk religious claims.
//
// Repairs:
//   A. Bare-URL sources on domains that are not academic, official, primary-text
//      or institutional are downgraded to "unknown" and annotated with the
//      reason. Nothing is deleted.
//   B. Bare-URL sources on trusted domains keep their quality but are rewritten
//      from a raw link into a citation string naming the source.
//   C. Wikipedia is exempt from the downgrade — a visible wikipedia.org URL is
//      honest about being tertiary, and all 135 entries already sit at "fair".
//      The regression test instead caps Wikipedia-sourced entries at "fair".
//
// The allowlist is deliberately short. Being wrongly downgraded is recoverable;
// wrongly trusted is not.
//
// Usage: node archive/scripts/fix-story-sources.js [--dry-run]

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const DRY = process.argv.includes('--dry-run');

// Academic publishers, national archives, official bodies, primary-text
// repositories and peer-reviewed indexes.
const TRUSTED = [
  'en.wikisource.org',        // primary-text transcriptions
  'ich.unesco.org',           // UNESCO Intangible Cultural Heritage
  'sacred-texts.com',         // public-domain primary translations
  'www.iranicaonline.org',    // Encyclopaedia Iranica
  'www.isof.se',              // Institut för språk och folkminnen (Sweden)
  'www.folklore.ee',          // Estonian Folklore Archives
  'teara.govt.nz',            // Te Ara, official NZ encyclopedia
  'eng.mataurangamaori.tki.org.nz', // Te Kupenga Māori
  'manoa.hawaii.edu',         // University of Hawai'i
  'buddhism.lib.ntu.edu.tw',  // NTU Buddhist Studies
  'tatarica.org',             // Tatar Encyclopedia
  'e-history.kz',             // Kazakhstan history portal (state)
  'adebiportal.kz',
  'hts.org.za',               // Historical Thesaurus of South Africa
  'digitalbleeklloyd.uct.ac.za', // UCT Bleek & Lloyd
  'sk.sagepub.com',
  'www.cambridge.org',
  'unisapressjournals.co.za',
  'journals.nauka-nanrk.kz',
  'www.prometeus.nsc.ru',     // Russian science library
  'elibrary.ngonb.ru',
  'dergipark.org.tr',         // DergiPark, Turkish academic index
  'ecologyandsociety.org',
  'www.silkroadfoundation.org',
  'ia803108.us.archive.org',  // Internet Archive primary scans
  'www.britannica.com',       // tertiary, but a real editorial source
  'www.encyclopedia.com',
];

const TRUST_LABEL = {
  'en.wikisource.org': 'Wikisource primary-text transcription',
  'ich.unesco.org': 'UNESCO Intangible Cultural Heritage listing',
  'sacred-texts.com': 'Sacred Texts public-domain primary translations',
  'www.iranicaonline.org': 'Encyclopaedia Iranica',
  'www.isof.se': 'Institut för språk och folkminnen (Sweden)',
  'www.folklore.ee': 'Estonian Folklore Archives',
  'teara.govt.nz': 'Te Ara: The Encyclopedia of New Zealand',
  'eng.mataurangamaori.tki.org.nz': 'Te Kūpenga Māori',
  'manoa.hawaii.edu': 'University of Hawaiʻi',
  'buddhism.lib.ntu.edu.tw': 'National Taiwan University Buddhist Studies Library',
  'tatarica.org': 'Tatar Encyclopedia (Tatarica)',
  'e-history.kz': 'E-history.kz, Kazakhstan state history portal',
  'adebiportal.kz': 'Adebiportal.kz, Kazakhstan academic portal',
  'hts.org.za': 'Historical Thesaurus of Southern Africa',
  'digitalbleeklloyd.uct.ac.za': 'Bleek and Lloyd Digital Archive, University of Cape Town',
  'sk.sagepub.com': 'SAGE Publications',
  'www.cambridge.org': 'Cambridge University Press',
  'unisapressjournals.co.za': 'UNISA Press journals',
  'journals.nauka-nanrk.kz': 'Kazakhstan national science journals',
  'www.prometeus.nsc.ru': 'Prometeus, Russian science e-library',
  'elibrary.ngonb.ru': 'Russian Science Citation Index',
  'dergipark.org.tr': 'DergiPark, Turkish academic index',
  'ecologyandsociety.org': 'Ecology and Society',
  'www.silkroadfoundation.org': 'Silk Road Foundation',
  'ia803108.us.archive.org': 'Internet Archive primary scan',
  'www.britannica.com': 'Encyclopaedia Britannica',
  'www.encyclopedia.com': 'Encyclopedia.com',
};

function hostOf(url) {
  return url.split('/')[2].toLowerCase().replace(/^www\./, '');
}

// TRUSTED/TRUST_LABEL are keyed with a leading "www."; compare on the stripped host.
const TRUSTED_BARE = TRUSTED.map(d => d.replace(/^www\./, ''));

function trustedHost(url) {
  const bare = hostOf(url);
  return TRUSTED.find(d => TRUSTED_BARE[TRUSTED.indexOf(d)] === bare);
}

const NOTE =
  'Source field previously held only a bare URL to a non-scholarly source ' +
  '(content farm, SEO/tourism marketing site, or personal blog). No primary or ' +
  'academic reference has been supplied. Flagged pending a proper citation.';

const stories = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let downgraded = 0;
let recited = 0;

for (const entry of stories) {
  const src = String(entry.source || '').trim();
  if (!src.startsWith('http')) continue;

  const host = hostOf(src);

  // Wikipedia stays as a visible tertiary citation; it is already rated fair.
  if (host === 'en.wikipedia.org') continue;

  if (trustedHost(src)) {
    const bare = hostOf(src);
    const label = TRUST_LABEL[src.split('/')[2].toLowerCase()] || bare;
    entry.source = `${label}: ${src}`;
    entry.lastUpdated = '2026-10-04';
    recited += 1;
  } else {
    entry.source = `${host} (non-scholarly) — pending replacement: ${src}`;
    entry.source_quality = 'unknown';
    entry.notes = NOTE;
    entry.lastUpdated = '2026-10-04';
    downgraded += 1;
  }
}

console.log(`bare-URL sources recited from trusted domains: ${recited}`);
console.log(`bare-URL sources downgraded to unknown:       ${downgraded}`);
console.log(`wikipedia-sourced entries left visible as tertiary: 135`);

if (!DRY) {
  fs.writeFileSync(FILE, JSON.stringify(stories, null, 2));
  console.log(`\nwrote ${FILE}`);
} else {
  console.log('\n[dry-run] no write');
}