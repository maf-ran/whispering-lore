// tests/search-index.test.js
/* eslint-env node */
const fs = require('fs')
const path = require('path')

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'))
}

describe('search index', () => {
  const index = load('data/sharded/search-index.json')
  const masters = {
    creatures: load('data/datasets/creatures.json'),
    stories: load('data/datasets/stories.json'),
    items: load('data/items.json'),
  }

  test('slug sets match masters exactly', () => {
    for (const kind of ['creatures', 'stories', 'items']) {
      const idxSlugs = index[kind].map((e) => e.slug)
      const masterSlugs = masters[kind].map((e) => e.slug)
      expect(idxSlugs.length).toBe(masterSlugs.length)
      expect(idxSlugs).toEqual(expect.arrayContaining(masterSlugs))
      expect(masterSlugs).toEqual(expect.arrayContaining(idxSlugs))
    }
  })

  test('every entry carries display name and excerpt', () => {
    for (const kind of ['creatures', 'stories', 'items']) {
      for (const e of index[kind]) {
        expect(e.name || e.title).toBeTruthy()
        expect(typeof e.excerpt).toBe('string')
      }
    }
  })

  test('index stays under 9MB (perf budget)', () => {
    const bytes = fs.statSync(
      path.join(__dirname, '..', 'data', 'sharded', 'search-index.json')
    ).size
    expect(bytes).toBeLessThan(9 * 1024 * 1024)
  })
})