// Kept apart from Tone.js, so the tests can check them without an audio context

import type { Instrumentation, Part } from '../engine/types'

export const SAMPLED_INSTRUMENTS = {
  piano: { notes: ['A2', 'C#3', 'F3', 'A3', 'C#4', 'F4', 'A4', 'C#5', 'F5', 'A5', 'C#6'] },
  guitar: { notes: ['B2', 'D#3', 'G3', 'B3', 'D#4', 'G4', 'B4', 'D#5'] },
  // The melody goes higher than an alto saxophone: it is played one octave lower, where the sax sounds best
  sax: { notes: ['C#3', 'E3', 'G3', 'A#3', 'C#4', 'E4', 'G4', 'A#4', 'C#5'], transpose: -12 },
  'double-bass': { notes: ['A#1', 'C2', 'D2', 'E2', 'F#2', 'G#2', 'A2', 'C#3', 'E3'] },
  'electric-bass': { notes: ['C2', 'D#2', 'F#2', 'A2', 'C3', 'D#3', 'F#3'] },
  drums: { notes: ['kick', 'snare', 'hihat'] },
} as const satisfies Record<string, { notes: readonly string[]; transpose?: number }>

export type SampledInstrument = keyof typeof SAMPLED_INSTRUMENTS

export const DRUMS = SAMPLED_INSTRUMENTS.drums.notes
export type Drum = (typeof DRUMS)[number]

type NotesPart = Exclude<Part, 'drums'>
export type SampledChoice = { [P in NotesPart]: `${P}:${Exclude<Instrumentation[P], 'synth'>}` }[NotesPart]

export const SAMPLED_VOICES: Record<SampledChoice, { samples: SampledInstrument; volume: number; release: number }> = {
  'keys:piano': { samples: 'piano', volume: -9, release: 1.2 },
  'keys:guitar': { samples: 'guitar', volume: -11.5, release: 1 },
  'lead:piano': { samples: 'piano', volume: -7, release: 0.6 },
  'lead:sax': { samples: 'sax', volume: -8.5, release: 0.3 },
  'bass:double-bass': { samples: 'double-bass', volume: -5, release: 0.25 },
  'bass:electric-bass': { samples: 'electric-bass', volume: -6, release: 0.25 },
}

export function transposeOf(instrument: SampledInstrument): number {
  const definition = SAMPLED_INSTRUMENTS[instrument]
  return 'transpose' in definition ? definition.transpose : 0
}

export function sampleUrl(instrument: SampledInstrument, name: string): string {
  return `${import.meta.env.BASE_URL}samples/${instrument}/${name.replace('#', 's')}.wav`
}
