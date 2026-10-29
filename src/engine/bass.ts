import type { MelodyNote } from './melody'
import type { Random } from './random'
import type { Chord } from './theory'
import { STEPS_PER_BAR } from './time'

const BASS_LOW = 36

/**
 * Root of each chord on the first beat, then the root or the fifth on the third beat.
 * Before a chord change, a passing note sometimes leads to the next root.
 */
export function generateBass(random: Random, chords: Chord[], next: Chord, scale: readonly number[]): MelodyNote[] {
  const notes: MelodyNote[] = []

  chords.forEach((chord, bar) => {
    const start = bar * STEPS_PER_BAR
    const root = bassRoot(chord)
    const fifth = root + (chord.notes[2] - chord.notes[0])

    notes.push({ step: start, duration: 6, midi: root, velocity: 0.8 })
    notes.push({ step: start + 8, duration: 4, midi: random.chance(0.6) ? root : fifth, velocity: 0.65 })

    if (random.chance(0.4)) {
      const passing = closestNeighbour(scale, bassRoot(chords[bar + 1] ?? next))
      if (passing !== undefined) {
        notes.push({ step: start + 14, duration: 2, midi: passing, velocity: 0.55 })
      }
    }
  })

  return notes
}

export function bassRoot(chord: Chord): number {
  return BASS_LOW + ((chord.notes[0] - BASS_LOW) % 12)
}

function closestNeighbour(scale: readonly number[], target: number): number | undefined {
  const index = scale.indexOf(target)
  if (index === -1) {
    return undefined
  }
  return scale[index > 0 ? index - 1 : index + 1]
}
