import { sectionAt } from '../engine/song'
import { formatTime, STEPS_PER_BAR } from '../engine/time'
import type { Song } from '../engine/types'
import { useMessages } from '../i18n/messages'
import { usePlayerStore } from '../store/playerStore'
import { useSongPosition } from './useSongPosition'

interface SongProgressProps {
  song: Song
  isPlaying: boolean
}

export function SongProgress({ song, isPlaying }: SongProgressProps) {
  const seek = usePlayerStore((state) => state.seek)
  const position = useSongPosition(isPlaying)
  const t = useMessages()
  const totalSteps = song.bars * STEPS_PER_BAR
  const bar = Math.min(song.bars - 1, Math.floor(position / STEPS_PER_BAR))
  const current = sectionAt(song, bar)
  const sectionLabel = t.music.sections[current?.name ?? 'intro']
  const progress = Math.min(100, (position / totalSteps) * 100)

  return (
    <div>
      <div className="flex justify-between text-xs text-stone-400">
        <span>{sectionLabel}</span>
        <span>
          {formatTime(position, song.bpm)} / {formatTime(totalSteps, song.bpm)}
        </span>
      </div>

      <div className="group relative mt-1 flex h-4 items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white">
        <div className="relative flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
          {song.sections.map((section) => (
            <div key={section.startBar} className="h-full bg-white/10" style={{ flexGrow: section.bars }} />
          ))}
          <div className="absolute inset-y-0 left-0 bg-glow" style={{ width: `${progress}%` }} />
        </div>
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100"
          style={{ left: `${progress}%` }}
        />

        {/*
          Moves bar by bar, since starting in the middle of a bar would sound off the beat.
          The range goes up to the end of the song so that each value sits where its bar is drawn,
          and its one-pixel thumb keeps clicks where they land on the bar.
        */}
        <input
          type="range"
          min={0}
          max={song.bars}
          step={1}
          value={bar}
          onChange={(event) => seek(Math.min(Number(event.target.value), song.bars - 1) * STEPS_PER_BAR)}
          aria-label={t.player.position}
          aria-valuetext={`${formatTime(position, song.bpm)}, ${sectionLabel}`}
          className="absolute inset-0 w-full cursor-pointer appearance-none opacity-0 [&::-moz-range-thumb]:h-px [&::-moz-range-thumb]:w-px [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-px [&::-webkit-slider-thumb]:w-px [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  )
}
