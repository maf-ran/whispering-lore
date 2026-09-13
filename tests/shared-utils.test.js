/** @jest-environment jsdom */
/* eslint-env node */
/**
 * @jest-environment jsdom
 */

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
}

if (typeof global.fetch === 'undefined') {
  global.fetch = function () {
    return Promise.reject(new Error('fetch not mocked'))
  }
}

require('../js/shared-utils.js')

var getSlug = window.__sharedUtils.getSlug

describe('getSlug', () => {
  it('converts name to URL-safe slug', () => {
    expect(getSlug('Hello World')).toBe('hello-world')
    expect(getSlug('Café Crème')).toBe('caf-cr-me')
    expect(getSlug('  spaces  ')).toBe('spaces')
    expect(getSlug('already-slug')).toBe('already-slug')
  })

  it('handles empty/null input', () => {
    expect(getSlug('')).toBe('')
    expect(getSlug(null)).toBe('')
    expect(getSlug(undefined)).toBe('')
  })
})

describe('renderSources', () => {
  function el() {
    document.body.innerHTML =
      '<div class="detail-sources is-hidden">' +
      '<h3>Sources</h3><ul class="detail-source-list"></ul>' +
      '<div class="detail-source-badges"></div></div>'
    return document.querySelector('.detail-sources')
  }

  it('splits source on ";" into one li each, trimmed', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, { source: 'Prose Edda (Gylfaginning); Grímnismál', source_type: 'literary', source_quality: 'expert' })
    expect(box.classList.contains('is-hidden')).toBe(false)
    const lis = box.querySelectorAll('.detail-source-list li')
    expect(lis.length).toBe(2)
    expect(lis[0].textContent).toBe('Prose Edda (Gylfaginning)')
    expect(lis[1].textContent).toBe('Grímnismál')
  })

  it('auto-links https URLs inside items', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, { source: 'https://en.wikipedia.org/wiki/Tangaloa; Samoan and Tongan mythology' })
    const links = box.querySelectorAll('.detail-source-list li a')
    expect(links.length).toBe(1)
    expect(links[0].getAttribute('href')).toBe('https://en.wikipedia.org/wiki/Tangaloa')
    expect(links[0].getAttribute('target')).toBe('_blank')
    expect(box.querySelectorAll('.detail-source-list li')[1].textContent).toBe('Samoan and Tongan mythology')
  })

  it('renders source_type and source_quality badges', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, { source: 'Prose Edda', source_type: 'literary', source_quality: 'expert' })
    const st = box.querySelector('.source-type-badge')
    expect(st).not.toBeNull()
    expect(st.className).toContain('source-type-badge--literary')
    expect(st.textContent).toBe('Literary')
    const sq = box.querySelector('.source-badge')
    expect(sq).not.toBeNull()
    expect(sq.className).toContain('source-badge--expert')
    expect(sq.textContent).toBe('Expert')
  })

  it('stays hidden for missing/empty source', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, {})
    expect(box.classList.contains('is-hidden')).toBe(true)
    expect(box.querySelectorAll('.detail-source-list li').length).toBe(0)
  })

  it('stays hidden for the exact "None" sentinel', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, { source: 'None — no independent source located' })
    expect(box.classList.contains('is-hidden')).toBe(true)
  })

  it('renders "None"-prefixed entries that carry real refs (not the sentinel)', () => {
    const box = el()
    window.__sharedUtils.renderSources(box, { source: "None — no independent source located; cf. Mooney, Myths of the Cherokee (Uktena)" })
    expect(box.classList.contains('is-hidden')).toBe(false)
    const lis = box.querySelectorAll('.detail-source-list li')
    expect(lis.length).toBe(2)
    expect(lis[1].textContent).toBe('cf. Mooney, Myths of the Cherokee (Uktena)')
  })
})
