import { describe, expect, it } from 'vitest'
import { stepsToTicks } from './time'

describe('stepsToTicks', () => {
  it('converts sixteenth notes to transport ticks', () => {
    expect(stepsToTicks(0)).toBe('0i')
    expect(stepsToTicks(4)).toBe('192i')
    expect(stepsToTicks(16)).toBe('768i')
  })

  it('keeps the humanized positions between two sixteenth notes', () => {
    expect(stepsToTicks(64.03)).toBe('3073i')
  })
})
