export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export type ScaleName = 'major' | 'dorian' | 'aeolian'

export type SectionName = 'intro' | 'A' | 'B' | 'outro'

export interface Section {
  name: SectionName
  startBar: number
  bars: number
}

export interface ChordEvent {
  bar: number
  symbol: string
  notes: string[]
}

/** Positions and durations are counted in sixteenth notes from the start of the song. */
export interface NoteEvent {
  step: number
  duration: number
  note: string
  velocity: number
}

export interface DrumHit {
  step: number
  velocity: number
}

export interface Drums {
  kick: DrumHit[]
  snare: DrumHit[]
  hihat: DrumHit[]
}

export type Mood = 'chill' | 'melancholic' | 'dreamy'
export type MelodyStyle = 'none' | 'calm' | 'lively'
export type DrumStyle = 'none' | 'light' | 'classic' | 'busy'

/**
 * What a beginner picks for a section, instead of writing notes. The variants are the
 * dice buttons: each value gives another take of the same part, everything else unchanged.
 */
export interface SectionSettings {
  mood: Mood
  chordsVariant: number
  melody: MelodyStyle
  melodyVariant: number
  drums: DrumStyle
  drumsVariant: number
  bass: boolean
}

export type Arrangement = Record<SectionName, SectionSettings>

export type Part = 'keys' | 'lead' | 'bass' | 'drums'

export interface Instrumentation {
  keys: 'piano' | 'guitar' | 'synth'
  lead: 'piano' | 'sax' | 'synth'
  bass: 'double-bass' | 'electric-bass' | 'synth'
  drums: 'retro' | 'synth'
}

export interface Song {
  seed: number
  bpm: number
  key: NoteName
  scale: ScaleName
  /** Delay applied to off-beat eighth notes by the player, from 0 (straight) to 0.3 */
  swing: number
  arrangement: Arrangement
  instrumentation: Instrumentation
  bars: number
  sections: Section[]
  chords: ChordEvent[]
  melody: NoteEvent[]
  bass: NoteEvent[]
  drums: Drums
}
