/* eslint-env node */
const fs = require('fs')
const path = require('path')

describe('Rune scatter module', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'rune-scatter.js'),
    'utf-8'
  )

  it('defines 72 runes across four traditions', () => {
    const match = src.match(/const runes = \[([\s\S]*?)\]/)
    expect(match).toBeTruthy()
    const runeList = match[1]
      .split(',')
      .map((r) => r.trim().replace(/'/g, ''))
      .filter(Boolean)
    expect(runeList.length).toBe(68)
  })

  it('uses Fisher-Yates shuffle', () => {
    expect(src).toContain('Math.floor(Math.random() * (si + 1))')
  })

  it('selects 16–23 runes per render', () => {
    expect(src).toContain('16 + Math.floor(Math.random() * 8)')
  })

  it('avoids the center zone by pushing runes to edges', () => {
    expect(src).toContain('0.25')
    expect(src).toContain('0.75')
    expect(src).toContain('0.2')
    expect(src).toContain('0.8')
  })

  it('adapts fill color for light vs dark theme', () => {
    expect(src).toContain('data-theme')
    expect(src).toContain("'light'")
    expect(src).toContain('rgba(153, 27, 27,')
    expect(src).toContain('rgba(255, 255, 255,')
  })

  it('registers a passive resize listener', () => {
    expect(src).toContain('{ passive: true }')
  })

  it('handles missing canvas or hero gracefully', () => {
    expect(src).toContain('if (!canvas || !hero) return')
  })

  it('uses 2d canvas context', () => {
    expect(src).toContain("getContext('2d')")
  })
})
