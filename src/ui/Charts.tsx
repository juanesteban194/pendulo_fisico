// ─── GRÁFICAS CIENTÍFICAS — TEMA CLARO ───────────────────────────────────────

import { useMemo, type CSSProperties } from 'react'
import {
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useSimulationStore, selectHistory } from '../store/simulationStore'
import type { SimulationFrame } from '../types/physics.types'

const VIOLET = '#8b5cf6'
const BLUE   = '#3b82f6'
const ORANGE = '#f97316'
const GREEN  = '#16a34a'
const MUTED  = 'rgba(71,85,105,0.5)'
const GRID   = 'rgba(15,23,42,0.06)'

const TICK   = { fontSize: 9, fill: 'rgba(71,85,105,0.6)' }
const MARGIN = { top: 6, right: 6, bottom: 4, left: -18 }

const TOOLTIP_STYLE: CSSProperties = {
  background: 'rgba(255,255,255,0.97)',
  border:     '1px solid rgba(15,23,42,0.1)',
  borderRadius: '6px', fontSize: '11px',
  color: '#0f172a', padding: '4px 8px',
}

interface DisplayFrame {
  time: number; theta: number; omega: number
  Ec: number; Ep: number; Etotal: number
}

function toDisplay(frames: SimulationFrame[]): DisplayFrame[] {
  return frames.map(f => ({
    time:   parseFloat(f.time.toFixed(2)),
    theta:  parseFloat((f.theta * 180 / Math.PI).toFixed(3)),
    omega:  parseFloat(f.omega.toFixed(4)),
    Ec:     f.Ec, Ep: f.Ep, Etotal: f.Ec + f.Ep,
  }))
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.card}>
      <p style={s.cardTitle}>{title}</p>
      {children}
    </div>
  )
}

export function Charts() {
  const history  = useSimulationStore(selectHistory)
  const frames   = useMemo(() => toDisplay(history), [history])
  const phaseData = useMemo(() => frames.map(f => ({ theta: f.theta, omega: f.omega })), [frames])

  if (frames.length < 2) {
    return (
      <div style={s.empty}>
        <span style={s.emptyText}>Iniciando simulación…</span>
      </div>
    )
  }

  return (
    <div style={s.grid}>

      <ChartCard title="θ(t) — posición angular">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={GRID} />
            <XAxis dataKey="time" tick={TICK}
              label={{ value: 't (s)', position: 'insideBottomRight', offset: -2, style: TICK }} />
            <YAxis tick={TICK}
              label={{ value: '°', angle: -90, position: 'insideLeft', style: TICK }} />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [`${v.toFixed(3)}°`, 'θ']}
              labelFormatter={(t: number) => `t = ${t} s`} />
            <Line type="monotone" dataKey="theta" stroke={VIOLET}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="ω(t) — velocidad angular">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={GRID} />
            <XAxis dataKey="time" tick={TICK} />
            <YAxis tick={TICK}
              label={{ value: 'rad/s', angle: -90, position: 'insideLeft', style: { ...TICK, fontSize: 8 } }} />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [`${v.toFixed(4)} rad/s`, 'ω']}
              labelFormatter={(t: number) => `t = ${t} s`} />
            <Line type="monotone" dataKey="omega" stroke={BLUE}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fase — θ vs ω">
        <ResponsiveContainer width="100%" height={108}>
          <ScatterChart margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={GRID} />
            <XAxis dataKey="theta" type="number" name="θ" tick={TICK}
              label={{ value: 'θ (°)', position: 'insideBottomRight', offset: -2, style: TICK }} />
            <YAxis dataKey="omega" type="number" name="ω" tick={TICK}
              label={{ value: 'ω', angle: -90, position: 'insideLeft', style: TICK }} />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v: number, name: string) =>
                name === 'θ' ? [`${v.toFixed(2)}°`, 'θ'] : [`${v.toFixed(3)} rad/s`, 'ω']} />
            <Scatter data={phaseData}
              line={{ stroke: GREEN, strokeWidth: 1.2 }}
              lineType="joint"
              shape={() => null as unknown as React.ReactElement}
              fill={GREEN} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Energía mecánica">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={GRID} />
            <XAxis dataKey="time" tick={TICK} />
            <YAxis tick={TICK}
              label={{ value: 'J', angle: -90, position: 'insideLeft', style: TICK }} />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [`${v.toExponential(3)} J`, name]}
              labelFormatter={(t: number) => `t = ${t} s`} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', color: MUTED }} />
            <Line type="monotone" dataKey="Ec"     name="Ec cinética"  stroke={ORANGE}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Ep"     name="Ep potencial" stroke={BLUE}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Etotal" name="E total"      stroke={GREEN}
              strokeWidth={1} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}

const s: Record<string, CSSProperties> = {
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
    gap: '8px', padding: '8px', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  },
  card: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    background: '#ffffff', borderRadius: '8px', padding: '8px 10px 6px',
    border: '1px solid rgba(15,23,42,0.07)', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
  },
  cardTitle: {
    margin: 0, fontSize: '10px', fontWeight: 700,
    color: 'rgba(71,85,105,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
  emptyText: { fontSize: '12px', color: '#94a3b8' },
}