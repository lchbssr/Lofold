import type { Frame } from './frame'
import { glow, HEIGHT, mix, rect, sprite, WIDTH } from './pixel'
import { drawSky } from './sky'
import { drawWeather } from './weather'

// The window, seen from inside the room: the sky and the weather only show through its glass
const WINDOW = { x: 92, y: 26, width: 136, height: 100 }
const DESK_TOP = 150

const ROOFTOPS = [
  [92, 14], [104, 22], [118, 16], [131, 28], [146, 20], [160, 30], [176, 18], [190, 26], [206, 15], [218, 21],
] as const

const CAT = [
  '..#.....#..',
  '..##...##..',
  '..#######..',
  '.#########.',
  '..#######..',
  '...#####...',
  '..#######..',
  '.#########.',
  '.#########.',
  '###########',
  '###########',
  '###########',
  '.#########.',
]
const TAIL_DOWN = ['............', '###########.']
const TAIL_UP = ['...........#', '###########.']

const LEAVES = [
  '.....#.......',
  '....##...#...',
  '#...##..##...',
  '##..###.##..#',
  '.##..##.#..##',
  '..##.#####.#.',
  '...#######...',
  '....#####....',
]

export function drawRoom(frame: Frame) {
  const { ctx, colors, time } = frame
  const { x, y, width, height } = WINDOW
  const bottom = y + height

  drawSky(frame, { x: 212, y: 40, radius: 8 })
  ROOFTOPS.forEach(([left, rise], index) => {
    const right = ROOFTOPS[index + 1]?.[0] ?? x + width
    rect(ctx, left, bottom - rise, right - left, rise, colors.far)
    if (index % 2 === 0) {
      rect(ctx, left + 4, bottom - rise + 5, 2, 2, colors.light, 0.7)
    }
  })
  drawWeather(frame)

  rect(ctx, 0, 0, WIDTH, y, colors.near)
  rect(ctx, 0, bottom, WIDTH, HEIGHT - bottom, colors.near)
  rect(ctx, 0, y, x, height, colors.near)
  rect(ctx, x + width, y, WIDTH - x - width, height, colors.near)
  glow(ctx, 262, 116, 62, colors.light, 0.12)

  const frameColor = colors.mid
  rect(ctx, x - 3, y - 3, width + 6, 3, frameColor)
  rect(ctx, x - 3, y, 3, height, frameColor)
  rect(ctx, x + width, y, 3, height, frameColor)
  rect(ctx, x + width / 2 - 1, y, 2, height, frameColor)
  rect(ctx, x, y + 46, width, 2, frameColor)
  rect(ctx, x - 22, y - 10, width + 44, 2, frameColor)
  const curtain = mix(colors.mid, colors.light, 0.1)
  for (const left of [x - 18, x + width + 4]) {
    rect(ctx, left, y - 8, 14, height + 12, curtain)
    rect(ctx, left + 4, y - 8, 1, height + 12, frameColor)
    rect(ctx, left + 9, y - 8, 1, height + 12, frameColor)
  }
  rect(ctx, x - 6, bottom, width + 12, 4, mix(colors.mid, colors.light, 0.15))

  const catX = 96
  sprite(ctx, CAT, catX, bottom - CAT.length, colors.near)
  sprite(ctx, Math.sin(time * 1.3) > 0.6 ? TAIL_UP : TAIL_DOWN, catX + 6, bottom - 2, colors.near)

  rect(ctx, 0, DESK_TOP, WIDTH, HEIGHT - DESK_TOP, colors.mid)
  glow(ctx, 262, DESK_TOP + 4, 40, colors.light, 0.25, { height: 10 })
  rect(ctx, 0, DESK_TOP, WIDTH, 1, mix(colors.mid, colors.light, 0.3))

  rect(ctx, 252, DESK_TOP - 4, 20, 4, colors.near)
  rect(ctx, 261, 112, 2, DESK_TOP - 116, colors.near)
  for (let row = 0; row < 12; row++) {
    const half = 5 + Math.floor(row / 2)
    rect(ctx, 262 - half, 100 + row, half * 2, 1, colors.near)
  }
  rect(ctx, 256, 112, 12, 1, colors.light)

  const mug = mix(colors.mid, colors.light, 0.35)
  rect(ctx, 222, DESK_TOP - 7, 7, 7, mug)
  rect(ctx, 229, DESK_TOP - 5, 2, 3, mug)
  for (let puff = 0; puff < 3; puff++) {
    const rise = (time * 4 + puff * 4) % 12
    rect(ctx, 224 + Math.round(Math.sin(time * 2 + puff) * 1.5), DESK_TOP - 9 - rise, 1, 2, colors.light, 0.5 * (1 - rise / 12))
  }

  const books = [mix(colors.mid, colors.light, 0.25), colors.near, mix(colors.near, colors.light, 0.2)]
  books.forEach((color, index) => rect(ctx, 20 + index * 5, DESK_TOP - 18 + index * 2, 4, 18 - index * 2, color))
  rect(ctx, 18, DESK_TOP - 3, 30, 3, mix(colors.mid, colors.light, 0.15))
  const pot = mix(colors.near, colors.light, 0.15)
  for (let row = 0; row < 10; row++) {
    rect(ctx, 60 + Math.floor(row / 3), DESK_TOP - 10 + row, 14 - Math.floor(row / 3) * 2, 1, pot)
  }
  const leaves = mix(colors.mid, colors.light, 0.12)
  sprite(ctx, LEAVES, 61, DESK_TOP - 18, leaves)
}
