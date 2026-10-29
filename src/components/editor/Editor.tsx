import { Redo2, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { useMessages } from '../../i18n/messages'
import { usePlayerStore } from '../../store/playerStore'
import { Segmented } from '../Segmented'
import { MODIFIER_KEY } from '../shortcutKeys'
import { AdvancedEditor } from './AdvancedEditor'
import { Library } from './Library'
import { SimpleEditor } from './SimpleEditor'

type Mode = 'simple' | 'advanced'

const HISTORY_BUTTON =
  'flex h-8 w-8 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent'

export function Editor() {
  const [mode, setMode] = useState<Mode>('simple')
  const { undoStack, redoStack, undo, redo } = usePlayerStore()
  const t = useMessages().editor

  return (
    <section className="w-full max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-night/60 p-4 backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Segmented
          label={t.mode}
          options={[
            { id: 'simple', label: t.simple },
            { id: 'advanced', label: t.advanced },
          ]}
          value={mode}
          onChange={setMode}
        />

        <div className="flex gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            aria-label={t.undo(MODIFIER_KEY)}
            title={t.undo(MODIFIER_KEY)}
            className={HISTORY_BUTTON}
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            aria-label={t.redo(MODIFIER_KEY)}
            title={t.redo(MODIFIER_KEY)}
            className={HISTORY_BUTTON}
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {mode === 'simple' ? <SimpleEditor /> : <AdvancedEditor />}

      <div className="border-t border-white/10 pt-5">
        <Library />
      </div>
    </section>
  )
}
