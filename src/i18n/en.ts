import type { Instrumentation, Part } from '../engine/types'

type InstrumentNames = { [P in Part]: Record<Instrumentation[P], string> }

const instruments: InstrumentNames = {
  keys: { piano: 'Piano', guitar: 'Guitar', synth: 'Synth' },
  lead: { piano: 'Piano', sax: 'Sax', synth: 'Synth' },
  bass: { 'double-bass': 'Double bass', 'electric-bass': 'Electric bass', synth: 'Synth' },
  drums: { retro: 'Retro kit', synth: 'Synth' },
}

/** Every text of the interface in English; fr.ts must provide the same ones */
export const en = {
  locale: 'en',
  /** Added to the octave of a note name: 0 writes middle C as C4 */
  octaveOffset: 0,

  app: {
    tagline: 'Compose lo-fi music in your browser.',
    openEditor: 'Edit this track',
    closeEditor: 'Close the editor',
    backgroundPlay: 'The music keeps playing while you work in another tab.',
    customLoops: 'A track you changed plays in a loop.',
    nextStarts: 'When a track ends, a new one starts.',
    idleHint: 'Leave the mouse still to watch the scene.',
    iosWarning: 'On iPhone and iPad, the music may stop when the screen locks.',
    shortcuts: 'Keyboard shortcuts',
    language: 'Language',
  },

  player: {
    edited: 'edited',
    custom: 'custom',
    restart: 'Restart this track',
    previous: 'Previous track',
    next: 'Next track',
    generate: 'Generate a new track',
    loading: 'Loading the sounds…',
    play: 'Play',
    pause: 'Pause',
    volume: 'Volume',
    warmth: 'Warmth',
    vinyl: 'Vinyl',
    space: 'Space',
    weather: 'Weather',
    muted: 'Muted, press M to hear it again',
    position: 'Position in the track',
    nowPlaying: 'Now playing',
    save: 'Save to My tracks',
    unsave: 'Remove from My tracks',
    share: 'Copy the link of this track',
    shared: 'Link copied',
    cannotShare: 'Edited tracks cannot be shared by link',
    download: 'Download as WAV',
    rendering: 'Rendering…',
    renderingTrack: 'Rendering the track…',
    downloadFailed: 'The export failed, try again',
    fullscreen: 'Full screen',
    leaveFullscreen: 'Leave full screen',
    sleepTimerOff: (next: number) => `Sleep timer: stop the music in ${next} min`,
    sleepTimerOn: (left: number, next: number | null) =>
      `The music stops in ${left} min. ${next === null ? 'Turn the timer off' : `Stop it in ${next} min instead`}`,
    minutes: (minutes: number) => `${minutes} min`,
  },

  errors: {
    audio: 'The sound could not start. Check that this site is allowed to play sound, then press play again.',
    download: 'Some sounds could not be downloaded. Check your connection, then try again.',
    close: 'Close this message',
  },

  ambiance: {
    scene: 'Scene',
    weather: 'Weather',
    timeOfDay: 'Time of day',
    auto: 'Auto: follows the time of day',
    scenes: { room: 'Room', city: 'City', hills: 'Hills', sea: 'Sea' },
    weathers: { clear: 'Clear', rain: 'Rain', snow: 'Snow', storm: 'Storm' },
    palettes: { dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' },
  },

  shortcuts: {
    title: 'Keyboard shortcuts',
    close: 'Close',
    space: 'Space',
    shift: 'Shift',
    playPause: 'Play or pause',
    previousNext: 'Previous or next track',
    moveByBar: 'One bar back or forward',
    volume: 'Volume, while the editor is closed',
    mute: 'Mute, or hear the music again',
    fullscreen: 'Full screen',
    undo: 'Undo a change, while the editor is open',
    redo: 'Redo it',
    help: 'This help',
  },

  editor: {
    mode: 'Editor mode',
    simple: 'Simple',
    advanced: 'Advanced',
    undo: (modifier: string) => `Undo (${modifier}+Z)`,
    redo: (modifier: string) => `Redo (${modifier}+Shift+Z)`,

    simpleIntro:
      "Pick what you like for each part of the track. The dice plays another version of that part only: keep what you like, roll what you don't.",
    instruments: 'Instruments',
    manualEditsWarning: 'Changing these settings replaces the notes you edited by hand.',
    plays: (times: number) => `plays ${times} times`,
    otherChords: (section: string) => `Other chords for ${section}`,
    otherMelody: (section: string) => `Other melody for ${section}`,
    otherDrums: (section: string) => `Other drums for ${section}`,
    on: 'On',
    off: 'Off',

    bar: (bar: number) => `Bar ${bar}`,
    barButton: (bar: number, chord: string, isPlaying: boolean) => `Bar ${bar}, ${chord}${isPlaying ? ', playing' : ''}`,
    loopBar: 'Loop this bar',
    chord: 'Chord',
    halfOfBar: 'Half of the bar',
    halves: ['Beats 1–2', 'Beats 3–4'],
    drums: 'Drums',
    melody: 'Melody',
    cell: (row: string, step: number) => `${row}, step ${step}`,
    drumNames: { kick: 'Kick', snare: 'Snare', hihat: 'Hi-hat' },
    advancedHelp:
      'Click a cell to hear it and add it, click it again to remove it. Turn on “Loop this bar” to hear your changes right away. The bass follows the chords.',

    myTracks: 'My tracks',
    saved: 'Saved',
    saveTrack: 'Save this track',
    emptyLibrary: 'Saved tracks stay in this browser.',
    trackName: 'Name of the track',
    rename: 'Rename',
    renameTrack: (name: string) => `Rename ${name}`,
    delete: 'Delete',
    deleteTrack: (name: string) => `Delete ${name}`,
  },

  music: {
    notes: { C: 'C', 'C#': 'C#', D: 'D', 'D#': 'D#', E: 'E', F: 'F', 'F#': 'F#', G: 'G', 'G#': 'G#', A: 'A', 'A#': 'A#', B: 'B' },
    scales: { major: 'major', dorian: 'dorian', aeolian: 'minor' },
    sections: { intro: 'Intro', A: 'Part A', B: 'Part B', outro: 'Outro' },
    parts: { keys: 'Chords', lead: 'Melody', bass: 'Bass', drums: 'Drums' },
    moods: { chill: 'Chill', melancholic: 'Melancholic', dreamy: 'Dreamy' },
    melodyStyles: { none: 'None', calm: 'Calm', lively: 'Lively' },
    drumStyles: { none: 'None', light: 'Light', classic: 'Classic', busy: 'Busy' },
    instruments,
  },
}

export type Messages = typeof en
