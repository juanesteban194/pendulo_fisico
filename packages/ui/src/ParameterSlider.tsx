// ─── <ParameterSlider /> ─────────────────────────────────────────────────────
//
// Slider numérico controlado con:
//   • Track con relleno animado del color del acento (no solo accentColor CSS)
//   • Thumb que crece al hover/focus/active
//   • Tooltip con el valor mientras se arrastra
//   • Animación spring del valor en pantalla
//   • Tabular-nums + ResizeObserver-free (todo CSS)

'use client'

import { type ChangeEvent, useId, useState } from 'react'

export type AccentColor = 'orange' | 'purple' | 'blue' | 'green' | 'amber'

const TRACK_COLOR: Record<AccentColor, string> = {
  orange: 'rgb(var(--accent-orange))',
  purple: 'rgb(var(--accent-purple))',
  blue:   'rgb(var(--accent-blue))',
  green:  'rgb(var(--accent-green))',
  amber:  'rgb(var(--accent-amber))',
}

const TEXT_COLOR: Record<AccentColor, string> = {
  orange: 'text-accent-orange',
  purple: 'text-accent-purple',
  blue:   'text-accent-blue',
  green:  'text-accent-green',
  amber:  'text-accent-amber',
}

export interface ParameterSliderProps {
  label: string
  symbol?: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  digits?: number
  color?: AccentColor
  onChange: (value: number) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function ParameterSlider({
  label,
  symbol,
  unit,
  value,
  min,
  max,
  step,
  digits = 2,
  color = 'orange',
  onChange,
  disabled = false,
  id,
  className = '',
}: ParameterSliderProps) {
  const reactId = useId()
  const sliderId = id ?? `slider-${reactId}`
  const [active, setActive] = useState(false)

  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0
  const trackColor = TRACK_COLOR[color]

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <div className={['group flex flex-col gap-2', className].join(' ')}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={sliderId} className="text-sm text-text-secondary">
          {label}
          {symbol && (
            <span className="ml-1.5 font-mono text-xs italic text-text-tertiary">
              {symbol}
            </span>
          )}
        </label>
        <span
          className={[
            'font-mono text-sm font-semibold tabular-nums tracking-tight',
            'transition-transform duration-150',
            active ? 'scale-110' : '',
            TEXT_COLOR[color],
          ].join(' ')}
        >
          {value.toFixed(digits)}
          <span className="ml-1 font-sans text-xs font-normal text-text-tertiary">
            {unit}
          </span>
        </span>
      </div>

      <div className="relative h-5 w-full">
        {/* Track de fondo */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-bg-tinted" />
        {/* Track de relleno (color del acento) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-[width] duration-100"
          style={{ width: `${pct}%`, background: trackColor }}
        />
        {/* Input range nativo, transparente, encima */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handle}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onPointerCancel={() => setActive(false)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          className="ps-input absolute inset-0 w-full cursor-pointer appearance-none bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{ ['--ps-color' as string]: trackColor }}
          aria-label={`${label} (${value.toFixed(digits)} ${unit})`}
        />
      </div>
    </div>
  )
}
