import { Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMessages } from '../i18n/messages'
import { usePlayerStore } from '../store/playerStore'
import { SMALL_BUTTON } from './buttonStyles'

const DURATIONS = [15, 30, 60]

function useMinutesLeft(endsAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endsAt === null) {
      return
    }
    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 10_000)
    return () => clearInterval(interval)
  }, [endsAt])

  return endsAt === null ? null : Math.max(1, Math.ceil((endsAt - now) / 60_000))
}

export function SleepTimerButton() {
  const sleepTimer = usePlayerStore((state) => state.sleepTimer)
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer)
  const minutesLeft = useMinutesLeft(sleepTimer?.endsAt ?? null)
  const t = useMessages().player

  const next = sleepTimer === null ? DURATIONS[0] : (DURATIONS[DURATIONS.indexOf(sleepTimer.minutes) + 1] ?? null)
  // The first click always starts the timer: next is only null while it runs
  const label = minutesLeft === null ? t.sleepTimerOff(next ?? DURATIONS[0]) : t.sleepTimerOn(minutesLeft, next)

  return (
    <button
      type="button"
      onClick={() => setSleepTimer(next)}
      aria-label={label}
      title={label}
      className={`${SMALL_BUTTON} ${sleepTimer ? 'text-glow' : 'text-stone-400'}`}
    >
      <Moon size={16} />
      {minutesLeft !== null && <span className="text-xs">{t.minutes(minutesLeft)}</span>}
    </button>
  )
}
