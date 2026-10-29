import { create } from 'zustand'
import { resolveLanguage, type Language } from './language'

const STORAGE_KEY = 'lofold-language'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // Storage unavailable (private browsing…): the language of the browser is used
    return null
  }
}

function browserLanguages(): readonly string[] {
  return typeof navigator === 'undefined' ? [] : navigator.languages
}

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: resolveLanguage(readSaved(), browserLanguages()),
  setLanguage: (language) => {
    set({ language })
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Storage unavailable: the language stays chosen until the page is closed
    }
  },
}))
