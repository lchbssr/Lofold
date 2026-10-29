# Lofold

Compose lo-fi music in your browser, or let Lofold generate a track for you.

## Features

- **Endless tracks**: the random button generates a new track from a seed, and the next one follows when it ends.
  The same seed always gives the same track, so `?seed=48213` is enough to share it.
- **Simple editor**: plain-word settings for the chords, melody, drums and bass, a die that rolls one part again,
  and a choice of instrument for each part (piano, guitar, saxophone, double bass, bass guitar, retro kit, synths).
- **Advanced editor**: a step grid for the drums, a chord for each bar (the bass follows), a piano roll for the melody,
  a loop on one bar, and undo and redo. Changes are heard without stopping the music.
- **Lo-fi sound**: CC0 samples through a low-pass filter, light saturation, reverb, tape wobble and vinyl crackle,
  all adjustable, plus synthesized weather sounds with thunder after each lightning strike.
- **Pixel art scenes**: a room, a city, hills and the sea, drawn in code on a 320×180 canvas, with the time of day
  (Dawn, Day, Dusk, Night, or Auto from the local clock) and the weather (Clear, Rain, Snow, Storm).
- **Save and share**: the link keeps the track, its edits, its instruments and the scene; “My tracks” saves tracks
  in the browser; any track can be downloaded as a WAV file.
- **English and French**: the interface follows the language of the browser, and can be switched at the bottom of the page.
- **Listening comfort**: keyboard shortcuts (press `?` to list them), a sleep timer, an idle mode that leaves only
  the scene, and the system media controls with the track name, the scene picture and the progress bar.

## How it works

```
seed → engine/ → track as JSON → store/ → audio/ → sound
                                        → scenes/ → canvas
```

The engine only builds a track as JSON, without playing a sound: chords from a Markov chain, a melody made of a
varied motif, a bass line, swung drums, a structure of sections and a light humanization. The player then schedules
this JSON with Tone.js. The whole generation is therefore tested with Vitest, without a browser or audio: the same
seed gives the same track, every note belongs to the scale, and no section or bar repeats too often, over 300 seeds.

```
src/
├── engine/      # Pure generation: seeded random, music theory, chords, melody, bass, drums, structure
├── audio/       # Tone.js player: instruments, effects, weather sounds, WAV export, media controls
├── store/       # State of the player, the library and the scene (Zustand)
├── scenes/      # Pixel art scenes, palettes and weather
├── components/  # Player, editors and pickers
└── i18n/        # The texts of the interface, in English and French
public/samples/  # CC0 samples
```

## Stack

React, TypeScript, Vite, Tailwind CSS, Zustand and [Tone.js](https://tonejs.github.io/) for the audio.
Oxlint and Vitest, checked by GitHub Actions.

## Getting started

Requirements: Node.js 22 or later.

```bash
npm install
npm run dev     # http://localhost:5173
npm run lint
npm test
npm run build
```

## Credits

Every sample is under the [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) license (public domain):

- upright piano and double bass: [VSCO 2 Community Edition](https://github.com/sgossner/VSCO-2-CE), Versilian Studios;
- electric guitar: [Black And Green Guitars](https://github.com/sfzinstruments/karoryfer.black-and-green-guitars), Karoryfer Samples;
- alto saxophone: [Weresax](https://github.com/sfzinstruments/karoryfer.weresax), Karoryfer Samples;
- bass guitar: [Swagbass](https://github.com/sfzinstruments/karoryfer.swagbass), Karoryfer Samples;
- drums: [Gogodze Phu Vol. II](https://github.com/sfzinstruments/karoryfer.gogodze-phu-vol-ii), Karoryfer Samples.

The vinyl crackle and the weather sounds are synthesized, and the scenes are drawn in code.
