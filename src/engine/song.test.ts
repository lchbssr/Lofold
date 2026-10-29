import { describe, expect, it } from 'vitest'
import { STEPS_PER_BAR } from './time'
import { generateSong } from './song'
import { NOTE_NAMES, pitchClasses } from './theory'
import type { NoteEvent, Song } from './types'

const SEEDS = Array.from({ length: 300 }, (_, index) => index * 7919 + 1)
const songs = SEEDS.map((seed) => generateSong(seed))

const midiOf = (note: string) => {
  const [, name, octave] = note.match(/^([A-G]#?)(-?\d+)$/)!
  return NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number]) + 12 * (Number(octave) + 1)
}

const signature = (notes: NoteEvent[], start: number) =>
  notes.map((note) => `${Math.round(note.step) - start}:${note.note}`).join(' ')

const notesBetween = (song: Song, startBar: number, bars: number) =>
  song.melody.filter((note) => {
    const bar = Math.floor(Math.round(note.step) / STEPS_PER_BAR)
    return bar >= startBar && bar < startBar + bars
  })

describe('generateSong', () => {
  it('generates the same song for the same seed', () => {
    expect(generateSong(48213)).toEqual(generateSong(48213))
  })

  it('generates different songs for different seeds', () => {
    expect(generateSong(48213)).not.toEqual(generateSong(48214))
  })

  it('keeps the tempo and the length in lo-fi ranges', () => {
    for (const song of songs) {
      expect(song.bpm).toBeGreaterThanOrEqual(70)
      expect(song.bpm).toBeLessThanOrEqual(90)
      expect(song.bars).toBeGreaterThanOrEqual(32)
      expect(song.bars).toBeLessThanOrEqual(40)
    }
  })

  it('only plays notes of the scale', () => {
    for (const song of songs) {
      const scale = pitchClasses(song.key, song.scale)
      const notes = [...song.melody, ...song.bass].map((note) => note.note)
      const chordNotes = song.chords.flatMap((chord) => chord.notes)

      for (const note of [...notes, ...chordNotes]) {
        expect(scale).toContain(midiOf(note) % 12)
      }
    }
  })

  it('keeps the melody and the bass in their ranges', () => {
    for (const song of songs) {
      for (const note of song.melody) {
        expect(midiOf(note.note)).toBeGreaterThanOrEqual(60)
        expect(midiOf(note.note)).toBeLessThanOrEqual(84)
      }
      for (const note of song.bass) {
        expect(midiOf(note.note)).toBeGreaterThanOrEqual(36)
        expect(midiOf(note.note)).toBeLessThanOrEqual(55)
      }
    }
  })

  it('has a chord on every bar, never the same twice in a row within a section', () => {
    for (const song of songs) {
      expect(song.chords.map((chord) => chord.bar)).toEqual(Array.from({ length: song.bars }, (_, bar) => bar))
      for (const { startBar, bars } of song.sections) {
        const chords = song.chords.slice(startBar, startBar + bars)
        chords.slice(1).forEach((chord, index) => {
          expect(chord.symbol).not.toBe(chords[index].symbol)
        })
      }
    }
  })

  it('never plays two identical sections in a row', () => {
    for (const song of songs) {
      const sections = song.sections.map(({ startBar, bars }) =>
        signature(notesBetween(song, startBar, bars), startBar * STEPS_PER_BAR),
      )
      sections.slice(1).forEach((section, index) => {
        expect(section).not.toBe(sections[index])
      })
    }
  })

  it('never repeats the same melody bar more than twice in a row', () => {
    for (const song of songs) {
      const bars = Array.from({ length: song.bars }, (_, bar) =>
        signature(notesBetween(song, bar, 1), bar * STEPS_PER_BAR),
      ).filter((bar) => bar !== '')

      bars.slice(2).forEach((bar, index) => {
        expect(bar === bars[index] && bar === bars[index + 1]).toBe(false)
      })
    }
  })
})
