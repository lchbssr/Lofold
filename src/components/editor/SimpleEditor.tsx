import { Dices } from 'lucide-react'
import type { ReactNode } from 'react'
import { DRUM_STYLES, MELODY_STYLES, MOODS } from '../../engine/arrangement'
import { INSTRUMENTS, PARTS } from '../../engine/instrumentation'
import type { Instrumentation, Part, SectionName, SectionSettings } from '../../engine/types'
import { useMessages } from '../../i18n/messages'
import { usePlayerStore } from '../../store/playerStore'

export function SimpleEditor() {
  const { song, hasManualEdits, arrange } = usePlayerStore()
  const names = [...new Set(song.sections.map((section) => section.name))]
  const t = useMessages().editor

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-300">{t.simpleIntro}</p>

      <div className="space-y-3 rounded-xl bg-white/5 p-4">
        <h3 className="font-semibold text-white">{t.instruments}</h3>
        {PARTS.map((part) => (
          <InstrumentRow key={part} part={part} />
        ))}
      </div>
      {hasManualEdits && (
        <p className="rounded-lg bg-amber-300/10 px-3 py-2 text-sm text-amber-200">{t.manualEditsWarning}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {names.map((name) => (
          <SectionCard
            key={name}
            name={name}
            plays={song.sections.filter((section) => section.name === name).length}
            settings={song.arrangement[name]}
            onChange={(changes) => arrange(name, changes)}
          />
        ))}
      </div>
    </div>
  )
}

function InstrumentRow<P extends Part>({ part }: { part: P }) {
  const instrument = usePlayerStore((state) => state.song.instrumentation[part])
  const setInstrument = usePlayerStore((state) => state.setInstrument)
  const t = useMessages().music

  return (
    <Row label={t.parts[part]}>
      <Choices<Instrumentation[P]>
        options={INSTRUMENTS[part]}
        labels={t.instruments[part]}
        value={instrument}
        onPick={(picked) => setInstrument(part, picked)}
      />
    </Row>
  )
}

interface SectionCardProps {
  name: SectionName
  plays: number
  settings: SectionSettings
  onChange: (changes: Partial<SectionSettings>) => void
}

function SectionCard({ name, plays, settings, onChange }: SectionCardProps) {
  const { editor: t, music } = useMessages()
  const label = music.sections[name]

  return (
    <div className="space-y-3 rounded-xl bg-white/5 p-4">
      <h3 className="font-semibold text-white">
        {label}
        {plays > 1 && <span className="ml-2 text-xs font-normal text-stone-400">{t.plays(plays)}</span>}
      </h3>

      <Row label={music.parts.keys}>
        <Choices options={MOODS} labels={music.moods} value={settings.mood} onPick={(mood) => onChange({ mood })} />
        <RollButton label={t.otherChords(label)} onClick={() => onChange({ chordsVariant: settings.chordsVariant + 1 })} />
      </Row>

      <Row label={music.parts.lead}>
        <Choices options={MELODY_STYLES} labels={music.melodyStyles} value={settings.melody} onPick={(melody) => onChange({ melody })} />
        <RollButton
          label={t.otherMelody(label)}
          disabled={settings.melody === 'none'}
          onClick={() => onChange({ melodyVariant: settings.melodyVariant + 1 })}
        />
      </Row>

      <Row label={music.parts.drums}>
        <Choices options={DRUM_STYLES} labels={music.drumStyles} value={settings.drums} onPick={(drums) => onChange({ drums })} />
        <RollButton
          label={t.otherDrums(label)}
          disabled={settings.drums === 'none'}
          onClick={() => onChange({ drumsVariant: settings.drumsVariant + 1 })}
        />
      </Row>

      <Row label={music.parts.bass}>
        <Choices
          options={['on', 'off'] as const}
          labels={{ on: t.on, off: t.off }}
          value={settings.bass ? 'on' : 'off'}
          onPick={(bass) => onChange({ bass: bass === 'on' })}
        />
      </Row>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <span className="w-14 shrink-0 text-xs text-stone-400">{label}</span>
      {children}
    </div>
  )
}

interface ChoicesProps<T extends string> {
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onPick: (value: T) => void
}

function Choices<T extends string>({ options, labels, value, onPick }: ChoicesProps<T>) {
  return (
    <div className="flex flex-1 flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(option)}
          aria-pressed={option === value}
          className="rounded-full px-2.5 py-1 text-xs text-stone-300 transition-colors hover:bg-white/10 hover:text-white aria-pressed:bg-glow aria-pressed:text-night"
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}

function RollButton({ label, disabled = false, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <Dices size={16} />
    </button>
  )
}
