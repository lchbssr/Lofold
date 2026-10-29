import { bassRoot } from './bass'
import { diatonicChord, midiToNote, type Chord } from './theory'
import { STEPS_PER_BAR } from './time'
import type { Drums, Song } from './types'

export type DrumName = keyof Drums

const DEFAULT_VELOCITY: Record<DrumName, number> = { kick: 0.85, snare: 0.75, hihat: 0.4 }

/** Events are compared on the sixteenth-note grid, ignoring the humanization */
function gridStep(step: number): number {
  return Math.round(step)
}

function byStep<T extends { step: number }>(a: T, b: T): number {
  return a.step - b.step
}

export function scaleChords(song: Song): Chord[] {
  return [0, 1, 2, 3, 4, 5, 6].map((degree) => diatonicChord(song.key, song.scale, degree))
}

export function toggleDrumHit(song: Song, drum: DrumName, step: number): Song {
  const hits = song.drums[drum]
  const exists = hits.some((hit) => gridStep(hit.step) === step)
  const next = exists
    ? hits.filter((hit) => gridStep(hit.step) !== step)
    : [...hits, { step, velocity: DEFAULT_VELOCITY[drum] }].sort(byStep)

  return { ...song, drums: { ...song.drums, [drum]: next } }
}

export function setChord(song: Song, bar: number, degree: number): Song {
  const chord = diatonicChord(song.key, song.scale, degree)
  const root = midiToNote(bassRoot(chord))
  const start = bar * STEPS_PER_BAR
  const end = start + STEPS_PER_BAR

  return {
    ...song,
    chords: song.chords.map((current) =>
      current.bar === bar ? { bar, symbol: chord.symbol, notes: chord.notes.map(midiToNote) } : current,
    ),
    bass: [
      ...song.bass.filter((note) => gridStep(note.step) < start || gridStep(note.step) >= end),
      { step: start, duration: 6, note: root, velocity: 0.8 },
      { step: start + 8, duration: 4, note: root, velocity: 0.65 },
    ].sort(byStep),
  }
}

export function toggleMelodyNote(song: Song, step: number, note: string): Song {
  const covering = song.melody.find(
    (current) => current.note === note && gridStep(current.step) <= step && step < gridStep(current.step) + current.duration,
  )
  if (covering) {
    return { ...song, melody: song.melody.filter((current) => current !== covering) }
  }

  return {
    ...song,
    melody: [...song.melody.filter((current) => gridStep(current.step) !== step), { step, duration: 2, note, velocity: 0.6 }].sort(byStep),
  }
}
