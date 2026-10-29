import { createRandom, deriveSeed } from '../engine/random'
import type { Frame } from './frame'
import { HEIGHT, mix, rect, WHITE, WIDTH, type Rgb } from './pixel'

export const WEATHERS = ['clear', 'rain', 'snow', 'storm'] as const

export type WeatherId = (typeof WEATHERS)[number]

export function isWeatherId(value: unknown): value is WeatherId {
  return WEATHERS.some((weather) => weather === value)
}

const FLASH: Rgb = [215, 228, 255]

const random = createRandom(5)
const drops = (count: number, speed: readonly [number, number], length: readonly [number, number]) =>
  Array.from({ length: count }, () => ({
    x: random.int(0, WIDTH + 90),
    offset: random.next(),
    speed: random.int(...speed),
    length: random.int(...length),
  }))
const RAIN = { drops: drops(140, [150, 210], [3, 6]), slant: 0.3 }
const STORM_RAIN = { drops: drops(280, [230, 300], [5, 9]), slant: 0.45 }
const FLAKES = Array.from({ length: 110 }, () => ({
  x: random.int(0, WIDTH),
  offset: random.next(),
  speed: random.int(10, 24),
  size: random.chance(0.25) ? 2 : 1,
  phase: random.float(0, Math.PI * 2),
}))

// Every few seconds, a storm may strike: about one lightning in ten seconds
const LIGHTNING_PERIOD = 6
const LIGHTNING_CHANCE = 0.6
const LIGHTNING_SECONDS = 0.6
// The brightest a flash makes the picture: enough to feel it, not to dazzle
const FLASH_OPACITY = 0.35

export interface Lightning {
  flash: number
  x: number
  seed: number
}

function strikeOf(period: number): { start: number; x: number } | null {
  // A still picture (time 0) never has any
  if (period <= 0) {
    return null
  }
  const random = createRandom(deriveSeed(period, 'lightning'))
  if (!random.chance(LIGHTNING_CHANCE)) {
    return null
  }
  const start = period * LIGHTNING_PERIOD + random.float(0, LIGHTNING_PERIOD - LIGHTNING_SECONDS)
  return { start, x: random.int(30, WIDTH - 30) }
}

/**
 * The lightning of a storm at a time, in seconds, or null. It is worked out from the time alone,
 * so it needs no state, and the thunder of the ambient sounds can follow it.
 */
export function lightningAt(time: number): Lightning | null {
  const period = Math.floor(time / LIGHTNING_PERIOD)
  const strike = strikeOf(period)
  const elapsed = strike ? time - strike.start : -1
  if (!strike || elapsed < 0 || elapsed >= LIGHTNING_SECONDS) {
    return null
  }
  const flash = elapsed < 0.1 ? 1 : elapsed < 0.2 ? 0.25 : 0.8 * (1 - (elapsed - 0.2) / (LIGHTNING_SECONDS - 0.2))
  return { flash, x: strike.x, seed: period }
}

export function lightningBetween(from: number, to: number): { start: number; seed: number }[] {
  const strikes = []
  for (let period = Math.floor(from / LIGHTNING_PERIOD); period <= Math.floor(to / LIGHTNING_PERIOD); period++) {
    const strike = strikeOf(period)
    if (strike && strike.start >= from && strike.start < to) {
      strikes.push({ start: strike.start, seed: period })
    }
  }
  return strikes
}

/** Rain or snow over the whole picture, and the flash of a storm: a scene draws its foreground after it to hide it there */
export function drawWeather({ ctx, colors, weather, time }: Frame) {
  if (weather === 'rain' || weather === 'storm') {
    const { drops, slant } = weather === 'storm' ? STORM_RAIN : RAIN
    const color = mix(colors.skyBottom, WHITE, 0.6)
    for (const drop of drops) {
      const distance = HEIGHT + drop.length
      const y = ((drop.offset * distance + time * drop.speed) % distance) - drop.length
      rect(ctx, drop.x - y * slant, y, 1, drop.length, color, 0.55)
    }
  }

  if (weather === 'storm') {
    const lightning = lightningAt(time)
    if (lightning) {
      rect(ctx, 0, 0, WIDTH, HEIGHT, FLASH, lightning.flash * FLASH_OPACITY)
    }
  }

  if (weather === 'snow') {
    for (const flake of FLAKES) {
      const y = ((flake.offset * HEIGHT + time * flake.speed) % (HEIGHT + 2)) - 2
      const x = (flake.x + Math.sin(time * 0.7 + flake.phase) * 4 + WIDTH) % WIDTH
      rect(ctx, x, y, flake.size, flake.size, WHITE, 0.85)
    }
  }
}
