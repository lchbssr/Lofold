import { describe, expect, it } from 'vitest'
import { generateSong } from '../engine/song'
import { songTitle } from '../engine/title'
import { findSavedTrack, songName, useLibraryStore } from './libraryStore'

describe('findSavedTrack', () => {
  const song = generateSong(7)
  const tracks = [{ id: 'a', savedAt: '2026-10-28T20:00:00.000Z', song: JSON.parse(JSON.stringify(song)) }]

  it('finds a track saved with the same content, even as another object', () => {
    expect(findSavedTrack(tracks, song)?.id).toBe('a')
  })

  it('does not take another version of the same seed for the saved one', () => {
    const changed = { ...song, instrumentation: { ...song.instrumentation, drums: song.instrumentation.drums === 'synth' ? 'retro' : 'synth' } } as const

    expect(findSavedTrack(tracks, changed)).toBeUndefined()
  })
})

describe('renaming a track', () => {
  const song = generateSong(11)

  it('shows the name given to a saved track, and the one of its seed once the name is erased', () => {
    const { save } = useLibraryStore.getState()
    save(song)
    const [track] = useLibraryStore.getState().tracks

    useLibraryStore.getState().rename(track.id, '  Pour réviser  ')

    expect(songName(useLibraryStore.getState().tracks, song)).toBe('Pour réviser')

    useLibraryStore.getState().rename(track.id, '   ')

    expect(songName(useLibraryStore.getState().tracks, song)).toBe(songTitle(11))
  })

  it('names an unsaved song after its seed', () => {
    expect(songName([], song)).toBe(songTitle(11))
  })
})
