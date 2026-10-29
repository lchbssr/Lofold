export const PPQ = 192

export const TICKS_PER_STEP = PPQ / 4

export function stepsToTicks(steps: number): string {
  return `${Math.round(steps * TICKS_PER_STEP)}i`
}
