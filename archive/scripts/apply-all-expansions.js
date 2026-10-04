const fs = require('fs')
const path = require('path')

const storiesPath = path.join(__dirname, '../../data/datasets/stories.json')
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'))

// Build a slug→index and id→index lookup
const bySlug = {}
const byId = {}
stories.forEach((s, i) => {
  bySlug[s.slug] = i
  if (s.id) byId[s.id] = i
})

const batchFiles = [
  'unknown-cherokee.json',
  'unknown-choctaw-creek-sem-chick-natch.json',
  'unknown-pacific-nw-1.json',
  'unknown-pacific-nw-2.json',
  'unknown-african-american.json',
  'unknown-mexican-latino.json',
  'americas-caribbean-1.json',
  'americas-caribbean-2.json',
  'americas-caribbean-3.json',
  'asia-newroz.json'
]

let totalUpdated = 0
let totalSkipped = 0
const allExpanded = new Set()

batchFiles.forEach(file => {
  const filePath = path.join(__dirname, 'expansions', file)
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${file} not found`)
    return
  }
  const expansions = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let fileUpdated = 0
  let fileSkipped = 0

  Object.entries(expansions).forEach(([key, expandedText]) => {
    const idx = bySlug[key] !== undefined ? bySlug[key] : byId[key]
    if (idx === undefined) {
      console.log(`  WARN: key "${key}" not found in stories.json`)
      fileSkipped++
      return
    }
    const story = stories[idx]
    if (!story.full_text || !story.summary) {
      fileSkipped++
      return
    }
    if (story.full_text.trim() === story.summary.trim()) {
      story.full_text = expandedText
      story.version = (story.version || '1.0.0')
      story.lastUpdated = new Date().toISOString().split('T')[0]
      allExpanded.add(story.slug)
      fileUpdated++
    } else {
      fileSkipped++
    }
  })

  console.log(`${file}: ${fileUpdated} updated, ${fileSkipped} skipped`)
  totalUpdated += fileUpdated
  totalSkipped += fileSkipped
})

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2) + '\n')

console.log(`\n=== TOTAL: ${totalUpdated} updated, ${totalSkipped} skipped ===`)

// Verify remaining
let remaining = 0
stories.forEach(s => {
  if (s.full_text && s.summary && s.full_text.trim() === s.summary.trim()) {
    remaining++
  }
})
console.log(`Stories still identical: ${remaining}`)
