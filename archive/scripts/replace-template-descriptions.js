const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const creatures = JSON.parse(readFileSync(join(__dirname, '..', 'data/datasets/creatures.json'), 'utf8'));

const TEMPLATE_RE = /legendary (creature|being) from (ancient )?(folklore|mythology)/i;
const APPEAR_RE = /depicted in folklore/i;
const BEHAV_RE = /known in folklore/i;
const FOLK_RE = /folklore|mythology/i;

let descFixed = 0;
let appearFixed = 0;
let behavFixed = 0;

function buildDescription(c) {
  const name = c.name;
  const type = c.type || 'creature';
  const country = c.country;

  const anchor = (!FOLK_RE.test(c.seo_description || '')) ? c.seo_description :
                 (!FOLK_RE.test(c.summary || '')) ? c.summary : null;

  const sig = c.cultural_significance || '';
  const habitat = c.habitat || '';
  const tags = (c.behavior_tags || []).join(', ');

  let parts = [];

  if (anchor) {
    parts.push(`${name} is a ${type} from ${country} folklore.`);
    parts.push(` ${anchor}.`);
  } else {
    parts.push(`${name} is a ${type} from ${country} folklore.`);
    if (sig) parts.push(` ${sig}.`);
    if (tags) parts.push(` It is known to be ${tags}.`);
  }

  if (sig && !parts.join('').includes(sig.replace(/\.$/, ''))) {
    parts.push(` ${sig}.`);
  }
  if (habitat && !anchor?.toLowerCase().includes(habitat.toLowerCase().slice(0, 20))) {
    parts.push(` It is said to dwell in ${habitat}.`);
  }

  return parts.join('').replace(/\.\./g, '.').replace(/\.\s+\./g, '.').trim();
}

function fixAppearance(c) {
  if (!APPEAR_RE.test(c.appearance || '')) return c.appearance;
  return `${c.name} is described as a ${c.type || 'creature'} in ${c.country || 'its native'} folklore.`;
}

function fixBehavior(c) {
  if (!BEHAV_RE.test(c.behavior || '')) return c.behavior;
  const tags = (c.behavior_tags || []).join(', ');
  return tags
    ? `${c.name} is ${tags} in ${c.country || 'its native'} folklore.`
    : `${c.name} exhibits behaviors typical of ${c.type || 'a folklore'} being.`;
}

for (const c of creatures) {
  if (TEMPLATE_RE.test(c.description || '')) {
    c.description = buildDescription(c);
    descFixed++;
  }
}

for (const c of creatures) {
  const origA = c.appearance;
  const origB = c.behavior;
  c.appearance = fixAppearance(c);
  c.behavior = fixBehavior(c);
  if (c.appearance !== origA) appearFixed++;
  if (c.behavior !== origB) behavFixed++;
}

writeFileSync(
  join(__dirname, '..', 'data/datasets/creatures.json'),
  JSON.stringify(creatures, null, 2) + '\n',
  'utf8'
);

console.log(`Descriptions fixed: ${descFixed}`);
console.log(`Appearances fixed:  ${appearFixed}`);
console.log(`Behaviors fixed:    ${behavFixed}`);
