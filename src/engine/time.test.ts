import { describe, expect, it } from 'vitest'
import { formatTime, secondsToSteps, stepsToSeconds } from './time'

describe('time', () => {
  it('converts sixteenth notes to seconds and back', () => {
    // At 60 BPM, a quarter note (4 steps) lasts one second
    expect(stepsToSeconds(4, 60)).toBe(1)
    expect(secondsToSteps(1, 60)).toBe(4)
    expect(secondsToSteps(stepsToSeconds(37, 83), 83)).toBeCloseTo(37)
  })

  it('writes a duration as minutes and seconds', () => {
    expect(formatTime(0, 80)).toBe('0:00')
    expect(formatTime(40 * 16, 80)).toBe('2:00')
    expect(formatTime(4 * 9, 60)).toBe('0:09')
  })
})
