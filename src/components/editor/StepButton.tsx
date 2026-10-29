interface StepButtonProps {
  label: string
  step: number
  state: 'start' | 'hold' | null
  isPlayhead: boolean
  onClick: () => void
  className?: string
}

export function StepButton({ label, step, state, isPlayhead, onClick, className = '' }: StepButtonProps) {
  const background =
    state === 'start' ? 'bg-glow' : state === 'hold' ? 'bg-glow/40' : step % 4 === 0 ? 'bg-white/12' : 'bg-white/6'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={state === 'start'}
      className={`h-8 rounded-sm transition-colors hover:bg-white/25 sm:h-6 ${background} ${isPlayhead ? 'ring-1 ring-white/70' : ''} ${className}`}
    />
  )
}
