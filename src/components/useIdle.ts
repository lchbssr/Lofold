import { useEffect, useState } from 'react'

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const

export function useIdle(delayMs: number, enabled: boolean): boolean {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }
    let timeout = setTimeout(() => setIsIdle(true), delayMs)
    const wake = () => {
      setIsIdle(false)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsIdle(true), delayMs)
    }

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, wake, { passive: true }))
    return () => {
      clearTimeout(timeout)
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, wake))
      setIsIdle(false)
    }
  }, [delayMs, enabled])

  return isIdle
}
