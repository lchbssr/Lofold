import { describe, expect, it } from 'vitest'
import { lightningAt, lightningBetween } from './weather'

const TIMES = Array.from({ length: 10 * 60 * 12 }, (_, frame) => 1000 + frame / 12)

describe('lightningAt', () => {
  it('never strikes on a still picture', () => {
    expect(lightningAt(0)).toBeNull()
  })

  it('strikes about once in ten seconds', () => {
    const strikes = new Set(TIMES.map((time) => lightningAt(time)?.seed).filter((seed) => seed !== undefined))

    expect(strikes.size).toBeGreaterThan(40)
    expect(strikes.size).toBeLessThan(80)
  })

  it('flashes briefly and never brighter than full', () => {
    const lit = TIMES.filter((time) => lightningAt(time) !== null)

    for (const time of lit) {
      const { flash } = lightningAt(time)!
      expect(flash).toBeGreaterThanOrEqual(0)
      expect(flash).toBeLessThanOrEqual(1)
    }
    expect(lit.length / TIMES.length).toBeLessThan(0.1)
  })

  it('gives the same lightning to the same time', () => {
    const time = TIMES.find((current) => lightningAt(current) !== null)!

    expect(lightningAt(time)).toEqual(lightningAt(time))
  })

  it('lists the same strikes as the ones seen on screen', () => {
    const listed = lightningBetween(1000, 1600).map(({ seed }) => seed)
    const seen = [...new Set(TIMES.map((time) => lightningAt(time)?.seed).filter((seed) => seed !== undefined))]

    expect(listed).toEqual(seen)
  })
})
