// ─── Slider interactivo para el péndulo simple ────────────────────────────────
// Muestra T en tiempo real al mover L. Client Component.

'use client'

import { useState } from 'react'
import { ParameterSlider, DataReadout } from '@pendulo/ui'

const G = 9.78

export function SimplePendulumSlider() {
  const [L, setL] = useState(0.25)
  const T = 2 * Math.PI * Math.sqrt(L / G)
  const f = 1 / T
  const omega = 2 * Math.PI / T

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <p className="ui-label mb-4">Explorador interactivo — péndulo simple (g = 9.78 m/s²)</p>
      <ParameterSlider
        label="Longitud" symbol="L" unit="m"
        value={L} min={0.05} max={3.0} step={0.01} digits={2}
        color="orange"
        onChange={setL}
      />
      <div className="mt-4 divide-y divide-border-subtle">
        <DataReadout label="período"          symbol="T" value={T} unit="s"      digits={4} color="orange" />
        <DataReadout label="frecuencia"       symbol="f" value={f} unit="Hz"     digits={4} color="blue" />
        <DataReadout label="freq. angular"    symbol="ω" value={omega} unit="rad/s" digits={3} color="purple" />
      </div>
      <p className="mt-3 text-xs text-text-tertiary">
        Para L = 0.2479 m → T = 1 s (péndulo de reloj en Medellín)
      </p>
    </div>
  )
}
