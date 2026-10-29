import { isPaletteChoice, type PaletteChoice } from '../scenes/palettes'
import { isSceneId, type SceneId } from '../scenes/scenes'
import { isWeatherId, type WeatherId } from '../scenes/weather'

export interface Ambiance {
  sceneId: SceneId
  paletteId: PaletteChoice
  weatherId: WeatherId
}

export const DEFAULT_AMBIANCE: Ambiance = { sceneId: 'room', paletteId: 'dusk', weatherId: 'rain' }

/**
 * The ambiance to show: a shared link (?scene=city&palette=night&weather=snow) wins over the last choice
 * saved in this browser, which wins over the default one. Invalid values are ignored.
 */
export function resolveAmbiance(search: string, saved: Partial<Record<keyof Ambiance, unknown>>): Ambiance {
  const params = new URLSearchParams(search)
  const scene = [params.get('scene'), saved.sceneId].find(isSceneId)
  const palette = [params.get('palette'), saved.paletteId].find(isPaletteChoice)
  const weather = [params.get('weather'), saved.weatherId].find(isWeatherId)

  return {
    sceneId: scene ?? DEFAULT_AMBIANCE.sceneId,
    paletteId: palette ?? DEFAULT_AMBIANCE.paletteId,
    weatherId: weather ?? DEFAULT_AMBIANCE.weatherId,
  }
}

export function ambianceParams({ sceneId, paletteId, weatherId }: Ambiance): Record<string, string> {
  return { scene: sceneId, palette: paletteId, weather: weatherId }
}
