import { readFileSync, writeFileSync } from 'fs';

const BATCH = process.argv[2];
if (!BATCH) { console.error('usage: node apply-batch.mjs <batch-json>'); process.exit(1); }

const ROOT = process.cwd();
const read = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, 'utf8'));

const batch = read(BATCH);
const items = read('data/items.json');
const creatures = read('data/datasets/creatures.json');
const stories = read('data/datasets/stories.json');
const regions = read('data/datasets/geo-regions.json');
const countries = read('data/datasets/geo-countries.json');

const regionSet = new Set(regions);
const countrySet = new Set(countries);
const creatureIndex = new Map(creatures.map(c => [c.slug, c]));
const storyIndex = new Map(stories.map(s => [s.slug, s]));
const existingItems = new Map(items.map(i => [i.slug, i]));

const TYPES = new Set([
  'weapon','jewelry','ship','garment','tool','household object','ritual object',
  'rune stave','musical instrument','other','religious object','crown',
  'cooking vessel','container'
]);
const SOURCE_TYPES = new Set(['oral_tradition','literary','archaeological','secondary_scholarly']);
const SOURCE_QUALITY = new Set(['academic','documented','expert','fair','good','poor','primary','researched','verified','well-documented']);

let errors = 0;
const err = (slug, msg) => { console.error(`  ✗ ${slug}: ${msg}`); errors++; };

const idRange = batch.map(i => Number((i.id.match(/-(\d+)$/) || [])[1]));
if (idRange.some(Number.isNaN)) err('(batch)', 'one or more ids lack -NNNN suffix');
const minId = Math.min(...idRange), maxId = Math.max(...idRange);
const usedIds = new Set(items.map(i => i.id));
const seenSlugs = new Set();

for (const it of batch) {
  const slug = it.slug;
  if (seenSlugs.has(slug)) err(slug, 'duplicate slug within batch');
  seenSlugs.add(slug);
  if (existingItems.has(slug)) err(slug, 'duplicate slug already in items.json');
  if (usedIds.has(it.id)) err(slug, `duplicate id ${it.id} already in items.json`);
  if (!new RegExp(`^${slug}-\\d{4}$`).test(it.id)) err(slug, `id ${it.id} does not match slug-NNNN pattern`);
  if (it.description.length < 200) err(slug, `description below 200-char hard floor (${it.description.length}); target ≥500`);
  if (!TYPES.has(it.type)) err(slug, `bad type: ${it.type}`);
  if (!SOURCE_TYPES.has(it.source_type)) err(slug, `bad source_type: ${it.source_type}`);
  if (!SOURCE_QUALITY.has(it.source_quality)) err(slug, `bad source_quality: ${it.source_quality}`);
  if (typeof it.attested !== 'boolean') err(slug, 'attested must be boolean');
  if (!countrySet.has(it.country)) err(slug, `country not in geo-countries: ${it.country}`);
  if (!regionSet.has(it.region)) err(slug, `region not in geo-regions: ${it.region}`);
  for (const r of (it.related_creatures || [])) if (!creatureIndex.has(r)) err(slug, `related_creatures slug missing: ${r}`);
  for (const s of (it.featured_in_stories || [])) if (!storyIndex.has(s)) err(slug, `featured_in_stories slug missing: ${s}`);
}

console.log(`batch: ${batch.length} items, id range ${minId}-${maxId}`);
console.log(errors ? `VALIDATION FAILED (${errors} errors)` : 'VALIDATION OK');

if (errors) { console.log('aborting apply.'); process.exit(1); }

// ── Apply: merge into items.json (append, preserve batch order) ──
const newItems = [...items];
for (const it of batch) newItems.push(it);
writeFileSync(`${ROOT}/data/items.json`, JSON.stringify(newItems, null, 2) + '\n');
console.log(`items.json: ${items.length} -> ${newItems.length}`);

// ── Backrefs: creatures.related_items ──
const insertAfter = (obj, key, value, afterKey) => {
  const out = {};
  let inserted = false;
  for (const k of Object.keys(obj)) {
    out[k] = obj[k];
    if (k === afterKey && !inserted) { out[key] = value; inserted = true; }
  }
  if (!inserted) out[key] = value;
  return out;
};

for (const it of batch) {
  for (const slug of (it.related_creatures || [])) {
    const c = creatureIndex.get(slug);
    const list = Array.isArray(c.related_items) ? [...c.related_items] : [];
    if (!list.includes(it.slug)) list.push(it.slug);
    list.sort((a, b) => a.localeCompare(b));
    c.related_items = list;
  }
}
for (const c of creatures) if (c.related_items) Object.assign(c, { related_items: c.related_items });
console.log('creature backrefs updated');

// ── Backrefs: stories.items ──
for (const it of batch) {
  for (const slug of (it.featured_in_stories || [])) {
    const s = storyIndex.get(slug);
    const list = Array.isArray(s.items) ? [...s.items] : [];
    if (!list.includes(it.slug)) list.push(it.slug);
    list.sort((a, b) => a.localeCompare(b));
    s.items = list;
  }
}
console.log('story backrefs updated');

writeFileSync(`${ROOT}/data/datasets/creatures.json`, JSON.stringify(creatures, null, 2) + '\n');
writeFileSync(`${ROOT}/data/datasets/stories.json`, JSON.stringify(stories, null, 2) + '\n');
console.log('DONE');
