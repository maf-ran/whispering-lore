#!/usr/bin/env node
// Re-source and de-pseudoscientificise the two Dogon creation stories.
//
// Problems found 2026-10-04:
//  1. `the-nommo-descend-in-the-ark-of-sirius` cited hitchhikersguidetoreligion.com
//     — a debunking site — as its source at source_quality "good".
//  2. Its full_text carried the Sirius Mystery framing (Temple 1976): a vessel
//     "blazing with fire" leaving "a trail of smoke across the heavens", Nommo
//     with "blue-green skin, webbed hands and gills". Those details are Temple's,
//     not Griaule's, and were repudiated by Dieterlen and van Beek.
//  3. `amma-and-the-cosmic-egg-the-dogon-creation` cited culturesofwestafrica.com.
//  4. Both set period "ancient". Both texts were recorded by Griaule in 1946 from
//     Ogotemmêli and published 1948/1965 — a 20th-century published record of an
//     oral tradition.
//  5. The two entries conflated *Dieu d'eau* (1948, creation egg) with
//     *Le renard pale* (1965, ark). van Beek (1991) and Dieterlen hold the two
//     accounts too inconsistent to reconcile; the ark material belongs to the
//     1965 text only.
//
// Usage: node archive/scripts/fix-dogon-sources.js

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const PERIOD = '20th-century recorded oral tradition (Griaule interviews 1946; published 1948 and 1965)';

const DISPUTE_NOTE =
  'Recorded by Marcel Griaule from Ogotemmêli of the Sanga Dogon in 1946. The published ' +
  'canon is contested: W. E. A. van Beek, "Dogon Restudied", Current Anthropology 32:2 (1991) ' +
  '139-167, fieldwork over ten years, found Dogon informants who did not attribute this ' +
  'significance to the Nommo and could not recover the parallel described here; ' +
  'Andrew Apter argues in Cahiers d\'Etudes Africaines that van Beek may under-read ' +
  'deep knowledge whose content is fluid rather than fixed. The 1948 and 1965 accounts are ' +
  'internally inconsistent. Robert Temple\'s Sirius Mystery (1976) built an extraterrestrial ' +
  'argument on this material; it was rejected by serious anthropologists and both Dieterlen and ' +
  'van Beek publicly regretted the appropriation. Do not present the Sirius reading as tradition.';

const ARK = {
  slug: 'the-nommo-descend-in-the-ark-of-sirius',
  title: 'The Nommo Bring the Ark to Earth',
  summary:
    'In the account published as Le renard pale (1965), the Nommo — twin amphibious beings who ' +
    'embody water and the spoken word — carried an ark to earth and released the eight first ' +
    'ancestors of humanity, bringing cultivated seed and the techniques of pottery, weaving and ' +
    'speech. The ark came to rest at a place Griaule calls the Eye of the World, and the ' +
    'granary forms of Dogon villages are traditionally related to its shape. This account stands ' +
    'apart from the earlier creation narrative in Dieu d\'eau (1948) and is the version most often ' +
    'cited, and most often overstated, in popular retellings.',
  full_text:
    'The Nommo are water beings, and in the account published as Le renard pale in 1965 they are ' +
    'also the ark-bearers. They are described as twins, androgynous, neither wholly male nor wholly ' +
    'female, a duality that runs through Dogon art and cosmology as the form creation was meant to take.\n\n' +
    'They brought an ark to earth, and released the eight first ancestors onto the land. The ark ' +
    'came down at what Griaule calls the Eye of the World, where the first rituals were ' +
    'performed. Nothing in the published account describes it as burning, or as leaving a trail ' +
    'across the heavens.\n\n' +
    'What the Nommo brought was knowledge held to be civilising rather than divine: seed, and the ' +
    'crafts of the potter, the weaver and the speaker. They established the order of the clans, the ' +
    'rules of marriage, and the ceremonies of initiation.\n\n' +
    'They also brought a warning. The Pale Fox would come, and the work of the living would be to ' +
    'hold the balance between order and disorder. That work belongs to the associations of ' +
    'initiated men, whose masked performances, divination and funerals keep the balance in repair.\n\n' +
    'The account holds that the Nommo will return when the world has fallen too far from its ' +
    'arrangement. Until then the Dogon keep the rituals and the laws the Nommo brought down.',
  source:
    'Marcel Griaule, Le renard pale, T. I (Paris: Institut d\'Ethnologie, 1965), with Germaine ' +
    'Dieterlen; contested by W. E. A. van Beek, "Dogon Restudied", Current Anthropology 32:2 ' +
    '(1991) 139-167. Ark narrative summarised in The Metropolitan Museum of Art, The Art of Africa.',
  source_quality: 'fair',
  source_type: 'literary',
  period: PERIOD,
  notes: DISPUTE_NOTE,
};

const CREATION = {
  slug: 'amma-and-the-cosmic-egg-the-dogon-creation',
  summary:
    'In Dieu d\'eau (1948), Amma the creator works from a cosmic egg, and the first being born is ' +
    'Ogo — also called Yurugu, the Pale Fox — premature, without a twin, and therefore incomplete. ' +
    'Ogo takes what was not given to him. Amma answers by creating the Nommo, twin beings of water ' +
    'and speech, one of whom is sacrificed and dismembered so that the world can be assembled from ' +
    'the pieces. In this telling the Nommo do not arrive from Sirius; that belongs to the later ' +
    'ark narrative.',
  full_text:
    'Before Amma there was only the undivided. Amma worked from an egg containing everything that ' +
    'would come to exist.\n\n' +
    'The first being born was Ogo, the Pale Fox, born prematurely and without a twin. Because he ' +
    'was incomplete he took what had not been given to him, and disorder entered the world.\n\n' +
    'Amma\'s answer was the Nommo: twins of water and speech, perfectly formed where Ogo was not. ' +
    'One Nommo was sacrificed and dismembered, and the pieces of that body became the materials of ' +
    'the world. Death and incompleteness were not outside the design; they were inside it.\n\n' +
    'What remains is the work of maintaining balance. The Pale Fox introduced disorder, and the ' +
    'living must hold the balance in repair through ritual, divination and the masked performances ' +
    'of the initiated associations.\n\n' +
    'This account comes from Dieu d\'eau, published in 1948 from interviews recorded in 1946. It is ' +
    'not the same account as the ark narrative published in 1965, and the two cannot be reconciled ' +
    'into one story.',
  source:
    'Marcel Griaule, Dieu d\'eau: Entretiens avec Ogotemmeli (Paris, 1948); English translation, ' +
    'Conversations with Ogotemmeli (Oxford University Press, 1965). Contested by W. E. A. van Beek, ' +
    '"Dogon Restudied", Current Anthropology 32:2 (1991) 139-167.',
  source_quality: 'fair',
  source_type: 'literary',
  period: PERIOD,
  notes:
    DISPUTE_NOTE +
    ' Note also that this entry previously absorbed ark material from the 1965 text, which belongs ' +
    'to the separate entry on the ark descent.',
};

const stories = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let patched = 0;

for (const fix of [ARK, CREATION]) {
  const entry = stories.find(s => s.slug === fix.slug);
  if (!entry) {
    console.log(`MISSING: ${fix.slug}`);
    continue;
  }
  for (const [key, value] of Object.entries(fix)) {
    entry[key] = value;
  }
  entry.lastUpdated = '2026-10-04';
  patched += 1;
  console.log(`patched: ${fix.slug}`);
}

fs.writeFileSync(FILE, JSON.stringify(stories, null, 2));
console.log(`\npatched ${patched} of 2 stories`);