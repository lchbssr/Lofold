import { drawCity } from './City'
import { drawHills } from './Hills'
import { drawRoom } from './Room'
import { drawSea } from './Sea'

export const SCENES = [
  { id: 'room', draw: drawRoom, artworkCenter: 160 },
  { id: 'city', draw: drawCity, artworkCenter: 120 },
  { id: 'hills', draw: drawHills, artworkCenter: 200 },
  { id: 'sea', draw: drawSea, artworkCenter: 110 },
] as const

export type SceneId = (typeof SCENES)[number]['id']

export function isSceneId(value: unknown): value is SceneId {
  return SCENES.some((scene) => scene.id === value)
}
