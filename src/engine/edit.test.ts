import { describe, expect, it } from 'vitest'
import { scaleChords, setChord, toggleDrumHit, toggleMelodyNote } from './edit'
import { generateSong } from './song'

// A song in C major, whose expected chords are easy to read. Its intro lasts 4 bars:
// part A starts at bar 4, step 64.
const seed = Array.from({ length: 1000 }, (_, index) => index).find((candidate) => {
  const { key, scale } = generateSong(candidate)
  return key === 'C' && scale === 'major'
})!
const song = generateSong(seed)

describe('toggleDrumHit', () => {
  it('adds a hit on an empty step, then removes it', () => {
    const added = toggleDrumHit(song, 'snare', 65)
    expect(added.drums.snare.some((hit) => hit.step === 65)).toBe(true)

    const removed = toggleDrumHit(added, 'snare', 65)
    expect(removed.drums.snare).toEqual(song.drums.snare)
  })

  it('removes a humanized hit when its grid step is toggled', () => {
    const hit = song.drums.hihat[3]
    const removed = toggleDrumHit(song, 'hihat', Math.round(hit.step))

    expect(removed.drums.hihat).not.toContainEqual(hit)
  })

  it('never modifies the original song', () => {
    const before = structuredClone(song)
    toggleDrumHit(song, 'kick', 3)

    expect(song).toEqual(before)
  })
})

describe('setChord', () => {
  it('offers the seven chords of the scale', () => {
    expect(scaleChords(song).map((chord) => chord.symbol)).toEqual(['Cmaj9', 'Dm9', 'Em7', 'Fmaj9', 'G9', 'Am9', 'Bm7b5'])
  })

  it('changes the chord of a bar and the bass follows', () => {
    const edited = setChord(song, 4, 3)
    const bassOfBar = edited.bass.filter((note) => note.step >= 64 && note.step < 80)

    expect(edited.chords[4]).toEqual({ bar: 4, symbol: 'Fmaj9', notes: ['F3', 'A3', 'C4', 'E4', 'G4'] })
    expect(bassOfBar.map((note) => note.note)).toEqual(['F2', 'F2'])
    expect(edited.chords.filter((chord) => chord.bar !== 4)).toEqual(song.chords.filter((chord) => chord.bar !== 4))
  })
})

describe('toggleMelodyNote', () => {
  it('adds an eighth note, then removes it', () => {
    const added = toggleMelodyNote(song, 5, 'E5')
    expect(added.melody).toContainEqual({ step: 5, duration: 2, note: 'E5', velocity: 0.6 })

    const removed = toggleMelodyNote(added, 5, 'E5')
    expect(removed.melody).toEqual(song.melody)
  })

  it('removes a note when one of its steps is clicked', () => {
    const added = toggleMelodyNote(song, 5, 'E5')

    expect(toggleMelodyNote(added, 6, 'E5').melody).toEqual(song.melody)
  })

  it('replaces the note starting on the same step', () => {
    const edited = toggleMelodyNote(toggleMelodyNote(song, 5, 'E5'), 5, 'G5')
    const notesAtStep = edited.melody.filter((note) => Math.round(note.step) === 5)

    expect(notesAtStep.map((note) => note.note)).toEqual(['G5'])
  })
})
