import { describe, expect, it } from 'vitest'
import { diatonicChord, midiToNote, pitchClasses, scaleNotes } from './theory'

describe('theory', () => {
  it('converts MIDI numbers to note names', () => {
    expect(midiToNote(60)).toBe('C4')
    expect(midiToNote(61)).toBe('C#4')
    expect(midiToNote(36)).toBe('C2')
  })

  it('lists the pitch classes of a scale', () => {
    expect(pitchClasses('D', 'dorian')).toEqual([2, 4, 5, 7, 9, 11, 0])
  })

  it('lists the scale notes within a range', () => {
    expect(scaleNotes('C', 'major', 60, 72).map(midiToNote)).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'])
  })

  it('builds ninth chords on the degrees of the scale', () => {
    const chord = diatonicChord('C', 'major', 1)

    expect(chord.symbol).toBe('Dm9')
    expect(chord.notes.map(midiToNote)).toEqual(['D3', 'F3', 'A3', 'C4', 'E4'])
    expect(diatonicChord('E', 'aeolian', 0).symbol).toBe('Em9')
    expect(diatonicChord('C', 'major', 4).symbol).toBe('G9')
  })

  it('stops at the seventh when the ninth would clash', () => {
    // The ninth of the third degree in C major is F, a minor ninth above E
    expect(diatonicChord('C', 'major', 2).symbol).toBe('Em7')
    expect(diatonicChord('C', 'major', 6).symbol).toBe('Bm7b5')
  })
})
