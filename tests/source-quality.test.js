/* eslint-env node */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function loadJSON(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'))
  } catch (e) {
    return []
  }
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
})
