import { describe, expect, it } from 'vitest'
import { decodeInstrumentation, defaultInstrumentation, encodeInstrumentation, INSTRUMENTS, PARTS } from './instrumentation'
import { generateSong } from './song'

describe('defaultInstrumentation', () => {
  it('draws the same instruments for the same seed', () => {
    expect(defaultInstrumentation(48213)).toEqual(defaultInstrumentation(48213))
  })

  it('uses every instrument of every part over many seeds', () => {
    const drawn = Array.from({ length: 300 }, (_, seed) => defaultInstrumentation(seed))

    for (const part of PARTS) {
      for (const instrument of INSTRUMENTS[part]) {
        expect(drawn.some((instrumentation) => instrumentation[part] === instrument), `${part}: ${instrument}`).toBe(true)
      }
    }
  })

  it('does not change the notes of a song', () => {
    const song = generateSong(7)
    const other = generateSong(7, song.arrangement, { keys: 'synth', lead: 'sax', bass: 'synth', drums: 'synth' })

    expect({ ...other, instrumentation: song.instrumentation }).toEqual(song)
  })
})

describe('encodeInstrumentation', () => {
  it('gives back the same instruments once decoded', () => {
    const instrumentation = { keys: 'guitar', lead: 'synth', bass: 'electric-bass', drums: 'retro' } as const

    expect(encodeInstrumentation(instrumentation)).toBe('1.2.1.0')
    expect(decodeInstrumentation('1.2.1.0')).toEqual(instrumentation)
  })

  it('rejects invalid text', () => {
    for (const text of ['', '1.2.1', '1.2.1.0.0', '9.0.0.0', 'a.b.c.d', '-1.0.0.0']) {
      expect(decodeInstrumentation(text), text).toBeNull()
    }
  })
})
