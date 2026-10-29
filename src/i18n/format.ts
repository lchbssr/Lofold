import type { NoteName, Song } from '../engine/types'
import type { Messages } from './en'

export function describeSong(song: Song, t: Messages): string {
  return `${t.music.notes[song.key]} ${t.music.scales[song.scale]} · ${song.bpm} BPM`
}

export function noteLabel(note: string, t: Messages): string {
  const match = /^([A-G]#?)(-?\d+)$/.exec(note)
  if (!match) {
    return note
  }
  const [, name, octave] = match
  return `${t.music.notes[name as NoteName]}${Number(octave) + t.octaveOffset}`
}
