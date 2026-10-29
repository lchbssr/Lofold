import { describe, expect, it } from 'vitest'
import { createRandom, deriveSeed } from './random'

describe('deriveSeed', () => {
  it('always derives the same seed from the same labels', () => {
    expect(deriveSeed(48213, 'melody', 'A', 2)).toBe(deriveSeed(48213, 'melody', 'A', 2))
  })

  it('derives different seeds for different parts', () => {
    const seeds = new Set([
      deriveSeed(48213, 'melody', 'A', 0),
      deriveSeed(48213, 'melody', 'A', 1),
      deriveSeed(48213, 'melody', 'B', 0),
      deriveSeed(48213, 'drums', 'A', 0),
      deriveSeed(48214, 'melody', 'A', 0),
    ])
    expect(seeds.size).toBe(5)
  })
})

const sequence = (seed: number) => {
  const random = createRandom(seed)
  return Array.from({ length: 5 }, () => random.next())
}

describe('createRandom', () => {
  it('gives the same sequence for the same seed', () => {
    expect(sequence(42)).toEqual(sequence(42))
  })

  it('gives different sequences for different seeds', () => {
    expect(sequence(42)).not.toEqual(sequence(43))
  })

  it('stays within the requested bounds', () => {
    const random = createRandom(7)
    const values = Array.from({ length: 1000 }, () => random.int(70, 90))

    expect(Math.min(...values)).toBe(70)
    expect(Math.max(...values)).toBe(90)
  })

  it('never picks an option without weight', () => {
    const random = createRandom(7)
    const picks = Array.from({ length: 500 }, () => random.weighted([['never', 0], ['always', 1]]))

    expect(picks).not.toContain('never')
  })
})
