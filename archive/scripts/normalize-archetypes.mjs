#!/usr/bin/env node
/**
 * normalize-archetypes.mjs
 *
 * Maps 539 unique archetype values to ~30 canonical types.
 * Strategy: keyword-based matching with priority ordering.
 * Dry-run by default; pass --write to mutate data/datasets/creatures.json.
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const CREATURES_PATH = join(ROOT, 'data', 'datasets', 'creatures.json')
const WRITE = process.argv.includes('--write')

// Canonical archetype types — keep this list stable
const CANONICAL = new Set([
  'forest-spirit', 'water-spirit', 'shapeshifter', 'demonic-entity', 'spirit',
  'vampiric-entity', 'trickster', 'guardian', 'nature-spirit', 'culture-hero',
  'ruler', 'monster', 'creator-god', 'guardian-spirit', 'demon', 'deity',
  'epic-hero', 'giant', 'witch', 'fertility-deity', 'water-dragon',
  'supreme-being', 'thunder-spirit', 'sky-god', 'hero', 'rainbow-serpent',
  'mother-goddess', 'celestial', 'trickster-creator', 'warrior-hero',
  'sea-spirit', 'earth-goddess', 'death-deity', 'ogre', 'hidden-people',
  'vampire', 'sea-god', 'ancestral-spirit', 'kachina-spirit', 'creator-deity',
  'cannibal-demon', 'creation-spirit', 'seducer', 'sun-god', 'sky-father',
  'weather-deity', 'familiar', 'thunderbird', 'war-god', 'sea-monster',
  'winged-steed', 'magical-steed', 'chaos-monster', 'psychopomp',
  'trickster-spirit', 'primordial-spirit', 'ghost', 'dragon-serpent',
  'adversary', 'ogress', 'storm-spirit', 'earth-diver', 'hunter-spirit',
  'world-bearer', 'femme-fatale', 'beast-man', 'benevolent-spirit',
  'animal-spirit', 'sacred-animal', 'wild-man', 'omen', 'judge',
  'spirit-guide', 'warrior-god', 'celestial-spirit', 'agriculture-spirit',
  'child-stealing-demon', 'monstrous-entity', 'dark-matriarch', 'desert-spirit',
  'creation-being', 'death-spirit', 'primordial-deity', 'weather-spirit',
  'serpent', 'cultural-hero', 'creator-trickster', 'earth-god',
  'apex-predator', 'spirit-being', 'wise-woman', 'spirit-entity',
  'ceremonial-object', 'cryptid', 'dragon', 'prophet', 'trickster-animal',
  'man-eating-giant', 'fertility-spirit', 'outlaw', 'guardian-serpent',
  'warrior-goddess', 'guide', 'death-goddess', 'trickster-hero',
  'wandering-spirit', 'warrior-deity', 'ancestor-spirit', 'bogeyman',
  'restless-spirit', 'revenant', 'magic-user', 'household-spirit',
  'conjurer', 'celestial-beast', 'protective-spirit', 'weather-shaman',
  'warrior', 'household-guardian', 'medicine-spirit', 'sun-goddess',
  'serpent-king', 'heroic-figure', 'water-demon'
])

// Keyword → canonical mapping (checked in order; first match wins)
const RULES = [
  // --- trickster variants ---
  [/trickster/i, 'trickster'],
  [/hare/i, 'trickster'],
  [/mischief/i, 'trickster'],
  [/spider.*creat/i, 'trickster-creator'],

  // --- water/aquatic ---
  [/water.?spirit/i, 'water-spirit'],
  [/water.*guardian/i, 'water-spirit'],
  [/water.*dwarf/i, 'water-spirit'],
  [/water.*mermaid/i, 'water-spirit'],
  [/water.*djinn/i, 'water-spirit'],
  [/water.*dweller/i, 'water-spirit'],
  [/lake.*spirit/i, 'water-spirit'],
  [/sea.*spirit/i, 'sea-spirit'],
  [/sea.*god/i, 'sea-god'],
  [/sea.*deity/i, 'sea-god'],
  [/sea.*serpent/i, 'water-dragon'],
  [/sea.*monster/i, 'sea-monster'],
  [/ocean.*terror/i, 'sea-monster'],
  [/ocean.*lord/i, 'sea-god'],
  [/sea.*demon/i, 'water-demon'],
  [/siren/i, 'water-spirit'],
  [/mermaid/i, 'water-spirit'],
  [/rainbow.*serpent/i, 'rainbow-serpent'],
  [/tide.*spirit/i, 'water-spirit'],
  [/water.*dragon/i, 'water-dragon'],
  [/water.*demon/i, 'water-demon'],
  [/water.*spirit/i, 'water-spirit'],

  // --- forest/nature ---
  [/forest.*spirit/i, 'forest-spirit'],
  [/forest.*god/i, 'forest-spirit'],
  [/forest.*king/i, 'forest-spirit'],
  [/forest.*imp/i, 'forest-spirit'],
  [/nature.*spirit/i, 'nature-spirit'],
  [/nature.*fairy/i, 'nature-spirit'],
  [/nature.*guardian/i, 'nature-spirit'],
  [/swamp.*spirit/i, 'nature-spirit'],
  [/mountain.*spirit/i, 'nature-spirit'],
  [/mountain.*god/i, 'nature-spirit'],
  [/mountain.*guardian/i, 'nature-spirit'],
  [/desert.*spirit/i, 'desert-spirit'],
  [/desert.*cannibal/i, 'desert-spirit'],
  [/land.*guardian/i, 'guardian'],
  [/earth.*giant/i, 'giant'],
  [/earth.*mother/i, 'earth-goddess'],
  [/earth.*goddess/i, 'earth-goddess'],
  [/earth.*god/i, 'earth-goddess'],
  [/earth.*shaker/i, 'giant'],
  [/earth.*diver/i, 'earth-diver'],

  // --- celestial/sky ---
  [/sky.*god/i, 'sky-god'],
  [/sky.*father/i, 'sky-father'],
  [/sky.*maiden/i, 'celestial'],
  [/sky.*being/i, 'celestial'],
  [/sky.*goddess/i, 'sky-god'],
  [/sky.*deity/i, 'sky-god'],
  [/celestial/i, 'celestial'],
  [/sun.*god/i, 'sun-god'],
  [/solar.*spirit/i, 'sun-god'],
  [/moon.*goddess/i, 'celestial'],
  [/moon.*god/i, 'celestial'],
  [/moon.*bride/i, 'celestial'],
  [/lunar.*spirit/i, 'celestial'],
  [/dawn.*deity/i, 'celestial'],
  [/dawn.*goddess/i, 'celestial'],
  [/heavenly.*nymph/i, 'celestial'],

  // --- death/underworld ---
  [/death.*deity/i, 'death-deity'],
  [/death.*goddess/i, 'death-deity'],
  [/death.*god/i, 'death-deity'],
  [/death.*spirit/i, 'death-spirit'],
  [/death.*bringer/i, 'death-deity'],
  [/death.*demon/i, 'death-deity'],
  [/underworld.*god/i, 'death-deity'],
  [/underworld/i, 'death-deity'],
  [/netherworld/i, 'death-deity'],
  [/afterlife/i, 'death-deity'],
  [/psychopomp/i, 'psychopomp'],
  [/revenant/i, 'revenant'],
  [/undead/i, 'revenant'],
  [/ghost/i, 'ghost'],
  [/haunting/i, 'ghost'],
  [/poltergeist/i, 'ghost'],
  [/restless.*soul/i, 'ghost'],
  [/restless.*spirit/i, 'ghost'],
  [/wandering.*soul/i, 'ghost'],
  [/wandering.*spirit/i, 'ghost'],
  [/unquiet.*dead/i, 'ghost'],
  [/lost.*soul/i, 'ghost'],

  // --- demonic/evil ---
  [/demonic/i, 'demonic-entity'],
  [/demon/i, 'demon'],
  [/devil/i, 'demon'],
  [/evil.*spirit/i, 'demonic-entity'],
  [/evil.*deity/i, 'demonic-entity'],
  [/malevolent/i, 'demonic-entity'],
  [/cannibal.*demon/i, 'cannibal-demon'],
  [/cannibal.*spirit/i, 'cannibal-demon'],
  [/cannibal.*giant/i, 'cannibal-demon'],
  [/cannibal.*dwarf/i, 'cannibal-demon'],
  [/cannibal.*bird/i, 'cannibal-demon'],
  [/man.eating.*giant/i, 'cannibal-demon'],
  [/man.eating.*beast/i, 'monster'],
  [/child.*steal/i, 'demonic-entity'],
  [/child.*scarer/i, 'demonic-entity'],
  [/child.*devour/i, 'demonic-entity'],
  [/bogeyman/i, 'demonic-entity'],
  [/night.*terror/i, 'demonic-entity'],
  [/night.*visitor/i, 'demonic-entity'],
  [/night.*hunter/i, 'demonic-entity'],
  [/night.*demon/i, 'demonic-entity'],
  [/shadow.*hunter/i, 'demonic-entity'],
  [/shadow.*demon/i, 'demonic-entity'],
  [/vengeful.*spirit/i, 'demonic-entity'],
  [/jealous.*spirit/i, 'demonic-entity'],
  [/wrathful.*spirit/i, 'demonic-entity'],
  [/wrathful/i, 'demonic-entity'],
  [/punishing/i, 'demonic-entity'],
  [/cursing/i, 'demonic-entity'],

  // --- shapeshifter ---
  [/shapeshift/i, 'shapeshifter'],
  [/shape.?shift/i, 'shapeshifter'],
  [/were.?/i, 'shapeshifter'],
  [/lycanthrope/i, 'shapeshifter'],
  [/transformed/i, 'shapeshifter'],

  // --- vampire/undead ---
  [/vampir/i, 'vampiric-entity'],
  [/vampire/i, 'vampire'],

  // --- monster/beast ---
  [/monstrous/i, 'monster'],
  [/monster/i, 'monster'],
  [/leviathan/i, 'monster'],
  [/dragon.*serpent/i, 'dragon-serpent'],
  [/dragon/i, 'dragon'],
  [/serpent.*king/i, 'serpent'],
  [/serpent/i, 'serpent'],
  [/cosmic.*serpent/i, 'dragon-serpent'],
  [/chaos.*monster/i, 'chaos-monster'],
  [/chaos.*serpent/i, 'chaos-monster'],
  [/primordial.*beast/i, 'monster'],
  [/primordial.*monster/i, 'monster'],
  [/glutton/i, 'monster'],
  [/apex.*predator/i, 'apex-predator'],
  [/predator/i, 'monster'],
  [/beast/i, 'monster'],
  [/ogre/i, 'ogre'],
  [/hag/i, 'witch'],
  [/cryptid/i, 'cryptid'],

  // --- guardian ---
  [/guardian.*spirit/i, 'guardian-spirit'],
  [/guardian.*serpent/i, 'guardian-serpent'],
  [/guardian.*dragon/i, 'guardian'],
  [/guardian.*bird/i, 'guardian'],
  [/guardian.*deit/i, 'guardian'],
  [/guardian.*animal/i, 'guardian'],
  [/guardian/i, 'guardian'],
  [/protector/i, 'guardian'],
  [/protective.*spirit/i, 'guardian'],
  [/tutelary/i, 'guardian'],
  [/sacred.*guardian/i, 'guardian'],
  [/household.*guardian/i, 'guardian'],
  [/household.*spirit/i, 'guardian'],
  [/guardian/i, 'guardian'],

  // --- creator/creation ---
  [/creator.*god/i, 'creator-god'],
  [/creator.*deity/i, 'creator-deity'],
  [/creator.*trickster/i, 'trickster-creator'],
  [/creator.*messeng/i, 'creator-god'],
  [/spider.*creat/i, 'trickster-creator'],
  [/creation.*spirit/i, 'creation-spirit'],
  [/creation.*deity/i, 'creator-deity'],
  [/creation.*being/i, 'creation-spirit'],
  [/creation.*beast/i, 'monster'],
  [/supreme.*being/i, 'supreme-being'],
  [/high.*god/i, 'supreme-being'],
  [/sun.*god.*supreme/i, 'supreme-being'],

  // --- deity/god ---
  [/fertility.*deity/i, 'fertility-deity'],
  [/fertility.*god/i, 'fertility-deity'],
  [/fertility.*goddess/i, 'fertility-deity'],
  [/fertility.*spirit/i, 'fertility-deity'],
  [/agriculture/i, 'fertility-deity'],
  [/weather.*deity/i, 'weather-deity'],
  [/weather.*god/i, 'weather-deity'],
  [/weather.*spirit/i, 'weather-spirit'],
  [/weather.*shaman/i, 'weather-spirit'],
  [/thunder.*spirit/i, 'thunder-spirit'],
  [/thunder.*deity/i, 'thunder-spirit'],
  [/storm.*god/i, 'storm-spirit'],
  [/storm.*spirit/i, 'storm-spirit'],
  [/war.*god/i, 'war-god'],
  [/war.*deity/i, 'war-god'],
  [/war.*deity/i, 'war-god'],
  [/warrior.*god/i, 'war-god'],
  [/warrior.*deity/i, 'war-god'],
  [/warrior.*goddess/i, 'warrior-goddess'],
  [/warrior.*queen/i, 'ruler'],
  [/warrior.*hero/i, 'warrior-hero'],
  [/warrior.*poet/i, 'epic-hero'],
  [/warrior/i, 'warrior'],
  [/mother.*goddess/i, 'mother-goddess'],
  [/first.*woman/i, 'mother-goddess'],
  [/earth.*mother/i, 'earth-goddess'],
  [/sky.*mother/i, 'mother-goddess'],
  [/moon.*goddess/i, 'celestial'],
  [/love.*deity/i, 'deity'],
  [/wisdom.*deity/i, 'deity'],
  [/law.*enforcer/i, 'deity'],
  [/divine.*law/i, 'deity'],
  [/judge.*deity/i, 'judge'],
  [/judge/i, 'judge'],
  [/goddess/i, 'deity'],
  [/god$/i, 'deity'],
  [/deity/i, 'deity'],

  // --- spirit (general catch-all) ---
  [/ancestral.*spirit/i, 'ancestral-spirit'],
  [/ancestor.*spirit/i, 'ancestral-spirit'],
  [/spirit.*guide/i, 'spirit-guide'],
  [/spirit.*beings/i, 'spirit'],
  [/spirit.*society/i, 'spirit'],
  [/spirit.*animals/i, 'animal-spirit'],
  [/spirit.*possession/i, 'spirit'],
  [/spirit.*queen/i, 'spirit'],
  [/spirit/i, 'spirit'],
  [/fairy/i, 'spirit'],
  [/sorcery.*spirit/i, 'spirit'],
  [/disease.*spirit/i, 'spirit'],
  [/possession.*spirit/i, 'spirit'],

  // --- hero/culture ---
  [/culture.*hero/i, 'culture-hero'],
  [/cultural.*hero/i, 'culture-hero'],
  [/epic.*hero/i, 'epic-hero'],
  [/epic.*king/i, 'epic-hero'],
  [/hero.*mother/i, 'hero'],
  [/heroic/i, 'hero'],
  [/heroine/i, 'hero'],
  [/hero/i, 'hero'],
  [/savior/i, 'hero'],
  [/folk.*hero/i, 'hero'],

  // --- ruler ---
  [/ruler/i, 'ruler'],
  [/king/i, 'ruler'],
  [/queen/i, 'ruler'],
  [/chief/i, 'ruler'],
  [/divine.*ruler/i, 'ruler'],
  [/sorcerer.*king/i, 'ruler'],
  [/emperor/i, 'ruler'],
  [/princess/i, 'ruler'],
  [/matriarch/i, 'ruler'],

  // --- seducer/femme ---
  [/seductress/i, 'seducer'],
  [/femme.*fatale/i, 'seducer'],
  [/seducer/i, 'seducer'],
  [/temptress/i, 'seducer'],

  // --- witch ---
  [/witch/i, 'witch'],

  // --- giant ---
  [/giant/i, 'giant'],

  // --- guide/prophet ---
  [/prophet/i, 'prophet'],
  [/guide/i, 'guide'],
  [/counselor/i, 'guide'],
  [/intermediary/i, 'guide'],

  // --- hidden ---
  [/hidden.*people/i, 'hidden-people'],
  [/hidden.*dweller/i, 'hidden-people'],
  [/hidden.*entity/i, 'hidden-people'],

  // --- animal ---
  [/animal.*spirit/i, 'animal-spirit'],
  [/totem.*animal/i, 'animal-spirit'],
  [/totem.*spirit/i, 'animal-spirit'],
  [/sacred.*animal/i, 'sacred-animal'],
  [/magical.*animal/i, 'sacred-animal'],
  [/mythical.*animal/i, 'sacred-animal'],
  [/mythical.*bird/i, 'sacred-animal'],
  [/mythical.*reptile/i, 'sacred-animal'],
  [/mythical.*herbivore/i, 'sacred-animal'],
  [/bird.*spirit/i, 'animal-spirit'],
  [/owl.*spirit/i, 'animal-spirit'],
  [/horse.*spirit/i, 'animal-spirit'],
  [/guardian.*animal/i, 'guardian'],
  [/she.wolf/i, 'animal-spirit'],
  [/birdman/i, 'animal-spirit'],
  [/cannibal.*bird/i, 'cannibal-demon'],

  // --- warrior/hero ---
  [/rebel.*warrior/i, 'warrior'],
  [/legendary.*warrior/i, 'warrior'],
  [/legendary.*queen/i, 'ruler'],

  // --- steed ---
  [/winged.*steed/i, 'magical-steed'],
  [/magical.*steed/i, 'magical-steed'],

  // --- wisdom ---
  [/wise.*woman/i, 'deity'],
  [/wise.*figure/i, 'deity'],
  [/sage/i, 'deity'],

  // --- outlaw ---
  [/outlaw/i, 'outlaw'],

  // --- magic ---
  [/magic.*user/i, 'deity'],
  [/magician/i, 'deity'],
  [/enchant/i, 'deity'],
  [/shaman/i, 'deity'],
  [/conjurer/i, 'deity'],

  // --- cycle/omen ---
  [/cycle/i, 'deity'],
  [/omen/i, 'omen'],

  // --- wild ---
  [/wild.*man/i, 'wild-man'],

  // --- specific compound patterns ---
  [/dying.*rising/i, 'deity'],
  [/swan.*maiden/i, 'shapeshifter'],

  // --- creature-based catch-alls ---
  [/shadow/i, 'demonic-entity'],
  [/threshold.*spirit/i, 'guardian'],
  [/threshold/i, 'guardian'],
  [/creator/i, 'creator-god'],
  [/primordial.*mother/i, 'mother-goddess'],
  [/wisdom.*figure/i, 'deity'],
  [/tragic.*figure/i, 'hero'],
  [/tragic.*hero/i, 'hero'],
  [/tragic.*princess/i, 'ruler'],
  [/tragic.*outcast/i, 'hero'],
  [/tragic.*maiden/i, 'hero'],
  [/first.*man/i, 'culture-hero'],
  [/first.*woman/i, 'mother-goddess'],
  [/water.*demon/i, 'demon'],
  [/construct/i, 'monster'],
  [/escaped.*victim/i, 'hero'],
  [/benefactor/i, 'guide'],
  [/two.faced/i, 'shapeshifter'],
  [/bringer.*plague/i, 'demonic-entity'],
  [/mount$/i, 'magical-steed'],
  [/eternal.*wanderer/i, 'hero'],
  [/pure.*maiden/i, 'hero'],
  [/primordial.*woman/i, 'mother-goddess'],
  [/unfilial.*son/i, 'hero'],
  [/reckless.*wanderer/i, 'hero'],
  [/lazy.*companion/i, 'trickster'],
  [/provider/i, 'guide'],
  [/divinely.*inspired/i, 'culture-hero'],
  [/blessed.*saint/i, 'culture-hero'],
  [/primordial.*shepherd/i, 'culture-hero'],
  [/strongman/i, 'warrior'],
  [/earth.*shaper/i, 'culture-hero'],
  [/primordial.*being/i, 'supreme-being'],
  [/servant/i, 'guide'],
  [/djinn/i, 'demonic-entity'],
  [/jinn/i, 'demonic-entity'],
  [/restless.*ancestor/i, 'ancestral-spirit'],
  [/dark.*elf/i, 'demonic-entity'],
  [/oracle/i, 'deity'],
  [/sea.*mother/i, 'water-spirit'],
  [/helper/i, 'guide'],
  [/sacred.*object/i, 'ceremonial-object'],
  [/royal.*regalia/i, 'ceremonial-object'],
  [/gatekeeper/i, 'guardian'],
  [/arrogant.*youth/i, 'hero'],
  [/punisher/i, 'deity'],
  [/charm/i, 'ceremonial-object'],
  [/steward/i, 'guardian'],
  [/eternal.*smith/i, 'culture-hero'],
  [/magical.*bird/i, 'sacred-animal'],
  [/headless.*horseman/i, 'demonic-entity'],
  [/sacrificial/i, 'deity'],
  [/master.*smith/i, 'culture-hero'],
  [/dwarf.*goblin/i, 'monster'],
  [/healer/i, 'deity'],
  [/national.*symbol/i, 'culture-hero'],
  [/wanderer/i, 'hero'],
  [/master.*craftsman/i, 'culture-hero'],
  [/legendary.*snake/i, 'serpent'],
  [/cosmic.*prey/i, 'monster'],
  [/otherworldly.*maiden/i, 'celestial'],
  [/antagonist/i, 'adversary'],
  [/cautionary/i, 'omen'],
  [/half.human/i, 'shapeshifter'],
  [/grandmother.*figure/i, 'deity'],
  [/soul.*eater/i, 'demonic-entity'],
  [/messenger/i, 'guide'],
  [/victim/i, 'hero'],
  [/world.*tree/i, 'culture-hero'],
  [/sacred.*being/i, 'spirit'],
  [/dragon/i, 'dragon'],
  [/serpent/i, 'serpent'],

  // --- anything left with "spirit" ---
  [/spirit/i, 'spirit'],

  // --- anything with god/goddess ---
  [/goddess/i, 'deity'],
  [/god/i, 'deity'],
]

// Normalize a single archetype string
function normalizeArchetype(raw) {
  if (!raw || !raw.trim()) return 'spirit'

  const trimmed = raw.trim()

  // If already canonical, return as-is
  if (CANONICAL.has(trimmed)) return trimmed

  // Try each rule
  for (const [pattern, canonical] of RULES) {
    if (pattern.test(trimmed)) return canonical
  }

  // Default: lowercase and hyphenate, but keep as custom
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // If the slug happens to be canonical, use it
  if (CANONICAL.has(slug)) return slug

  // Otherwise return the slug (will show up as non-canonical in report)
  return slug
}

// Main
const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'))

const before = {}
const after = {}
let changed = 0

creatures.forEach((c) => {
  const orig = c.archetype || 'MISSING'
  before[orig] = (before[orig] || 0) + 1

  const normalized = normalizeArchetype(orig)
  after[normalized] = (after[normalized] || 0) + 1

  if (orig !== normalized) {
    changed++
    if (WRITE) {
      c.archetype = normalized
    }
  }
})

// Report
const beforeCount = Object.keys(before).length
const afterCount = Object.keys(after).length

console.log(`\n=== Archetype Normalization Report ===`)
console.log(`Creatures: ${creatures.length}`)
console.log(`Before: ${beforeCount} unique archetypes`)
console.log(`After:  ${afterCount} unique archetypes`)
console.log(`Changed: ${changed} creatures`)
console.log()

// Show non-canonical remnants
const nonCanonical = Object.keys(after)
  .filter((a) => !CANONICAL.has(a))
  .sort((a, b) => after[b] - after[a])

if (nonCanonical.length > 0) {
  console.log(`⚠ ${nonCanonical.length} non-canonical archetypes remain:`)
  nonCanonical.forEach((a) => console.log(`  ${after[a]}x "${a}"`))
  console.log()
}

// Show top 25 after
console.log('Top 25 after normalization:')
Object.entries(after)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)
  .forEach(([a, n]) => console.log(`  ${n}x "${a}"`))

if (WRITE) {
  writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n')
  console.log(`\n✓ Written to ${CREATURES_PATH}`)
} else {
  console.log(`\n(Dry run — pass --write to apply)`)
}
