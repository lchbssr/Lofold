import type { DrumName } from '../../engine/edit'
import { STEPS_PER_BAR } from '../../engine/time'
import type { Song } from '../../engine/types'
import { useMessages } from '../../i18n/messages'
import { GRID_ROW, phoneVisibility, type Half } from './grid'
import { StepButton } from './StepButton'

const DRUMS: DrumName[] = ['kick', 'snare', 'hihat']

interface DrumGridProps {
  song: Song
  bar: number
  playingStep: number | null
  half: Half
  onToggle: (drum: DrumName, step: number, added: boolean) => void
}

export function DrumGrid({ song, bar, playingStep, half, onToggle }: DrumGridProps) {
  const start = bar * STEPS_PER_BAR
  const t = useMessages().editor

  return (
    <div className="space-y-1">
      {DRUMS.map((name) => {
        const label = t.drumNames[name]
        const steps = new Set(song.drums[name].map((hit) => Math.round(hit.step)))
        return (
          <div key={name} className={GRID_ROW}>
            <span className="text-xs leading-tight text-stone-400">{label}</span>
            {Array.from({ length: STEPS_PER_BAR }, (_, index) => {
              const hasHit = steps.has(start + index)
              return (
                <StepButton
                  key={index}
                  step={index}
                  label={t.cell(label, index + 1)}
                  state={hasHit ? 'start' : null}
                  isPlayhead={index === playingStep}
                  className={phoneVisibility(index, half)}
                  onClick={() => onToggle(name, start + index, !hasHit)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
