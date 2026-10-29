import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { describeSong } from '../../i18n/format'
import { useMessages } from '../../i18n/messages'
import { findSavedTrack, trackName, useLibraryStore, type SavedTrack } from '../../store/libraryStore'
import { usePlayerStore } from '../../store/playerStore'

export function Library() {
  const { tracks, save } = useLibraryStore()
  const song = usePlayerStore((state) => state.song)
  const isSaved = useMemo(() => findSavedTrack(tracks, song) !== undefined, [tracks, song])
  const t = useMessages().editor

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t.myTracks}</h3>
        <button
          type="button"
          onClick={() => save(song)}
          disabled={isSaved}
          className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-white/10"
        >
          {isSaved ? t.saved : t.saveTrack}
        </button>
      </div>

      {tracks.length === 0 ? (
        <p className="mt-3 text-sm text-stone-400">{t.emptyLibrary}</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
        </ul>
      )}
    </div>
  )
}

function TrackRow({ track }: { track: SavedTrack }) {
  const { remove, rename } = useLibraryStore()
  const openSong = usePlayerStore((state) => state.openSong)
  const [isRenaming, setIsRenaming] = useState(false)
  // Escape closes the field without keeping what was typed, even though closing it also blurs it
  const isCancelled = useRef(false)
  const messages = useMessages()
  const t = messages.editor
  const name = trackName(track)

  const startRenaming = () => {
    isCancelled.current = false
    setIsRenaming(true)
  }

  return (
    <li className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
      {isRenaming ? (
        <input
          autoFocus
          defaultValue={name}
          maxLength={60}
          aria-label={t.trackName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
            if (event.key === 'Escape') {
              isCancelled.current = true
              setIsRenaming(false)
            }
          }}
          onBlur={(event) => {
            if (!isCancelled.current) {
              rename(track.id, event.currentTarget.value)
            }
            setIsRenaming(false)
          }}
          className="min-w-0 flex-1 rounded bg-night/60 px-2 py-0.5 text-sm text-white outline-none ring-1 ring-white/20 focus:ring-glow"
        />
      ) : (
        <button type="button" onClick={() => openSong(track.song)} className="min-w-0 flex-1 text-left text-sm text-stone-200 hover:text-white">
          {name}
          <span className="ml-2 text-xs text-stone-400">{describeSong(track.song, messages)}</span>
          <span className="ml-2 text-xs text-stone-500">{new Date(track.savedAt).toLocaleString(messages.locale)}</span>
        </button>
      )}
      <button type="button" onClick={startRenaming} aria-label={t.renameTrack(name)} title={t.rename} className="shrink-0 text-stone-500 transition-colors hover:text-white">
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={() => remove(track.id)}
        aria-label={t.deleteTrack(name)}
        title={t.delete}
        className="shrink-0 text-stone-500 transition-colors hover:text-red-300"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}
