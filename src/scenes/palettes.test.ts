import { describe, expect, it } from 'vitest'
import { paletteForHour } from './palettes'

describe('paletteForHour', () => {
  it('follows the time of day', () => {
    expect(paletteForHour(6)).toBe('dawn')
    expect(paletteForHour(13)).toBe('day')
    expect(paletteForHour(19)).toBe('dusk')
    expect(paletteForHour(23)).toBe('night')
    expect(paletteForHour(2)).toBe('night')
  })

  it('changes palette on the hour', () => {
    expect([4, 5, 8, 9, 16, 17, 20, 21].map(paletteForHour)).toEqual(['night', 'dawn', 'dawn', 'day', 'day', 'dusk', 'dusk', 'night'])
  })
})
