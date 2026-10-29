import { createRandom } from '../engine/random'
import type { Frame } from './frame'
import { HEIGHT, mix, rect, WHITE, WIDTH, type Rgb } from './pixel'
import { drawSky } from './sky'
import { drawWeather } from './weather'

const ridge = (base: number, waves: ReadonlyArray<readonly [number, number, number]>) =>
  Array.from({ length: WIDTH }, (_, x) => Math.round(base + waves.reduce((sum, [size, length, shift]) => sum + size * Math.sin(x / length + shift), 0)))

const FAR = ridge(104, [[10, 55, 1], [5, 22, 0]])
const MID = ridge(126, [[8, 45, 2.5], [4, 16, 1]])
const NEAR = ridge(152, [[6, 33, 0.5], [3, 12, 2]])

const PINES = [[28, 16], [36, 12], [96, 14], [210, 18], [221, 13], [290, 15]] as const

const CABIN_X = 74

const random = createRandom(17)
const FIREFLIES = Array.from({ length: 14 }, () => ({
  x: random.int(0, WIDTH - 1),
  y: random.int(140, 172),
  phase: random.float(0, Math.PI * 2),
}))

function drawRidge(ctx: CanvasRenderingContext2D, heights: readonly number[], color: Rgb) {
  heights.forEach((top, x) => rect(ctx, x, top, 1, HEIGHT - top, color))
}

function drawPine(ctx: CanvasRenderingContext2D, x: number, base: number, height: number, color: Rgb) {
  for (let row = 0; row < height; row++) {
    const half = Math.floor((row % 4) / 2 + row / 3)
    rect(ctx, x - half, base - height + row, half * 2 + 1, 1, color)
  }
  rect(ctx, x, base, 1, 3, color)
}

export function drawHills(frame: Frame) {
  const { ctx, colors, weather, time } = frame
  drawSky(frame, { x: 228, y: 90, radius: 16 })

  drawRidge(ctx, FAR, colors.far)
  drawRidge(ctx, MID, colors.mid)
  for (const [x, height] of PINES) {
    drawPine(ctx, x, MID[x] + 2, height, colors.near)
  }
  drawRidge(ctx, NEAR, colors.near)

  const ground = NEAR[CABIN_X + 8]
  for (let row = 0; row < 6; row++) {
    rect(ctx, CABIN_X + 5 - row, ground - 17 + row, row * 2 + 8, 1, colors.near)
  }
  rect(ctx, CABIN_X, ground - 11, 18, 12, colors.near)
  rect(ctx, CABIN_X + 13, ground - 19, 3, 5, colors.near)
  rect(ctx, CABIN_X + 4, ground - 8, 4, 4, colors.light)
  const smoke = mix(colors.mid, WHITE, 0.4)
  for (let puff = 0; puff < 4; puff++) {
    const rise = (time * 3 + puff * 5) % 20
    rect(ctx, CABIN_X + 14 + Math.round(Math.sin(time + puff) + rise / 4), ground - 21 - rise, 2, 2, smoke, 0.5 * (1 - rise / 20))
  }

  if (weather === 'clear' && colors.stars > 0.5) {
    for (const firefly of FIREFLIES) {
      const glow = Math.sin(time * 2 + firefly.phase)
      if (glow > 0) {
        const x = firefly.x + Math.round(Math.sin(time * 0.4 + firefly.phase) * 6)
        const y = firefly.y + Math.round(Math.cos(time * 0.3 + firefly.phase) * 3)
        rect(ctx, x, y, 1, 1, colors.light, glow * colors.stars)
      }
    }
  }

  drawWeather(frame)
}
