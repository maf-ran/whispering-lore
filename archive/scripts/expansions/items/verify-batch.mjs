import { readFileSync } from 'fs';

const ROOT = process.cwd();
const read = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, 'utf8'));

const items = read('data/items.json');
const creatures = read('data/datasets/creatures.json');
const stories = read('data/datasets/stories.json');

let ok = true;
const check = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗ FAIL'} ${msg}`); if (!cond) ok = false; };

const slugs = items.map(i => i.slug);
check(new Set(slugs).size === slugs.length, `no duplicate slugs (${slugs.length} unique)`);
check(items.length === 562, `items.json total = 562 (got ${items.length})`);

const bySlug = (arr) => new Map(arr.map(x => [x.slug, x]));
const cidx = bySlug(creatures);
const sidx = bySlug(stories);

// creature backrefs
const expCreatures = { 'perk-nas': ['baltic-amber-jewelry'], 'laumalatvian-latvia': ['laimas-distaff'], 'laumas-plural-laum-s': ['laimas-distaff'] };
for (const [slug, want] of Object.entries(expCreatures)) {
  const c = cidx.get(slug);
  check(!!c, `creature ${slug} exists`);
  if (c) check(JSON.stringify(c.related_items || []) === JSON.stringify(want), `${slug}.related_items = ${JSON.stringify(c.related_items)}`);
}

// story backrefs
const expStories = {
  'jurate-and-kastytis-the-amber-legend-of-the-baltic-sea': ['baltic-amber-jewelry'],
  'egle-the-queen-of-serpents': ['egles-dress'],
  'lauma-the-spinning-fairy-of-latvia': ['laimas-distaff'],
};
for (const [slug, want] of Object.entries(expStories)) {
  const s = sidx.get(slug);
  check(!!s, `story ${slug} exists`);
  if (s) check(JSON.stringify(s.items || []) === JSON.stringify(want), `${slug}.items = ${JSON.stringify(s.items)}`);
}

// id ordering + range
const ids = items.map(i => Number(i.id.match(/-(\d+)$/)[1]));
check(ids.every((v, i) => i === 0 || v > ids[i - 1]), 'ids strictly ascending');
check(Math.min(...ids) === 101, `min id = 101 (got ${Math.min(...ids)})`);
check(Math.max(...ids) === 1772, `max id = 1772 (got ${Math.max(...ids)})`);

// baltic items present
const baltic = items.filter(i => i.country === 'Lithuania' || i.country === 'Latvia' || i.country === 'Estonia').filter(i => i.region === 'Baltic');
check(baltic.length === 16, `16 Baltic items present (got ${baltic.length})`);

// manifest totals
const manifest = read('data/sharded/manifest.json');
check(manifest.items.total === 562, `manifest items.total = 562 (got ${manifest.items.total})`);
check(manifest.creatures.total === 3668, `manifest creatures.total = 3668 (got ${manifest.creatures.total})`);
check(manifest.stories.total === 2185, `manifest stories.total = 2185 (got ${manifest.stories.total})`);

// check backref arrays are sorted
for (const c of creatures) {
  const r = c.related_items;
  if (r) check(r.every((v, i) => i === 0 || r[i - 1].localeCompare(v) <= 0), `${c.slug} related_items sorted`);
}

console.log(ok ? '\nALL CHECKS PASSED' : '\nCHECKS FAILED');
process.exit(ok ? 0 : 1);
