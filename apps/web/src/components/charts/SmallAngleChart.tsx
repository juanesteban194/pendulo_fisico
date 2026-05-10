// ─── Gráfica: sin(θ) vs θ — Aproximación de ángulos pequeños ────────────────

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
    })
  }
  return pts
}

const DATA = generateData()
const TICK_COLOR = 'rgb(var(--text-tertiary))'

export function SmallAngleChart() {
  return (
    <div className="my-6 rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
      <p className="ui-label mb-4">Error de la aproximación sin(θ) ≈ θ</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={DATA} margin={{ top: 8, right: 24, bottom: 36, left: 28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" />
          <XAxis
            dataKey="theta"
            label={{ value: 'ángulo θ', position: 'insideBottom', offset: -22, fontSize: 11, fill: TICK_COLOR }}
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            tickFormatter={v => `${v}°`}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
          />
          <YAxis
            tick={{ fontSize: 11, fill: TICK_COLOR }}
            domain={[0, 0.55]}
            tickMargin={6}
            stroke="rgb(var(--border-default))"
            label={{ value: 'valor (rad)', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: TICK_COLOR, style: { textAnchor: 'middle' } }}
          />
          <Tooltip
            formatter={(val: number, name: string) => [
              val.toFixed(4),
              name === 'sin' ? 'sin(θ)' : 'θ (rad)',
            ]}
            labelFormatter={v => `θ = ${v}°`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgb(var(--border-subtle))' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="line"
            formatter={v => v === 'sin' ? 'sin(θ) — exacto' : 'θ en rad — aproximación'}
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
      <p className="mt-3 text-center text-xs text-text-tertiary">
        A 15° el error es <span className="font-mono text-accent-orange">≈ 1.1%</span>
        {' '}· a 30° sube a <span className="font-mono text-accent-orange">≈ 4.5%</span>
      </p>
    </div>
  )
}
