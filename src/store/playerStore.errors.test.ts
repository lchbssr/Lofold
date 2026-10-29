import { beforeEach, describe, expect, it, vi } from 'vitest'

// A stand-in for the Tone.js player, whose failures the tests choose
const { player, loadPlayer } = vi.hoisted(() => {
  let prepared = false
  const player = {
    isReady: vi.fn(() => false),
    start: vi.fn(async () => {}),
    isPrepared: vi.fn(() => prepared),
    prepare: vi.fn(async () => {
      prepared = true
    }),
    resetPrepared: () => {
      prepared = false
    },
    load: vi.fn(),
    seek: vi.fn(),
    setLoop: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    getPosition: vi.fn(() => 0),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setWeather: vi.fn(),
    setEffects: vi.fn(),
    audition: vi.fn(),
    changeSmoothly: vi.fn((change: () => void) => change()),
  }
  return { player, loadPlayer: vi.fn(async () => player) }
})

vi.mock('../audio/loadPlayer', () => ({ loadPlayer, getLoadedPlayer: () => player }))
vi.stubGlobal('window', {
  location: { search: '?seed=7', href: 'http://localhost/?seed=7' },
  history: { replaceState: () => {} },
})
const { usePlayerStore } = await import('./playerStore')

describe('playerStore errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    player.resetPrepared()
    usePlayerStore.setState({ isPlaying: false, isLoading: false, error: null })
  })

  it('says when the browser does not let the sound start', async () => {
    player.start.mockRejectedValueOnce(new Error('blocked'))
    await usePlayerStore.getState().togglePlay()

    expect(usePlayerStore.getState()).toMatchObject({ error: 'audio', isPlaying: false, isLoading: false })
  })

  it('says when the player cannot be downloaded', async () => {
    loadPlayer.mockRejectedValueOnce(new Error('offline'))
    await usePlayerStore.getState().togglePlay()

    expect(usePlayerStore.getState()).toMatchObject({ error: 'download', isPlaying: false, isLoading: false })
  })

  it('says when the sounds of an instrument cannot be downloaded', async () => {
    player.prepare.mockRejectedValueOnce(new Error('offline'))
    await usePlayerStore.getState().togglePlay()

    expect(usePlayerStore.getState()).toMatchObject({ error: 'download', isPlaying: false, isLoading: false })
    expect(player.play).not.toHaveBeenCalled()
  })

  it('clears the message once the music plays again', async () => {
    player.start.mockRejectedValueOnce(new Error('blocked'))
    await usePlayerStore.getState().togglePlay()
    await usePlayerStore.getState().togglePlay()

    expect(usePlayerStore.getState()).toMatchObject({ error: null, isPlaying: true })
  })
})
