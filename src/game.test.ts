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
