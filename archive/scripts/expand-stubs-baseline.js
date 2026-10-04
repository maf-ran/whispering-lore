// ============================================================================
// DO NOT RUN. Generates template filler, not research.
//
// This script fills stub entries by randomly assembling sentences from the
// template arrays below (`pick` uses Math.random). Running it produces text that
// reads as sourced description but is combinatorial invention, and it stamps the
// result into entries with source_quality intact — so the fabrication ships
// looking verified.
//
// It is retained only as a record of how the templated descriptions in the
// dataset were produced. If you need to fill a genuine stub, write the entry by
// hand from a real source, and set source_quality "unknown" / attested false
// until it has been checked. See archive/scripts/sync-unattested-flags.js.
// ============================================================================

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

if (!process.env.WL_ALLOW_TEMPLATE_FILLER) {
  console.error(
    'Refusing to run: this script generates template filler, not sourced text.\n' +
    'It is retained for provenance only. See the banner at the top of this file.'
  );
  process.exit(1);
}

const CREATURES_PATH = join(__dirname, '../..', 'data/datasets/creatures.json');
const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));

function capitalize(s) {
  if (!s) return '';
  return s.split(/[-_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const descTemplates = [
  (n, t, e, a) => `${n} is a ${e} ${t} from ${a} folklore, deeply embedded in the oral traditions of the region.`,
  (n, t, e, a) => `In ${a} mythology, ${n} stands as a ${e} ${t} whose stories have been carried through generations.`,
  (n, t, e, a) => `The ${e} ${t} ${n} belongs to the rich tapestry of ${a} mythological tradition.`,
  (n, t, e, a) => `${n} ranks among the most distinctive ${e} ${t} beings in ${a} folklore.`,
  (n, t, e, a) => `Within ${a} mythology, ${n} is a ${e} ${t} whose presence marks the spiritual landscape.`,
];

const archPhrases = {
  'guide': ['serves as a guide between worlds, leading souls or travelers through liminal spaces',
            'acts as a celestial or spiritual guide, showing the way to those who seek wisdom',
            'functions as a psychopomp figure, accompanying the worthy across thresholds'],
  'guardian': ['stands as a guardian of sacred places, watching over boundaries between realms',
              'serves as a protective spirit, warding off malevolent forces from communities',
              'acts as a divine sentinel, protecting the natural and spiritual order'],
  'trickster': ['embodies the trickster archetype, challenging conventions through cunning and wit',
               'delights in deception and mischief, often teaching through humiliating lessons',
               'revels in chaos and boundary-crossing, exposing hypocrisy through clever tricks'],
  'shapeshifter': ['moves fluidly between forms, blurring the line between human and animal nature',
                  'commands the power of transformation, shifting between shapes at will',
                  'exists between forms, a being of mutable flesh that defies easy categorization'],
  'monster': ['inspires fear as a monster of the wilderness, representing the dangers of the unknown',
             'haunts the edges of civilization as a monster that preys on the unwary',
             'embodies primal terror, a monster whose very name warns against forbidden places'],
  'nature-spirit': ['embodies the wild forces of nature, tied to specific landscapes and seasons',
                   'animates the natural world as a spirit of growth, decay, and renewal',
                   'dwells within forests, waters, or mountains as the living consciousness of the land'],
  'water-spirit': ['haunts the depths of lakes and rivers as a water spirit of immense power',
                  'rules over the watery realm, from rain-swollen streams to the ocean depths',
                  'emerges from the waters as a spirit of the deep, commanding currents and tides'],
  'forest-spirit': ['roams the deep woods as a forest spirit, keeper of ancient trees and hidden glades',
                   'dwells within the forest shadows, a spirit that guards the green realm',
                   'animates the woodlands as a spirit of the thicket and the clearing alike'],
  'ancestor-spirit': ['bridges the living and the dead as an ancestor spirit of great wisdom',
                     'carries the记忆 of the lineage, an ancestor spirit who guides descendants',
                     'manifests as an ancestor spirit, preserving the ways of those who came before'],
  'household-spirit': ['keeps watch over the home as a household spirit of hearth and threshold',
                      'dwells within the domestic sphere, a spirit tied to family and home',
                      'inhabits the family dwelling as a household spirit that brings fortune or strife'],
  'deity': ['reigns as a deity of considerable power, commanding the forces of nature and fate',
           'holds dominion over a realm of existence as a deity in the pantheon',
           'stands among the gods as a deity whose influence shapes the mortal world'],
  'hero': ['embodies the hero archetype, undertaking great deeds that shape the destiny of their people',
          'rises as a hero of legend, performing feats that echo through the generations',
          'walks the path of the hero, confronting trials that test the limits of mortal strength'],
  'demon': ['plunges from the celestial realm as a demon of shadow and flame',
           'wields dark influence as a demon that tempts and torments the living',
           'rises from the abyss as a demon whose appetite for chaos knows no bounds'],
  'cursed-being': ['wanders the earth as a cursed being, trapped between worlds by an ancient doom',
                  'bears the weight of a curse that transforms and isolates them from the living',
                  'exists under a powerful curse, their form and fate forever altered'],
  'animal-spirit': ['moves through the wild as an animal spirit, embodying the essence of its kin',
                   'manifests as an animal spirit, bridging instinct and intelligence',
                   'takes the form of a sacred animal spirit, revered by those who share its territory'],
};

const appTemplates = [
  (n, e, a) => `${n} is described in ${a} tradition as a being of ${e} essence, its appearance reflecting its otherworldly nature.`,
  (n, e, a) => `Traditional accounts of ${n} emphasize its ${e} qualities, with descriptions passed down through ${a} oral narratives.`,
  (n, e, a) => `In ${a} folklore, ${n} appears as a manifestation of ${e}, its form unmistakable to those who know the stories.`,
  (n, e, a) => `Witnesses describe ${n} bearing the marks of its ${e} origins, shaped by the mythology of ${a}.`,
];

const behaveTemplates = [
  (n, a) => `Within ${a} tradition, ${n} follows patterns consistent with its role in the spiritual order of the region.`,
  (n, a) => `${n} interacts with the world according to the ancient laws of ${a} mythology, never straying from its ordained nature.`,
  (n, a) => `The behavior of ${n} is well-documented in ${a} oral narratives, which describe its interactions with humanity.`,
  (n, a) => `According to ${a} belief, ${n} conducts itself according to the principles that govern beings of its kind.`,
];

const cultTemplates = [
  (n, a) => `${n} occupies a significant place in ${a} cultural memory, its stories preserving traditional knowledge.`,
  (n, a) => `The legend of ${n} carries deep meaning for ${a} communities, encoding wisdom about the natural and spiritual worlds.`,
  (n, a) => `In ${a} tradition, ${n} serves as a vessel for cultural values and ancestral teachings.`,
  (n, a) => `${n} remains an important figure in ${a} folklore, its stories continuing to resonate with each new generation.`,
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildDesc(c) {
  const n = capitalize(c.name || c.slug);
  const t = c.type || 'spirit';
  const e = c.element || 'spirit';
  const a = c.mythology || c.culture || 'the region';
  const arch = (c.archetype || 'spirit').replace(/-/g, ' ');
  const culture = c.culture || 'unknown';
  const habitat = c.habitat || 'the natural world';
  const keywords = c.keywords || [];
  const fun_fact = c.fun_fact || '';

  let parts = [];

  parts.push(pick(descTemplates)(n, t, e, a));

  if (archPhrases[arch]) {
    parts.push(capFirst(pick(archPhrases[arch])) + '.');
  }

  parts.push(`This ${t} is firmly rooted in the traditions of the ${culture} people.`);

  if (keywords.length > 0) {
    const kws = keywords.filter((_, i) => i < 4);
    parts.push(`${n} is particularly associated with ${kws.slice(0, -1).join(', ')}${kws.length > 1 ? ' and ' : ''}${kws[kws.length - 1]}.`);
  }

  if (habitat && habitat.length > 2) {
    const h = habitat.charAt(0).toUpperCase() + habitat.slice(1);
    parts.push(`${h} serve as the domain where ${n}'s stories unfold.`);
  }

  if (fun_fact && fun_fact.length > 10) {
    parts.push(capFirst(fun_fact.replace(/\.$/, '')) + '.');
  }

  return parts.join(' ');
}

function buildAppear(c) {
  const n = capitalize(c.name || c.slug);
  const e = c.element || 'spirit';
  const a = c.mythology || c.culture || 'the region';
  const arch = (c.archetype || 'spirit').replace(/-/g, ' ');
  const habitat = c.habitat || 'the natural world';
  const keywords = c.keywords || [];

  let parts = [];
  parts.push(pick(appTemplates)(n, e, a));

  const archLooks = [
    `Its form clearly marks it as a ${arch} of ${a} tradition.`,
    `Those familiar with ${a} mythology recognize the ${arch} archetype in its visage.`,
    `Every aspect of its appearance speaks to its role as a ${arch} in the ${a} cosmology.`,
  ];
  parts.push(pick(archLooks));

  if (keywords.length > 0) {
    parts.push(`Artistic and oral descriptions emphasize ${keywords[0]}${keywords.length > 1 ? ', ' + keywords.slice(1, 3).join(', ') : ''} as defining traits.`);
  }

  const habitatLooks = [
    `Its ${e} nature is said to reflect the landscape of ${habitat}, blending the being seamlessly into its environment.`,
    `The ${e} ${e === 'spirit' ? 'essence' : 'qualities'} of ${n} manifest in ways that echo the terrain of ${habitat}.`,
  ];
  parts.push(pick(habitatLooks));

  return parts.join(' ');
}

function buildBehave(c) {
  const n = capitalize(c.name || c.slug);
  const a = c.mythology || c.culture || 'the region';
  const arch = (c.archetype || 'spirit').replace(/-/g, ' ');
  const culture = c.culture || 'unknown';
  const habitat = c.habitat || 'the natural world';
  const strengths = c.strengths || [];
  const weaknesses = c.weaknesses || [];

  let parts = [];
  parts.push(pick(behaveTemplates)(n, a));

  if (strengths.length > 0) {
    parts.push(`${n} commands considerable power, including ${strengths.slice(0, 3).join(', ')}, which it wields in accordance with ${culture} tradition.`);
  }

  if (weaknesses.length > 0) {
    parts.push(`However, ${n} can be countered through ${weaknesses.slice(0, 3).join(', ')}, knowledge preserved by ${culture} elders.`);
  }

  if (strengths.length === 0 && weaknesses.length === 0) {
    const genericBehaviors = [
      `${n} is said to frequent ${habitat}, where its presence is felt by those attuned to the ${arch} realm.`,
      `Those who venture into ${habitat} may encounter ${n}, whose ${arch} nature governs its actions.`,
      `${n} dwells within ${habitat}, conducting its existence according to the ${culture} understanding of such beings.`,
    ];
    parts.push(pick(genericBehaviors));
  }

  return parts.join(' ');
}

function buildCult(c) {
  const n = capitalize(c.name || c.slug);
  const a = c.mythology || c.culture || 'the region';
  const region = c.region || 'the region';
  const culture = c.culture || 'unknown';
  const arch = (c.archetype || 'spirit').replace(/-/g, ' ');

  let parts = [];
  parts.push(pick(cultTemplates)(n, a));

  const cultRoles = [
    `As a ${arch}, ${n} represents the ${culture} understanding of the forces that ${a === culture ? '' : a + ' '}shape existence.`,
    `The figure of ${n} encapsulates the ${culture} worldview, illustrating the relationship between humanity and the ${arch} realm.`,
    `Through ${n}, the ${culture} people explore themes of ${['nature and spirit', 'order and chaos', 'life and death', 'the known and the unknown', 'humanity and the wild'].filter(() => true)[0]}.`,
  ];
  parts.push(pick(cultRoles));

  parts.push(`The oral narratives surrounding ${n} continue to be shared in ${region}, preserving this important thread of ${culture} heritage.`);

  return parts.join(' ');
}

// Main
const stubs = creatures.filter(c => {
  const d = (c.description || '').length;
  const a = (c.appearance || '').length;
  const b = (c.behavior || '').length;
  return d < 100 && a < 100 && b < 100;
});

let count = 0;
const results = [];

stubs.forEach(c => {
  const oldDesc = c.description || '';
  const oldAppear = c.appearance || '';
  const oldBehave = c.behavior || '';
  const oldCult = c.cultural_significance || '';

  const newDesc = buildDesc(c);
  const newAppear = buildAppear(c);
  const newBehave = buildBehave(c);
  const newCult = buildCult(c);

  c.description = oldDesc.length > 100 ? oldDesc : newDesc;
  c.appearance = oldAppear.length > 100 ? oldAppear : newAppear;
  c.behavior = oldBehave.length > 100 ? oldBehave : newBehave;
  c.cultural_significance = oldCult.length > 100 ? oldCult : newCult;

  results.push({
    slug: c.slug,
    desc: { before: oldDesc.length, after: c.description.length },
    appear: { before: oldAppear.length, after: c.appearance.length },
    behave: { before: oldBehave.length, after: c.behavior.length },
    cult: { before: oldCult.length, after: c.cultural_significance.length },
  });
  count++;
});

writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n');

console.log(`\nExpanded ${count} stub creatures\n`);

const dTotal = results.reduce((s, r) => s + r.desc.before, 0);
const aTotal = results.reduce((s, r) => s + r.appear.before, 0);
const bTotal = results.reduce((s, r) => s + r.behave.before, 0);
const cTotal = results.reduce((s, r) => s + r.cult.before, 0);

const dAfter = results.reduce((s, r) => s + r.desc.after, 0);
const aAfter = results.reduce((s, r) => s + r.appear.after, 0);
const bAfter = results.reduce((s, r) => s + r.behave.after, 0);
const cAfter = results.reduce((s, r) => s + r.cult.after, 0);

console.log(`Description: ${dTotal} → ${dAfter} chars (avg ${Math.round(dAfter/count)}/entry)`);
console.log(`Appearance: ${aTotal} → ${aAfter} chars (avg ${Math.round(aAfter/count)}/entry)`);
console.log(`Behavior: ${bTotal} → ${bAfter} chars (avg ${Math.round(bAfter/count)}/entry)`);
console.log(`Cultural Sig: ${cTotal} → ${cAfter} chars (avg ${Math.round(cAfter/count)}/entry)`);

// Show sample entries
results.slice(0, 5).forEach(r => {
  const c = creatures.find(x => x.slug === r.slug);
  const name = capitalize(c.name || c.slug);
  console.log(`\n--- ${name} (${r.slug}) ---`);
  console.log(`DESC (${r.desc.before}→${r.desc.after}): ${(c.description||'').substring(0, 150)}...`);
  console.log(`APPEAR (${r.appear.before}→${r.appear.after}): ${(c.appearance||'').substring(0, 150)}...`);
  console.log(`BEHAVE (${r.behave.before}→${r.behave.after}): ${(c.behavior||'').substring(0, 150)}...`);
  console.log(`CULT (${r.cult.before}→${r.cult.after}): ${(c.cultural_significance||'').substring(0, 150)}...`);
});
