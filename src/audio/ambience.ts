import * as Tone from 'tone'
import { lightningBetween, type WeatherId } from '../scenes/weather'

export interface Ambience {
  setWeather: (weather: WeatherId) => void
  setLevel: (level: number) => void
}

const MIXES: Record<WeatherId, { rain: number; wind: number; thunder: boolean }> = {
  clear: { rain: 0, wind: 0.5, thunder: false },
  rain: { rain: 0.6, wind: 0.1, thunder: false },
  snow: { rain: 0, wind: 1, thunder: false },
  storm: { rain: 0.85, wind: 0.5, thunder: true },
}
const MAX_GAIN = 0.8

const CROSSFADE_SECONDS = 2
const THUNDER_CHECK_MS = 500
const THUNDER_LOOKAHEAD_SECONDS = 1.5

export function createAmbience(context: Tone.BaseContext, output: Tone.InputNode): Ambience {
  const master = new Tone.Gain({ context, gain: 0 }).connect(output)

  const rain = new Tone.Gain({ context, gain: 0 }).connect(master)
  const rainHighpass = new Tone.Filter({ context, frequency: 500, type: 'highpass' }).connect(rain)
  const rainLowpass = new Tone.Filter({ context, frequency: 7000, type: 'lowpass' }).connect(rainHighpass)
  new Tone.Noise({ context, type: 'pink' }).connect(rainLowpass).sync().start(0)

  const wind = new Tone.Gain({ context, gain: 0 }).connect(master)
  const gusts = new Tone.Gain({ context, gain: 0.6 }).connect(wind)
  const windFilter = new Tone.Filter({ context, frequency: 500, type: 'bandpass', Q: 1.2 }).connect(gusts)
  new Tone.LFO({ context, frequency: 0.06, min: 300, max: 900 }).connect(windFilter.frequency).start()
  new Tone.LFO({ context, frequency: 0.09, min: 0.3, max: 1 }).connect(gusts.gain).start()
  new Tone.Noise({ context, type: 'pink' }).connect(windFilter).sync().start(0)

  const thunder = new Tone.AmplitudeEnvelope({ context, attack: 0.3, decay: 2.5, sustain: 0, release: 1.5 }).connect(master)
  const thunderFilter = new Tone.Filter({ context, frequency: 200, type: 'lowpass', rolloff: -24 }).connect(thunder)
  new Tone.Noise({ context, type: 'brown' }).connect(thunderFilter).start()

  let weather: WeatherId = 'clear'
  let lastScheduled = -1

  // Looks for the lightning about to strike on screen: both use the clock of the page
  setInterval(() => {
    if (!MIXES[weather].thunder || context.transport.state !== 'started') {
      return
    }
    const now = performance.now() / 1000
    for (const { start, seed } of lightningBetween(now, now + THUNDER_LOOKAHEAD_SECONDS)) {
      if (seed <= lastScheduled) {
        continue
      }
      lastScheduled = seed
      // Sound travels slower than light: the farther the lightning, the later and softer its thunder
      const distance = (seed % 5) / 4
      const delay = 0.4 + distance * 1.6
      thunder.triggerAttackRelease(2, context.now() + start - now + delay, 1 - distance * 0.5)
    }
  }, THUNDER_CHECK_MS)

  return {
    setWeather: (next) => {
      weather = next
      rain.gain.rampTo(MIXES[next].rain, CROSSFADE_SECONDS)
      wind.gain.rampTo(MIXES[next].wind, CROSSFADE_SECONDS)
    },
    setLevel: (level) => master.gain.rampTo(level * MAX_GAIN, 0.1),
  }
}
