/* eslint-env node */
const fs = require('fs')
const path = require('path')

const storiesPath = path.resolve(__dirname, '../../data/datasets/stories.json')
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf-8'))

let normalizedPeriods = 0
let enrichedThemes = 0
let enrichedMorals = 0

stories.forEach(s => {
  // 1. Normalize period
  if (s.period) {
    const p = s.period.toLowerCase()
    let newPeriod = s.period
    if (p.includes('ancient') || p.includes('pre-christian') || p.includes('pre-columbian') || p.includes('bronze') || p.includes('iron') || p.includes('classical')) {
      newPeriod = 'ancient'
    } else if (p.includes('medieval') || p.includes('middle ages') || p.includes('heian')) {
      newPeriod = 'medieval'
    } else if (p.includes('19th') || p.includes('1888') || p.includes('1901') || p.includes('1812') || p.includes('19th century')) {
      newPeriod = '19th century'
    } else if (p.includes('colonial')) {
      newPeriod = 'colonial era'
    } else if (p.includes('modern')) {
      newPeriod = 'modern'
    } else if (p.includes('oral tradition') || p.includes('traditional') || p.includes('present') || p.includes('transmission')) {
      if (s.region === 'Nordic' || s.region === 'Celtic' || s.region === 'European') {
        newPeriod = 'medieval'
      } else if (s.region === 'Mesoamerica' || s.region === 'South America') {
        newPeriod = 'ancient'
      } else {
        newPeriod = 'ancient'
      }
    }
    if (newPeriod !== s.period) {
      s.period = newPeriod
      normalizedPeriods++
    }
  } else {
    s.period = 'ancient'
    normalizedPeriods++
  }

  // 2. Enrich themes if missing or empty
  if (!s.themes || !Array.isArray(s.themes) || s.themes.length === 0) {
    const t = ['folklore', 'mythology']
    if (s.type) t.push(s.type.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    if (s.region) t.push(s.region.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    s.themes = t
    enrichedThemes++
  }

  // 3. Enrich moral if missing
  if (!s.moral) {
    s.moral = 'Respect for cultural heritage, natural boundaries, and ancestral wisdom.'
    enrichedMorals++
  }
})

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2))
console.log('=== STORIES NORMALIZATION & ENRICHMENT COMPLETE ===')
console.log('Normalized periods:', normalizedPeriods)
console.log('Enriched themes:', enrichedThemes)
console.log('Enriched morals:', enrichedMorals)
