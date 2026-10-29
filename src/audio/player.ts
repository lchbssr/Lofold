import * as Tone from 'tone'
import { STEPS_PER_BAR } from '../engine/time'
import type { Instrumentation, Song } from '../engine/types'
import type { WeatherId } from '../scenes/weather'
import { createAmbience, type Ambience } from './ambience'
import type { Effects } from './effects'
import { createInstruments, type Instruments } from './instruments'
import type { Drum } from './samples'
import { scheduleSong } from './schedule'
import { PPQ, stepsToTicks, TICKS_PER_STEP } from './time'

const context = Tone.getContext()

const FADE_SECONDS = 0.3

let instruments: Instruments | null = null
let ambience: Ambience | null = null
let parts: Tone.Part[] = []
let endEvent: number | null = null
let fader: Tone.Gain | null = null
let pending: { id: number; change: () => void } | null = null

export function isReady(): boolean {
  return instruments !== null
}

/** Must be called after a user gesture: browsers block audio until then */
export async function start() {
  await Tone.start()
  // Some browsers leave the audio suspended without an error: playing would then be silent
  if (context.state !== 'running') {
    throw new Error('The browser did not let the sound start')
  }
  if (!instruments) {
    context.transport.PPQ = PPQ
    fader = new Tone.Gain({ context, gain: 0 }).toDestination()
    instruments = createInstruments(context, fader)
    ambience = createAmbience(context, fader)
  }
}

export async function prepare(instrumentation: Instrumentation) {
  if (!instruments) {
    throw new Error('Call start() before preparing a song')
  }
  await instruments.load(instrumentation)
}

export function isPrepared(instrumentation: Instrumentation): boolean {
  return instruments?.loaded(instrumentation) != null
}

function makePendingChange() {
  if (pending) {
    const { id, change } = pending
    pending = null
    context.clearTimeout(id)
    change()
  }
}

function fadeIn() {
  fader?.gain.rampTo(1, FADE_SECONDS)
}

function fadeOutThen(change: () => void, seconds = FADE_SECONDS) {
  makePendingChange()
  fader?.gain.rampTo(0, seconds)
  const id = context.setTimeout(() => {
    pending = null
    change()
  }, seconds)
  pending = { id, change }
}

export function changeSmoothly(change: () => void) {
  if (context.transport.state !== 'started') {
    change()
    return
  }
  fadeOutThen(() => {
    change()
    fadeIn()
  })
}

export function load(song: Song, onEnd: () => void) {
  const band = instruments?.loaded(song.instrumentation)
  if (!band) {
    throw new Error('Call prepare() before loading a song')
  }
  const { transport } = context

  // Only our own events are removed: transport.cancel() would also remove the vinyl hiss
  transport.stop()
  parts.forEach((part) => part.dispose())
  if (endEvent !== null) {
    transport.clear(endEvent)
  }

  parts = scheduleSong(context, song, band)
  endEvent = transport.scheduleOnce((time) => {
    // Called in sync with the screen, so the interface can update safely
    context.draw.schedule(onEnd, time)
  }, stepsToTicks(song.bars * STEPS_PER_BAR))
}

export function play() {
  makePendingChange()
  context.transport.start()
  fadeIn()
}

export function pause(fadeSeconds = FADE_SECONDS) {
  fadeOutThen(() => context.transport.pause(), fadeSeconds)
}

export function setVolume(volume: number) {
  context.destination.volume.rampTo(Tone.gainToDb(volume), 0.05)
}

export function setMuted(muted: boolean) {
  context.destination.mute = muted
}

export function setEffects(effects: Effects) {
  instruments?.setEffects(effects)
  ambience?.setLevel(effects.ambience)
}

export function setWeather(weather: WeatherId) {
  ambience?.setWeather(weather)
}

export function getPosition(): number {
  return context.transport.ticks / TICKS_PER_STEP
}

export function seek(step: number) {
  context.transport.ticks = Math.round(step * TICKS_PER_STEP)
}

export function setLoop(range: { start: number; end: number } | null) {
  const { transport } = context
  if (range === null) {
    transport.loop = false
    return
  }
  transport.loopStart = stepsToTicks(range.start)
  transport.loopEnd = stepsToTicks(range.end)
  transport.loop = true
  const position = getPosition()
  if (position < range.start || position >= range.end) {
    seek(range.start)
  }
}

export type Sound =
  | { instrument: 'lead'; note: string }
  | { instrument: 'chord'; notes: string[] }
  | { instrument: Drum }

export function audition(sound: Sound, instrumentation: Instrumentation) {
  const band = instruments?.loaded(instrumentation)
  if (!band) {
    return
  }
  // The fader is down while the music is paused: it is raised so the sound can be heard
  if (context.transport.state !== 'started') {
    makePendingChange()
    fader?.gain.rampTo(1, 0.02)
  }
  const now = context.now()
  switch (sound.instrument) {
    case 'lead':
      band.lead([sound.note], '8n', now, 0.7)
      break
    case 'chord':
      band.keys(sound.notes, '2n', now, 0.45)
      break
    default:
      band.drums(sound.instrument, now, 0.8)
  }
}
