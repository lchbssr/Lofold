import { LoaderCircle, Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { describeSong } from '../i18n/format'
import { useMessages } from '../i18n/messages'
import { isCustomSong, usePlayerStore } from '../store/playerStore'
import { AmbiancePicker } from './AmbiancePicker'
import { ROUND_BUTTON } from './buttonStyles'
import { DownloadButton } from './DownloadButton'
import { ErrorMessage } from './ErrorMessage'
import { FullscreenButton } from './FullscreenButton'
import { SaveButton } from './SaveButton'
import { ShareButton } from './ShareButton'
import { SleepTimerButton } from './SleepTimerButton'
import { Slider } from './Slider'
import { SongProgress } from './SongProgress'
import { useSongName } from './useSongName'

export function Player() {
  const { song, hasManualEdits, isPlaying, isLoading, isMuted, history, upcoming, volume, effects, togglePlay, nextSong, previousSong, seek, setVolume, setEffect } =
    usePlayerStore()
  const messages = useMessages()
  const t = messages.player
  const nextLabel = upcoming.length > 0 ? t.next : t.generate
  const isCustom = usePlayerStore(isCustomSong)
  const name = useSongName()

  return (
    <section className="w-full max-w-md rounded-2xl border border-white/10 bg-night/60 p-4 backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="truncate font-semibold text-white">{name}</h2>
            <SaveButton />
          </div>
          <p className="text-xs text-stone-400">
            {describeSong(song, messages)} · #{song.seed}
            {hasManualEdits ? ` · ${t.edited}` : isCustom && ` · ${t.custom}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <SleepTimerButton />
          <FullscreenButton />
          <DownloadButton />
        </div>
      </div>

      <ErrorMessage />

      <div className="mt-4">
        {/* Remounted for each song, so the progress starts again from zero */}
        <SongProgress key={song.seed} song={song} isPlaying={isPlaying} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
        <button type="button" onClick={() => seek(0)} aria-label={t.restart} title={t.restart} className={ROUND_BUTTON}>
          <RotateCcw size={18} />
        </button>

        <button
          type="button"
          onClick={previousSong}
          disabled={history.length === 0}
          aria-label={t.previous}
          title={t.previous}
          className={ROUND_BUTTON}
        >
          <SkipBack size={18} />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isLoading ? t.loading : isPlaying ? t.pause : t.play}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-glow text-night transition hover:brightness-110 disabled:cursor-wait"
        >
          {isLoading ? (
            <LoaderCircle size={26} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={26} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button type="button" onClick={nextSong} aria-label={nextLabel} title={nextLabel} className={ROUND_BUTTON}>
          {upcoming.length > 0 ? <SkipForward size={18} /> : <Shuffle size={18} />}
        </button>

        <ShareButton disabled={hasManualEdits} />
      </div>

      <div className="mt-6 space-y-3">
        <Slider
          label={t.volume}
          value={volume}
          onChange={setVolume}
          inactiveText={isMuted ? t.muted : undefined}
        />
        <Slider label={t.warmth} value={effects.warmth} onChange={(value) => setEffect('warmth', value)} />
        <Slider label={t.vinyl} value={effects.vinyl} onChange={(value) => setEffect('vinyl', value)} />
        <Slider label={t.space} value={effects.space} onChange={(value) => setEffect('space', value)} />
        <Slider label={t.weather} value={effects.ambience} onChange={(value) => setEffect('ambience', value)} />
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <AmbiancePicker />
      </div>
    </section>
  )
}
