import type { Song } from '../../engine/types'
import { useMessages } from '../../i18n/messages'

interface BarStripProps {
  song: Song
  selectedBar: number
  playingBar: number | null
  onSelect: (bar: number) => void
}

export function BarStrip({ song, selectedBar, playingBar, onSelect }: BarStripProps) {
  const t = useMessages()

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {song.sections.map((section) => (
        <div key={section.startBar} className="shrink-0">
          <p className="mb-1 text-xs text-stone-400">{t.music.sections[section.name]}</p>
          <div className="flex gap-1">
            {song.chords.slice(section.startBar, section.startBar + section.bars).map((chord) => (
              <button
                key={chord.bar}
                type="button"
                onClick={() => onSelect(chord.bar)}
                aria-label={t.editor.barButton(chord.bar + 1, chord.symbol, chord.bar === playingBar)}
                aria-pressed={chord.bar === selectedBar}
                className={`w-14 rounded-md bg-white/5 py-1.5 text-xs text-stone-300 transition-colors hover:bg-white/10 aria-pressed:bg-glow aria-pressed:text-night ${chord.bar === playingBar ? 'ring-1 ring-white/70' : ''}`}
              >
                {chord.symbol}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
