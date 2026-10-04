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

// ── Homepage precomputed caches (replicates js/main.js + js/daily-feature.js) ──
// latest.json + daily.json avoid a full shard scan on the homepage. Logic must
// mirror the runtime fallbacks exactly; otherwise precomputed != live.
const DATASETS = join(ROOT, 'data/datasets');

const dayHash = (y, m, d) => y * 1000000 + (m + 1) * 10000 + d;
const dailyIndex = (entries, date) => {
  const i = dayHash(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.abs(i) % entries.length;
};
const pad2 = (n) => String(n).padStart(2, '0');
const dateKey = (d) =>
  d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());

function writeDailyPicks() {
  const picks = {};
  const now = new Date();
  for (let i = 0; i < 45; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dc = creatures[dailyIndex(creatures, d)];
    const ds = stories[dailyIndex(stories, d)];
    picks[dateKey(d)] = {
      creature: {
        name: dc.name,
        type: dc.type,
        country: dc.country,
        summary: dc.summary || dc.description,
        slug: dc.slug,
      },
      story: {
        title: ds.title,
        country: ds.country,
        region: ds.region,
        summary: ds.summary,
        slug: ds.slug,
      },
    };
  }
  writeFileSync(join(DATASETS, 'daily.json'), JSON.stringify({
    _meta: {
      generated: dateKey(now),
      days: 45,
      note: 'precomputed daily picks replicating getDailyIndex(); regenerate when shards change; runtime falls back to full Shimmer scan for dates beyond window',
    },
    picks,
  }, null, 2));
  console.log('  daily.json     (' + Object.keys(picks).length + ' days)');
}

function writeLatestPicks() {
  const all = [
    ...creatures.map((c, i) => ({
      name: c.name,
      desc: c.description,
      date: c.date_added || 'Recent',
      type: 'Creature',
      index: creatures.length - i,
    })),
    ...stories.map((s, i) => ({
      name: s.title,
      desc: s.summary || (s.content ? s.content.substring(0, 120) + '...' : ''),
      date: s.date_added || 'Recent',
      type: 'Story',
      index: stories.length - i,
    })),
  ]
    .sort((a, b) => {
      if (a.date !== b.date) {
        if (a.date === 'Recent') return 1;
        if (b.date === 'Recent') return -1;
        return b.date > a.date ? 1 : -1;
      }
      return a.index - b.index;
    })
    .slice(0, 3);
  writeFileSync(join(DATASETS, 'latest.json'), JSON.stringify({
    _meta: {
      generated: dateKey(new Date()),
      generator: 'shard-data.mjs (auto on every rebuild)',
      source: 'data/datasets/{creatures,stories}.json',
      note: 'precomputed top-3 for homepage Latest Additions; main.js falls back to full Shimmer scan if missing',
    },
    items: all,
  }, null, 2));
  console.log('  latest.json   (top ' + all.length + ')');
}

console.log('Homepage caches:');
writeDailyPicks();
writeLatestPicks();

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
