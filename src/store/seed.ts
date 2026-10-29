const MAX_SEED = 1_000_000

export function randomSeed(): number {
  return Math.floor(Math.random() * MAX_SEED)
}

export function seedFromSearch(search: string): number | null {
  const value = new URLSearchParams(search).get('seed')
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : null
}
