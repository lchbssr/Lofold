import * as Tone from 'tone'
import { STEPS_PER_BAR, stepsToSeconds } from '../engine/time'
import type { Song } from '../engine/types'
import type { Effects } from './effects'
import { createInstruments } from './instruments'
import { scheduleSong } from './schedule'
import { PPQ } from './time'
import { encodeWav, normalize } from './wav'

const TAIL_SECONDS = 4

/**
 * Renders the whole song to a WAV file, faster than real time, with the current effects.
 * It uses its own offline context: the music playing live is not affected.
 */
export async function renderWav(song: Song, effects: Effects): Promise<Blob> {
  const duration = stepsToSeconds(song.bars * STEPS_PER_BAR, song.bpm) + TAIL_SECONDS
  const context = new Tone.OfflineContext(2, duration, Tone.getContext().sampleRate)
  context.transport.PPQ = PPQ

  const instruments = createInstruments(context)
  instruments.setEffects(effects)
  const band = await instruments.load(song.instrumentation)
  await instruments.ready
  scheduleSong(context, song, band)
  context.transport.start(0)

  const audio = await context.render()
  const channels = Array.from({ length: audio.numberOfChannels }, (_, index) => audio.getChannelData(index))
  context.dispose()

  return new Blob([encodeWav(normalize(channels), audio.sampleRate)], { type: 'audio/wav' })
}
