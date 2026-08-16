/** @jest-environment jsdom */
/* eslint-env node */
/**
 * @jest-environment jsdom
 */

const fs = require('fs')
const path = require('path')

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
}

// Deterministic rAF so the animated count settles synchronously. Timestamps
// increase monotonically per call so the count animation always terminates.
window.requestAnimationFrame = function (cb) {
  window._rafFrame = (window._rafFrame || 0) + 1
  cb((window._rafFrame - 1) * 400)
  return window._rafFrame
}
window.cancelAnimationFrame = function () {}

const itemsFixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'items.json'), 'utf8')
)
const manifestFixture = (function () {
  const regions = {}
  const types = {}
  const slugIndex = {}
  const allSlugs = []
  itemsFixture.forEach(function (item) {
    if (item.region) regions[item.region] = (regions[item.region] || 0) + 1
    if (item.type) {
      const t = item.type.charAt(0).toUpperCase() + item.type.slice(1)
      types[t] = (types[t] || 0) + 1
    }
    if (item.slug) {
      allSlugs.push(item.slug)
      const ch = item.slug.replace(/^(the|a|an)-/, '')[0] || '_'
      if (!slugIndex[ch]) slugIndex[ch] = []
      slugIndex[ch].push(item.slug)
    }
  })
  allSlugs.sort()
  return {
    creatures: { total: 0, regions: {}, countries: {}, tribes: {}, types: {}, slugIndex: {}, allSlugs: [] },
    stories: { total: 0, regions: {}, countries: {}, tribes: {}, types: {}, slugIndex: {}, allSlugs: [] },
    items: {
      total: itemsFixture.length,
      regions: regions,
      countries: {},
      tribes: {},
      types: types,
      slugIndex: slugIndex,
      allSlugs: allSlugs,
    },
  }
})()
const itemShards = {}
itemsFixture.forEach(function (item) {
  if (!item.region) return
  const key = item.region.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!itemShards[key]) itemShards[key] = []
  itemShards[key].push(item)
})
global.fetch = function (url) {
  if (url === 'data/sharded/manifest.json') {
    return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(manifestFixture) } })
  }
  const m = url.match(/^data\/sharded\/items\/by-region\/(.+?)\.json$/)
  if (m && itemShards[m[1]]) {
    return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(itemShards[m[1]]) } })
  }
  return Promise.reject(new Error('fetch not mocked: ' + url))
}

require('../js/shared-utils.js')
const { ItemsViewer } = require('../js/items-viewer.js')

describe('ItemsViewer structure', () => {
  let viewer

  beforeEach(() => {
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (sh) {
      sh.manifest = null
      sh.shards = {}
      sh.slugBatches = {}
    }
    document.body.innerHTML =
      '<div class="bestiary-layout">' +
      '  <p class="item-count" aria-live="polite">Loading artifacts...</p>' +
      '  <div id="item-empty" class="is-hidden"></div>' +
      '  <div id="item-grid"></div>' +
      '  <button id="item-load-more" class="is-hidden"></button>' +
      '  <section id="item-detail" class="is-hidden"></section>' +
      '  <div class="page-hero"></div>' +
      '  <div class="filter-bar"></div>' +
      '</div>'
    viewer = new ItemsViewer()
  })

  it('exists with type items and correct IDs', () => {
    expect(typeof ItemsViewer).toBe('function')
    expect(viewer.type).toBe('items')
    expect(viewer.gridId).toBe('item-grid')
    expect(viewer.emptyId).toBe('item-empty')
    expect(viewer.loadMoreId).toBe('item-load-more')
    expect(viewer.countSelector).toBe('.item-count')
  })

  it('cardRenderer returns an article.card with an item CTA', () => {
    const item = {
      slug: 'mjolnir',
      name: 'Mjölnir',
      region: 'Nordic',
      country: 'Iceland',
      type: 'weapon',
    }
    const card = viewer.cardRenderer(item, 0)
    expect(card.tagName).toBe('ARTICLE')
    expect(card.classList.contains('card')).toBe(true)
    const cta = card.querySelector('.card-cta')
    expect(cta).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('?item=mjolnir')
    const badge = card.querySelector('.card-type-badge')
    expect(badge).toBeTruthy()
    expect(badge.textContent).toBe('weapon')
  })

  it('updateCount renders the artifacts label', () => {
    viewer.cache = [{ slug: 'a' }, { slug: 'b' }]
    viewer.state.filteredData = viewer.cache.slice()
    viewer.updateCount()
    const countEl = document.querySelector('.item-count')
    expect(countEl.textContent).toMatch(/2 of 2 artifacts/)
  })
})
