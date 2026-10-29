import { STEPS_PER_BAR } from '../../engine/time'
import { MELODY_RANGE } from '../../engine/song'
import { midiToNote, scaleNotes } from '../../engine/theory'
import type { Song } from '../../engine/types'
import { noteLabel } from '../../i18n/format'
import { useMessages } from '../../i18n/messages'
import { GRID_ROW, phoneVisibility, type Half } from './grid'
import { StepButton } from './StepButton'

interface PianoRollProps {
  song: Song
  bar: number
  playingStep: number | null
  half: Half
  onToggle: (step: number, note: string, added: boolean) => void
}

export function PianoRoll({ song, bar, playingStep, half, onToggle }: PianoRollProps) {
  const start = bar * STEPS_PER_BAR
  const t = useMessages()
  const rows = scaleNotes(song.key, song.scale, ...MELODY_RANGE).map(midiToNote).reverse()

  const stateAt = (note: string, step: number) => {
    for (const current of song.melody) {
      const from = Math.round(current.step)
      if (current.note === note && step >= from && step < from + current.duration) {
        return step === from ? 'start' : 'hold'
      }
    }
    return null
  }

  return (
    <div className="space-y-0.5">
      {rows.map((note) => (
        <div key={note} className={GRID_ROW}>
          <span className="text-xs text-stone-400">{noteLabel(note, t)}</span>
          {Array.from({ length: STEPS_PER_BAR }, (_, index) => {
            const state = stateAt(note, start + index)
            return (
              <StepButton
                key={index}
                step={index}
                label={t.editor.cell(noteLabel(note, t), index + 1)}
                state={state}
                isPlayhead={index === playingStep}
                className={phoneVisibility(index, half)}
                onClick={() => onToggle(start + index, note, state === null)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
