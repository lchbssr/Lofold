import * as Tone from 'tone'
import { STEPS_PER_BAR } from '../engine/time'
import type { DrumHit, NoteEvent, Song } from '../engine/types'
import type { Band } from './instruments'
import { DRUMS } from './samples'
import { stepsToTicks } from './time'

const DUPLICATE_WINDOW = 0.01

/**
 * Schedules every note of the song on the transport of the context, from the beginning.
 * Shared by the live player and the WAV export, so both play exactly the same thing.
 */
export function scheduleSong(context: Tone.BaseContext, song: Song, band: Band): Tone.Part[] {
  const { keys, lead, bass, drums } = band
  const { transport } = context

  transport.bpm.value = song.bpm
  transport.swing = song.swing
  transport.swingSubdivision = '8n'

  const part = <T extends { step: number }>(events: T[], play: (time: number, event: T) => void) => {
    let last: { event: T; time: number } | null = null

    return new Tone.Part({
      context,
      callback: (time, value) => {
        // Tone.js cannot infer the type of generic events: each value is one of the events below
        const { event } = value as { event: T }
        // Tone.js invokes an event twice when its tick falls exactly on the edge of an audio block,
        // which happens often when rendering a file. Single-voice synths refuse a second identical start.
        // The two calls are a fraction of a millisecond apart (not always exactly equal), while a looped
        // bar plays the same event again seconds later: only the near-simultaneous call is skipped.
        if (last?.event === event && Math.abs(time - last.time) < DUPLICATE_WINDOW) {
          return
        }
        last = { event, time }
        play(time, event)
      },
      events: events.map((event) => ({ time: stepsToTicks(event.step), event })),
    }).start(0)
  }

  const chords = song.chords.map((chord) => ({ step: chord.bar * STEPS_PER_BAR, notes: chord.notes }))

  return [
    part(chords, (time, chord) => {
      chord.notes.forEach((note, index) => {
        keys([note], stepsToTicks(15), time + index * 0.015, 0.45)
      })
    }),
    part(song.melody, (time, note: NoteEvent) => {
      lead([note.note], stepsToTicks(note.duration), time, note.velocity)
    }),
    part(song.bass, (time, note: NoteEvent) => {
      bass([note.note], stepsToTicks(note.duration), time, note.velocity)
    }),
    ...DRUMS.map((drum) => part(song.drums[drum], (time, hit: DrumHit) => drums(drum, time, hit.velocity))),
  ]
}
