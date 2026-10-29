import type { Frame } from './frame'
import { sceneColors, type Palette } from './palettes'
import { HEIGHT, WIDTH } from './pixel'
import type { WeatherId } from './weather'

const SCALE = 3

/**
 * A square picture of the scene for the system media controls (lock screen, notifications), as a PNG data URL.
 * It is cropped around `centerX`, the most telling part of the scene, and drawn still.
 */
export function renderArtwork(draw: (frame: Frame) => void, palette: Palette, weather: WeatherId, centerX: number): string | null {
  const scene = document.createElement('canvas')
  scene.width = WIDTH
  scene.height = HEIGHT
  const sceneCtx = scene.getContext('2d')

  const artwork = document.createElement('canvas')
  artwork.width = HEIGHT * SCALE
  artwork.height = HEIGHT * SCALE
  const artworkCtx = artwork.getContext('2d')

  if (!sceneCtx || !artworkCtx) {
    return null
  }
  draw({ ctx: sceneCtx, colors: sceneColors(palette), weather, time: 0 })

  const left = Math.min(WIDTH - HEIGHT, Math.max(0, Math.round(centerX - HEIGHT / 2)))
  artworkCtx.imageSmoothingEnabled = false
  artworkCtx.drawImage(scene, left, 0, HEIGHT, HEIGHT, 0, 0, artwork.width, artwork.height)
  return artwork.toDataURL('image/png')
}

export const ARTWORK_SIZE = `${HEIGHT * SCALE}x${HEIGHT * SCALE}`
