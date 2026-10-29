import { create } from 'zustand'
import type { Effects } from '../audio/effects'
import { getLoadedPlayer, loadPlayer, type Player } from '../audio/loadPlayer'
import { updateMediaPosition, updateMediaSession } from '../audio/mediaSession'
import type { Sound } from '../audio/player'
import { decodeArrangement, defaultArrangement, encodeArrangement, sameArrangement } from '../engine/arrangement'
import { decodeInstrumentation, defaultInstrumentation, encodeInstrumentation, sameInstrumentation } from '../engine/instrumentation'
import { generateSong, rearrange } from '../engine/song'
import { secondsToSteps, STEPS_PER_BAR, stepsToSeconds } from '../engine/time'
import type { Instrumentation, Part, SectionName, SectionSettings, Song } from '../engine/types'
import { describeSong } from '../i18n/format'
import { getMessages } from '../i18n/messages'
import { useAmbianceStore } from './ambianceStore'
import { useLanguageStore } from './languageStore'
import { songName, useLibraryStore } from './libraryStore'
import { randomSeed, seedFromSearch } from './seed'
import { readSettings, saveSettings } from './settings'
import { setUrlParams } from './url'

export type PlayerError = 'audio' | 'download'

interface PlayedSong {
  song: Song
  hasManualEdits: boolean
}

const HISTORY_SIZE = 20
const UNDO_SIZE = 50
const SLEEP_FADE_SECONDS = 10

interface PlayerState {
  song: Song
  /**
   * True once notes were changed by hand in the advanced editor: the seed and the arrangement
   * can no longer rebuild the song, so it cannot be shared by link anymore
   */
  hasManualEdits: boolean
  isPlaying: boolean
  isLoading: boolean
  error: PlayerError | null
  /**
   * Where the music resumes, in sixteenth notes: set by a seek, a pause or a new song.
   * While the music plays, the current position comes from the player.
   */
  resumeAt: number
  history: PlayedSong[]
  upcoming: PlayedSong[]
  undoStack: PlayedSong[]
  redoStack: PlayedSong[]
  volume: number
  isMuted: boolean
  effects: Effects
  loopedBar: number | null
  sleepTimer: { minutes: number; endsAt: number } | null
  togglePlay: () => Promise<void>
  nextSong: () => void
  previousSong: () => void
  seek: (step: number) => void
  moveByBars: (bars: number) => void
  getPosition: () => number
  arrange: (section: SectionName, changes: Partial<SectionSettings>) => void
  setInstrument: <P extends Part>(part: P, instrument: Instrumentation[P]) => void
  editSong: (edit: (song: Song) => Song) => void
  undo: () => void
  redo: () => void
  openSong: (song: Song) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setEffect: (name: keyof Effects, value: number) => void
  setLoopedBar: (bar: number | null) => void
  setSleepTimer: (minutes: number | null) => void
  audition: (sound: Sound) => Promise<void>
  dismissError: () => void
}

function loopRange(bar: number | null) {
  return bar === null ? null : { start: bar * STEPS_PER_BAR, end: (bar + 1) * STEPS_PER_BAR }
}

function hasOtherArrangement(song: Song): boolean {
  return !sameArrangement(song.arrangement, defaultArrangement(song.seed))
}

function hasOtherInstruments(song: Song): boolean {
  return !sameInstrumentation(song.instrumentation, defaultInstrumentation(song.seed))
}

/** A song somebody has worked on: it plays in a loop instead of moving on to a new one */
export function isCustomSong({ song, hasManualEdits }: Pick<PlayerState, 'song' | 'hasManualEdits'>): boolean {
  return hasManualEdits || hasOtherArrangement(song) || hasOtherInstruments(song)
}

function updateUrl(song: Song, hasManualEdits: boolean) {
  if (hasManualEdits) {
    setUrlParams({ seed: null, arr: null, inst: null })
    return
  }
  setUrlParams({
    seed: String(song.seed),
    arr: hasOtherArrangement(song) ? encodeArrangement(song.arrangement) : null,
    inst: hasOtherInstruments(song) ? encodeInstrumentation(song.instrumentation) : null,
  })
}

function songFromUrl(): Song {
  const params = new URLSearchParams(window.location.search)
  const seed = seedFromSearch(window.location.search) ?? randomSeed()
  const arrangement = decodeArrangement(params.get('arr') ?? '')
  const instrumentation = decodeInstrumentation(params.get('inst') ?? '')
  const song = generateSong(seed, arrangement ?? undefined, instrumentation ?? undefined)
  updateUrl(song, false)
  return song
}

