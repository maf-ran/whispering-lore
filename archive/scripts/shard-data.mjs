import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'data/datasets');
const DST = join(ROOT, 'data/sharded');

const creatures = JSON.parse(readFileSync(join(SRC, 'creatures.json'), 'utf8'));
const stories = JSON.parse(readFileSync(join(SRC, 'stories.json'), 'utf8'));
const items = JSON.parse(readFileSync(join(ROOT, 'data/items.json'), 'utf8'));

function safeDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function buildManifest(entries, name) {
  const regions = {}, countries = {}, tribes = {}, types = {}, slugGroups = {};
  entries.forEach(e => {
    if (e.region) regions[e.region] = (regions[e.region] || 0) + 1;
    if (e.country) countries[e.country] = (countries[e.country] || 0) + 1;
    if (e.tribe) tribes[e.tribe] = (tribes[e.tribe] || 0) + 1;
    if (e.type) {
      const t = e.type.charAt(0).toUpperCase() + e.type.slice(1);
      types[t] = (types[t] || 0) + 1;
    }
    const stripped = (e.slug || '').replace(/^(the|a|an)-/, '');
    const first = stripped[0] || '_';
    if (!slugGroups[first]) slugGroups[first] = [];
    slugGroups[first].push(e.slug);
  });

  const facetOrder = (obj) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});

  return {
    total: entries.length,
    regions: facetOrder(regions),
    countries: facetOrder(countries),
    tribes: facetOrder(tribes),
    types: facetOrder(types),
    slugIndex: Object.keys(slugGroups).sort().reduce((acc, k) => { acc[k] = slugGroups[k]; return acc; }, {}),
    allSlugs: entries.filter(e => e.slug).sort((a, b) => a.slug.localeCompare(b.slug)).map(e => e.slug)
  };
}

// ── Manifest ──
console.log('Building manifest...');
safeDir(DST);

// Auto-derived overlay coverage map: scan data/i18n/<lang>/ for
// <type>-<regionKey>.json files so runtime can skip missing overlays
// without firing 404s. Rebuild shards after adding overlay files.
const I18N_DIR = join(ROOT, 'data', 'i18n');
const i18nCoverage = {};
if (existsSync(I18N_DIR)) {
  readdirSync(I18N_DIR).forEach((lang) => {
    const dir = join(I18N_DIR, lang);
    if (!statSync(dir).isDirectory()) return;
    i18nCoverage[lang] = {};
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => {
        i18nCoverage[lang][f.replace(/\.json$/, '')] = true;
      });
  });
}

writeFileSync(join(DST, 'manifest.json'), JSON.stringify({
  i18n: i18nCoverage,
  creatures: buildManifest(creatures, 'creatures'),
  stories: buildManifest(stories, 'stories'),
  items: buildManifest(items, 'items')
}, null, 2));
console.log('  done.');

// ── Region shards ──
const emitShards = (entries, shardKey, subDir, name) => {
  const groups = {};
  entries.forEach(e => {
    const key = e[shardKey] || 'Unknown';
    const slug = key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!groups[slug]) groups[slug] = [];
    groups[slug].push(e);
  });
  const base = join(DST, subDir, 'by-' + shardKey);
  safeDir(base);
  Object.entries(groups).forEach(([key, items]) => {
    writeFileSync(join(base, key + '.json'), JSON.stringify(items, null, 2));
  });
  console.log(`${name} ${shardKey} shards: ${Object.keys(groups).length}`);
};

emitShards(creatures, 'region', 'creatures', 'Creature');
emitShards(stories, 'region', 'stories', 'Story');
emitShards(items, 'region', 'items', 'Item');

// ── Slug batch files (by first character) ──
const writeSlugBatches = (entries, subDir, name) => {
  const base = join(DST, subDir, 'by-slug');
  safeDir(base);
  const batches = {};
  let detailCount = 0;
  entries.forEach(e => {
    const slug = e.slug;
    if (!slug) return;
    const stripped = slug.replace(/^(the|a|an)-/, '');
    const first = stripped[0] || '_';
    if (!batches[first]) batches[first] = [];
    batches[first].push(e);
    detailCount++;
  });
  Object.entries(batches).forEach(([ch, items]) => {
    writeFileSync(join(base, ch + '.json'), JSON.stringify(items, null, 2));
  });
  console.log(`${name} slug batches: ${Object.keys(batches).length} (${detailCount} entries)`);
};

writeSlugBatches(creatures, 'creatures', 'Creature');
writeSlugBatches(stories, 'stories', 'Story');
writeSlugBatches(items, 'items', 'Item');

// ── Total sizes ──
const dirSize = (dir) => {
  let size = 0;
  const walk = (d) => {
    if (!existsSync(d)) return;
    readdirSync(d).forEach(e => {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else size += statSync(p).size;
    });
  };
  walk(dir);
  return (size / 1024 / 1024).toFixed(1);
};

console.log('\n=== Shard sizes ===');
console.log('  creatures/        ~' + dirSize(join(DST, 'creatures')) + ' MB');
console.log('  stories/          ~' + dirSize(join(DST, 'stories')) + ' MB');
console.log('  items/            ~' + dirSize(join(DST, 'items')) + ' MB');
console.log('  manifest.json     ~' + (readFileSync(join(DST, 'manifest.json')).length / 1024).toFixed(0) + ' KB');
console.log('\nDone.');
