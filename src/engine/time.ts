/** Positions and durations are counted in sixteenth notes: sixteen of them make a bar */
export const STEPS_PER_BAR = 16

export function stepsToSeconds(steps: number, bpm: number): number {
  return (steps / 4) * (60 / bpm)
}

export function secondsToSteps(seconds: number, bpm: number): number {
  return (seconds / 60) * bpm * 4
}

export function formatTime(steps: number, bpm: number): string {
  const seconds = Math.floor(stepsToSeconds(steps, bpm))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
