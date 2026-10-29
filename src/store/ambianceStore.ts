import { create } from 'zustand'
import type { PaletteChoice } from '../scenes/palettes'
import type { SceneId } from '../scenes/scenes'
import type { WeatherId } from '../scenes/weather'
import { ambianceParams, resolveAmbiance, type Ambiance } from './ambiance'
import { setUrlParams } from './url'

const STORAGE_KEY = 'lofold-ambiance'

interface AmbianceState extends Ambiance {
  setScene: (sceneId: SceneId) => void
  setPalette: (paletteId: PaletteChoice) => void
  setWeather: (weatherId: WeatherId) => void
}

function readSaved(): Partial<Ambiance> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    // Storage unavailable (private browsing…) or corrupted: start from the default ambiance
    return {}
  }
}

function save(ambiance: Ambiance) {
  setUrlParams(ambianceParams(ambiance))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ambiance))
  } catch {
    // Storage unavailable: the ambiance stays valid for the session
  }
}

export const useAmbianceStore = create<AmbianceState>()((set, get) => {
  const initial = resolveAmbiance(window.location.search, readSaved())
  setUrlParams(ambianceParams(initial))

  const update = (changes: Partial<Ambiance>) => {
    const { sceneId, paletteId, weatherId } = { ...get(), ...changes }
    set({ sceneId, paletteId, weatherId })
    save({ sceneId, paletteId, weatherId })
  }

  return {
    ...initial,
    setScene: (sceneId) => update({ sceneId }),
    setPalette: (paletteId) => update({ paletteId }),
    setWeather: (weatherId) => update({ weatherId }),
  }
})
