/* eslint-env node */
const fs = require('fs')
const path = require('path')

const storiesPath = path.resolve(__dirname, '../../data/datasets/stories.json')
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf-8'))

const missingThemes = stories.filter(s => !s.themes || s.themes.length === 0)
const missingMoral = stories.filter(s => !s.moral)
const transmissionPeriod = stories.filter(s => s.period && (s.period.toLowerCase().includes('tradition') || s.period.toLowerCase().includes('oral') || s.period.toLowerCase().includes('present')))

console.log('=== STORIES METADATA AUDIT ===')
console.log('Total stories:', stories.length)
console.log('Missing themes:', missingThemes.length)
console.log('Missing moral:', missingMoral.length)
console.log('Transmission/non-historical period tags:', transmissionPeriod.length)

fs.writeFileSync(path.resolve(__dirname, 'story-audit-report.json'), JSON.stringify({
  total: stories.length,
  missingThemes: missingThemes.map(s => s.slug),
  missingMoral: missingMoral.map(s => s.slug),
  transmissionPeriod: transmissionPeriod.map(s => ({ slug: s.slug, period: s.period }))
}, null, 2))
console.log('Audit report written to archive/scripts/story-audit-report.json')
