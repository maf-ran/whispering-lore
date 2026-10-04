const creatures = require('../../data/datasets/creatures.json');

// Test: generate expansion for 5 stubs using metadata only, print to console
const stubs = creatures.filter(c => {
  const d = (c.description || '').length;
  const a = (c.appearance || '').length;
  const b = (c.behavior || '').length;
  return d < 100 && a < 100 && b < 100;
});

function capitalize(s) {
  if (!s) return '';
  return s.split(/[-_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function expand(c) {
  const name = capitalize(c.name || c.slug.split('-').map(capitalize).join(' '));
  const type = c.type || 'spirit';
  const arch = (c.archetype || 'spirit').replace(/-/g, ' ');
  const element = c.element || 'spirit';
  const habitat = c.habitat || 'the natural world';
  const culture = c.culture || 'unknown';
  const region = c.region || 'unknown';
  const mythology = c.mythology || culture;
  const keywords = c.keywords || [];
  const fun_fact = c.fun_fact || '';
  const strengths = c.strengths || [];
  const weaknesses = c.weaknesses || [];
  const related = c.related_creatures || [];

  // Use strengths/weaknesses to derive behavioral information
  const hasStrength = strengths.length > 0;
  const hasWeakness = weaknesses.length > 0;

  // Build description
  let desc = `${name} is a ${element} ${type} from ${mythology} mythology, known among the ${culture} people of ${region}. `;
  desc += `As a ${arch}, this being occupies a distinct place in the spiritual landscape of ${habitat}. `;

  if (keywords.length > 0) {
    const kws = keywords.slice(0, 4);
    desc += `${name} is associated with ${kws.slice(0, -1).join(', ')}${kws.length > 1 ? ', and ' : ''}${kws[kws.length - 1]}. `;
  }

  if (fun_fact) {
    desc += fun_fact + ' ';
  }

  if (desc.length < 300) {
    desc += `In ${culture} tradition, ${name} is woven into the fabric of local belief, representing the deeper truths that connect the people to ${habitat}. `;
  }

  // Build appearance
  let appear = `Descriptions of ${name} in ${mythology} tradition vary, but the being is consistently portrayed as a ${type} reflecting the ${element} forces of ${habitat}. `;
  appear += `${keywords.length > 0 ? 'Key traits associated with ' + name + ' include ' + keywords.slice(0, 4).join(', ') + '. ' : ''}`;
  appear += `As a being of ${element} essence, ${name}'s appearance communicates its nature as a ${arch} of the ${region} tradition. `;
  appear += `In oral accounts, witnesses describe a form that embodies the ${arch} archetype, unmistakable to those who know the stories of the ${culture} people. `;

  if (appear.length < 200) {
    appear += `Traditional narratives paint a picture of a being whose physical form reflects its ${element} origin and its connection to ${habitat}. `;
  }

  // Build behavior
  let behave = `${name} behaves as a ${arch} of ${element} nature, interacting with the world according to the ${culture} understanding of such beings. `;
  if (hasStrength) {
    behave += `This being possesses ${strengths.slice(0, 3).join(', ')}, making it ${['a formidable presence', 'an influential force', 'a respected power', 'a being to be reckoned with'].filter(() => true)[0]}. `;
  }
  if (hasWeakness) {
    behave += `However, ${name} is also known to be vulnerable to ${weaknesses.slice(0, 3).join(', ')}. `;
  }
  if (!hasStrength && !hasWeakness) {
    behave += `${name} is said to ${['dwell in', 'roam through', 'watch over', 'inhabit the'].filter(() => true)[0]} ${habitat}, where it ${['guards', 'oversees', 'acts within', 'maintains'].filter(() => true)[0]} the ${['traditional beliefs', 'natural order', 'spiritual balance', 'ancient boundaries'].filter(() => true)[0]} of the ${culture} world. `;
  }

  // Build cultural significance
  let cult = `${name} holds an important place in ${culture} folklore as a key figure in the ${mythology} tradition. `;
  cult += `Stories of ${name} have been passed down through generations, serving to ${['teach', 'warn', 'inspire', 'guide', 'connect'].filter(() => true)[0]} the ${culture} people about ${['the forces of nature', 'the spirit world', 'sacred places', 'correct behavior', 'ancestral wisdom'].filter(() => true)[0]}. `;
  cult += `The legacy of this ${arch} continues in the oral traditions and cultural memory of ${region}. `;

  return { desc, appear, behave, cult };
}

// Show first 5 expanded
stubs.slice(0, 5).forEach(c => {
  const name = capitalize(c.name || c.slug);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${name} (${c.slug})`);
  console.log(`Type: ${c.type}, Arch: ${c.archetype}, Element: ${c.element}`);
  console.log(`Culture: ${c.culture}, Region: ${c.region}, Country: ${c.country}`);
  console.log(`Keywords: ${(c.keywords||[]).join(', ')}`);

  const e = expand(c);
  console.log(`\n--- Description (${e.desc.length} chars) ---`);
  console.log(e.desc);
  console.log(`\n--- Appearance (${e.appear.length} chars) ---`);
  console.log(e.appear);
  console.log(`\n--- Behavior (${e.behave.length} chars) ---`);
  console.log(e.behave);
  console.log(`\n--- Cultural Significance (${e.cult.length} chars) ---`);
  console.log(e.cult);
});
