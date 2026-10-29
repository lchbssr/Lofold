import { create } from 'zustand'
import { songTitle } from '../engine/title'
import type { Song } from '../engine/types'

const STORAGE_KEY = 'lofold-library'
// A song weighs a few dozen kilobytes: 20 of them stay far below the storage limit of a browser
const MAX_TRACKS = 20

export interface SavedTrack {
  id: string
  savedAt: string
  song: Song
  name?: string
}

interface LibraryState {
  tracks: SavedTrack[]
  save: (song: Song) => void
  remove: (id: string) => void
  rename: (id: string, name: string) => void
}

function readTracks(): SavedTrack[] {
  try {
    const tracks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(tracks) ? tracks : []
  } catch {
    // Storage unavailable or corrupted: start with an empty library
    return []
  }
}

function writeTracks(tracks: SavedTrack[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks))
  } catch {
    // Storage unavailable or full: the tracks stay available until the page is closed
  }
}

export function trackName(track: SavedTrack): string {
  return track.name ?? songTitle(track.song.seed)
}

export function songName(tracks: SavedTrack[], song: Song): string {
  const saved = findSavedTrack(tracks, song)
  return saved ? trackName(saved) : songTitle(song.seed)
}

export function findSavedTrack(tracks: SavedTrack[], song: Song): SavedTrack | undefined {
  const content = JSON.stringify(song)
  return tracks.find((track) => JSON.stringify(track.song) === content)
}

export const useLibraryStore = create<LibraryState>()((set, get) => {
  const update = (tracks: SavedTrack[]) => {
    set({ tracks })
    writeTracks(tracks)
  }

  return {
    tracks: readTracks(),
    save: (song) => {
      const track = { id: crypto.randomUUID(), savedAt: new Date().toISOString(), song }
      update([track, ...get().tracks].slice(0, MAX_TRACKS))
    },
    remove: (id) => update(get().tracks.filter((track) => track.id !== id)),
    rename: (id, name) => {
      const trimmed = name.trim()
      update(get().tracks.map((track) => (track.id === id ? { ...track, name: trimmed || undefined } : track)))
    },
  }
})
