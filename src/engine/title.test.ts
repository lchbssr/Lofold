import { describe, expect, it } from 'vitest'
import { songTitle } from './title'

describe('songTitle', () => {
  it('gives the same name to the same seed', () => {
    expect(songTitle(48213)).toBe(songTitle(48213))
  })

  it('is two capitalized words or more', () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(songTitle(seed)).toMatch(/^[A-Z][a-z]+( [A-Z][a-z]+)+$/)
    }
  })

  it('rarely gives the same name to two songs in a row', () => {
    const names = new Set(Array.from({ length: 100 }, (_, seed) => songTitle(seed)))

    expect(names.size).toBeGreaterThan(90)
  })
})
