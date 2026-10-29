// Kept apart from instruments.ts so the interface can use it without downloading Tone.js

export interface Effects {
  warmth: number
  vinyl: number
  space: number
  ambience: number
}

export const DEFAULT_EFFECTS: Effects = { warmth: 0.5, vinyl: 0.3, space: 0.35, ambience: 0 }
