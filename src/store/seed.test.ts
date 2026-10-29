import { describe, expect, it } from 'vitest'
import { seedFromSearch } from './seed'

describe('seedFromSearch', () => {
  it('reads the seed of a shared link', () => {
    expect(seedFromSearch('?seed=48213')).toBe(48213)
    expect(seedFromSearch('?lang=en&seed=7')).toBe(7)
  })

  it('ignores a missing or invalid seed', () => {
    expect(seedFromSearch('')).toBeNull()
    expect(seedFromSearch('?seed=')).toBeNull()
    expect(seedFromSearch('?seed=abc')).toBeNull()
    expect(seedFromSearch('?seed=-4')).toBeNull()
    expect(seedFromSearch('?seed=1.5')).toBeNull()
  })
})
