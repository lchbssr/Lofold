import { createRandom, deriveSeed } from './random'
import type { Arrangement, DrumStyle, MelodyStyle, Mood, SectionName, SectionSettings } from './types'

export const MOODS: readonly Mood[] = ['chill', 'melancholic', 'dreamy']
export const MELODY_STYLES: readonly MelodyStyle[] = ['none', 'calm', 'lively']
export const DRUM_STYLES: readonly DrumStyle[] = ['none', 'light', 'classic', 'busy']
export const SECTION_NAMES: readonly SectionName[] = ['intro', 'A', 'B', 'outro']

export function defaultArrangement(seed: number): Arrangement {
  const random = createRandom(deriveSeed(seed, 'arrangement'))
  const mood = random.pick(MOODS)
  const section = (settings: Partial<SectionSettings>): SectionSettings => ({
    mood,
    chordsVariant: 0,
    melody: 'calm',
    melodyVariant: 0,
    drums: 'classic',
    drumsVariant: 0,
    bass: true,
    ...settings,
  })

  return {
    intro: section({ melody: 'none', drums: 'light' }),
    A: section({ melody: random.pick(['calm', 'lively']) }),
    B: section({ mood: random.pick(MOODS), chordsVariant: 1, melody: random.pick(['calm', 'lively']), drums: random.pick(['classic', 'busy']) }),
    outro: section({}),
  }
}

/**
 * Compact form for links: one group per section (intro, A, B, outro), seven numbers each —
 * mood, chords take, melody, melody take, drums, drums take, bass — e.g. "0.0.0.0.1.0.1-…".
 */
export function encodeArrangement(arrangement: Arrangement): string {
  return SECTION_NAMES.map((name) => {
    const settings = arrangement[name]
    return [
      MOODS.indexOf(settings.mood),
      settings.chordsVariant,
      MELODY_STYLES.indexOf(settings.melody),
      settings.melodyVariant,
      DRUM_STYLES.indexOf(settings.drums),
      settings.drumsVariant,
      settings.bass ? 1 : 0,
    ].join('.')
  }).join('-')
}

export function decodeArrangement(text: string): Arrangement | null {
  const groups = text.split('-').map((group) => group.split('.').map(Number))
  const valid = (value: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(value) && value >= 0 && value <= max

  if (groups.length !== SECTION_NAMES.length) {
    return null
  }

  const sections: SectionSettings[] = []
  for (const [mood, chordsVariant, melody, melodyVariant, drums, drumsVariant, bass, ...extra] of groups) {
    const allValid = [chordsVariant, melodyVariant, drumsVariant].every((value) => valid(value))
      && valid(mood, MOODS.length - 1) && valid(melody, MELODY_STYLES.length - 1) && valid(drums, DRUM_STYLES.length - 1) && valid(bass, 1)
    if (!allValid || extra.length > 0) {
      return null
    }
    sections.push({
      mood: MOODS[mood],
      chordsVariant,
      melody: MELODY_STYLES[melody],
      melodyVariant,
      drums: DRUM_STYLES[drums],
      drumsVariant,
      bass: bass === 1,
    })
  }

  const [intro, A, B, outro] = sections
  return { intro, A, B, outro }
}

export function sameArrangement(a: Arrangement, b: Arrangement): boolean {
  return encodeArrangement(a) === encodeArrangement(b)
}
