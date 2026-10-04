/* eslint-env node */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function loadJSON(relPath) {
  // Fail loud: returning [] on a parse error made every assertion below pass
  // vacuously against an unreadable or truncated dataset.
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'))
}

describe('Source Quality Audit & Enforcement', () => {
  const allowedQualities = ['academic', 'documented', 'expert', 'fair', 'good', 'high', 'low', 'medium', 'poor', 'primary', 'researched', 'verified', 'well-documented', 'unknown']

  it('all items have valid source quality', () => {
    const items = loadJSON('data/items.json')
    items.forEach(item => {
      expect(allowedQualities).toContain(item.source_quality)
    })
  })

  it('all dataset creatures have valid source quality', () => {
    const creatures = loadJSON('data/datasets/creatures.json')
    creatures.forEach(c => {
      expect(allowedQualities).toContain(c.source_quality || 'unknown')
    })
  })

  it('all dataset stories have valid source quality', () => {
    const stories = loadJSON('data/datasets/stories.json')
    stories.forEach(s => {
      expect(allowedQualities).toContain(s.source_quality || 'unknown')
    })
  })

  // The description-research pass records its verdict in the entry text. Those
  // flags must agree with source_quality, or unattested entries ship as "fair".
  it('self-declared unattested entries are flagged unknown and unattested', () => {
    const creatures = loadJSON('data/datasets/creatures.json')
    const drifted = creatures.filter(c => {
      const selfDeclared =
        String(c.source || '').startsWith('No verifiable source') ||
        String(c.description || '').startsWith('Not independently attested')
      return selfDeclared && (c.source_quality !== 'unknown' || c.attested !== false)
    })
    expect(drifted.map(c => c.slug)).toEqual([])
  })
})

// Citation trust. A source field holding nothing but a link to a content farm,
// marketing site or personal blog cannot support a claim of scholarly rigour.
// Trusted sources are rewritten as "Label: url" by archive/scripts/fix-story-sources.js,
// so any source still starting with a bare URL is either Wikipedia or unscholarastic.
describe('Story citation trust', () => {
  const stories = loadJSON('data/datasets/stories.json')
  const atLeastFair = ['academic', 'documented', 'expert', 'fair', 'good', 'high', 'medium', 'primary', 'researched', 'verified', 'well-documented']

  it('non-scholarly bare-URL sources are flagged unknown', () => {
    const overstated = stories.filter(s => {
      const src = String(s.source || '')
      if (!src.includes('(non-scholarly)')) return false
      return atLeastFair.includes(s.source_quality)
    })
    expect(overstated.map(s => s.slug)).toEqual([])
  })

  it('bare-URL sources are Wikipedia only, and rated no better than fair', () => {
    const bad = stories
      .filter(s => String(s.source || '').startsWith('http'))
      .filter(s => {
        const isWikipedia = String(s.source).includes('en.wikipedia.org')
        const ratedTooHigh = !['fair', 'unknown', 'poor', 'low'].includes(s.source_quality)
        return !isWikipedia || ratedTooHigh
      })
    expect(bad.map(s => `${s.slug} :: ${s.source_quality}`)).toEqual([])
  })
})
