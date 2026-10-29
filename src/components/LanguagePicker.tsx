import { useMessages } from '../i18n/messages'
import type { Language } from '../store/language'
import { useLanguageStore } from '../store/languageStore'

// Each language is written in itself, so anyone finds theirs whatever the page shows
const NAMES: Record<Language, string> = { en: 'English', fr: 'Français' }

export function LanguagePicker() {
  const { language, setLanguage } = useLanguageStore()
  const t = useMessages()

  return (
    <div role="group" aria-label={t.app.language} className="flex justify-center gap-3">
      {(Object.keys(NAMES) as Language[]).map((id) => (
        <button
          key={id}
          type="button"
          lang={id}
          onClick={() => setLanguage(id)}
          aria-pressed={language === id}
          className="underline-offset-2 hover:text-white hover:underline aria-pressed:text-white aria-pressed:underline"
        >
          {NAMES[id]}
        </button>
      ))}
    </div>
  )
}
