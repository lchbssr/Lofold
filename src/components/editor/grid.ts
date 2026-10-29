import { STEPS_PER_BAR } from '../../engine/time'

export type Half = 0 | 1

const HALF_STEPS = STEPS_PER_BAR / 2

/**
 * A row of the drum grid or the piano roll: its name, then the 16 steps of the bar on a large screen,
 * or the 8 steps of half a bar on a phone, where 16 cells would be too narrow to tap
 */
export const GRID_ROW = 'grid grid-cols-[4.5rem_repeat(8,minmax(0,1fr))] items-center gap-0.5 sm:grid-cols-[5.5rem_repeat(16,minmax(0,1fr))]'

export function phoneVisibility(step: number, half: Half): string {
  return Math.floor(step / HALF_STEPS) === half ? '' : 'max-sm:hidden'
}