export const usePlayerStore = create<PlayerState>()((set, get) => {
  let loadedSong: Song | null = null

  let downloads = 0
  let sleepTimeout: ReturnType<typeof setTimeout> | undefined

  const whileLoading = async <T,>(task: Promise<T>): Promise<T> => {
    downloads++
    set({ isLoading: true })
    try {
      return await task
    } finally {
      downloads--
      if (downloads === 0) {
        set({ isLoading: false })
      }
    }
  }

  const handleEnd = () => {
    if (!isCustomSong(get())) {
      get().nextSong()
      return
    }
    void schedule(get().song)
    syncMediaSession(0)
  }

  /**
   * Schedules the song in the player if music is playing, once its instruments are ready:
   * from its beginning, or from where the music is (after an edit). A change of song fades smoothly.
   */
  const schedule = async (song: Song, { fromCurrentPosition = false, smoothly = false } = {}) => {
    const player = getLoadedPlayer()
    if (!player || !get().isPlaying) {
      return
    }
    if (!player.isPrepared(song.instrumentation)) {
      try {
        await whileLoading(player.prepare(song.instrumentation))
      } catch {
        set({ error: 'download' })
        return
      }
      // Another song may have been chosen, or the music paused, during the download
      if (get().song !== song || !get().isPlaying) {
        return
      }
    }
    const play = () => {
      // Read before loading, which moves the player back to the beginning
      const from = fromCurrentPosition ? player.getPosition() : 0
      player.load(song, handleEnd)
      player.seek(from)
      player.play()
      loadedSong = song
    }
    if (smoothly) {
      player.changeSmoothly(play)
    } else {
      play()
    }
  }

  const prepareCurrentSong = async (player: Player): Promise<boolean> => {
    try {
      while (!player.isPrepared(get().song.instrumentation)) {
        await whileLoading(player.prepare(get().song.instrumentation))
      }
      return true
    } catch {
      set({ error: 'download' })
      return false
    }
  }

  const showSong = (next: PlayedSong, history: Pick<PlayerState, 'history' | 'upcoming'>) => {
    get().setLoopedBar(null)
    set({ ...next, ...history, resumeAt: 0, undoStack: [], redoStack: [] })
    updateUrl(next.song, next.hasManualEdits)
    void schedule(next.song, { smoothly: true })
    // The player still plays the previous song during the fade: the new one starts from 0
    syncMediaSession(0)
  }

  const withCurrent = (songs: PlayedSong[]): PlayedSong[] => {
    const { song, hasManualEdits } = get()
    return [...songs, { song, hasManualEdits }].slice(-HISTORY_SIZE)
  }

  const replaceSong = (song: Song, hasManualEdits: boolean) => {
    set({ song, hasManualEdits })
    updateUrl(song, hasManualEdits)
    void schedule(song, { fromCurrentPosition: true })
  }

  const changeSong = (song: Song, hasManualEdits: boolean) => {
    const { song: current, hasManualEdits: currentEdits, undoStack } = get()
    set({ undoStack: [...undoStack, { song: current, hasManualEdits: currentEdits }].slice(-UNDO_SIZE), redoStack: [] })
    replaceSong(song, hasManualEdits)
  }

  const startPlayer = async (): Promise<Player | null> => {
    const start = async () => {
      const player = await loadPlayer().catch(() => null)
      if (!player) {
        set({ error: 'download' })
        return null
      }
      const started = await player.start().then(() => true, () => false)
      if (!started) {
        set({ error: 'audio' })
        return null
      }
      const { volume, isMuted, effects } = get()
      player.setVolume(volume)
      player.setMuted(isMuted)
      player.setEffects(effects)
      player.setWeather(useAmbianceStore.getState().weatherId)
      return player
    }
    return getLoadedPlayer()?.isReady() ? start() : whileLoading(start())
  }

  const pause = (player: Player, fadeSeconds?: number) => {
    player.pause(fadeSeconds)
    set({ isPlaying: false, resumeAt: player.getPosition() })
    syncMediaSession()
  }

  const syncMediaPosition = (step: number) => {
    const { song } = get()
    updateMediaPosition(stepsToSeconds(song.bars * STEPS_PER_BAR, song.bpm), stepsToSeconds(step, song.bpm))
  }

  const syncMediaSession = (position = get().getPosition()) => {
    const { song, isPlaying, history, togglePlay, nextSong, previousSong, seek } = get()
    updateMediaSession(songName(useLibraryStore.getState().tracks, song), describeSong(song, getMessages()), isPlaying, {
      play: () => {
        if (!get().isPlaying) void togglePlay()
      },
      pause: () => {
        if (get().isPlaying) void togglePlay()
      },
      next: nextSong,
      previous: history.length > 0 ? previousSong : null,
      seekTo: (seconds) => seek(Math.floor(secondsToSteps(seconds, get().song.bpm) / STEPS_PER_BAR) * STEPS_PER_BAR),
    })
    syncMediaPosition(position)
  }

  const settings = readSettings()

  useAmbianceStore.subscribe(({ weatherId }) => getLoadedPlayer()?.setWeather(weatherId))
  // A track renamed in the library gets its new name in the system media controls right away
  useLibraryStore.subscribe(() => syncMediaSession())
  useLanguageStore.subscribe(() => syncMediaSession())

  return {
    song: songFromUrl(),
    hasManualEdits: false,
    isPlaying: false,
    isLoading: false,
    error: null,
    resumeAt: 0,
    history: [],
    upcoming: [],
    undoStack: [],
    redoStack: [],
    ...settings,
    isMuted: false,
    loopedBar: null,
    sleepTimer: null,

    togglePlay: async () => {
      const player = await startPlayer()
      if (!player) {
        return
      }

      if (get().isPlaying) {
        pause(player)
        return
      }

      if (!(await prepareCurrentSong(player))) {
        return
      }
      const { song, resumeAt, loopedBar } = get()
      // A song changed while paused is loaded again; the position is kept, since a new song resets it
      if (loadedSong !== song) {
        player.load(song, handleEnd)
        loadedSong = song
      }
      player.seek(resumeAt)
      player.setLoop(loopRange(loopedBar))
      player.play()
      set({ isPlaying: true, error: null })
      syncMediaSession()
    },

    nextSong: () => {
      const { history, upcoming } = get()
      const next = upcoming.at(-1) ?? { song: generateSong(randomSeed()), hasManualEdits: false }
      showSong(next, { history: withCurrent(history), upcoming: upcoming.slice(0, -1) })
    },

    previousSong: () => {
      const { history, upcoming } = get()
      const previous = history.at(-1)
      if (previous) {
        showSong(previous, { history: history.slice(0, -1), upcoming: withCurrent(upcoming) })
      }
    },

    seek: (step) => {
      set({ resumeAt: step })
      syncMediaPosition(step)
      if (get().isPlaying) {
        const player = getLoadedPlayer()
        player?.changeSmoothly(() => player.seek(step))
      }
    },

    moveByBars: (bars) => {
      const { song, getPosition, seek } = get()
      const bar = Math.floor(getPosition() / STEPS_PER_BAR) + bars
      seek(Math.min(song.bars - 1, Math.max(0, bar)) * STEPS_PER_BAR)
    },

    getPosition: () => {
      const { isPlaying, resumeAt } = get()
      return isPlaying ? (getLoadedPlayer()?.getPosition() ?? resumeAt) : resumeAt
    },

    arrange: (section, changes) => changeSong(rearrange(get().song, section, changes), false),

    setInstrument: (part, instrument) => {
      const { song, hasManualEdits } = get()
      changeSong({ ...song, instrumentation: { ...song.instrumentation, [part]: instrument } }, hasManualEdits)
    },

    editSong: (edit) => changeSong(edit(get().song), true),

    undo: () => {
      const { song, hasManualEdits, undoStack, redoStack } = get()
      const previous = undoStack.at(-1)
      if (previous) {
        set({ undoStack: undoStack.slice(0, -1), redoStack: [...redoStack, { song, hasManualEdits }] })
        replaceSong(previous.song, previous.hasManualEdits)
      }
    },

    redo: () => {
      const { song, hasManualEdits, undoStack, redoStack } = get()
      const next = redoStack.at(-1)
      if (next) {
        set({ undoStack: [...undoStack, { song, hasManualEdits }], redoStack: redoStack.slice(0, -1) })
        replaceSong(next.song, next.hasManualEdits)
      }
    },

    openSong: (song) => {
      // Tracks saved before the simple editor or the choice of instruments get the ones of their seed
      const saved = {
        ...song,
        arrangement: song.arrangement ?? defaultArrangement(song.seed),
        instrumentation: song.instrumentation ?? defaultInstrumentation(song.seed),
      }
      // Like opening a new page in a browser, it leaves no song to move forward to
      showSong({ song: saved, hasManualEdits: true }, { history: withCurrent(get().history), upcoming: [] })
    },

    setVolume: (volume) => {
      set({ volume, isMuted: false })
      saveSettings({ volume, effects: get().effects })
      getLoadedPlayer()?.setVolume(volume)
      getLoadedPlayer()?.setMuted(false)
    },

    toggleMute: () => {
      const isMuted = !get().isMuted
      set({ isMuted })
      getLoadedPlayer()?.setMuted(isMuted)
    },

    setEffect: (name, value) => {
      const effects = { ...get().effects, [name]: value }
      set({ effects })
      saveSettings({ volume: get().volume, effects })
      getLoadedPlayer()?.setEffects(effects)
    },

    setLoopedBar: (bar) => {
      set({ loopedBar: bar })
      getLoadedPlayer()?.setLoop(loopRange(bar))
    },

    setSleepTimer: (minutes) => {
      clearTimeout(sleepTimeout)
      if (minutes === null) {
        set({ sleepTimer: null })
        return
      }
      set({ sleepTimer: { minutes, endsAt: Date.now() + minutes * 60_000 } })
      sleepTimeout = setTimeout(() => {
        set({ sleepTimer: null })
        const player = getLoadedPlayer()
        if (player && get().isPlaying) {
          pause(player, SLEEP_FADE_SECONDS)
        }
      }, minutes * 60_000)
    },

    audition: async (sound) => {
      const player = await startPlayer()
      if (player && (await prepareCurrentSong(player))) {
        player.audition(sound, get().song.instrumentation)
      }
    },

    dismissError: () => set({ error: null }),
  }
})
