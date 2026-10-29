import { createRandom } from '../engine/random'
import type { Frame } from './frame'
import { HEIGHT, mix, rect, WIDTH } from './pixel'
import { drawSky } from './sky'
import { drawWeather } from './weather'

interface Building {
  x: number
  width: number
  height: number
  windows: { x: number; y: number; phase: number }[]
}

const random = createRandom(3)

function skyline(baseline: number, minHeight: number, maxHeight: number, litWindows: number): Building[] {
  const buildings: Building[] = []
  for (let x = -4; x < WIDTH; ) {
    const width = random.int(16, 32)
    const height = random.int(minHeight, maxHeight)
    const windows: Building['windows'] = []
    for (let row = baseline - height + 5; row < baseline - 6; row += 6) {
      for (let column = x + 3; column < x + width - 4; column += 5) {
        if (random.chance(litWindows)) {
          windows.push({ x: column, y: row, phase: random.float(0, Math.PI * 2) })
        }
      }
    }
    buildings.push({ x, width, height, windows })
    x += width + random.int(1, 3)
  }
  return buildings
}

const FAR = skyline(152, 40, 86, 0)
const MID = skyline(166, 30, 70, 0.12)
const NEAR = skyline(HEIGHT, 22, 62, 0.3)
const TOWER = NEAR[2]
const ANTENNA = NEAR[NEAR.length - 3]

export function drawCity(frame: Frame) {
  const { ctx, colors, time } = frame
  drawSky(frame, { x: 64, y: 42, radius: 10 })

  for (const building of FAR) {
    rect(ctx, building.x, 152 - building.height, building.width, building.height + 30, colors.far)
  }

  const dimLight = mix(colors.mid, colors.light, 0.45)
  for (const building of MID) {
    rect(ctx, building.x, 166 - building.height, building.width, building.height + 20, colors.mid)
    for (const window of building.windows) {
      rect(ctx, window.x, window.y, 2, 2, dimLight)
    }
  }

  for (const building of NEAR) {
    rect(ctx, building.x, HEIGHT - building.height, building.width, building.height, colors.near)
    for (const window of building.windows) {
      if (Math.sin(time * 0.05 + window.phase) > -0.85) {
        rect(ctx, window.x, window.y, 2, 3, colors.light, 0.85)
      }
    }
  }

  const roof = HEIGHT - TOWER.height
  rect(ctx, TOWER.x + 4, roof - 13, 12, 8, colors.near)
  rect(ctx, TOWER.x + 3, roof - 14, 14, 1, colors.near)
  rect(ctx, TOWER.x + 5, roof - 5, 1, 5, colors.near)
  rect(ctx, TOWER.x + 14, roof - 5, 1, 5, colors.near)

  const top = HEIGHT - ANTENNA.height - 16
  rect(ctx, ANTENNA.x + ANTENNA.width / 2, top, 1, 16, colors.near)
  if (time % 2 < 1) {
    rect(ctx, ANTENNA.x + ANTENNA.width / 2, top - 1, 1, 1, [255, 92, 92])
  }

  drawWeather(frame)
}
