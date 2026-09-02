import type { Entity, EntityCode } from './data/states.ts'

export const MIN_SCALE = 1
export const MAX_SCALE = 12

/** Lowercase, strip accents, drop everything that is not a letter or digit. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function matchesAnswer(
  value: string,
  answer: string,
  aliases: readonly string[] = [],
): boolean {
  const accepted = [answer, ...aliases]
  const normalizedValue = normalizeAnswer(value)
  return accepted.some((acceptedAnswer: string) =>
    normalizedValue && normalizedValue === normalizeAnswer(acceptedAnswer)
  )
}

export function findEntity(
  value: string,
  entities: readonly Entity[],
): Entity | undefined {
  return entities.find((entity) => matchesAnswer(value, entity.name, entity.nameAliases))
}

export function pickRandom(
  entities: readonly Entity[],
  previousCode?: EntityCode,
  random: () => number = Math.random,
): Entity {
  const pool =
    entities.length > 1 ? entities.filter((entity) => entity.code !== previousCode) : entities
  const picked = pool[Math.floor(random() * pool.length)]
  if (!picked) throw new Error('pickRandom called with an empty pool')
  return picked
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export type SortKey = 'name' | 'code' | 'capital' | 'type'
export type TypeFilter = 'all' | 'state' | 'ut'

/**
 * Filter, then sort, for the Field Guide's list view.
 *
 * Copies before sorting: ENTITIES is readonly, so sorting it in place would be
 * both a type error and a mutation of shared module state. Uses localeCompare
 * rather than `<` so "Andaman" and "andhra" order alphabetically rather than by
 * character code. Sorting by type groups states before UTs and falls back to
 * name within each group, which is how the roster is normally taught.
 */
export function arrangeEntities(
  entities: readonly Entity[],
  sortKey: SortKey,
  filter: TypeFilter,
): readonly Entity[] {
  const filtered =
    filter === 'all' ? entities : entities.filter((entity) => entity.type === filter)

  return [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'code':
        return a.code.localeCompare(b.code)
      case 'capital':
        return a.capital.localeCompare(b.capital)
      case 'type':
        return a.type === b.type
          ? a.name.localeCompare(b.name)
          : a.type === 'state' ? -1 : 1
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })
}
