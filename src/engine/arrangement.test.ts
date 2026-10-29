import { describe, expect, it } from 'vitest'
import { decodeArrangement, defaultArrangement, encodeArrangement } from './arrangement'
import { STEPS_PER_BAR } from './time'
import { generateSong, rearrange } from './song'
import type { NoteEvent, SectionName, Song } from './types'

const song = generateSong(48213)

const barsOf = (target: Song, name: SectionName) =>
  target.sections.filter((section) => section.name === name).flatMap(({ startBar, bars }) => Array.from({ length: bars }, (_, bar) => startBar + bar))

const notesIn = (notes: NoteEvent[], bars: number[]) =>
  notes.filter((note) => bars.includes(Math.floor(Math.round(note.step) / STEPS_PER_BAR)))

const allHits = (target: Song) => [...target.drums.kick, ...target.drums.snare, ...target.drums.hihat]

describe('arrangement', () => {
  it('gives the default arrangement when none is given', () => {
    expect(generateSong(48213, defaultArrangement(48213))).toEqual(song)
    expect(song.arrangement).toEqual(defaultArrangement(48213))
  })

  it('starts with a quiet intro', () => {
    expect(song.arrangement.intro).toMatchObject({ melody: 'none', drums: 'light' })
    expect(notesIn(song.melody, barsOf(song, 'intro'))).toEqual([])
  })

  it('re-rolls the melody of a section without touching anything else', () => {
    const rerolled = rearrange(song, 'A', { melodyVariant: 1 })
    const partA = barsOf(song, 'A')
    const otherBars = Array.from({ length: song.bars }, (_, bar) => bar).filter((bar) => !partA.includes(bar))

    expect(notesIn(rerolled.melody, partA)).not.toEqual(notesIn(song.melody, partA))
    expect(notesIn(rerolled.melody, otherBars)).toEqual(notesIn(song.melody, otherBars))
    expect(rerolled.chords).toEqual(song.chords)
    expect(rerolled.bass).toEqual(song.bass)
    expect(rerolled.drums).toEqual(song.drums)
  })

  it('changes the chords of a section with its mood', () => {
    const current = song.arrangement.B.mood
    const otherMood = current === 'dreamy' ? 'melancholic' : 'dreamy'
    const changed = rearrange(song, 'B', { mood: otherMood, chordsVariant: 0 })
    const partB = barsOf(song, 'B')

    expect(changed.chords.filter((chord) => partB.includes(chord.bar))).not.toEqual(song.chords.filter((chord) => partB.includes(chord.bar)))
    expect(changed.chords.filter((chord) => !partB.includes(chord.bar))).toEqual(song.chords.filter((chord) => !partB.includes(chord.bar)))
  })

  it('removes a part when it is turned off', () => {
    const silentB = rearrange(rearrange(rearrange(song, 'B', { melody: 'none' }), 'B', { drums: 'none' }), 'B', { bass: false })
    const partB = barsOf(song, 'B')
    const hitsInB = allHits(silentB).filter((hit) => partB.includes(Math.floor(Math.round(hit.step) / STEPS_PER_BAR)))

    expect(notesIn(silentB.melody, partB)).toEqual([])
    expect(notesIn(silentB.bass, partB)).toEqual([])
    expect(hitsInB).toEqual([])
  })

  it('makes busy drums denser than classic ones', () => {
    const classic = rearrange(song, 'A', { drums: 'classic' })
    const busy = rearrange(song, 'A', { drums: 'busy' })

    expect(allHits(busy).length).toBeGreaterThan(allHits(classic).length)
  })
})

describe('encodeArrangement', () => {
  it('fits an arrangement in a short text and reads it back', () => {
    const arrangement = rearrange(song, 'B', { melody: 'lively', melodyVariant: 12, bass: false }).arrangement
    const text = encodeArrangement(arrangement)

    expect(text).toMatch(/^[\d.-]+$/)
    expect(text.length).toBeLessThan(80)
    expect(decodeArrangement(text)).toEqual(arrangement)
  })

  it('rejects texts that are not an arrangement', () => {
    expect(decodeArrangement('')).toBeNull()
    expect(decodeArrangement('hello')).toBeNull()
    expect(decodeArrangement('0.0.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1')).toBeNull()
    expect(decodeArrangement('9.0.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1')).toBeNull()
    expect(decodeArrangement('0.0.0.0.1.0.2-0.0.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1')).toBeNull()
    expect(decodeArrangement('0.-1.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1-0.0.0.0.1.0.1')).toBeNull()
  })
})
