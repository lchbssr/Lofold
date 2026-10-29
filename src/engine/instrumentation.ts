import { createRandom, deriveSeed } from './random'
import type { Instrumentation, Part } from './types'

export const INSTRUMENTS: { readonly [P in Part]: readonly Instrumentation[P][] } = {
  keys: ['piano', 'guitar', 'synth'],
  lead: ['piano', 'sax', 'synth'],
  bass: ['double-bass', 'electric-bass', 'synth'],
  drums: ['retro', 'synth'],
}

export const PARTS: readonly Part[] = ['keys', 'lead', 'bass', 'drums']

const WEIGHTS: { [P in Part]: Record<Instrumentation[P], number> } = {
  keys: { piano: 4, guitar: 3, synth: 2 },
  lead: { piano: 3, sax: 3, synth: 3 },
  bass: { 'double-bass': 3, 'electric-bass': 3, synth: 3 },
  drums: { retro: 3, synth: 2 },
}

export function defaultInstrumentation(seed: number): Instrumentation {
  const random = createRandom(deriveSeed(seed, 'instrumentation'))
  // The entries keep the order of WEIGHTS, so a seed always draws the same instruments
  const pick = <P extends Part>(part: P): Instrumentation[P] =>
    random.weighted(Object.entries(WEIGHTS[part]) as Array<[Instrumentation[P], number]>)

  return { keys: pick('keys'), lead: pick('lead'), bass: pick('bass'), drums: pick('drums') }
}

export function encodeInstrumentation(instrumentation: Instrumentation): string {
  return PARTS.map((part) => (INSTRUMENTS[part] as readonly string[]).indexOf(instrumentation[part])).join('.')
}

export function decodeInstrumentation(text: string): Instrumentation | null {
  const positions = text.split('.').map(Number)
  if (positions.length !== PARTS.length) {
    return null
  }
  const instruments = PARTS.map((part, index) => (INSTRUMENTS[part] as readonly string[])[positions[index]])
  if (instruments.some((instrument) => instrument === undefined)) {
    return null
  }
  const [keys, lead, bass, drums] = instruments
  return { keys, lead, bass, drums } as Instrumentation
}

export function sameInstrumentation(a: Instrumentation, b: Instrumentation): boolean {
  return encodeInstrumentation(a) === encodeInstrumentation(b)
}
