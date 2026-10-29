import { beforeEach, describe, expect, it, vi } from 'vitest'

// The store reads and updates the link of the page: a minimal one is enough, since no sound is played here
vi.stubGlobal('window', {
  location: { search: '?seed=7', href: 'http://localhost/?seed=7' },
  history: { replaceState: () => {} },
})
const { isCustomSong, usePlayerStore } = await import('./playerStore')

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({ history: [], upcoming: [], undoStack: [], redoStack: [], resumeAt: 0 })
  })

  it('moves in the song while it is paused', () => {
    usePlayerStore.getState().seek(32)

    expect(usePlayerStore.getState().getPosition()).toBe(32)
  })

  it('starts a new song from the beginning, and can go back to the previous one', () => {
    const { song: first, seek, nextSong } = usePlayerStore.getState()
    seek(48)
    nextSong()

    expect(usePlayerStore.getState().song).not.toBe(first)
    expect(usePlayerStore.getState().getPosition()).toBe(0)

    usePlayerStore.getState().previousSong()

    expect(usePlayerStore.getState().song).toBe(first)
    expect(usePlayerStore.getState().history).toEqual([])
  })

  it('moves forward again to the song left by going back, then generates new ones', () => {
    const { song: first, nextSong } = usePlayerStore.getState()
    nextSong()
    const second = usePlayerStore.getState().song
    usePlayerStore.getState().previousSong()

    expect(usePlayerStore.getState().song).toBe(first)

    usePlayerStore.getState().nextSong()

    expect(usePlayerStore.getState().song).toBe(second)
    expect(usePlayerStore.getState().upcoming).toEqual([])

    usePlayerStore.getState().nextSong()

    expect(usePlayerStore.getState().song).not.toBe(first)
    expect(usePlayerStore.getState().song).not.toBe(second)
  })

  it('leaves no song to move forward to after opening a saved one', () => {
    const { song, nextSong } = usePlayerStore.getState()
    nextSong()
    usePlayerStore.getState().previousSong()
    usePlayerStore.getState().openSong(song)

    expect(usePlayerStore.getState().upcoming).toEqual([])
  })

  it('plays a part with another instrument without changing the notes, and keeps it in the link', () => {
    const { song, setInstrument } = usePlayerStore.getState()
    const other = song.instrumentation.lead === 'sax' ? 'synth' : 'sax'
    setInstrument('lead', other)
    const changed = usePlayerStore.getState().song

    expect(changed.instrumentation.lead).toBe(other)
    expect(changed.melody).toBe(song.melody)
    expect(isCustomSong(usePlayerStore.getState())).toBe(true)
  })

  it('turns the sleep timer off by itself once it ends', () => {
    vi.useFakeTimers()
    usePlayerStore.getState().setSleepTimer(15)

    expect(usePlayerStore.getState().sleepTimer?.minutes).toBe(15)

    vi.advanceTimersByTime(15 * 60_000)

    expect(usePlayerStore.getState().sleepTimer).toBeNull()
    vi.useRealTimers()
  })

  it('replaces a running sleep timer by the new one', () => {
    vi.useFakeTimers()
    usePlayerStore.getState().setSleepTimer(15)
    usePlayerStore.getState().setSleepTimer(30)
    vi.advanceTimersByTime(15 * 60_000)

    expect(usePlayerStore.getState().sleepTimer?.minutes).toBe(30)

    usePlayerStore.getState().setSleepTimer(null)
    vi.useRealTimers()
  })

  it('undoes and redoes the changes made in the editor', () => {
    const { song: original, arrange } = usePlayerStore.getState()
    arrange('A', { drums: 'busy' })
    const changed = usePlayerStore.getState().song

    usePlayerStore.getState().undo()

    expect(usePlayerStore.getState().song).toBe(original)

    usePlayerStore.getState().redo()

    expect(usePlayerStore.getState().song).toBe(changed)
  })

  it('forgets the changes undone once another change is made', () => {
    const { arrange } = usePlayerStore.getState()
    arrange('A', { drums: 'busy' })
    usePlayerStore.getState().undo()
    usePlayerStore.getState().arrange('B', { melody: 'none' })

    expect(usePlayerStore.getState().redoStack).toEqual([])
  })

  it('starts a new song with nothing to undo', () => {
    usePlayerStore.getState().arrange('A', { drums: 'busy' })
    usePlayerStore.getState().nextSong()

    expect(usePlayerStore.getState().undoStack).toEqual([])
  })

  it('moves by one bar, without going past the start or the end of the song', () => {
    const { seek, moveByBars, song } = usePlayerStore.getState()
    seek(37)
    moveByBars(1)

    expect(usePlayerStore.getState().getPosition()).toBe(48)

    moveByBars(-5)

    expect(usePlayerStore.getState().getPosition()).toBe(0)

    seek((song.bars - 1) * 16)
    moveByBars(1)

    expect(usePlayerStore.getState().getPosition()).toBe((song.bars - 1) * 16)
  })

  it('mutes and brings the sound back at the same volume', () => {
    usePlayerStore.getState().setVolume(0.6)
    usePlayerStore.getState().toggleMute()

    expect(usePlayerStore.getState()).toMatchObject({ isMuted: true, volume: 0.6 })

    usePlayerStore.getState().toggleMute()

    expect(usePlayerStore.getState()).toMatchObject({ isMuted: false, volume: 0.6 })
  })

  it('brings the sound back when the volume is moved', () => {
    usePlayerStore.getState().toggleMute()
    usePlayerStore.getState().setVolume(0.3)

    expect(usePlayerStore.getState().isMuted).toBe(false)
  })

  it('does nothing when there is no previous song', () => {
    const { song } = usePlayerStore.getState()
    usePlayerStore.getState().previousSong()

    expect(usePlayerStore.getState().song).toBe(song)
  })

  it('only keeps the last songs', () => {
    for (let index = 0; index < 30; index++) {
      usePlayerStore.getState().nextSong()
    }

    expect(usePlayerStore.getState().history).toHaveLength(20)
  })
})
