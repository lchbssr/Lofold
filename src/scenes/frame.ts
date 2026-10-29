import type { SceneColors } from './palettes'
import type { WeatherId } from './weather'

export interface Frame {
  ctx: CanvasRenderingContext2D
  colors: SceneColors
  weather: WeatherId
  time: number
}
