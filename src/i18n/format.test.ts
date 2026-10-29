import { describe, expect, it } from 'vitest'
import { generateSong } from '../engine/song'
import { en } from './en'
import { describeSong, noteLabel } from './format'
import { fr } from './fr'

describe('describeSong', () => {
  it('names the key and the scale in the language of the page', () => {
    const song = { ...generateSong(1), key: 'A', scale: 'aeolian', bpm: 77 } as const

    expect(describeSong(song, en)).toBe('A minor · 77 BPM')
    expect(describeSong(song, fr)).toBe('La mineur · 77 BPM')
  })
})

describe('noteLabel', () => {
  it('writes the notes in solfège in French, middle C being do 3', () => {
    expect(noteLabel('C4', en)).toBe('C4')
    expect(noteLabel('C4', fr)).toBe('Do3')
    expect(noteLabel('F#5', fr)).toBe('Fa♯4')
  })
})
