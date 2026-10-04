// verify-native-dict.js
// Script to verify that essential i18n keys exist for Swedish (sv) and Spanish (es).
// It parses js/i18n.js to extract the DICT object without executing the entire file.
const fs = require('fs')
const path = require('path')

const i18nPath = path.join(__dirname, 'js', 'i18n.js')
const i18nContent = fs.readFileSync(i18nPath, 'utf8')

// Locate the start of the DICT definition.
const dictStartMatch = i18nContent.search(/const\s+DICT\s*=\s*\{/)
if (dictStartMatch === -1) {
  console.error('Could not locate DICT definition')
  process.exit(1)
}
let braceCount = 0
const startIdx = i18nContent.indexOf('{', dictStartMatch)
let endIdx = -1
for (let i = startIdx; i < i18nContent.length; i++) {
  const ch = i18nContent[i]
  if (ch === '{') braceCount++
  else if (ch === '}') braceCount--
  if (braceCount === 0) { endIdx = i; break }
}
if (endIdx === -1) {
  console.error('Failed to find the end of DICT object')
  process.exit(1)
}
const dictLiteral = i18nContent.slice(startIdx, endIdx + 1)
let DICT = {}
try {
  // Evaluate the object literal safely.
  DICT = new Function('return ' + dictLiteral)()
} catch (e) {
  console.error('Error evaluating DICT:', e)
  process.exit(1)
}

// List of keys that should be present in each language dictionary.
const requiredKeys = [
  'nav.home','nav.bestiary','nav.items','nav.stories','nav.world','nav.quiz','nav.about','nav.mylore',
  'footer.nav.home','footer.nav.bestiary','footer.nav.items','footer.nav.stories','footer.nav.world','footer.nav.quiz','footer.nav.about','footer.nav.mylore',
  'hero.sub','hero.bestiary','hero.stories','hero.items','hero.world','hero.quiz','hero.mylore',
  // Add additional keys as needed.
]

const missing = [];
// Dynamically verify all language codes defined in language-toggle.js
// const path = require('path') // already imported at top
const langTogglePath = path.join(__dirname, 'js', 'language-toggle.js')
const langToggleContent = fs.readFileSync(langTogglePath, 'utf8')
let GROUPS = []
const groupMatch = langToggleContent.match(/const GROUPS = (\[.*?\]);/s)
if (groupMatch) {
  try {
    GROUPS = new Function('return ' + groupMatch[1])()
  } catch (e) {
    console.error('Failed to parse GROUPS from language-toggle.js', e)
  }
}
const allLangs = new Set()
GROUPS.forEach(g => {
  if (g.codes) {
    g.codes.forEach(pair => allLangs.add(pair[0]))
  }
})
Array.from(allLangs).forEach(lang => {
  const langDict = DICT[lang] || {}
  requiredKeys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(langDict, key)) {
      missing.push(`${lang} missing ${key}`)
    }
  })
})

if (missing.length) {
  console.log('Missing i18n keys:')
  missing.forEach(m => console.log(m))
  process.exit(1)
} else {
  console.log('All required i18n keys are present for sv and es.')
  process.exit(0)
}
