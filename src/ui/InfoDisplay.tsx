// ─── PANEL DE INFORMACIÓN EN TIEMPO REAL — TEMA CLARO ────────────────────────

import { useEffect, useState, useMemo, type CSSProperties } from 'react'
import { useSimulationStore, selectParams } from '../store/simulationStore'
import { computeDerived } from '../physics/pendulum'
import type { PendulumState, PendulumParams, DerivedQuantities } from '../types/physics.types'

const REFRESH_MS = 50

const T = {
  orange: '#f97316', blue: '#3b82f6', violet: '#8b5cf6',
  green:  '#16a34a', teal: '#0d9488', text: '#1e293b', muted: '#64748b',
  dim:    '#94a3b8', border: 'rgba(15,23,42,0.07)',
}

function Row({ label, value, unit, color, mono = true }: {
  label: string; value: string; unit?: string; color?: string; mono?: boolean
}) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={{
        ...s.rowValue,
        color: color ?? T.text,
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
      }}>
        {value}
        {unit && <span style={s.rowUnit}> {unit}</span>}
      </span>
    </div>
  )
}

function EnergyBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 1e-12 ? Math.min(100, (value / total) * 100) : 0
  return (
    <div style={s.energyWrap}>
      <div style={s.energyHeader}>
        <span style={s.rowLabel}>{label}</span>
        <span style={{ ...s.rowValue, color, fontFamily: 'monospace' }}>
          {value.toExponential(3)}<span style={s.rowUnit}> J</span>
        </span>
      </div>
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${pct.toFixed(1)}%`, background: color }} />
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <div style={s.divider} />
      <p style={s.sectionTitle}>{children}</p>
    </>
  )
}

const REGIME_MAP: Record<DerivedQuantities['regime'], { label: string; color: string; bg: string }> = {
  laminar:    { label: 'Laminar',    color: '#16a34a', bg: '#dcfce7' },
  transition: { label: 'Transición', color: '#d97706', bg: '#fef3c7' },
  turbulent:  { label: 'Turbulento', color: '#dc2626', bg: '#fee2e2' },
}

const STABILITY_MAP: Record<DerivedQuantities['stability'], { label: string; color: string; bg: string }> = {
  stable:   { label: 'Estable',   color: '#16a34a', bg: '#dcfce7' },
  critical: { label: 'Crítico',   color: '#d97706', bg: '#fef3c7' },
  unstable: { label: 'Inestable', color: '#dc2626', bg: '#fee2e2' },
}

export function InfoDisplay() {
  const [snapshot, setSnapshot] = useState<{ state: PendulumState; params: PendulumParams }>(() => ({
    state:  useSimulationStore.getState().state,
    params: useSimulationStore.getState().params,
  }))

  useEffect(() => {
    const id = setInterval(() => {
      const store = useSimulationStore.getState()
      setSnapshot({ state: store.state, params: store.params })
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const d = useMemo(() => computeDerived(snapshot.state, snapshot.params), [snapshot])
  const thetaDeg = snapshot.state.theta * 180 / Math.PI
  const params   = useSimulationStore(selectParams)
  const regime   = REGIME_MAP[d.regime]
  const stab     = STABILITY_MAP[d.stability]

  // ── Cantidades de amortiguamiento ────────────────────────────────────────
  // τ = 2·I / b  — tiempo para que la amplitud caiga al 37% (e⁻¹)
  // Q = 2π·I·f / b — factor de calidad: cuántas oscilaciones dura (~50 en lab)
  //   Solo definida cuando hay oscilación (sistema estable, f > 0).
  // P = b·ω²    — potencia disipada al fluido [W] (válida en cualquier estado)
  const tau    = d.b > 1e-12 ? (2 * d.I) / d.b : Infinity
  const Q_val  = d.b > 1e-12 && d.f > 0
    ? (2 * Math.PI * d.I * d.f) / d.b
    : Infinity
  const P_diss = d.b * snapshot.state.omega * snapshot.state.omega

  const fmtTau = isFinite(tau)   ? tau.toFixed(1)   : '∞'
  const fmtQ   = isFinite(Q_val) && Q_val < 1e5 ? Q_val.toFixed(0) : '—'

  return (
    <div style={s.panel}>
      <p style={s.sectionTitle}>Estado</p>

      <Row label="θ — ángulo"       value={thetaDeg.toFixed(3)}            unit="°"      color={T.violet} />
      <Row label="ω — vel. angular" value={snapshot.state.omega.toFixed(4)} unit="rad/s" color={T.blue} />
      <Row label="t — tiempo"       value={snapshot.state.time.toFixed(2)}  unit="s"     color={T.dim} />

      <SectionTitle>Dinámica</SectionTitle>
      <Row label="T — período"
        value={isFinite(d.T) ? d.T.toFixed(4) : '∞'}
        unit={isFinite(d.T) ? 's' : ''}
        color={T.orange} />
      <Row label="f — frecuencia"  value={d.f.toFixed(4)}        unit="Hz" />
      <Row label="I — inercia"     value={d.I.toExponential(4)}  unit="kg·m²" />
      <Row label="d — CM → pivote"
        value={d.d.toFixed(4)}
        unit="m"
        color={d.stability === 'unstable' ? '#dc2626' : T.text} />
      <Row label="Leq — equiv."
        value={isFinite(d.Leq) ? d.Leq.toFixed(4) : '—'}
        unit={isFinite(d.Leq) ? 'm' : ''}
        color={T.dim} />
      <div style={s.row}>
        <span style={s.rowLabel}>Estabilidad</span>
        <span style={{ ...s.badge, color: stab.color, background: stab.bg }}>{stab.label}</span>
      </div>

      <SectionTitle>Fluido</SectionTitle>
      <Row label="Medio"          value={params.fluid}              mono={false} color={T.orange} />
      <Row label="Temperatura"    value={params.tempC.toString()}   unit="°C" />
      <Row label="Re — Reynolds"  value={d.Re.toFixed(2)} />
      <div style={s.row}>
        <span style={s.rowLabel}>Régimen</span>
        <span style={{ ...s.badge, color: regime.color, background: regime.bg }}>{regime.label}</span>
      </div>
      <Row label="b — amortiguam." value={d.b.toExponential(3)} unit="N·m·s" color={T.dim} />

      <SectionTitle>Amortiguamiento</SectionTitle>
      {/* τ: tiempo de decaimiento de la amplitud al 37% (A = A₀·e^{-t/τ}) */}
      <Row label="τ — decaimiento" value={fmtTau} unit={isFinite(tau) ? 's' : ''} color={T.teal} />
      {/* Q: factor de calidad — número de oscilaciones × 2π que dura la energía */}
      <Row label="Q — calidad"     value={fmtQ}   color={T.green} />
      {/* P = b·ω²: potencia disipada instantánea al fluido */}
      <Row label="P — pot. disip." value={P_diss > 1e-15 ? P_diss.toExponential(3) : '0'} unit="W" color={T.dim} />

      <SectionTitle>Energía</SectionTitle>
      <EnergyBar label="Ec — cinética"   value={d.Ec} total={d.Etotal} color={T.orange} />
      <EnergyBar label="Ep — potencial"  value={d.Ep} total={d.Etotal} color={T.blue} />
      <div style={s.divider} />
      <Row label="E total" value={d.Etotal.toExponential(3)} unit="J" color={T.green} />
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  panel: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    padding: '11px 12px', height: '100%', overflowY: 'auto', boxSizing: 'border-box',
  },
  sectionTitle: {
    margin: 0, fontSize: '10px', fontWeight: 700, color: T.dim,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  divider:   { height: '1px', background: T.border, margin: '1px 0' },
  row:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel:  { fontSize: '11px', color: T.muted },
  rowValue:  { fontSize: '11px', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: T.text },
  rowUnit:   { fontSize: '10px', fontWeight: 400, color: T.dim },
  energyWrap:   { display: 'flex', flexDirection: 'column', gap: '4px' },
  energyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  barTrack: { height: '3px', borderRadius: '2px', background: 'rgba(15,23,42,0.08)', overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: '2px', transition: 'width 0.1s ease-out' },
  badge: {
    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.03em',
  },
}
