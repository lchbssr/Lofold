import { defaultArrangement } from './arrangement'
import { defaultInstrumentation } from './instrumentation'
import { generateBass } from './bass'
import { generateProgression } from './chords'
import { generateDrums } from './drums'
import { generateMotif, renderMelody, type MelodyNote } from './melody'
import { createRandom, deriveSeed, type Random } from './random'
import { midiToNote, NOTE_NAMES, scaleNotes, type Chord } from './theory'
import { STEPS_PER_BAR } from './time'
import type { Arrangement, DrumHit, Instrumentation, NoteEvent, ScaleName, Section, SectionName, SectionSettings, Song } from './types'

const STRUCTURES: readonly SectionName[][] = [
  ['intro', 'A', 'B', 'A', 'B', 'outro'],
  ['intro', 'A', 'B', 'A', 'outro'],
  ['intro', 'A', 'A', 'B', 'A', 'outro'],
]
const SECTION_BARS: Record<SectionName, number> = { intro: 4, A: 8, B: 8, outro: 4 }

export const MELODY_RANGE = [60, 84] as const
const BASS_RANGE = [36, 55] as const

/**
 * Generates a song from a seed, the settings of each section and its instruments. Every part
 * (the chords of a mood, the melody of a section, its drums…) draws from its own random sequence:
 * changing one setting only rewrites that part, and the same seed and settings always give the same song.
 */
export function generateSong(
  seed: number,
  arrangement: Arrangement = defaultArrangement(seed),
  instrumentation: Instrumentation = defaultInstrumentation(seed),
): Song {
  const random = createRandom(deriveSeed(seed, 'song'))
  const stream = (...labels: Array<string | number>) => createRandom(deriveSeed(seed, ...labels))

  const bpm = random.int(70, 90)
  const key = random.pick(NOTE_NAMES)
  const scale = random.weighted<ScaleName>([['dorian', 3], ['aeolian', 2], ['major', 2]])
  const swing = round(random.float(0.08, 0.22))
  const structure = random.pick(STRUCTURES)

  const melodyScale = scaleNotes(key, scale, ...MELODY_RANGE)
  const bassScale = scaleNotes(key, scale, ...BASS_RANGE)

  // Sections with the same mood and the same take share their chords (the intro and part A by default)
  const progressionOf = ({ mood, chordsVariant }: SectionSettings): Chord[] =>
    generateProgression(stream('chords', mood, chordsVariant), key, scale, mood, 4)

  const song: Song = {
    seed, bpm, key, scale, swing, arrangement, instrumentation,
    bars: 0,
    sections: [],
    chords: [],
    melody: [],
    bass: [],
    drums: { kick: [], snare: [], hihat: [] },
  }
  const occurrences: Record<SectionName, number> = { intro: 0, A: 0, B: 0, outro: 0 }

  structure.forEach((name, position) => {
    const settings = arrangement[name]
    const bars = SECTION_BARS[name]
    const startBar = song.bars
    const offset = startBar * STEPS_PER_BAR
    const occurrence = occurrences[name]
    const progression = progressionOf(settings)
    const chords = Array.from({ length: bars }, (_, bar) => progression[bar % progression.length])

    song.sections.push({ name, startBar, bars })
    chords.forEach((chord, bar) => {
      song.chords.push({ bar: startBar + bar, symbol: chord.symbol, notes: chord.notes.map(midiToNote) })
    })

    if (settings.melody !== 'none') {
      const motif = generateMotif(stream('motif', name, settings.melody, settings.melodyVariant), settings.melody)
      // A section that comes back is played higher: it stays recognizable without being identical
      const melody = renderMelody(stream('melody', name, settings.melodyVariant, occurrence), motif, chords, melodyScale, {
        transpose: occurrence * 2,
        sparse: name === 'outro',
      })
      song.melody.push(...humanize(stream('humanize-melody', name, occurrence), toEvents(melody, offset), 0.08))
    }

    if (settings.bass) {
      const nextChord = progressionOf(arrangement[structure[position + 1] ?? structure[0]])[0]
      const bass = generateBass(stream('bass', name, occurrence), chords, nextChord, bassScale)
        .filter((note) => name !== 'intro' || note.step >= (bars / 2) * STEPS_PER_BAR)
      song.bass.push(...toEvents(bass, offset))
    }

    const drums = generateDrums(stream('drums', name, settings.drums, settings.drumsVariant), settings.drums, name, bars)
    const humanizeDrums = stream('humanize-drums', name, occurrence)
    song.drums.kick.push(...shift(drums.kick, offset))
    song.drums.snare.push(...humanize(humanizeDrums, shift(drums.snare, offset), 0.03))
    song.drums.hihat.push(...humanize(humanizeDrums, shift(drums.hihat, offset), 0.05))

    occurrences[name]++
    song.bars += bars
  })

  return song
}

export function rearrange(song: Song, section: SectionName, changes: Partial<SectionSettings>): Song {
  return generateSong(song.seed, { ...song.arrangement, [section]: { ...song.arrangement[section], ...changes } }, song.instrumentation)
}

export function sectionAt(song: Song, bar: number): Section | undefined {
  return song.sections.find((section) => bar >= section.startBar && bar < section.startBar + section.bars)
}

function toEvents(notes: MelodyNote[], offset: number): NoteEvent[] {
  return notes.map(({ step, duration, midi, velocity }) => ({
    step: step + offset,
    duration,
    note: midiToNote(midi),
    velocity,
  }))
}

function shift(hits: DrumHit[], offset: number): DrumHit[] {
  return hits.map((hit) => ({ ...hit, step: hit.step + offset }))
}

function humanize<T extends { step: number; velocity: number }>(random: Random, events: T[], timing: number): T[] {
  return events.map((event) => ({
    ...event,
    step: round(Math.max(0, event.step + random.float(-timing, timing))),
    velocity: round(Math.min(1, Math.max(0.1, event.velocity + random.float(-0.07, 0.07)))),
  }))
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
