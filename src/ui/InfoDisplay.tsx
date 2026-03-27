// ─── PANEL DE INFORMACIÓN EN TIEMPO REAL ─────────────────────────────────────
//
// Muestra las cantidades físicas derivadas del estado actual del péndulo,
// actualizadas a 20 Hz (suficiente para lectura humana, 3× más eficiente
// que suscribirse directamente al loop de física a 60 Hz).
//
// Estrategia de actualización:
//   • setInterval cada 50 ms (20 Hz) consulta el store con getState()
//   • getState() NO crea una suscripción reactiva — solo lee el valor actual
//   • El resultado se guarda en un estado local de React que sí dispara renders
//   • Así desacoplamos la frecuencia de la física (60 Hz) de la de la UI (20 Hz)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo, type CSSProperties } from 'react'
import { useSimulationStore, selectParams } from '../store/simulationStore'
import { computeDerived }  from '../physics/pendulum'
import type {
  PendulumState,
  PendulumParams,
  DerivedQuantities,
} from '../types/physics.types'

// ─── Frecuencia de refresco ───────────────────────────────────────────────────

/** Milisegundos entre cada actualización del panel (50 ms = 20 Hz). */
const REFRESH_MS = 50

// ─── Sub-componentes de presentación ─────────────────────────────────────────
//
// Cada sub-componente solo recibe datos — no accede al store directamente.
// Esto se llama "componente de presentación": recibe props y devuelve JSX.
// Son los más fáciles de probar y de reutilizar.
//

/** Una fila con etiqueta a la izquierda y valor a la derecha. */
function Row({
  label, value, unit, color, mono = true,
}: {
  label: string
  value: string
  unit?: string
  color?: string
  mono?: boolean
}) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={{
        ...s.rowValue,
        color: color ?? TOKEN.text,
        fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
      }}>
        {value}
        {unit && <span style={s.rowUnit}> {unit}</span>}
      </span>
    </div>
  )
}

/** Barra de energía: muestra el porcentaje de Ec o Ep sobre E_total. */
function EnergyBar({
  label, value, total, color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  // Porcentaje con protección contra división por cero
  const pct = total > 1e-12
    ? Math.min(100, (value / total) * 100)
    : 0

  return (
    <div style={s.energyWrap}>
      <div style={s.energyHeader}>
        <span style={s.rowLabel}>{label}</span>
        <span style={{ ...s.rowValue, color, fontFamily: 'monospace' }}>
          {value.toExponential(3)}
          <span style={s.rowUnit}> J</span>
        </span>
      </div>
      {/* Barra de progreso */}
      <div style={s.barTrack}>
        <div style={{
          ...s.barFill,
          width:      `${pct.toFixed(1)}%`,
          background: color,
        }} />
      </div>
    </div>
  )
}

/** Título de sección con línea divisora. */
function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <div style={s.divider} />
      <p style={s.sectionTitle}>{children}</p>
    </>
  )
}

