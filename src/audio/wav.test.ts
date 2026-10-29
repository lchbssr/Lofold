import { describe, expect, it } from 'vitest'
import { encodeWav, normalize } from './wav'

const text = (view: DataView, offset: number, length: number) =>
  String.fromCharCode(...Array.from({ length }, (_, index) => view.getUint8(offset + index)))

describe('encodeWav', () => {
  const left = new Float32Array([0, 0.5, -0.5, 1])
  const right = new Float32Array([0, -1, 2, -2])
  const view = new DataView(encodeWav([left, right], 44100))

  it('writes a valid WAV header', () => {
    expect(text(view, 0, 4)).toBe('RIFF')
    expect(text(view, 8, 4)).toBe('WAVE')
    expect(text(view, 36, 4)).toBe('data')
    expect(view.getUint16(20, true)).toBe(1) // PCM
    expect(view.getUint16(22, true)).toBe(2) // stereo
    expect(view.getUint32(24, true)).toBe(44100)
    expect(view.getUint16(34, true)).toBe(16)
  })

  it('stores every sample of every channel', () => {
    // 4 frames × 2 channels × 2 bytes
    expect(view.getUint32(40, true)).toBe(16)
    expect(view.byteLength).toBe(44 + 16)
  })

  it('interleaves the channels and converts the samples to 16 bits', () => {
    expect(view.getInt16(44 + 4, true)).toBe(16383) // left, 0.5
    expect(view.getInt16(44 + 6, true)).toBe(-32768) // right, -1
  })

  it('clips the samples outside -1 to 1', () => {
    expect(view.getInt16(44 + 10, true)).toBe(32767) // right, 2
    expect(view.getInt16(44 + 14, true)).toBe(-32768) // right, -2
  })
})

describe('normalize', () => {
  it('brings the loudest sample to the target level', () => {
    const [channel] = normalize([new Float32Array([0.1, -0.2, 0.05])], 0.8)

    expect(Array.from(channel).map((sample) => Number(sample.toFixed(3)))).toEqual([0.4, -0.8, 0.2])
  })

  it('leaves silence untouched', () => {
    const silence = [new Float32Array([0, 0])]

    expect(normalize(silence)).toBe(silence)
  })
})
