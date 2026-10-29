import { TriangleAlert, X } from 'lucide-react'
import { useMessages } from '../i18n/messages'
import { usePlayerStore } from '../store/playerStore'

export function ErrorMessage() {
  const error = usePlayerStore((state) => state.error)
  const dismissError = usePlayerStore((state) => state.dismissError)
  const t = useMessages().errors

  return (
    // Always in the page, so screen readers announce the message as soon as it appears
    <div role="alert">
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-200">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <p className="flex-1">{t[error]}</p>
          <button
            type="button"
            onClick={dismissError}
            aria-label={t.close}
            className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
