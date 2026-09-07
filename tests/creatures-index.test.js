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

describe('Creatures index data integrity', () => {
  const index = loadJSON('data/sharded/creatures/index.json');
  const master = loadJSON('data/datasets/creatures.json');
  const manifest = loadJSON('data/sharded/manifest.json');

  const FIELDS = ['slug', 'name', 'type', 'country', 'region', 'description'];

  it('matches manifest total and is non-empty', () => {
    expect(index.length).toBe(manifest.creatures.total);
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
      FIELDS.forEach((k) => {
        const val = entry[k];
        assert(val !== undefined && val !== '', `${entry.slug} missing/empty ${k}`);
      });
    });
  });

  it('slugs are unique and kebab-case', () => {
    const slugs = index.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => {
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), `slug not kebab-case: ${s}`);
    });
  });

  it('has the same slug set as the master dataset', () => {
    const masterSlugs = new Set(master.map((c) => c.slug));
    expect(index.length).toBe(master.length);
    index.forEach((entry) => {
      assert(masterSlugs.has(entry.slug), `index slug not in master: ${entry.slug}`);
    });
  });

  it('grid fields match the master dataset per slug', () => {
    const bySlug = new Map(master.map((c) => [c.slug, c]));
    index.forEach((entry) => {
      const src = bySlug.get(entry.slug);
      assert(src, `index entry has no master source: ${entry.slug}`);
      FIELDS.forEach((k) => {
        expect(entry[k]).toBe(src[k]);
      });
    });
  });

  it('every description is substantial enough for a card excerpt', () => {
    index.forEach((entry) => {
      assert(
        entry.description.length >= 80,
        `description too short on ${entry.slug} (${entry.description.length} chars)`
      );
    });
  });

  it('is sorted by name ascending for stable output', () => {
    const names = index.map((i) => i.name.toLowerCase());
    const sorted = names.slice().sort();
    expect(names).toEqual(sorted);
  });
});