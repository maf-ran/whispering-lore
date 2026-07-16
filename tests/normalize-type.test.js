/**
 * @jest-environment jsdom
 */

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
}

require('../js/shared-utils.js')

var normalizeType = window.__sharedUtils.normalizeType
var TYPE_ALIAS_MAP = window.__sharedUtils.TYPE_ALIAS_MAP

describe('normalizeType', () => {
  it('returns "unknown" for empty/null/undefined input', () => {
    expect(normalizeType(null)).toBe('unknown')
    expect(normalizeType(undefined)).toBe('unknown')
    expect(normalizeType('')).toBe('unknown')
  })

  it('passes through canonical types unchanged', () => {
    expect(normalizeType('dragon')).toBe('dragon')
    expect(normalizeType('ghost')).toBe('ghost')
    expect(normalizeType('demon')).toBe('demon')
    expect(normalizeType('fairy')).toBe('fairy')
    expect(normalizeType('vampire')).toBe('vampire')
    expect(normalizeType('spirit')).toBe('spirit')
  })

  it('normalizes dragon aliases', () => {
    expect(normalizeType('wyrm')).toBe('dragon')
    expect(normalizeType('drake')).toBe('dragon')
    expect(normalizeType('wyvern')).toBe('dragon')
    expect(normalizeType('sea-serpent')).toBe('dragon')
    expect(normalizeType('water-dragon')).toBe('dragon')
    expect(normalizeType('sky-dragon')).toBe('dragon')
    expect(normalizeType('dragon-like')).toBe('dragon')
    expect(normalizeType('serpent-dragon')).toBe('dragon')
  })

  it('normalizes ghost aliases', () => {
    expect(normalizeType('phantom')).toBe('ghost')
    expect(normalizeType('spectre')).toBe('ghost')
    expect(normalizeType('wraith')).toBe('ghost')
    expect(normalizeType('spirit-ghost')).toBe('ghost')
  })

  it('normalizes demon aliases', () => {
    expect(normalizeType('devil')).toBe('demon')
    expect(normalizeType('fiend')).toBe('demon')
    expect(normalizeType('evil-spirit')).toBe('demon')
  })

  it('normalizes monster aliases', () => {
    expect(normalizeType('beast')).toBe('monster')
    expect(normalizeType('leviathan')).toBe('monster')
    expect(normalizeType('chimera')).toBe('monster')
  })

  it('normalizes goblin aliases', () => {
    expect(normalizeType('hobgoblin')).toBe('goblin')
    expect(normalizeType('imp')).toBe('goblin')
  })

  it('normalizes fairy aliases', () => {
    expect(normalizeType('faerie')).toBe('fairy')
    expect(normalizeType('fae')).toBe('fairy')
    expect(normalizeType('elf')).toBe('fairy')
    expect(normalizeType('pixie')).toBe('fairy')
    expect(normalizeType('sprite')).toBe('fairy')
  })

  it('normalizes undead aliases', () => {
    expect(normalizeType('zombie')).toBe('undead')
    expect(normalizeType('skeleton')).toBe('undead')
    expect(normalizeType('lich')).toBe('undead')
  })

  it('normalizes vampire aliases', () => {
    expect(normalizeType('vampiric-entity')).toBe('vampire')
  })

  it('normalizes werewolf aliases', () => {
    expect(normalizeType('lycanthrope')).toBe('werewolf')
    expect(normalizeType('wolfman')).toBe('werewolf')
  })

  it('normalizes shapeshifter aliases', () => {
    expect(normalizeType('shape-shifter')).toBe('shapeshifter')
    expect(normalizeType('transformer')).toBe('shapeshifter')
  })

  it('normalizes giant aliases', () => {
    expect(normalizeType('ogre')).toBe('giant')
    expect(normalizeType('ettin')).toBe('giant')
    expect(normalizeType('jotunn')).toBe('giant')
    expect(normalizeType('cyclops')).toBe('giant')
  })

  it('normalizes water-horse aliases', () => {
    expect(normalizeType('kelpie')).toBe('water-horse')
    expect(normalizeType('each-uisge')).toBe('water-horse')
  })

  it('normalizes water-spirit aliases', () => {
    expect(normalizeType('merperson')).toBe('water-spirit')
    expect(normalizeType('mermaid')).toBe('water-spirit')
    expect(normalizeType('merman')).toBe('water-spirit')
    expect(normalizeType('siren')).toBe('water-spirit')
    expect(normalizeType('nymph')).toBe('water-spirit')
    expect(normalizeType('naiad')).toBe('water-spirit')
    expect(normalizeType('undine')).toBe('water-spirit')
  })

  it('normalizes nature-spirit aliases', () => {
    expect(normalizeType('forest-spirit')).toBe('nature-spirit')
    expect(normalizeType('wood-spirit')).toBe('nature-spirit')
    expect(normalizeType('tree-spirit')).toBe('nature-spirit')
    expect(normalizeType('dryad')).toBe('nature-spirit')
  })

  it('normalizes household-spirit aliases', () => {
    expect(normalizeType('domovoi')).toBe('household-spirit')
    expect(normalizeType('brownie')).toBe('household-spirit')
    expect(normalizeType('hob')).toBe('household-spirit')
  })

  it('normalizes ancestor-spirit aliases', () => {
    expect(normalizeType('ancestor')).toBe('ancestor-spirit')
  })

  it('normalizes animal-spirit aliases', () => {
    expect(normalizeType('totem')).toBe('animal-spirit')
  })

  it('normalizes guardian aliases', () => {
    expect(normalizeType('guardian-spirit')).toBe('guardian')
    expect(normalizeType('protector')).toBe('guardian')
  })

  it('normalizes deity aliases', () => {
    expect(normalizeType('god')).toBe('deity')
    expect(normalizeType('goddess')).toBe('deity')
    expect(normalizeType('lesser-god')).toBe('deity')
  })

  it('normalizes trickster aliases', () => {
    expect(normalizeType('culture-hero')).toBe('trickster')
  })

  it('normalizes elemental aliases', () => {
    expect(normalizeType('air-elemental')).toBe('elemental')
    expect(normalizeType('fire-elemental')).toBe('elemental')
    expect(normalizeType('water-elemental')).toBe('elemental')
    expect(normalizeType('earth-elemental')).toBe('elemental')
  })

  it('is case-insensitive', () => {
    expect(normalizeType('Dragon')).toBe('dragon')
    expect(normalizeType('WYVERN')).toBe('dragon')
    expect(normalizeType('Kelpie')).toBe('water-horse')
    expect(normalizeType(' VAMPIRE ')).toBe('vampire')
  })

  it('passes through unknown types as-is', () => {
    expect(normalizeType('custom-type')).toBe('custom-type')
    expect(normalizeType('rare')).toBe('rare')
  })

  it('TYPE_ALIAS_MAP has 70+ entries', () => {
    expect(Object.keys(TYPE_ALIAS_MAP).length).toBeGreaterThan(70)
  })
})
