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
