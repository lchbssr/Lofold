import { createRandom, deriveSeed } from '../engine/random'
import type { Frame } from './frame'
import { disc, glow, gradient, HEIGHT, mix, rect, WHITE, WIDTH, type Rgb } from './pixel'
import { lightningAt, type Lightning } from './weather'

const random = createRandom(11)
const STARS = Array.from({ length: 80 }, () => ({
  x: random.int(0, WIDTH - 1),
  y: random.int(0, 100),
  bright: random.chance(0.12),
  twinkles: random.chance(0.3),
  phase: random.float(0, Math.PI * 2),
}))
interface Cloud {
  x: number
  y: number
  width: number
  speed: number
}

const clouds = (count: number, top: readonly [number, number], width: readonly [number, number], speed: readonly [number, number]): Cloud[] =>
  Array.from({ length: count }, (_, index) => ({
    x: Math.round((index * (WIDTH + 60)) / count) + random.int(0, 30),
    y: random.int(...top),
    width: random.int(...width),
    speed: random.float(...speed),
  }))

const CLOUDS = clouds(6, [8, 60], [26, 46], [1.5, 3])
const STORM_CLOUDS = clouds(12, [0, 46], [52, 90], [3, 5])

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, time: number, color: Rgb) {
  const x = Math.round(((cloud.x + time * cloud.speed) % (WIDTH + cloud.width * 2)) - cloud.width)
  const size = Math.round(cloud.width / 6)
  disc(ctx, x + size, cloud.y, size, color)
  disc(ctx, x + Math.round(cloud.width * 0.38), cloud.y - size, Math.round(size * 1.6), color)
  disc(ctx, x + Math.round(cloud.width * 0.68), cloud.y - Math.round(size * 0.6), Math.round(size * 1.2), color)
  disc(ctx, x + cloud.width - size, cloud.y, size, color)
  rect(ctx, x + size, cloud.y, cloud.width - size * 2, size + 1, color)
}

function drawBolt(ctx: CanvasRenderingContext2D, { x, seed, flash }: Lightning) {
  const random = createRandom(deriveSeed(seed, 'bolt'))
  const bottom = 30 + random.int(55, 85)
  let boltX = x
  for (let y = 30; y < bottom; ) {
    const length = random.int(4, 8)
    const shift = random.int(-3, 3)
    for (let step = 0; step < length && y < bottom; step++, y++) {
      rect(ctx, boltX + (shift * step) / length, y, 2, 1, WHITE, flash)
    }
    boltX += shift
    if (random.chance(0.25)) {
      const direction = random.chance(0.5) ? 1 : -1
      for (let step = 0; step < random.int(6, 12); step++) {
        rect(ctx, boltX + direction * step * 0.8, y + step, 1, 1, WHITE, flash * 0.7)
      }
    }
  }
}

interface Celestial {
  x: number
  y: number
  radius: number
}

export function drawSky(frame: Frame, celestial: Celestial) {
  const { ctx, colors, weather, time } = frame
  gradient(ctx, 0, HEIGHT, colors.skyTop, colors.skyBottom)

  if (weather === 'clear' && colors.stars > 0) {
    for (const star of STARS) {
      const twinkle = star.twinkles ? 0.6 + 0.4 * Math.sin(time * 1.5 + star.phase) : 1
      const alpha = colors.stars * twinkle
      rect(ctx, star.x, star.y, 1, 1, WHITE, alpha)
      if (star.bright) {
        rect(ctx, star.x - 1, star.y, 3, 1, WHITE, alpha * 0.5)
        rect(ctx, star.x, star.y - 1, 1, 3, WHITE, alpha * 0.5)
      }
    }
  }

  if (weather !== 'storm') {
    glow(ctx, celestial.x, celestial.y, Math.round(celestial.radius * 2.6), colors.light, 0.3)
    disc(ctx, celestial.x, celestial.y, celestial.radius, colors.light)
  } else {
    rect(ctx, 0, 0, WIDTH, HEIGHT, [0, 0, 0], 0.3)
    // Drawn before the clouds, so the bolt comes out of them
    const lightning = lightningAt(time)
    if (lightning) {
      drawBolt(ctx, lightning)
    }
  }

  if (weather !== 'clear') {
    const color = weather === 'snow' ? mix(colors.far, WHITE, 0.35) : mix(colors.far, colors.skyTop, 0.5)
    for (const cloud of CLOUDS) {
      drawCloud(ctx, cloud, time, color)
    }
  }

  if (weather === 'storm') {
    const color = mix(colors.near, colors.far, 0.4)
    for (const cloud of STORM_CLOUDS) {
      drawCloud(ctx, cloud, time, color)
    }
  }
}
