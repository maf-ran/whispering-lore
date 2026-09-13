/* eslint-env node */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

describe('items index', function () {
  let items, index, manifest

  beforeAll(function () {
    items = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/items.json'), 'utf-8'))
    index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sharded/items/index.json'), 'utf-8'))
    manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sharded/manifest.json'), 'utf-8'))
  })

  test('count matches master and manifest', function () {
    expect(index).toHaveLength(items.length)
    expect(index).toHaveLength(manifest.items.total)
  })

  test('slug parity is exact (no dupes, no extra, no missing)', function () {
    const master = items.map((i) => i.slug).sort()
    const idx = index.map((i) => i.slug).sort()
    expect(idx).toEqual(master)
  })

  test('required fields are non-empty', function () {
    const required = ['slug', 'name', 'type', 'country', 'region']
    index.forEach((entry) => {
      required.forEach((k) => assert(entry[k] !== undefined && entry[k] !== '', entry.slug + ' missing/empty ' + k));
    })
  })

  test('index stays lean (< 1MB)', function () {
    const size = fs.statSync(path.join(ROOT, 'data/sharded/items/index.json')).size
    expect(size).toBeLessThan(1024 * 1024)
  })
})