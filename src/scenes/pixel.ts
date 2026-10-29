export const WIDTH = 320
export const HEIGHT = 180

export type Rgb = readonly [number, number, number]

export const WHITE: Rgb = [255, 255, 255]

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
  ]
}

export function css([red, green, blue]: Rgb, alpha = 1): string {
  return `rgb(${red} ${green} ${blue} / ${alpha})`
}

// Ordered dithering, as in old games: a 4×4 Bayer matrix spreads the thresholds evenly
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

export function ditherThreshold(x: number, y: number): number {
  return (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16
}

export function gradientBand(x: number, y: number, height: number, bands: number): number {
  const position = (y / (height - 1)) * (bands - 1)
  const band = Math.floor(position)
  return position - band > ditherThreshold(x, y) ? band + 1 : band
}

export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: Rgb, alpha = 1) {
  ctx.fillStyle = css(color, alpha)
  ctx.fillRect(Math.round(x), Math.round(y), width, height)
}

export function disc(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, color: Rgb) {
  ctx.fillStyle = css(color)
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.round(Math.sqrt(radius * radius - dy * dy))
    ctx.fillRect(centerX - half, centerY + dy, half * 2 + 1, 1)
  }
}

interface Run {
  x: number
  y: number
  width: number
  ring: number
}

// The shape of a halo never changes, only its color: it is computed once, as rows to fill in one call each
const glowShapes = new Map<string, Run[]>()

function glowShape(centerX: number, centerY: number, radius: number, height: number, rings: number): Run[] {
  const key = [centerX, centerY, radius, height, rings].join()
  const cached = glowShapes.get(key)
  if (cached) {
    return cached
  }

  const runs: Run[] = []
  for (let y = Math.max(0, centerY - height); y <= Math.min(HEIGHT - 1, centerY + height); y++) {
    let run: Run | undefined
    for (let x = Math.max(0, centerX - radius); x <= Math.min(WIDTH - 1, centerX + radius); x++) {
      const position = Math.max(0, (1 - Math.hypot((x - centerX) / radius, (y - centerY) / height)) * rings)
      // Only a narrow band is dithered where two rings meet: dithering the whole ring would look like noise
      const blend = Math.min(1, Math.max(0, ((position % 1) - 0.4) / 0.2))
      const ring = Math.min(rings, Math.floor(position) + (position > 0 && blend > ditherThreshold(x, y) ? 1 : 0))

      if (ring === 0) {
        run = undefined
      } else if (run?.ring === ring) {
        run.width++
      } else {
        run = { x, y, width: 1, ring }
        runs.push(run)
      }
    }
  }
  runs.sort((a, b) => a.ring - b.ring)
  glowShapes.set(key, runs)
  return runs
}

export function glow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: Rgb,
  opacity: number,
  { height = radius, rings = 3 } = {},
) {
  let ring = 0
  for (const run of glowShape(centerX, centerY, radius, height, rings)) {
    if (run.ring !== ring) {
      ring = run.ring
      ctx.fillStyle = css(color, (opacity * ring) / rings)
    }
    ctx.fillRect(run.x, run.y, run.width, 1)
  }
}

export function sprite(ctx: CanvasRenderingContext2D, rows: readonly string[], x: number, y: number, color: Rgb) {
  ctx.fillStyle = css(color)
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      if (row[dx] === '#') {
        ctx.fillRect(x + dx, y + dy, 1, 1)
      }
    }
  })
}

const bandMaps = new Map<string, Uint8Array>()
const gradients = new Map<string, ImageData>()

function bandMap(height: number, bands: number): Uint8Array {
  const key = [height, bands].join()
  let map = bandMaps.get(key)
  if (!map) {
    map = new Uint8Array(WIDTH * height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < WIDTH; x++) {
        map[y * WIDTH + x] = gradientBand(x, y, height, bands)
      }
    }
    bandMaps.set(key, map)
  }
  return map
}

export function gradient(ctx: CanvasRenderingContext2D, top: number, height: number, from: Rgb, to: Rgb, bands = 8) {
  const key = [top, height, from, to, bands].join()
  let image = gradients.get(key)

  if (!image) {
    image = ctx.createImageData(WIDTH, height)
    const colors = Array.from({ length: bands }, (_, band) => mix(from, to, band / (bands - 1)))
    const map = bandMap(height, bands)
    for (let pixel = 0; pixel < map.length; pixel++) {
      const [red, green, blue] = colors[map[pixel]]
      image.data[pixel * 4] = red
      image.data[pixel * 4 + 1] = green
      image.data[pixel * 4 + 2] = blue
      image.data[pixel * 4 + 3] = 255
    }
    // A palette fade creates new gradients on every frame: only the last ones are worth keeping
    if (gradients.size > 16) {
      gradients.clear()
    }
    gradients.set(key, image)
  }

  ctx.putImageData(image, 0, top)
}
