import test from 'node:test'
import assert from 'node:assert/strict'
import { ENTITIES, ENTITY_BY_CODE, ENTITY_BY_LGD } from './data/states.ts'

test('roster is 28 states and 8 union territories', () => {
  assert.equal(ENTITIES.length, 36)
  assert.equal(ENTITIES.filter((e) => e.type === 'state').length, 28)
  assert.equal(ENTITIES.filter((e) => e.type === 'ut').length, 8)
})

test('ISO codes are unique and two uppercase letters', () => {
  const codes = ENTITIES.map((e) => e.code)
  assert.equal(new Set(codes).size, 36)
  for (const code of codes) assert.match(code, /^[A-Z]{2}$/)
})

test('LGD codes are unique positive integers', () => {
  const lgd = ENTITIES.map((e) => e.lgdCode)
  assert.equal(new Set(lgd).size, 36)
  for (const code of lgd) assert.ok(Number.isInteger(code) && code > 0)
})

test('lookups cover every entity', () => {
  assert.equal(ENTITY_BY_CODE.size, 36)
  assert.equal(ENTITY_BY_LGD.size, 36)
  assert.equal(ENTITY_BY_CODE.get('MH')?.capital, 'Mumbai')
  assert.equal(ENTITY_BY_LGD.get(27)?.name, 'Maharashtra')
})

test('every capital is a non-empty string', () => {
  for (const e of ENTITIES) assert.ok(e.capital.length > 0, e.name)
})

import {
  clampScale, findEntity, formatTime, matchesAnswer, normalizeAnswer,
} from './game.ts'

test('normalizes spaces, punctuation, and case', () => {
  assert.equal(normalizeAnswer('  Tamil-Nadu! '), 'tamilnadu')
})

test('normalizes diacritics', () => {
  assert.equal(normalizeAnswer('Rājasthān'), 'rajasthan')
})

test('accepts a capital alias', () => {
  assert.equal(matchesAnswer('Bangalore', 'Bengaluru', ['Bangalore']), true)
  assert.equal(matchesAnswer('Mysore', 'Bengaluru', ['Bangalore']), false)
})

test('accepts winter capitals as alternates', () => {
  assert.equal(matchesAnswer('Nagpur', 'Mumbai', ['Nagpur', 'Bombay']), true)
  assert.equal(matchesAnswer('Jammu', 'Srinagar', ['Jammu']), true)
})

test('finds entities by full name and by renamed alias', () => {
  assert.equal(findEntity('west bengal', ENTITIES)?.code, 'WB')
  assert.equal(findEntity('Orissa', ENTITIES)?.code, 'OD')
})

test('rejects codes as answers', () => {
  assert.equal(findEntity('MH', ENTITIES), undefined)
  assert.equal(findEntity('27', ENTITIES), undefined)
})

test('does not accept a wrong-but-nearby capital', () => {
  const assam = ENTITY_BY_CODE.get('AS')!
  assert.equal(matchesAnswer('Guwahati', assam.capital, assam.capitalAliases), false)
})

test('formats a countdown clock', () => {
  assert.equal(formatTime(125), '02:05')
  assert.equal(formatTime(0), '00:00')
})

test('clamps zoom scale to [1, 12]', () => {
  assert.equal(clampScale(0.2), 1)
  assert.equal(clampScale(1), 1)
  assert.equal(clampScale(6), 6)
  assert.equal(clampScale(12), 12)
  assert.equal(clampScale(40), 12)
})

import topology from './data/india-states.topo.json' with { type: 'json' }

