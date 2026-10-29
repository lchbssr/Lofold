import type { CSSProperties } from 'react'
import { formatTime, STEPS_PER_BAR } from '../engine/time'
import { useMessages } from '../i18n/messages'
import { usePlayerStore } from '../store/playerStore'
import { useSongName } from './useSongName'
import { useSongPosition } from './useSongPosition'

const GROOVES: CSSProperties = { background: 'repeating-radial-gradient(circle, #101014 0 2px, #1c1b22 2px 3px)' }
const SHEEN: CSSProperties = {
  background: 'conic-gradient(from 40deg, transparent 0 15%, rgb(255 255 255 / 0.1) 22%, transparent 30% 65%, rgb(255 255 255 / 0.07) 72%, transparent 80%)',
}
const NOTES = [
  { symbol: '♪', delay: '0s', left: '70%' },
  { symbol: '♫', delay: '1s', left: '85%' },
  { symbol: '♪', delay: '2s', left: '55%' },
]

function Record() {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <div className="absolute inset-0 animate-spin-record rounded-full motion-reduce:animate-none" style={GROOVES}>
        <div className="absolute inset-[30%] rounded-full bg-glow">
          <div className="absolute top-[12%] left-1/2 h-[22%] w-[10%] -translate-x-1/2 rounded-full bg-night/40" />
          <div className="absolute inset-[42%] rounded-full bg-night" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-full" style={SHEEN} />
      {NOTES.map(({ symbol, delay, left }) => (
        <span
          key={delay}
          className="absolute -top-2 animate-float-note text-sm text-glow opacity-0 motion-reduce:hidden"
          style={{ left, animationDelay: delay }}
        >
          {symbol}
        </span>
      ))}
    </div>
  )
}

export function NowPlaying({ visible }: { visible: boolean }) {
  const song = usePlayerStore((state) => state.song)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const name = useSongName()
  const t = useMessages().player
  const position = useSongPosition(isPlaying && visible, 500)
  const totalSteps = song.bars * STEPS_PER_BAR

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-night/60 p-4 backdrop-blur-md transition-opacity duration-700 motion-reduce:transition-none sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-80 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <Record />
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] tracking-widest text-stone-400 uppercase">{t.nowPlaying}</p>
        <p className="truncate font-semibold text-white">{name}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-glow" style={{ width: `${Math.min(100, (position / totalSteps) * 100)}%` }} />
        </div>
        <p className="mt-1 flex justify-between text-xs text-stone-400">
          <span>{formatTime(position, song.bpm)}</span>
          <span>{formatTime(totalSteps, song.bpm)}</span>
        </p>
      </div>
    </div>
  )
}
