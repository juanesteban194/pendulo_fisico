// ─── Gráfica: Ep / Ec / E_total vs tiempo ────────────────────────────────────

'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

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
const TICK_COLOR = 'rgb(var(--text-tertiary))'

export function EnergyBarsChart() {
  return (
    <div className="my-6 rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <p className="ui-label mb-4">Energía mecánica — péndulo del laboratorio (θ₀ = 5°)</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={DATA} margin={{ top: 8, right: 24, bottom: 36, left: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" />
          <XAxis
            dataKey="t"
            label={{ value: 'tiempo', position: 'insideBottom', offset: -22, fontSize: 11, fill: TICK_COLOR }}
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            tickFormatter={v => `${v}s`}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
          />
          <YAxis
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            tickFormatter={v => `${(v * 1e6).toFixed(0)}`}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
            label={{ value: 'energía (µJ)', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: TICK_COLOR, style: { textAnchor: 'middle' } }}
          />
          <Tooltip
            formatter={(val: number, name: string) => [
              `${(val * 1e6).toFixed(2)} µJ`,
              name === 'Ep' ? 'Potencial' : name === 'Ec' ? 'Cinética' : 'Total',
            ]}
            labelFormatter={v => `t = ${v} s`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgb(var(--border-subtle))' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="line" />
          <ReferenceLine y={E_MAX} stroke="rgb(var(--accent-green))" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="Ep" name="Ep" stroke="rgb(var(--accent-amber))"  strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Ec" name="Ec" stroke="rgb(var(--accent-blue))"   strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Et" name="Et" stroke="rgb(var(--accent-green))"  strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-3 text-center text-xs text-text-tertiary">
        Ep (ámbar) y Ec (azul) se intercambian continuamente.
        E_total (verde) permanece constante — conservación de la energía mecánica.
      </p>
    </div>
  )
}
