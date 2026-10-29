import * as Tone from 'tone'
import { SAMPLED_INSTRUMENTS, sampleUrl, type SampledInstrument } from './samples'

export type Samples = Record<string, Tone.ToneAudioBuffer>

const loading = new Map<SampledInstrument, Promise<Samples>>()

async function download(instrument: SampledInstrument): Promise<Samples> {
  const names: readonly string[] = SAMPLED_INSTRUMENTS[instrument].notes
  const buffers = await Promise.all(names.map((name) => Tone.ToneAudioBuffer.fromUrl(sampleUrl(instrument, name))))
  return Object.fromEntries(names.map((name, index) => [name, buffers[index]]))
}

export function loadSamples(instrument: SampledInstrument): Promise<Samples> {
  let samples = loading.get(instrument)
  if (!samples) {
    samples = download(instrument)
    // A failed download can be tried again on the next click
    samples.catch(() => loading.delete(instrument))
    loading.set(instrument, samples)
  }
  return samples
}
