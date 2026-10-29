import * as Tone from 'tone'
import type { Instrumentation, Part } from '../engine/types'
import type { Effects } from './effects'
import { loadSamples } from './loadSamples'
import { DRUMS, SAMPLED_VOICES, transposeOf, type Drum, type SampledChoice } from './samples'

export type PlayNotes = (notes: string[], duration: Tone.Unit.Time, time: number, velocity: number) => void
export type PlayHit = (drum: Drum, time: number, velocity: number) => void

export interface Band {
  keys: PlayNotes
  lead: PlayNotes
  bass: PlayNotes
  drums: PlayHit
}

export interface Instruments {
  load: (instrumentation: Instrumentation) => Promise<Band>
  loaded: (instrumentation: Instrumentation) => Band | null
  ready: Promise<void>
  setEffects: (effects: Effects) => void
}

const DRUM_NOTE = 'C3'
const DRUM_VOLUMES: Record<Drum, number> = { kick: -4, snare: -5, hihat: -9 }

/**
 * The instruments of the songs, all sent through the same lo-fi chain:
 * light saturation → tape wobble → low-pass filter → reverb.
 * Each instrument is only created when a song needs it. The context is explicit so the same
 * instruments can play live or be rendered to a file; the output lets the live player fade them in and out.
 */
export function createInstruments(context: Tone.BaseContext, output: Tone.InputNode = context.destination): Instruments {
  const reverb = new Tone.Reverb({ context, decay: 3, wet: 0.2 }).connect(output)
  const lowpass = new Tone.Filter({ context, frequency: 2000, type: 'lowpass' }).connect(reverb)
  const wobble = new Tone.Vibrato({ context, frequency: 0.5, depth: 0.06 }).connect(lowpass)
  const bus = new Tone.Distortion({ context, distortion: 0.08 }).connect(wobble)

  const vinylLevel = new Tone.Gain({ context, gain: 0 }).connect(output)
  const vinylFilter = new Tone.Filter({ context, frequency: 1500, type: 'highpass' }).connect(vinylLevel)
  new Tone.Noise({ context, type: 'pink' }).connect(vinylFilter).sync().start(0)

  const synths = {
    keys: (): PlayNotes => {
      const synth = new Tone.PolySynth({
        context,
        voice: Tone.FMSynth,
        options: { harmonicity: 3, modulationIndex: 1.5, envelope: { attack: 0.02, decay: 1.5, sustain: 0.3, release: 2.5 } },
        volume: -13,
      }).connect(bus)
      return (notes, duration, time, velocity) => synth.triggerAttackRelease(notes, duration, time, velocity)
    },
    lead: (): PlayNotes => {
      const synth = new Tone.Synth({
        context,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 },
        volume: -13.5,
      }).connect(bus)
      return ([note], duration, time, velocity) => synth.triggerAttackRelease(note, duration, time, velocity)
    },
    bass: (): PlayNotes => {
      const synth = new Tone.MonoSynth({
        context,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.4 },
        filterEnvelope: { baseFrequency: 180, octaves: 2 },
        volume: -15,
      }).connect(bus)
      return ([note], duration, time, velocity) => synth.triggerAttackRelease(note, duration, time, velocity)
    },
    drums: (): PlayHit => {
      const hihatFilter = new Tone.Filter({ context, frequency: 7000, type: 'highpass' }).connect(bus)
      const kick = new Tone.MembraneSynth({
        context,
        pitchDecay: 0.05,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0 },
        volume: -6.5,
      }).connect(bus)
      const snare = new Tone.NoiseSynth({
        context,
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
        volume: -14.5,
      }).connect(bus)
      const hihat = new Tone.NoiseSynth({
        context,
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
        volume: -22.5,
      }).connect(hihatFilter)
      return (drum, time, velocity) => {
        if (drum === 'kick') kick.triggerAttackRelease('C1', '8n', time, velocity)
        if (drum === 'snare') snare.triggerAttackRelease('16n', time, velocity)
        if (drum === 'hihat') hihat.triggerAttackRelease('32n', time, velocity)
      }
    },
  }

  const sampledNotes = async (choice: SampledChoice): Promise<PlayNotes> => {
    const { samples, volume, release } = SAMPLED_VOICES[choice]
    const sampler = new Tone.Sampler({ context, urls: await loadSamples(samples), volume, release }).connect(bus)
    const transpose = transposeOf(samples)
    return (notes, duration, time, velocity) => {
      const played = transpose === 0 ? notes : notes.map((note) => Tone.Frequency(note).transpose(transpose).toNote())
      sampler.triggerAttackRelease(played, duration, time, velocity)
    }
  }

  const sampledDrums = async (): Promise<PlayHit> => {
    const samples = await loadSamples('drums')
    const samplers = Object.fromEntries(
      DRUMS.map((drum) => [
        drum,
        new Tone.Sampler({ context, urls: { [DRUM_NOTE]: samples[drum] }, volume: DRUM_VOLUMES[drum] }).connect(bus),
      ]),
    ) as Record<Drum, Tone.Sampler>
    return (drum, time, velocity) => samplers[drum].triggerAttack(DRUM_NOTE, time, velocity)
  }

  const create = (part: Part, instrument: string): Promise<PlayNotes | PlayHit> | PlayNotes | PlayHit => {
    if (instrument === 'synth') {
      return synths[part]()
    }
    return part === 'drums' ? sampledDrums() : sampledNotes(`${part}:${instrument}` as SampledChoice)
  }

  const creating = new Map<string, Promise<PlayNotes | PlayHit>>()
  const created = new Map<string, PlayNotes | PlayHit>()

  const voice = (part: Part, instrument: string): Promise<PlayNotes | PlayHit> => {
    const key = `${part}:${instrument}`
    let promise = creating.get(key)
    if (!promise) {
      promise = Promise.resolve(create(part, instrument)).then((played) => {
        created.set(key, played)
        return played
      })
      // A failed download can be tried again on the next click
      promise.catch(() => creating.delete(key))
      creating.set(key, promise)
    }
    return promise
  }

  return {
    load: async (instrumentation) => {
      const [keys, lead, bass, drums] = await Promise.all([
        voice('keys', instrumentation.keys),
        voice('lead', instrumentation.lead),
        voice('bass', instrumentation.bass),
        voice('drums', instrumentation.drums),
      ])
      return { keys, lead, bass, drums } as Band
    },

    loaded: (instrumentation) => {
      const keys = created.get(`keys:${instrumentation.keys}`)
      const lead = created.get(`lead:${instrumentation.lead}`)
      const bass = created.get(`bass:${instrumentation.bass}`)
      const drums = created.get(`drums:${instrumentation.drums}`)
      return keys && lead && bass && drums ? ({ keys, lead, bass, drums } as Band) : null
    },

    ready: reverb.ready,

    setEffects: ({ warmth, vinyl, space }) => {
      lowpass.frequency.rampTo(700 * Math.pow(6000 / 700, 1 - warmth), 0.1)
      vinylLevel.gain.rampTo(vinyl * 0.05, 0.1)
      reverb.wet.rampTo(space * 0.6, 0.1)
    },
  }
}
