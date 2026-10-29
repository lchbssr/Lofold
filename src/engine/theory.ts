import type { NoteName, ScaleName } from './types'

export const NOTE_NAMES: readonly NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const SCALES: Record<ScaleName, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
}

export interface Chord {
  symbol: string
  notes: number[]
}

export function midiToNote(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

export function pitchClasses(key: NoteName, scale: ScaleName): number[] {
  const tonic = NOTE_NAMES.indexOf(key)
  return SCALES[scale].map((interval) => (tonic + interval) % 12)
}

export function scaleNotes(key: NoteName, scale: ScaleName, low: number, high: number): number[] {
  const classes = pitchClasses(key, scale)
  const notes: number[] = []
  for (let midi = low; midi <= high; midi++) {
    if (classes.includes(midi % 12)) {
      notes.push(midi)
    }
  }
  return notes
}

// Chord quality from its third, fifth and seventh, in semitones above the root
const SEVENTH_CHORDS: Record<string, string> = {
  '4-7-11': 'maj7',
  '3-7-10': 'm7',
  '4-7-10': '7',
  '3-6-10': 'm7b5',
}
const NINTH_CHORDS: Record<string, string> = { maj7: 'maj9', m7: 'm9', '7': '9' }

/**
 * Chord built on a degree of the scale (0 = first degree) by stacking thirds,
 * up to the ninth when it sounds good (a major ninth above the root).
 * The root always stays in the given octave, so every chord sits in the same register.
 */
export function diatonicChord(key: NoteName, scale: ScaleName, degree: number, rootOctave = 3): Chord {
  const tonic = 12 * (rootOctave + 1) + NOTE_NAMES.indexOf(key)
  const intervals = SCALES[scale]
  const noteAt = (scaleDegree: number) =>
    tonic + intervals[scaleDegree % 7] + 12 * Math.floor(scaleDegree / 7)

  const octaveTop = 12 * (rootOctave + 2)
  const [root, third, fifth, seventh, ninth] = [0, 2, 4, 6, 8]
    .map((offset) => noteAt(degree + offset))
    .map((midi, _, notes) => (notes[0] >= octaveTop ? midi - 12 : midi))
  const seventhQuality = SEVENTH_CHORDS[`${third - root}-${fifth - root}-${seventh - root}`]
  const ninthQuality = NINTH_CHORDS[seventhQuality]
  const withNinth = ninthQuality !== undefined && ninth - root === 14

  return {
    symbol: NOTE_NAMES[root % 12] + (withNinth ? ninthQuality : seventhQuality),
    notes: withNinth ? [root, third, fifth, seventh, ninth] : [root, third, fifth, seventh],
  }
}
