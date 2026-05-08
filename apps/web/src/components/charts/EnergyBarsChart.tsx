// ─── Gráfica: Ep / Ec / E_total vs tiempo ────────────────────────────────────
//
// Recharts line chart de un ciclo completo con los datos del laboratorio.
// Data generada analíticamente (péndulo simple ideal, sin amortiguamiento)
// para que sea precisa y ligera.

'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// Datos del laboratorio
const L   = 0.25
const M   = 0.020 + 0.075
const G   = 9.78
const D   = (0.020 * L / 2 + 0.075 * L) / M
const I   = (1 / 3) * 0.020 * L ** 2 + 0.075 * L ** 2
const T   = 2 * Math.PI * Math.sqrt(I / (M * G * D))
const TH0 = 5 * Math.PI / 180

function generateEnergyData() {
  const pts = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const t     = (i / steps) * T
    const theta = TH0 * Math.cos(2 * Math.PI * t / T)
    const omega = -TH0 * (2 * Math.PI / T) * Math.sin(2 * Math.PI * t / T)
    const Ep    = M * G * D * (1 - Math.cos(theta))
    const Ec    = 0.5 * I * omega * omega
    pts.push({
      t: Math.round(t * 1000) / 1000,
      Ep: Math.round(Ep * 1e6) / 1e6,
      Ec: Math.round(Ec * 1e6) / 1e6,
      Et: Math.round((Ep + Ec) * 1e6) / 1e6,
    })
  }
  return pts
}

const DATA = generateEnergyData()
const E_MAX = DATA[0]!.Et

export function EnergyBarsChart() {
  return (
    <div className="my-6 rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <p className="ui-label mb-3">Energía mecánica — péndulo del laboratorio (θ₀ = 5°)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" />
          <XAxis
            dataKey="t"
            label={{ value: 'tiempo (s)', position: 'insideBottom', offset: -8, fontSize: 11 }}
            tick={{ fontSize: 11 }}
            tickFormatter={v => `${v}s`}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v => `${(v * 1e4).toFixed(0)}µ`}
          />
          <Tooltip
            formatter={(val: number, name: string) => [
              `${(val * 1e6).toFixed(2)} µJ`,
              name === 'Ep' ? 'Potencial' : name === 'Ec' ? 'Cinética' : 'Total',
            ]}
            labelFormatter={v => `t = ${v} s`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={E_MAX} stroke="rgb(var(--accent-green))" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="Ep" name="Ep" stroke="rgb(var(--accent-amber))"  strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Ec" name="Ec" stroke="rgb(var(--accent-blue))"   strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Et" name="Et" stroke="rgb(var(--accent-green))"  strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-text-tertiary">
        Ep (ámbar) y Ec (azul) se intercambian continuamente.
        E_total (verde) permanece constante — conservación de la energía mecánica.
      </p>
    </div>
  )
}
