import { useMemo } from 'react'
import { songName, useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'

export function useSongName(): string {
  const song = usePlayerStore((state) => state.song)
  const tracks = useLibraryStore((state) => state.tracks)
  return useMemo(() => songName(tracks, song), [tracks, song])
}
