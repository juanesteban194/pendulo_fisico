// ─── Gráfica: sin(θ) vs θ — Aproximación de ángulos pequeños ────────────────
//
// Muestra en Recharts que sin(θ) ≈ θ para ángulos < ~15° y cuantifica el
// error porcentual a la derecha.

'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

function generateData() {
  const pts = []
  for (let d = 0; d <= 30; d += 0.5) {
    const r = d * Math.PI / 180
    pts.push({
      theta: Math.round(d * 10) / 10,
      sin:   Math.round(Math.sin(r) * 10000) / 10000,
      lin:   Math.round(r * 10000) / 10000,
      error: d === 0 ? 0 : Math.round(Math.abs(r - Math.sin(r)) / Math.abs(Math.sin(r)) * 10000) / 100,
    })
  }
  return pts
}

const DATA = generateData()

export function SmallAngleChart() {
  return (
    <div className="my-6 rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <p className="ui-label mb-3">Error de la aproximación sin(θ) ≈ θ</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" />
          <XAxis
            dataKey="theta"
            label={{ value: 'θ (°)', position: 'insideBottom', offset: -2, fontSize: 11 }}
            tick={{ fontSize: 11 }}
            tickFormatter={v => `${v}°`}
          />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 0.55]} />
          <Tooltip
            formatter={(val: number, name: string) => [
              val.toFixed(4),
              name === 'sin' ? 'sin(θ)' : 'θ (rad)',
            ]}
            labelFormatter={v => `θ = ${v}°`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={v => v === 'sin' ? 'sin(θ)  — exacto' : 'θ en rad — aproximación'}
          />
          <Line
            type="monotone" dataKey="sin" name="sin"
            stroke="rgb(var(--accent-blue))" strokeWidth={2} dot={false}
          />
          <Line
            type="monotone" dataKey="lin" name="lin"
            stroke="rgb(var(--accent-orange))" strokeWidth={2}
            strokeDasharray="5 3" dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-text-tertiary">
        A 15° el error es <span className="font-mono text-accent-orange">≈ 1.1%</span>
        {' '}· a 30° sube a <span className="font-mono text-accent-orange">≈ 4.5%</span>
      </p>
    </div>
  )
}
