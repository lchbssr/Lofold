import type { Random } from './random'
import { STEPS_PER_BAR } from './time'
import type { DrumStyle, Drums, SectionName } from './types'

const KICK_PATTERNS: readonly number[][] = [
  [0, 10],
  [0, 7, 10],
  [0, 8, 11],
  [0, 6, 10, 14],
]

/**
 * Drums of one section:
 * - light: hi-hats only;
 * - classic: kick, snare on beats 2 and 4, hi-hats, and sometimes a fill at the end;
 * - busy: classic, with more hi-hats, ghost notes on the snare and a fill almost every time.
 * The outro fades out whatever the style: no snare in its second half, nothing but hi-hats on its last bar.
 */
export function generateDrums(random: Random, style: DrumStyle, section: SectionName, bars: number): Drums {
  const drums: Drums = { kick: [], snare: [], hihat: [] }
  if (style === 'none') {
    return drums
  }

  const kick = random.pick(KICK_PATTERNS)
  const busy = style === 'busy'

  for (let bar = 0; bar < bars; bar++) {
    const start = bar * STEPS_PER_BAR
    const isLastBar = bar === bars - 1
    const fadingOut = section === 'outro' && bar >= bars / 2

    for (let step = 0; step < STEPS_PER_BAR; step += 2) {
      drums.hihat.push({ step: start + step, velocity: step % 4 === 0 ? 0.5 : 0.32 })
      if (random.chance(busy ? 0.5 : 0.1)) {
        drums.hihat.push({ step: start + step + 1, velocity: 0.22 })
      }
    }

    if (style === 'light' || (section === 'outro' && isLastBar)) {
      continue
    }

    for (const step of kick) {
      drums.kick.push({ step: start + step, velocity: step === 0 ? 0.9 : 0.75 })
    }

    if (!fadingOut) {
      drums.snare.push({ step: start + 4, velocity: 0.75 }, { step: start + 12, velocity: 0.75 })
      if (busy && random.chance(0.5)) {
        drums.snare.push({ step: start + random.pick([7, 9]), velocity: 0.25 })
      }
    }

    if (isLastBar && section !== 'outro' && random.chance(busy ? 0.9 : 0.6)) {
      for (const step of [13, 14, 15]) {
        drums.snare.push({ step: start + step, velocity: random.float(0.25, 0.45) })
      }
    }
  }

  return drums
}
