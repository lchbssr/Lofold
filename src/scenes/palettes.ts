import { hexToRgb, mix, type Rgb } from './pixel'

export interface Palette {
  id: string
  skyTop: string
  skyBottom: string
  far: string
  mid: string
  near: string
  light: string
  stars: number
}

export const PALETTES = [
  {
    id: 'dawn',
    skyTop: '#5d6fa8',
    skyBottom: '#f2b896',
    far: '#9187b0',
    mid: '#675f8c',
    near: '#38345a',
    light: '#ffe0b2',
    stars: 0,
  },
  {
    id: 'day',
    skyTop: '#3f7cc4',
    skyBottom: '#a8d4ee',
    far: '#7ba3c4',
    mid: '#557a9e',
    near: '#2c4561',
    light: '#ffe9a8',
    stars: 0,
  },
  {
    id: 'dusk',
    skyTop: '#2a1c48',
    skyBottom: '#d9786a',
    far: '#694879',
    mid: '#442f5d',
    near: '#221836',
    light: '#ffb46e',
    stars: 0.35,
  },
  {
    id: 'night',
    skyTop: '#070b1a',
    skyBottom: '#1f2a4d',
    far: '#27314f',
    mid: '#1a2140',
    near: '#0c1125',
    light: '#f4d58d',
    stars: 1,
  },
] as const satisfies readonly Palette[]

export type PaletteId = (typeof PALETTES)[number]['id']

export type PaletteChoice = PaletteId | 'auto'

export function isPaletteChoice(value: unknown): value is PaletteChoice {
  return value === 'auto' || PALETTES.some((palette) => palette.id === value)
}

export function paletteForHour(hour: number): PaletteId {
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 17) return 'day'
  if (hour >= 17 && hour < 21) return 'dusk'
  return 'night'
}

export interface SceneColors {
  skyTop: Rgb
  skyBottom: Rgb
  far: Rgb
  mid: Rgb
  near: Rgb
  light: Rgb
  stars: number
}

export function sceneColors(palette: Palette): SceneColors {
  return {
    skyTop: hexToRgb(palette.skyTop),
    skyBottom: hexToRgb(palette.skyBottom),
    far: hexToRgb(palette.far),
    mid: hexToRgb(palette.mid),
    near: hexToRgb(palette.near),
    light: hexToRgb(palette.light),
    stars: palette.stars,
  }
}

export function mixSceneColors(from: SceneColors, to: SceneColors, amount: number): SceneColors {
  return {
    skyTop: mix(from.skyTop, to.skyTop, amount),
    skyBottom: mix(from.skyBottom, to.skyBottom, amount),
    far: mix(from.far, to.far, amount),
    mid: mix(from.mid, to.mid, amount),
    near: mix(from.near, to.near, amount),
    light: mix(from.light, to.light, amount),
    stars: from.stars + (to.stars - from.stars) * amount,
  }
}
