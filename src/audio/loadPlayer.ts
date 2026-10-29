export type Player = typeof import('./player')

let player: Player | null = null

/** Tone.js is heavy: the player is only downloaded when the user asks for sound */
export async function loadPlayer(): Promise<Player> {
  player ??= await import('./player')
  return player
}

export function getLoadedPlayer(): Player | null {
  return player
}
