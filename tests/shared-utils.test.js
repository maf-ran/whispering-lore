/**
 * @jest-environment jsdom
 */

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
}

require('../js/shared-utils.js')

var safeText = window.__sharedUtils.safeText
var getSlug = window.__sharedUtils.getSlug

describe('safeText', () => {
  it('returns safe text (no HTML injection)', () => {
    expect(safeText('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>')
    expect(safeText('safe text')).toBe('safe text')
    expect(safeText('')).toBe('')
    expect(safeText(null)).toBe('')
    expect(safeText(undefined)).toBe('')
  })

  it('converts non-string inputs to string', () => {
    expect(safeText(42)).toBe('42')
    expect(safeText(true)).toBe('true')
  })
})

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
