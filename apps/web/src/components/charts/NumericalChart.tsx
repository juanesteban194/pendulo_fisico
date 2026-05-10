// ─── Gráfica: Euler explícito vs RK4 — deriva de energía ─────────────────────

'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const L   = 0.25
const M_b = 0.020
const M_e = 0.075
const G   = 9.78
const I   = (1 / 3) * M_b * L ** 2 + M_e * L ** 2
const D   = (M_b * L / 2 + M_e * L) / (M_b + M_e)
const TH0 = 10 * Math.PI / 180

function alpha(theta: number) { return -((M_b + M_e) * G * D * Math.sin(theta)) / I }

function energyOf(theta: number, omega: number) {
  const Ep = (M_b + M_e) * G * D * (1 - Math.cos(theta))
  const Ec = 0.5 * I * omega * omega
  return Ep + Ec
}

function simulateEuler(dt: number, steps: number) {
  let theta = TH0, omega = 0
  const E0 = energyOf(theta, omega)
  const pts: { t: number; euler: number }[] = []
  for (let i = 0; i < steps; i++) {
    const a = alpha(theta)
    theta += omega * dt
    omega += a * dt
    if (i % Math.max(1, Math.round(steps / 80)) === 0) {
      pts.push({ t: Math.round(i * dt * 100) / 100, euler: energyOf(theta, omega) / E0 })
    }
  }
  return pts
}

function simulateRK4(dt: number, steps: number) {
  let theta = TH0, omega = 0
  const E0 = energyOf(theta, omega)
  const pts: { t: number; rk4: number }[] = []
  for (let i = 0; i < steps; i++) {
    const k1t = omega, k1o = alpha(theta)
    const k2t = omega + k1o * dt / 2, k2o = alpha(theta + k1t * dt / 2)
    const k3t = omega + k2o * dt / 2, k3o = alpha(theta + k2t * dt / 2)
    const k4t = omega + k3o * dt,     k4o = alpha(theta + k3t * dt)
    theta += (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t)
    omega += (dt / 6) * (k1o + 2 * k2o + 2 * k3o + k4o)
    if (i % Math.max(1, Math.round(steps / 80)) === 0) {
      pts.push({ t: Math.round(i * dt * 100) / 100, rk4: energyOf(theta, omega) / E0 })
    }
  }
  return pts
}

function mergeData(dt: number) {
  const DURATION = 5
  const steps = Math.round(DURATION / dt)
  const euler = simulateEuler(dt, steps)
  const rk4   = simulateRK4(dt, steps)
  return euler.map((e, i) => ({ ...e, ...(rk4[i] ?? {}) }))
}

const DT_OPTIONS = [
  { label: '1 ms (1/60s frame)', value: 0.001 },
  { label: '10 ms',              value: 0.010 },
  { label: '50 ms',              value: 0.050 },
  { label: '100 ms',             value: 0.100 },
]

const TICK_COLOR = 'rgb(var(--text-tertiary))'

export function NumericalChart() {
  const [dtIdx, setDtIdx] = useState(1)
  const dt   = DT_OPTIONS[dtIdx]!.value
  const data = mergeData(dt)

  return (
    <div className="my-6 rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="ui-label">Deriva de energía: Euler vs RK4</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Δt =</span>
          <select
            value={dtIdx}
            onChange={e => setDtIdx(Number(e.target.value))}
            className="rounded border border-border-default bg-bg-surface px-2 py-1 font-mono text-xs text-text-primary"
          >
            {DT_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 24, bottom: 36, left: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" />
          <XAxis
            dataKey="t"
            label={{ value: 'tiempo (s)', position: 'insideBottom', offset: -22, fontSize: 11, fill: TICK_COLOR }}
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
          />
          <YAxis
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            tickFormatter={v => `${v.toFixed(2)}×`}
            domain={['auto', 'auto']}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
            label={{ value: 'E / E₀', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: TICK_COLOR, style: { textAnchor: 'middle' } }}
          />
          <Tooltip
            formatter={(val: number, name: string) => [
              `${val.toFixed(4)} E₀`,
              name === 'euler' ? 'Euler explícito' : 'RK4',
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgb(var(--border-subtle))' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="line" formatter={v => v === 'euler' ? 'Euler explícito' : 'RK4'} />
          <Line type="monotone" dataKey="euler" name="euler" stroke="rgb(var(--status-error))"  strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="rk4"   name="rk4"   stroke="rgb(var(--accent-green))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-3 text-center text-xs text-text-tertiary">
        Con Δt grande, Euler <span className="text-status-error">acumula error</span> y la energía crece sin fin.
        RK4 <span className="text-accent-green">permanece estable</span> incluso con Δt moderado.
      </p>
    </div>
  )
}
