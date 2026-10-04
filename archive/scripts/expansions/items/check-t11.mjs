import { readFile } from 'node:fs/promises';

const items = JSON.parse(await readFile('data/items.json', 'utf8'));
const slugs = new Set(items.map(i => i.id));

const planned = ['fujara','gaida','gajdy','trompita','trompeta','lajkonik','rogatywka','martenitsa','martisor','troita','kukeri','dacian-gold-bracelets','sajkaca','pirot-kilim','opanak','ohrid-pearl','krali-marko-sabre','drotar','bogracs','matyo-embroidery','valaska','pomlazka','sibacka','korbac','czech-glass-ornaments','szeletszur','ciffraszur','zlatni-kolac','rodnen-krale'];
const hit = slugs.intersection ? [...slugs.intersection(new Set(planned))] : planned.filter(s => slugs.has(s));

const regionCountries = ['Poland','Czech','Slovak','Hungar','Bulgar','Romania','Serb','North Macedonia','Macedonia','Kosovo'];
const text = await readFile('archive/scripts/expansions/items/ref-eastern-europe.txt', 'utf8');
const lines = text.split('\n');

const header = { creatures: false, stories: false };
const out = { creatures: [], stories: [] };
let current = null;
for (const line of lines) {
  const t = line.trim();
  if (/^## Creatures/i.test(t)) { current = 'creatures'; header.creatures = true; continue; }
  if (/^## Stories/i.test(t)) { current = 'stories'; header.stories = true; continue; }
  if (current && !t) { current = null; continue; }
  if (!current) continue;
  if (regionCountries.some(c => t.includes(c))) out[current].push(t);
}

console.log('HIT (already exist):', JSON.stringify(hit));
console.log('items.json total:', items.length);
console.log('CREATURE LINKS:');
for (const l of out.creatures) console.log('  ' + l);
console.log('STORY LINKS:');
for (const l of out.stories) console.log('  ' + l);
