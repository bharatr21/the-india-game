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
  clampScale, findEntity, formatTime, matchesAnswer, normalizeAnswer, pickRandom,
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

test('avoids immediately repeating an entity', () => {
  const picked = pickRandom(ENTITIES.slice(0, 2), 'AP', () => 0)
  assert.equal(picked.code, 'AR')
})

test('picks the only entity when the pool has one', () => {
  const picked = pickRandom(ENTITIES.slice(0, 1), 'AP', () => 0)
  assert.equal(picked.code, 'AP')
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
