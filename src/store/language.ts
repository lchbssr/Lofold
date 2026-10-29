export const LANGUAGES = ['en', 'fr'] as const

export type Language = (typeof LANGUAGES)[number]

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language === value)
}

/**
 * The language of the interface: the one chosen in this browser, otherwise the first language
 * of the browser that Lofold speaks ("fr-CA" gives French), otherwise English.
 */
export function resolveLanguage(saved: unknown, browserLanguages: readonly string[]): Language {
  if (isLanguage(saved)) {
    return saved
  }
  const spoken = browserLanguages.map((tag) => tag.toLowerCase().split('-')[0]).find(isLanguage)
  return spoken ?? 'en'
}