test('every entity joins to exactly one map feature, and vice versa', () => {
  const objectKey = Object.keys(topology.objects)[0]!
  const geometries = (
    topology.objects as unknown as Record<
      string,
      { geometries: { properties: { lgdCode: number } }[] }
    >
  )[objectKey]!.geometries
  const mapCodes = geometries.map((g) => g.properties.lgdCode)

  assert.equal(mapCodes.length, 36, 'map should carry 36 features')
  assert.equal(new Set(mapCodes).size, 36, 'map LGD codes should be unique')

  for (const entity of ENTITIES) {
    assert.ok(mapCodes.includes(entity.lgdCode), `no map feature for ${entity.name}`)
  }
  for (const code of mapCodes) {
    assert.ok(ENTITY_BY_LGD.has(code), `map feature ${code} has no entity`)
  }
})

import { arrangeEntities } from './game.ts'

test('field guide filters by type', () => {
  assert.equal(arrangeEntities(ENTITIES, 'name', 'all').length, 36)
  assert.equal(arrangeEntities(ENTITIES, 'name', 'state').length, 28)
  assert.equal(arrangeEntities(ENTITIES, 'name', 'ut').length, 8)
})

test('field guide sorts without mutating the source', () => {
  const firstBefore = ENTITIES[0]!.code
  arrangeEntities(ENTITIES, 'capital', 'all')
  assert.equal(ENTITIES[0]!.code, firstBefore, 'ENTITIES must not be reordered')
})

test('field guide sort by type groups states before UTs', () => {
  const rows = arrangeEntities(ENTITIES, 'type', 'all')
  assert.equal(rows[0]!.type, 'state')
  assert.equal(rows[35]!.type, 'ut')
  assert.equal(rows.slice(0, 28).every((e) => e.type === 'state'), true)
})

test('field guide sorts by name alphabetically, not character code', () => {
  const rows = arrangeEntities(ENTITIES, 'name', 'all')
  assert.equal(rows[0]!.name, 'Andaman & Nicobar Islands')
  assert.equal(rows[1]!.name, 'Andhra Pradesh')
})

import { drawFromDeck, shuffle } from './game.ts'

/** Deterministic LCG so shuffle tests are reproducible. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

test('shuffle returns a permutation without mutating the input', () => {
  const source = ENTITIES.slice(0, 10)
  const before = source.map((e) => e.code)
  const result = shuffle(source, seeded(1))
  assert.equal(result.length, source.length)
  assert.deepEqual([...result].map((e) => e.code).sort(), [...before].sort())
  assert.deepEqual(source.map((e) => e.code), before, 'input must not be reordered')
})

test('a full deck deals every entity exactly once before repeating', () => {
  const random = seeded(42)
  let deck: readonly (typeof ENTITIES)[number][] = []
  const drawn: string[] = []
  for (let i = 0; i < 36; i++) {
    const result = drawFromDeck(deck, ENTITIES, undefined, random)
    deck = result.deck
    drawn.push(result.entity.code)
  }
  assert.equal(drawn.length, 36)
  assert.equal(new Set(drawn).size, 36, 'all 36 must appear before any repeats')
  assert.equal(deck.length, 0, 'deck should be exhausted')
})

test('the deck refills after being exhausted', () => {
  const random = seeded(7)
  let deck: readonly (typeof ENTITIES)[number][] = []
  let last = ''
  for (let i = 0; i < 36; i++) {
    const result = drawFromDeck(deck, ENTITIES, undefined, random)
    deck = result.deck
    last = result.entity.code
  }
  const after = drawFromDeck(deck, ENTITIES, last as never, random)
  assert.ok(after.entity, 'a 37th draw must still produce an entity')
  assert.equal(after.deck.length, 35, 'a fresh deck should have been dealt')
})

test('a refilled deck does not immediately repeat the previous entity', () => {
  // Force the boundary: empty deck, and whatever the shuffle puts first must
  // not equal previousCode.
  for (let seed = 1; seed <= 40; seed++) {
    const first = drawFromDeck([], ENTITIES, undefined, seeded(seed)).entity.code
    const guarded = drawFromDeck([], ENTITIES, first, seeded(seed)).entity.code
    assert.notEqual(guarded, first, `seed ${seed} repeated across the boundary`)
  }
})
