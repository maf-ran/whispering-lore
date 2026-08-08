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

if (typeof global.fetch === 'undefined') {
  global.fetch = function (url) {
    if (url === 'data/items.json') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: function () { return Promise.resolve(itemsFixture) },
      })
    }
    return Promise.reject(new Error('fetch not mocked: ' + url))
  }
}

const itemsFixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'items.json'), 'utf8')
)

require('../js/shared-utils.js')
const { ItemsViewer } = require('../js/items-viewer.js')

describe('ItemsViewer structure', () => {
  let viewer

  beforeEach(() => {
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
