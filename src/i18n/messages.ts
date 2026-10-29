import { useLanguageStore } from '../store/languageStore'
import { en, type Messages } from './en'
import { fr } from './fr'

export type { Messages }

const MESSAGES = { en, fr }

export function useMessages(): Messages {
  return MESSAGES[useLanguageStore((state) => state.language)]
}

export function getMessages(): Messages {
  return MESSAGES[useLanguageStore.getState().language]
}
