import { DEFAULT_EFFECTS, type Effects } from '../audio/effects'

export interface Settings {
  volume: number
  effects: Effects
}

export const DEFAULT_SETTINGS: Settings = { volume: 0.8, effects: DEFAULT_EFFECTS }

const STORAGE_KEY = 'lofold-settings'

function isLevel(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1
}

export function resolveSettings(saved: unknown): Settings {
  const { volume, effects } = (typeof saved === 'object' && saved !== null ? saved : {}) as Partial<Record<keyof Settings, unknown>>
  const savedEffects = (typeof effects === 'object' && effects !== null ? effects : {}) as Partial<Record<keyof Effects, unknown>>
  const effect = (name: keyof Effects) => {
    const value = savedEffects[name]
    return isLevel(value) ? value : DEFAULT_EFFECTS[name]
  }

  return {
    volume: isLevel(volume) ? volume : DEFAULT_SETTINGS.volume,
    effects: { warmth: effect('warmth'), vinyl: effect('vinyl'), space: effect('space'), ambience: effect('ambience') },
  }
}

export function readSettings(): Settings {
  try {
    return resolveSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
  } catch {
    // Storage unavailable (private browsing…) or corrupted: start from the default settings
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage unavailable: the settings stay valid for the session
  }
}
