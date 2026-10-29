import { useId } from 'react'

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  inactiveText?: string
}

export function Slider({ label, value, onChange, inactiveText }: SliderProps) {
  const id = useId()

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="w-16 text-sm text-stone-400">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={inactiveText}
        title={inactiveText}
        className={`flex-1 accent-glow transition-opacity ${inactiveText ? 'opacity-40' : ''}`}
      />
    </div>
  )
}