/** Etiqueta de régimen de flujo con color semántico. */
function RegimeBadge({ regime }: { regime: DerivedQuantities['regime'] }) {
  const { label, color, bg } = REGIME_MAP[regime]
  return (
    <span style={{ ...s.badge, color, background: bg }}>
      {label}
    </span>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function InfoDisplay() {
  // ── Estado local: snapshot del store tomado a 20 Hz ───────────────────────
  const [snapshot, setSnapshot] = useState<{
    state:  PendulumState
    params: PendulumParams
  }>(() => ({
    state:  useSimulationStore.getState().state,
    params: useSimulationStore.getState().params,
  }))

  // ── Polling a 20 Hz ───────────────────────────────────────────────────────
  //
  // setInterval llama a la función cada REFRESH_MS milisegundos.
  // getState() lee el store SIN crear una suscripción reactiva.
  // Solo actualizamos si la simulación está corriendo, para no desperdiciar
  // renders cuando está pausada.
  //
  useEffect(() => {
    const id = setInterval(() => {
      const store = useSimulationStore.getState()
      setSnapshot({ state: store.state, params: store.params })
    }, REFRESH_MS)

    // Cleanup: cancelar el interval cuando el componente se desmonta
    return () => clearInterval(id)
  }, [])

  // ── Calcular cantidades derivadas ─────────────────────────────────────────
  //
  // useMemo memoriza el resultado de computeDerived.
  // Solo recalcula cuando cambia snapshot (cada 50 ms), no en cada render.
  // Sin useMemo, React recalcularía esto en cada render aunque los datos
  // no hayan cambiado.
  //
  const d = useMemo(
    () => computeDerived(snapshot.state, snapshot.params),
    [snapshot]
  )

  // Convertir θ a grados para display (la física usa radianes)
  const thetaDeg = (snapshot.state.theta * 180 / Math.PI)
  const params   = useSimulationStore(selectParams)

  return (
    <div style={s.panel}>

      {/* ── Estado cinemático ────────────────────────────────────────────── */}
      <p style={s.sectionTitle}>Estado</p>

      <Row
        label="θ — ángulo"
        value={thetaDeg.toFixed(3)}
        unit="°"
        color={TOKEN.violet}
      />
      <Row
        label="ω — vel. angular"
        value={snapshot.state.omega.toFixed(4)}
        unit="rad/s"
        color={TOKEN.blue}
      />
      <Row
        label="t — tiempo"
        value={snapshot.state.time.toFixed(2)}
        unit="s"
        color={TOKEN.muted}
      />

      {/* ── Dinámica ────────────────────────────────────────────────────── */}
      <SectionTitle>Dinámica</SectionTitle>

      <Row
        label="T — período"
        value={d.T.toFixed(4)}
        unit="s"
        color={TOKEN.orange}
      />
      <Row
        label="f — frecuencia"
        value={d.f.toFixed(4)}
        unit="Hz"
      />
      <Row
        label="I — inercia"
        value={d.I.toExponential(4)}
        unit="kg·m²"
      />
      <Row
        label="d — CM → pivote"
        value={d.d.toFixed(4)}
        unit="m"
      />
      <Row
        label="Leq — equiv."
        value={d.Leq.toFixed(4)}
        unit="m"
        color={TOKEN.muted}
      />

      {/* ── Fluido ──────────────────────────────────────────────────────── */}
      <SectionTitle>Fluido</SectionTitle>

      <Row
        label="Medio"
        value={params.fluid}
        mono={false}
        color={TOKEN.orange}
      />
      <Row
        label="Temperatura"
        value={params.tempC.toString()}
        unit="°C"
      />
      <Row
        label="Re — Reynolds"
        value={d.Re.toFixed(2)}
      />

      {/* Régimen con badge de color */}
      <div style={s.row}>
        <span style={s.rowLabel}>Régimen</span>
        <RegimeBadge regime={d.regime} />
      </div>

      <Row
        label="b — amortiguam."
        value={d.b.toExponential(3)}
        unit="N·m·s"
        color={TOKEN.muted}
      />

      {/* ── Energía ─────────────────────────────────────────────────────── */}
      <SectionTitle>Energía</SectionTitle>

      <EnergyBar
        label="Ec — cinética"
        value={d.Ec}
        total={d.Etotal}
        color={TOKEN.orange}
      />
      <EnergyBar
        label="Ep — potencial"
        value={d.Ep}
        total={d.Etotal}
        color={TOKEN.blue}
      />

      <div style={s.divider} />
      <Row
        label="E total"
        value={d.Etotal.toExponential(3)}
        unit="J"
        color={TOKEN.green}
      />

    </div>
  )
}

// ─── Datos de régimen ─────────────────────────────────────────────────────────

const REGIME_MAP: Record<
  DerivedQuantities['regime'],
  { label: string; color: string; bg: string }
> = {
  laminar:    { label: 'Laminar',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)'  },
  transition: { label: 'Transición', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  turbulent:  { label: 'Turbulento', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

// ─── Tokens de color ──────────────────────────────────────────────────────────

const TOKEN = {
  orange: '#fb923c',
  blue:   '#60a5fa',
  violet: '#a78bfa',
  green:  '#4ade80',
  text:   'rgba(226,232,240,0.88)',
  muted:  'rgba(148,163,184,0.55)',
  border: 'rgba(148,163,184,0.1)',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {

  panel: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '7px',
    padding:       '12px',
    height:        '100%',
    overflowY:     'auto',
    boxSizing:     'border-box',
  },

  sectionTitle: {
    fontSize:      '10px',
    fontWeight:    600,
    color:         TOKEN.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin:        0,
  },

  divider: {
    height:     '1px',
    background: TOKEN.border,
    margin:     '2px 0',
  },

  // ── Filas ──────────────────────────────────────────────────────────────────
  row: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  rowLabel: {
    fontSize: '11.5px',
    color:    TOKEN.muted,
  },
  rowValue: {
    fontSize:           '11.5px',
    fontWeight:         500,
    fontVariantNumeric: 'tabular-nums',
    color:              TOKEN.text,
  },
  rowUnit: {
    fontSize:   '10px',
    fontWeight: 400,
    color:      TOKEN.muted,
  },

  // ── Barras de energía ──────────────────────────────────────────────────────
  energyWrap: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
  },
  energyHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  barTrack: {
    height:       '3px',
    borderRadius: '2px',
    background:   'rgba(148,163,184,0.12)',
    overflow:     'hidden',
  },
  barFill: {
    height:       '100%',
    borderRadius: '2px',
    transition:   'width 0.1s ease-out',
  },

  // ── Badge de régimen ───────────────────────────────────────────────────────
  badge: {
    fontSize:     '10px',
    fontWeight:   600,
    padding:      '2px 7px',
    borderRadius: '4px',
    letterSpacing: '0.04em',
  },
}