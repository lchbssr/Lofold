import { describe, expect, it } from 'vitest'
import { ditherThreshold, gradientBand, hexToRgb, mix } from './pixel'

describe('colors', () => {
  it('reads a hexadecimal color', () => {
    expect(hexToRgb('#ff8000')).toEqual([255, 128, 0])
  })

  it('mixes two colors', () => {
    expect(mix([0, 0, 0], [255, 100, 10], 0)).toEqual([0, 0, 0])
    expect(mix([0, 0, 0], [255, 100, 10], 0.5)).toEqual([128, 50, 5])
    expect(mix([0, 0, 0], [255, 100, 10], 1)).toEqual([255, 100, 10])
  })
})

describe('ditherThreshold', () => {
  it('spreads 16 thresholds evenly over each block of 4 by 4 pixels', () => {
    const thresholds = []
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        thresholds.push(ditherThreshold(x + 8, y + 4))
      }
    }

    expect(thresholds.sort((a, b) => a - b)).toEqual(Array.from({ length: 16 }, (_, index) => (index + 0.5) / 16))
  })
})

describe('gradientBand', () => {
  const height = 180
  const bands = 8

  it('starts with the first color and ends with the last one', () => {
    for (let x = 0; x < 16; x++) {
      expect(gradientBand(x, 0, height, bands)).toBe(0)
      expect(gradientBand(x, height - 1, height, bands)).toBe(bands - 1)
    }
  })

  it('only uses the two bands around the position of each pixel', () => {
    for (let y = 0; y < height; y++) {
      const band = Math.floor((y / (height - 1)) * (bands - 1))
      for (let x = 0; x < 16; x++) {
        expect([band, band + 1]).toContain(gradientBand(x, y, height, bands))
      }
    }
  })
})
