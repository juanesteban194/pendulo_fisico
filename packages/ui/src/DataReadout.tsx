// ─── <DataReadout /> ─────────────────────────────────────────────────────────
//
// Réplica de las filas tipo "T — período · 0.9847 s" del panel ESTADO/DINÁMICA
// del simulador 2D. Componente puro (sin estado), Server-Component-friendly.
//
// Uso:
//   <DataReadout label="período" symbol="T" value={0.9847} unit="s" digits={4} color="orange" />
//   <DataReadout label="medio" value="aire" />

export type AccentColor = 'orange' | 'purple' | 'blue' | 'green' | 'amber' | 'default'

const COLOR_CLASS: Record<AccentColor, string> = {
  orange:  'text-accent-orange',
  purple:  'text-accent-purple',
  blue:    'text-accent-blue',
  green:   'text-accent-green',
  amber:   'text-accent-amber',
  default: 'text-text-primary',
}

export interface DataReadoutProps {
  /** Texto humano descriptivo: "período", "velocidad angular", … */
  label: string
  /** Símbolo físico opcional: "T", "ω", "θ". Aparece a la derecha del label. */
  symbol?: string
  /** Valor a mostrar. Si es number y `digits` está definido, se formatea. */
  value: string | number
  /** Unidad: "s", "m", "rad/s". Aparece pequeña a la derecha del valor. */
  unit?: string
  /** Color del valor (acentos del simulador). Default: 'default' (gris). */
  color?: AccentColor
  /** Decimales para `value` numérico. Si no se pasa, se usa toString(). */
  digits?: number
  /** Notación exponencial (útil para energías ≪1). Sobreescribe digits. */
  exponential?: boolean
  className?: string
}

export function DataReadout({
  label,
  symbol,
  value,
  unit,
  color = 'default',
  digits,
  exponential = false,
  className = '',
}: DataReadoutProps) {
  const formatted = formatValue(value, digits, exponential)

  return (
    <div
      className={[
        'flex items-baseline justify-between gap-3 py-1',
        className,
      ].join(' ')}
    >
      <span className="text-sm text-text-secondary">
        {label}
        {symbol && (
          <span className="ml-1.5 font-mono text-xs italic text-text-tertiary">
            {symbol}
          </span>
        )}
      </span>
      <span
        className={[
          'font-mono text-sm font-medium tabular-nums',
          COLOR_CLASS[color],
        ].join(' ')}
      >
        {formatted}
        {unit && (
          <span className="ml-1 font-sans text-xs font-normal text-text-tertiary">
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}

function formatValue(
  value: string | number,
  digits: number | undefined,
  exponential: boolean,
): string {
  if (typeof value === 'string') return value
  if (!Number.isFinite(value)) return value === Infinity ? '∞' : '—'
  if (exponential) return value.toExponential(digits ?? 3)
  if (digits != null) return value.toFixed(digits)
  return String(value)
}
