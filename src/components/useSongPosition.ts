import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'

function readPosition(): number {
  return usePlayerStore.getState().getPosition()
}

export function useSongPosition(isPlaying: boolean, intervalMs = 250): number {
  const [position, setPosition] = useState(readPosition)

  useEffect(() => {
    const update = () => setPosition(readPosition())
    const unsubscribe = usePlayerStore.subscribe(update)
    const interval = isPlaying ? setInterval(update, intervalMs) : undefined
    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [isPlaying, intervalMs])

  return position
}
