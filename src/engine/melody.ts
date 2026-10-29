import type { Random } from './random'
import type { Chord } from './theory'
import { STEPS_PER_BAR } from './time'
import type { MelodyStyle } from './types'

export interface MotifNote {
  step: number
  duration: number
  move: number
}

export interface MelodyNote {
  step: number
  duration: number
  midi: number
  velocity: number
}

const STYLES: Record<Exclude<MelodyStyle, 'none'>, { density: number; syncopation: number; moves: ReadonlyArray<readonly [number, number]> }> = {
  calm: {
    density: 0.28,
    syncopation: 0.08,
    moves: [[0, 2], [1, 4], [-1, 4], [2, 1], [-2, 1]],
  },
  lively: {
    density: 0.55,
    syncopation: 0.25,
    moves: [[0, 1], [1, 3], [-1, 3], [2, 2], [-2, 2], [3, 1], [-3, 1]],
  },
}

/**
 * Rhythm and contour of a short two-bar idea. It is repeated through a section with
 * variations, which makes the melody recognizable without looping identically.
 */
export function generateMotif(random: Random, style: Exclude<MelodyStyle, 'none'>): MotifNote[] {
  const { density, syncopation, moves } = STYLES[style]
  const steps: number[] = []

  for (let bar = 0; bar < 2; bar++) {
    const onsets = [0, 2, 4, 6, 8, 10, 12, 14].filter((step) => step === 0 || random.chance(density))
    if (onsets.length < 2) {
      onsets.push(random.pick([6, 8, 10]))
    }
    for (const onset of [...new Set(onsets)].sort((a, b) => a - b)) {
      const step = onset > 0 && random.chance(syncopation) ? onset + 1 : onset
      steps.push(bar * STEPS_PER_BAR + step)
    }
  }

  return steps.map((step, index) => {
    const nextStep = steps[index + 1] ?? 2 * STEPS_PER_BAR
    return {
      step,
      duration: Math.max(1, Math.min(nextStep - step, index === steps.length - 1 ? 6 : 4)),
      move: index === 0 ? 0 : random.weighted(moves),
    }
  })
}

interface RenderOptions {
  transpose: number
  sparse: boolean
}

/**
 * Plays the motif over the chords of a section (one chord per bar), two bars at a time.
 * Every other pair of bars is a variation, and notes on strong beats land on chord tones.
 */
export function renderMelody(
  random: Random,
  motif: MotifNote[],
  chords: Chord[],
  scale: readonly number[],
  { transpose, sparse }: RenderOptions,
): MelodyNote[] {
  const notes: MelodyNote[] = []
  const pairs = Math.floor(chords.length / 2)
  let index = Math.floor(scale.length / 2) + transpose

  for (let pair = 0; pair < pairs; pair++) {
    const isVariation = pair % 2 === 1
    const isLastPair = pair === pairs - 1
    const variedFrom = motif.length - random.int(1, 2)

    motif.forEach((motifNote, position) => {
      if (sparse && position % 2 === 1) {
        return
      }

      let move = motifNote.move
      if (position === 0 && isVariation) {
        move = random.pick([-2, 2])
      } else if (isVariation && position >= variedFrom) {
        move = random.pick([-2, -1, 1, 2])
      }

      index += move
      if (index < 0 || index >= scale.length) {
        index -= 2 * move
      }
      index = Math.max(0, Math.min(scale.length - 1, index))

      const bar = pair * 2 + Math.floor(motifNote.step / STEPS_PER_BAR)
      const stepInBar = motifNote.step % STEPS_PER_BAR
      const isStrongBeat = stepInBar % 8 === 0
      if (isStrongBeat) {
        index = nearestChordTone(scale, index, chords[bar])
      }

      const isFinalNote = isLastPair && position === motif.length - 1
      notes.push({
        step: pair * 2 * STEPS_PER_BAR + motifNote.step,
        duration: isFinalNote ? STEPS_PER_BAR - stepInBar : motifNote.duration,
        midi: scale[index],
        velocity: isStrongBeat ? 0.7 : 0.55,
      })
    })
  }

  return notes
}

function nearestChordTone(scale: readonly number[], index: number, chord: Chord): number {
  const chordClasses = chord.notes.map((midi) => midi % 12)
  for (let distance = 0; distance < scale.length; distance++) {
    for (const candidate of [index - distance, index + distance]) {
      if (candidate >= 0 && candidate < scale.length && chordClasses.includes(scale[candidate] % 12)) {
        return candidate
      }
    }
  }
  return index
}
