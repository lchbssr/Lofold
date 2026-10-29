import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { useMessages } from '../i18n/messages'
import { findSavedTrack, useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'

export function SaveButton() {
  const song = usePlayerStore((state) => state.song)
  const { tracks, save, remove } = useLibraryStore()
  const saved = useMemo(() => findSavedTrack(tracks, song), [tracks, song])
  const t = useMessages().player
  const label = saved ? t.unsave : t.save

  return (
    <button
      type="button"
      onClick={() => (saved ? remove(saved.id) : save(song))}
      aria-label={label}
      aria-pressed={saved !== undefined}
      title={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-white/10 hover:text-white aria-pressed:text-glow"
    >
      <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
