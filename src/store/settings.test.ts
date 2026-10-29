import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, resolveSettings } from './settings'

describe('resolveSettings', () => {
  it('uses the default settings the first time', () => {
    expect(resolveSettings(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('restores the volume and the effects saved in the browser', () => {
    const saved = { volume: 0.4, effects: { warmth: 0.9, vinyl: 0, space: 0.6, ambience: 0.5 } }

    expect(resolveSettings(saved)).toEqual(saved)
  })

  it('keeps the weather sounds off for settings saved before they existed', () => {
    const saved = { volume: 0.4, effects: { warmth: 0.9, vinyl: 0, space: 0.6 } }

    expect(resolveSettings(saved).effects.ambience).toBe(0)
  })

  it('replaces each invalid value by its default only', () => {
    const saved = { volume: 3, effects: { warmth: 0.9, vinyl: 'loud', space: -1 } }

    expect(resolveSettings(saved)).toEqual({
      volume: DEFAULT_SETTINGS.volume,
      effects: {
        warmth: 0.9,
        vinyl: DEFAULT_SETTINGS.effects.vinyl,
        space: DEFAULT_SETTINGS.effects.space,
        ambience: DEFAULT_SETTINGS.effects.ambience,
      },
    })
  })
})
