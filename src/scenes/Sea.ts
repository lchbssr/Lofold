import { createRandom } from '../engine/random'
import type { Frame } from './frame'
import { css, gradient, HEIGHT, mix, rect, WIDTH } from './pixel'
import { drawSky } from './sky'
import { drawWeather } from './weather'

const HORIZON = 112
const SKY_LIGHT = { x: 70, y: 46, radius: 12 }
const LIGHTHOUSE = { x: 272, top: 104 }

const ISLAND = Array.from({ length: 140 }, (_, x) =>
  Math.round(16 * Math.exp(-(((x - 50) / 32) ** 2)) + 9 * Math.exp(-(((x - 108) / 16) ** 2))),
)

const SHORE = Array.from({ length: WIDTH }, (_, x) =>
  Math.round(170 + 3 * Math.sin(x / 9) - Math.max(0, x - 230) * 0.25),
)

const random = createRandom(23)
const WAVES = Array.from({ length: 34 }, () => ({
  x: random.int(0, WIDTH),
  y: random.int(HORIZON + 4, 165),
  width: random.int(3, 9),
  speed: random.float(1, 3),
}))

export function drawSea(frame: Frame) {
  const { ctx, colors, weather, time } = frame
  drawSky(frame, SKY_LIGHT)

  ISLAND.forEach((height, x) => rect(ctx, x, HORIZON - height, 1, height, colors.far))

  gradient(ctx, HORIZON, HEIGHT - HORIZON, mix(colors.skyBottom, colors.far, 0.6), colors.mid, 6)

  if (weather !== 'storm') {
    for (let y = HORIZON + 2; y < 168; y += 3) {
      const distance = (y - HORIZON) / (168 - HORIZON)
      const width = Math.round(4 + distance * 16 + Math.sin(time * 2 + y) * 3)
      const shift = Math.round(Math.sin(time * 1.5 + y * 0.7) * 3)
      rect(ctx, SKY_LIGHT.x - width / 2 + shift, y, width, 1, colors.light, 0.75 * (1 - distance * 0.6))
    }
  }

  const foam = mix(colors.mid, colors.skyBottom, 0.5)
  for (const wave of WAVES) {
    const x = ((wave.x + time * wave.speed) % (WIDTH + wave.width)) - wave.width
    rect(ctx, x, wave.y, wave.width, 1, foam)
  }

  const turn = time * 0.7
  const reach = Math.cos(turn) * 150
  if (Math.sin(turn) > 0) {
    ctx.fillStyle = css(colors.light, 0.2)
    ctx.beginPath()
    ctx.moveTo(LIGHTHOUSE.x, LIGHTHOUSE.top + 2)
    ctx.lineTo(LIGHTHOUSE.x + reach, LIGHTHOUSE.top - 6)
    ctx.lineTo(LIGHTHOUSE.x + reach, LIGHTHOUSE.top + 10)
    ctx.fill()
  }

  SHORE.forEach((top, x) => rect(ctx, x, top, 1, HEIGHT - top, colors.near))

  const { x, top } = LIGHTHOUSE
  for (let y = top + 6; y <= SHORE[x]; y++) {
    const half = 3 + Math.floor((y - top) / 16)
    const stripe = Math.floor((y - top) / 10) % 2 === 1
    rect(ctx, x - half, y, half * 2 + 1, 1, stripe ? mix(colors.near, colors.light, 0.2) : colors.near)
  }
  rect(ctx, x - 4, top + 4, 9, 2, colors.near)
  rect(ctx, x - 2, top, 5, 4, colors.light)
  rect(ctx, x - 3, top - 2, 7, 2, colors.near)

  drawWeather(frame)
}
