// ─── PANEL DE CONTROL — TEMA CLARO ───────────────────────────────────────────

import type { CSSProperties } from 'react'
import { useSimulationStore, selectParams, selectRunning } from '../store/simulationStore'
import { getAllFluids } from '../physics/fluids'
import type { FluidId } from '../types/physics.types'

// ─── Tokens de color (tema claro) ────────────────────────────────────────────
const T = {
  orange:  '#f97316',
  blue:    '#3b82f6',
  violet:  '#8b5cf6',
  amber:   '#d97706',
  green:   '#16a34a',
  indigo:  '#4f46e5',
  red:     '#dc2626',
  teal:    '#0d9488',
  text:    '#1e293b',
  muted:   '#64748b',
  dim:     '#94a3b8',
  border:  'rgba(15,23,42,0.09)',
  bg:      '#f8fafc',
  bgHover: '#f1f5f9',
}

interface SliderProps {
  label:    string
  symbol:   string
  unit:     string
  value:    number
  min:      number
  max:      number
  step:     number
  digits?:  number
  color?:   string
  onChange: (v: number) => void
}

function Slider({ label, symbol, unit, value, min, max, step, digits = 3, color = T.orange, onChange }: SliderProps) {
  return (
    <div style={s.sliderWrap}>
      <div style={s.sliderHeader}>
        <span style={s.paramLabel}>
          {label}
          <span style={s.paramSymbol}> {symbol}</span>
        </span>
        <span style={{ ...s.paramValue, color }}>
          {value.toFixed(digits)}
          <span style={s.paramUnit}> {unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={s.range}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

const GRAVITY_PRESETS = [
  { label: 'Luna',      g: 1.62,  icon: '🌙' },
  { label: 'Marte',     g: 3.72,  icon: '🔴' },
  { label: 'Medellín',  g: 9.78,  icon: '🇨🇴' },
  { label: 'Tierra',    g: 9.81,  icon: '🌍' },
  { label: 'Júpiter',   g: 24.79, icon: '🪐' },
]

const FLUID_ICONS: Record<FluidId, string> = {
  vacuum: '○', air: '~', water: '≋', oil: '◉', glycerin: '●',
}

export function ControlPanel() {
  const params  = useSimulationStore(selectParams)
  const running = useSimulationStore(selectRunning)
  const { setParams, setRunning, reset } = useSimulationStore.getState()
  const fluids = getAllFluids()
  const theta0Deg = params.theta0 * (180 / Math.PI)

  return (
    <div style={s.panel}>

      <div style={s.header}>
        <span style={s.panelTitle}>Parámetros</span>
        <div style={s.headerBtns}>
          <button
            style={{
              ...s.iconBtn,
              background:  running ? '#fef3c7' : '#dcfce7',
              color:        running ? T.amber   : T.green,
              borderColor: running ? '#fde68a' : '#86efac',
            }}
            onClick={() => setRunning(!running)}
            title={running ? 'Pausar' : 'Reanudar'}
          >{running ? '⏸' : '▶'}</button>

          <button
            style={{ ...s.iconBtn, background: '#ede9fe', color: T.indigo, borderColor: '#c4b5fd' }}
            onClick={reset}
            title="Reiniciar"
          >↺</button>
        </div>
      </div>

      <Section title="Geometría del péndulo">
        <Slider label="Longitud"    symbol="L"  unit="m"
          value={params.L}  min={0.05} max={3.0}  step={0.01} digits={2}
          onChange={v => setParams({ L: v })} />
        <Slider label="Masa extremo" symbol="mᵣ" unit="kg"
          value={params.mr} min={0.01} max={0.5}  step={0.005} digits={3}
          onChange={v => setParams({ mr: v })} />
        <Slider label="Masa barra"  symbol="m"  unit="kg"
          value={params.m}  min={0.001} max={0.2} step={0.001} digits={3}
          color={T.blue}
          onChange={v => setParams({ m: v })} />
      </Section>

      <Section title="Condición inicial">
        <Slider label="Ángulo inicial" symbol="θ₀" unit="°"
          value={theta0Deg} min={1} max={90} step={1} digits={0}
          color={T.violet}
          onChange={v => setParams({ theta0: v * (Math.PI / 180) })} />
      </Section>

      <Section title="Medio y temperatura">
        <div style={s.fluidGrid}>
          {fluids.map(f => {
            const active = params.fluid === f.id
            return (
              <button key={f.id}
                style={{ ...s.fluidBtn, ...(active ? s.fluidBtnActive : {}) }}
                onClick={() => setParams({ fluid: f.id as FluidId })}
              >
                <span style={s.fluidIcon}>{FLUID_ICONS[f.id]}</span>
                <span>{f.name}</span>
              </button>
            )
          })}
        </div>
        <Slider label="Temperatura" symbol="T" unit="°C"
          value={params.tempC} min={0} max={100} step={1} digits={0}
          color={T.red}
          onChange={v => setParams({ tempC: v })} />
      </Section>

      <Section title="Entorno gravitacional">
        <Slider label="Gravedad" symbol="g" unit="m/s²"
          value={params.g} min={1.6} max={24.8} step={0.01} digits={2}
          color={T.teal}
          onChange={v => setParams({ g: v })} />
        <div style={s.presetGrid}>
          {GRAVITY_PRESETS.map(({ label, g, icon }) => {
            const active = Math.abs(params.g - g) < 0.05
            return (
              <button key={label}
                style={{ ...s.presetBtn, ...(active ? s.presetBtnActive : {}) }}
                onClick={() => setParams({ g })} title={`g = ${g} m/s²`}
              >
                <span style={{ fontSize: '13px' }}>{icon}</span>
                <span style={{ fontSize: '9px', color: T.muted }}>{label}</span>
                <span style={{ fontSize: '9px', color: active ? T.teal : T.dim, fontVariantNumeric: 'tabular-nums' }}>{g}</span>
              </button>
            )
          })}
        </div>
      </Section>

    </div>
  )
}

const s: Record<string, CSSProperties> = {
  panel: {
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '13px 12px', height: '100%', overflowY: 'auto', boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px',
  },
  panelTitle: {
    fontSize: '11px', fontWeight: 700, color: T.muted,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  headerBtns: { display: 'flex', gap: '6px' },
  iconBtn: {
    width: '28px', height: '26px', border: '1px solid',
    borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  section: {
    display: 'flex', flexDirection: 'column', gap: '11px',
    padding: '11px 0', borderTop: `1px solid ${T.border}`,
  },
  sectionTitle: {
    margin: 0, fontSize: '10px', fontWeight: 700, color: T.dim,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  sliderWrap:   { display: 'flex', flexDirection: 'column', gap: '5px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  paramLabel:   { fontSize: '12px', color: T.text },
  paramSymbol:  { fontSize: '11px', color: T.dim, fontStyle: 'italic' },
  paramValue:   { fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  paramUnit:    { fontSize: '10px', fontWeight: 400, color: T.dim },
  range:        { width: '100%', cursor: 'pointer' },
  fluidGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px',
  },
  fluidBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    padding: '7px 4px', fontSize: '10px', fontWeight: 500, color: T.muted,
    background: T.bg, border: `1px solid ${T.border}`, borderRadius: '7px',
    cursor: 'pointer', lineHeight: 1.2,
  },
  fluidBtnActive: {
    background: '#fff7ed', borderColor: '#fdba74', color: T.orange,
  },
  fluidIcon: { fontSize: '14px', lineHeight: '1' },
  presetGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px',
  },
  presetBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    padding: '6px 2px', background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: '7px', cursor: 'pointer',
  },
  presetBtnActive: {
    background: '#f0fdf9', borderColor: '#5eead4',
  },
}