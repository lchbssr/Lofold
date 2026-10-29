import { Repeat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { scaleChords, setChord, toggleDrumHit, toggleMelodyNote } from '../../engine/edit'
import { STEPS_PER_BAR } from '../../engine/time'
import { sectionAt } from '../../engine/song'
import { midiToNote } from '../../engine/theory'
import { useMessages } from '../../i18n/messages'
import { usePlayerStore } from '../../store/playerStore'
import { Segmented } from '../Segmented'
import { useSongPosition } from '../useSongPosition'
import { BarStrip } from './BarStrip'
import { DrumGrid } from './DrumGrid'
import type { Half } from './grid'
import { PianoRoll } from './PianoRoll'

const FOLLOW_DELAY_MS = 4000

export function AdvancedEditor() {
  const { song, isPlaying, loopedBar, editSong, setLoopedBar, audition } = usePlayerStore()
  const [selectedBar, setSelectedBar] = useState(0)
  const messages = useMessages()
  const t = messages.editor
  const [half, setHalf] = useState<Half>(0)
  const lastTouch = useRef(0)
  const touch = () => {
    lastTouch.current = Date.now()
  }
  const position = useSongPosition(isPlaying, 80)

  // A new song may be shorter than the previous one
  const bar = Math.min(selectedBar, song.bars - 1)
  const chords = scaleChords(song)
  const currentDegree = chords.findIndex((chord) => chord.symbol === song.chords[bar].symbol)
  const section = sectionAt(song, bar)
  const isLooping = loopedBar !== null
  const playingBar = isPlaying ? Math.floor(position / STEPS_PER_BAR) : null
  const playingStep = playingBar === bar ? Math.floor(position) % STEPS_PER_BAR : null

  const playingHalf = playingStep === null ? null : (Math.floor(playingStep / (STEPS_PER_BAR / 2)) as Half)
  useEffect(() => {
    if (playingHalf !== null && Date.now() - lastTouch.current > FOLLOW_DELAY_MS) {
      setHalf(playingHalf)
    }
  }, [playingHalf])

  useEffect(() => () => setLoopedBar(null), [setLoopedBar])

  const selectBar = (next: number) => {
    setSelectedBar(next)
    if (isLooping) {
      setLoopedBar(next)
    }
  }

  return (
    <div className="space-y-6">
      <BarStrip song={song} selectedBar={bar} playingBar={playingBar} onSelect={selectBar} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-white">
          {t.bar(bar + 1)} <span className="font-normal text-stone-400">· {section && messages.music.sections[section.name]}</span>
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLoopedBar(isLooping ? null : bar)}
            aria-pressed={isLooping}
            className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white transition-colors hover:bg-white/15 aria-pressed:bg-glow aria-pressed:text-night"
          >
            <Repeat size={14} />
            {t.loopBar}
          </button>

          <label className="flex items-center gap-2 text-sm text-stone-400">
            {t.chord}
            <select
              value={currentDegree}
              onChange={(event) => {
                const degree = Number(event.target.value)
                editSong((current) => setChord(current, bar, degree))
                void audition({ instrument: 'chord', notes: chords[degree].notes.map(midiToNote) })
              }}
              className="rounded-md bg-white/10 px-2 py-1 text-white"
            >
              {chords.map((chord, degree) => (
                <option key={chord.symbol} value={degree} className="bg-night">
                  {chord.symbol}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Segmented
        label={t.halfOfBar}
        options={t.halves.map((label, index) => ({ id: index as Half, label }))}
        value={half}
        onChange={(picked) => {
          touch()
          setHalf(picked)
        }}
        className="sm:hidden"
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white">{t.drums}</h3>
        <DrumGrid
          song={song}
          bar={bar}
          playingStep={playingStep}
          half={half}
          onToggle={(drum, step, added) => {
            touch()
            editSong((current) => toggleDrumHit(current, drum, step))
            if (added) void audition({ instrument: drum })
          }}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white">{t.melody}</h3>
        <PianoRoll
          song={song}
          bar={bar}
          playingStep={playingStep}
          half={half}
          onToggle={(step, note, added) => {
            touch()
            editSong((current) => toggleMelodyNote(current, step, note))
            if (added) void audition({ instrument: 'lead', note })
          }}
        />
      </div>

      <p className="text-xs text-stone-400">{t.advancedHelp}</p>
    </div>
  )
}
