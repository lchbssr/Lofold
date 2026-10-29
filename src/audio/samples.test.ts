import { describe, expect, it } from 'vitest'
import { generateSong } from '../engine/song'
import type { Song } from '../engine/types'
import { SAMPLED_INSTRUMENTS, SAMPLED_VOICES, sampleUrl, transposeOf, type SampledChoice, type SampledInstrument } from './samples'

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function toMidi(note: string): number {
  return (Number(note.slice(-1)) + 1) * 12 + NAMES.indexOf(note.slice(0, -1))
}

function notesOf(song: Song, choice: SampledChoice): string[] {
  if (choice.startsWith('keys:')) return song.chords.flatMap((chord) => chord.notes)
  if (choice.startsWith('lead:')) return song.melody.map((note) => note.note)
  return song.bass.map((note) => note.note)
}

describe('samples', () => {
  // Transposed by more than 2 semitones, a sample starts to sound unnatural
  it('cover every note the parts play within 2 semitones', () => {
    for (const [choice, { samples }] of Object.entries(SAMPLED_VOICES) as Array<[SampledChoice, { samples: SampledInstrument }]>) {
      const recorded = SAMPLED_INSTRUMENTS[samples].notes.map(toMidi)

      for (let seed = 1; seed <= 200; seed++) {
        for (const note of notesOf(generateSong(seed), choice)) {
          const played = toMidi(note) + transposeOf(samples)
          const distance = Math.min(...recorded.map((midi) => Math.abs(midi - played)))
          expect(distance, `${choice} ${note}, seed ${seed}`).toBeLessThanOrEqual(2)
        }
      }
    }
  })

  it('all exist in the public folder', () => {
    const files = Object.keys(import.meta.glob('../../public/samples/**/*.wav'))

    for (const [instrument, { notes }] of Object.entries(SAMPLED_INSTRUMENTS) as Array<[SampledInstrument, { notes: readonly string[] }]>) {
      for (const note of notes) {
        expect(files).toContain(`../../public${sampleUrl(instrument, note)}`)
      }
    }
  })

  it('write a sharp as "s" in the file names', () => {
    expect(sampleUrl('piano', 'C#3')).toBe('/samples/piano/Cs3.wav')
  })
})
