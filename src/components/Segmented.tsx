interface SegmentedProps<Id extends string | number> {
  label: string
  options: ReadonlyArray<{ id: Id; label: string }>
  value: Id
  onChange: (id: Id) => void
  className?: string
}

export function Segmented<Id extends string | number>({ label, options, value, onChange, className = '' }: SegmentedProps<Id>) {
  return (
    <div className={`flex w-fit gap-1 rounded-full bg-white/5 p-1 ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={option.id === value}
          className="rounded-full px-3 py-1 text-sm text-stone-300 transition-colors hover:text-white aria-pressed:bg-white/15 aria-pressed:text-white"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
