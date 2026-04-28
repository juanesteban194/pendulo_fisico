// ─── <ParameterSlider /> ─────────────────────────────────────────────────────
//
// Slider numérico controlado, réplica del estilo del simulador 2D:
//   • Label izquierda con símbolo físico opcional en cursiva.
//   • Valor a la derecha en mono, color del acento (naranja por defecto).
//   • Barra del slider con `accentColor` CSS — se tinta en webkit/firefox/safari.
//
// Es Client Component porque depende de un onChange interactivo.
//
// Uso:
//   <ParameterSlider
//     label="Longitud" symbol="L" unit="m"
//     value={params.L} min={0.05} max={3.0} step={0.01} digits={2}
//     onChange={v => setParams({ L: v })}
//   />

'use client'

import type { ChangeEvent } from 'react'

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
  /** Texto descriptivo: "Longitud", "Masa extremo", … */
  label: string
  /** Símbolo físico opcional: "L", "m_r", "θ_0". */
  symbol?: string
  /** Unidad humana: "m", "kg", "°", "m/s²". */
  unit: string
  /** Valor controlado. */
  value: number
  /** Rango y paso. */
  min: number
  max: number
  step: number
  /** Decimales para mostrar el valor. Default: 2. */
  digits?: number
  /** Color del acento (track + texto del valor). Default: 'orange'. */
  color?: AccentColor
  /** Callback con el valor parseado a número. */
  onChange: (value: number) => void
  /** Deshabilitado. */
  disabled?: boolean
  /** id opcional para a11y / labels externos. */
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
  const sliderId = id ?? `slider-${label.replace(/\s+/g, '-').toLowerCase()}`

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
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
            'font-mono text-sm font-medium tabular-nums',
            TEXT_COLOR[color],
          ].join(' ')}
        >
          {value.toFixed(digits)}
          <span className="ml-1 font-sans text-xs font-normal text-text-tertiary">
            {unit}
          </span>
        </span>
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handle}
        className={[
          'h-1.5 w-full cursor-pointer rounded-full bg-bg-tinted',
          'appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ].join(' ')}
        style={{ accentColor: TRACK_COLOR[color] }}
        aria-label={`${label} (${value.toFixed(digits)} ${unit})`}
      />
    </div>
  )
}
