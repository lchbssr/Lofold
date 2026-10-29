import { createRandom, deriveSeed } from './random'

const ADJECTIVES = [
  'Rainy', 'Quiet', 'Sleepy', 'Golden', 'Hazy', 'Late', 'Soft', 'Faded', 'Warm', 'Lonely',
  'Velvet', 'Paper', 'Midnight', 'Slow', 'Distant', 'Gentle', 'Foggy', 'Amber', 'Dusty', 'Pale',
  'Lazy', 'Little', 'Silver', 'Hidden', 'Tired', 'Cozy', 'Blue', 'Neon', 'Wistful', 'Lost',
]
const NOUNS = [
  'Window', 'Train', 'Letters', 'Rooftops', 'Streetlights', 'Tea', 'Pages', 'Clouds', 'Harbor', 'Bicycle',
  'Radio', 'Sunday', 'Notebook', 'Garden', 'Lanterns', 'Puddles', 'Cassette', 'Balcony', 'Snowfall', 'Ferry',
  'Library', 'Moon', 'Postcards', 'Corner Store', 'Afternoon', 'Stairway', 'Polaroids', 'Coffee', 'Tram', 'Daydream',
]

export function songTitle(seed: number): string {
  const random = createRandom(deriveSeed(seed, 'title'))
  return `${random.pick(ADJECTIVES)} ${random.pick(NOUNS)}`
}
