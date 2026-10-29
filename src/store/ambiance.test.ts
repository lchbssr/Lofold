import { describe, expect, it } from 'vitest'
import { DEFAULT_AMBIANCE, resolveAmbiance } from './ambiance'

describe('resolveAmbiance', () => {
  it('uses the default ambiance the first time', () => {
    expect(resolveAmbiance('', {})).toEqual(DEFAULT_AMBIANCE)
  })

  it('restores the last choice saved in the browser', () => {
    const saved = { sceneId: 'hills', paletteId: 'dawn', weatherId: 'snow' }

    expect(resolveAmbiance('', saved)).toEqual(saved)
  })

  it('prefers the ambiance of a shared link', () => {
    const saved = { sceneId: 'hills', paletteId: 'dawn', weatherId: 'snow' }

    expect(resolveAmbiance('?seed=7&scene=sea&palette=night&weather=clear', saved)).toEqual({
      sceneId: 'sea',
      paletteId: 'night',
      weatherId: 'clear',
    })
  })

  it('accepts the palette that follows the time of day', () => {
    expect(resolveAmbiance('?palette=auto', {}).paletteId).toBe('auto')
  })

  it('ignores unknown scenes, palettes and weathers', () => {
    expect(resolveAmbiance('?scene=beach&palette=neon&weather=hail', { sceneId: 'space' })).toEqual(DEFAULT_AMBIANCE)
  })
})
