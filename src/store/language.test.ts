import { describe, expect, it } from 'vitest'
import { resolveLanguage } from './language'

describe('resolveLanguage', () => {
  it('keeps the language chosen in this browser', () => {
    expect(resolveLanguage('fr', ['en-US'])).toBe('fr')
  })

  it('follows the first language of the browser that Lofold speaks', () => {
    expect(resolveLanguage(null, ['fr-CA', 'en'])).toBe('fr')
    expect(resolveLanguage(null, ['de-DE', 'en-GB', 'fr'])).toBe('en')
  })

  it('falls back to English, and ignores an invalid saved value', () => {
    expect(resolveLanguage(null, ['de-DE'])).toBe('en')
    expect(resolveLanguage('klingon', ['fr-FR'])).toBe('fr')
  })
})
