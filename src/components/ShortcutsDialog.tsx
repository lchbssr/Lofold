import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { useMessages, type Messages } from '../i18n/messages'
import { canGoFullscreen } from './fullscreen'
import { Key } from './Key'
import { MODIFIER_KEY } from './shortcutKeys'

type Action = Exclude<keyof Messages['shortcuts'], 'title' | 'close' | 'space' | 'shift'>

const SHORTCUTS: { keys: string[]; action: Action; shown?: () => boolean }[] = [
  { keys: ['space'], action: 'playPause' },
  { keys: ['←', '→'], action: 'previousNext' },
  { keys: ['shift', '←', '→'], action: 'moveByBar' },
  { keys: ['↑', '↓'], action: 'volume' },
  { keys: ['M'], action: 'mute' },
  { keys: ['F'], action: 'fullscreen', shown: canGoFullscreen },
  { keys: [MODIFIER_KEY, 'Z'], action: 'undo' },
  { keys: [MODIFIER_KEY, 'shift', 'Z'], action: 'redo' },
  { keys: ['?'], action: 'help' },
]

interface ShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const t = useMessages().shortcuts
  const keyName = (key: string) => (key === 'space' || key === 'shift' ? t[key] : key)

  useEffect(() => {
    const element = dialog.current
    if (open && !element?.open) element?.showModal()
    if (!open && element?.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click outside the content, on the dark backdrop, lands on the dialog itself
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/10 bg-night p-0 text-stone-200 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-semibold text-white">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full p-1 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          {SHORTCUTS.filter(({ shown }) => shown?.() ?? true).map(({ keys, action }) => (
            <div key={action} className="flex items-center justify-between gap-4">
              <dt className="flex shrink-0 gap-1">
                {keys.map((key) => (
                  <Key key={key}>{keyName(key)}</Key>
                ))}
              </dt>
              <dd className="text-right text-stone-300">{t[action]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  )
}
