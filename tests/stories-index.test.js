/* eslint-env node */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'));
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const REQUIRED = ['slug', 'title', 'summary', 'country', 'region', 'type'];
const FIELDS = [...REQUIRED, 'tribe', 'themes', 'lastUpdated'];

describe('Stories index data integrity', () => {
  const index = loadJSON('data/sharded/stories/index.json');
  const master = loadJSON('data/datasets/stories.json');
  const manifest = loadJSON('data/sharded/manifest.json');

  it('matches manifest total and is non-empty', () => {
    expect(index.length).toBe(manifest.stories.total);
    expect(index.length).toBeGreaterThan(0);
  });

  it('contains only the slim grid fields on every entry', () => {
    index.forEach((entry) => {
      assert(entry && typeof entry === 'object', 'null entry in index');
      const keys = Object.keys(entry);
      assert(
        keys.every((k) => FIELDS.includes(k)),
        `unexpected index field on ${entry.slug}: ${keys.filter((k) => !FIELDS.includes(k)).join(', ')}`
      );
    });
  });

  it('grid entries carry the required fields', () => {
    index.forEach((entry) => {
      REQUIRED.forEach((k) => {
        const val = entry[k];
        assert(val !== undefined && val !== '', `${entry.slug} missing/empty ${k}`);
      });
    });
  });

  it('slugs are unique and kebab-case', () => {
    const slugs = index.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => {
      assert(/^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(s), `slug not kebab-case: ${s}`);
    });
  });

  it('has the same slug set as the master dataset', () => {
    const masterSlugs = new Set(master.map((s) => s.slug));
    expect(index.length).toBe(master.length);
    index.forEach((entry) => {
      assert(masterSlugs.has(entry.slug), `index slug not in master: ${entry.slug}`);
    });
  });

  it('grid fields match the master dataset per slug', () => {
    const bySlug = new Map(master.map((s) => [s.slug, s]));
    index.forEach((entry) => {
      const src = bySlug.get(entry.slug);
      assert(src, `index entry has no master source: ${entry.slug}`);
      FIELDS.forEach((k) => {
        expect(entry[k]).toEqual(src[k] || '');
      });
    });
  });

  it('is sorted by title ascending for stable output', () => {
    const titles = index.map((i) => i.title.toLowerCase());
    const sorted = titles.slice().sort();
    expect(titles).toEqual(sorted);
  });
});