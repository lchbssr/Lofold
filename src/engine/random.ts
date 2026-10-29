export interface Random {
  next(): number
  int(min: number, max: number): number
  float(min: number, max: number): number
  chance(probability: number): boolean
  pick<T>(items: readonly T[]): T
  weighted<T>(options: ReadonlyArray<readonly [T, number]>): T
}

/**
 * A seed of its own for one part of a song (FNV-1a hash of the seed and labels):
 * deriveSeed(48213, 'melody', 'A', 2). Each part draws from its own sequence,
 * so re-rolling the melody of a section leaves every other part unchanged.
 */
export function deriveSeed(seed: number, ...labels: Array<string | number>): number {
  let hash = 0x811c9dc5
  for (const character of [seed, ...labels].join(':')) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Seeded random generator (mulberry32 algorithm): the same seed always gives the same
 * sequence, which is what makes a generated song reproducible and shareable.
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max) => min + next() * (max - min),
    chance: (probability) => next() < probability,
    pick: (items) => items[Math.floor(next() * items.length)],
    weighted: (options) => {
      const total = options.reduce((sum, [, weight]) => sum + weight, 0)
      let threshold = next() * total
      for (const [value, weight] of options) {
        threshold -= weight
        if (threshold < 0) {
          return value
        }
      }
      return options[options.length - 1][0]
    },
  }
}
