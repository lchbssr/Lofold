import type { Random } from './random'
import { diatonicChord, type Chord } from './theory'
import type { Mood, NoteName, ScaleName } from './types'

type Transitions = Record<number, ReadonlyArray<readonly [number, number]>>

// Markov chains on the scale degrees (0 = I, 1 = ii…): possible next chords with their weight.
// None of them repeats a chord. Each mood favors other movements and starts on other degrees.
const MOODS: Record<Mood, { starts: readonly number[]; next: Transitions }> = {
  chill: {
    starts: [0],
    next: {
      0: [[3, 3], [5, 3], [1, 2], [4, 1]],
      1: [[4, 5], [3, 1]],
      2: [[5, 3], [3, 2]],
      3: [[4, 2], [0, 2], [1, 2], [2, 1]],
      4: [[0, 5], [5, 2]],
      5: [[1, 3], [3, 3], [4, 1]],
      6: [[0, 3], [2, 1]],
    },
  },
  melancholic: {
    starts: [5, 1],
    next: {
      0: [[5, 4], [3, 2], [1, 2]],
      1: [[4, 3], [5, 2], [2, 2]],
      2: [[5, 4], [1, 2]],
      3: [[2, 2], [5, 3], [0, 1]],
      4: [[5, 4], [0, 2]],
      5: [[1, 3], [2, 3], [3, 2]],
      6: [[2, 2], [5, 2]],
    },
  },
  dreamy: {
    starts: [3, 0],
    next: {
      0: [[3, 5], [1, 1], [5, 1]],
      1: [[3, 3], [4, 2]],
      2: [[3, 3], [5, 1]],
      3: [[0, 4], [1, 2], [2, 2]],
      4: [[3, 2], [0, 3]],
      5: [[3, 4], [1, 1]],
      6: [[0, 3]],
    },
  },
}

/**
 * A chord progression in the given mood, which loops cleanly: its last chord is never
 * its first one, so the progression can repeat without playing the same chord twice in a row.
 */
export function generateProgression(random: Random, key: NoteName, scale: ScaleName, mood: Mood, length: number): Chord[] {
  const { starts, next } = MOODS[mood]
  const symbolOf = (degree: number) => diatonicChord(key, scale, degree).symbol
  // Half-diminished chords (m7b5) sound too tense for lo-fi: those degrees are skipped
  const usable = [0, 1, 2, 3, 4, 5, 6].filter((degree) => !symbolOf(degree).endsWith('m7b5'))

  const preferred = starts.filter((degree) => usable.includes(degree))
  const first = random.pick(preferred.length > 0 ? preferred : usable)
  const degrees = [first]

  while (degrees.length < length) {
    const current = degrees[degrees.length - 1]
    const isLast = degrees.length === length - 1
    const allowed = (degree: number) => usable.includes(degree) && (!isLast || degree !== first)

    let options = next[current].filter(([degree]) => allowed(degree))
    if (options.length === 0) {
      options = usable.filter((degree) => degree !== current && allowed(degree)).map((degree) => [degree, 1] as const)
    }
    degrees.push(random.weighted(options))
  }

  return degrees.map((degree) => diatonicChord(key, scale, degree))
}
