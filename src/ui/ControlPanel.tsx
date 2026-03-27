// ─── PANEL DE CONTROL DE PARÁMETROS FÍSICOS ──────────────────────────────────
// Controles para los 7 parámetros del simulador en tiempo real.
// Lee y escribe en Zustand — no toca Three.js ni hace física.

import { useSimulationStore } from '../store/simulationStore'
import { getAllFluids } from '../physics/fluids'
import type { FluidId } from '../types/physics.types'

// ─── Componente de slider individual ─────────────────────────────────────────

interface SliderProps {
  label:    string
  unit:     string
  value:    number
  min:      number
  max:      number
  step:     number
  digits?:  number
  onChange: (v: number) => void
}

function Slider({ label, unit, value, min, max, step, digits = 3, onChange }: SliderProps) {
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderHeader}>
        <span style={styles.sliderLabel}>{label}</span>
        <span style={styles.sliderValue}>
          {value.toFixed(digits)} <span style={styles.unit}>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={styles.range}
      />
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export function ControlPanel() {
  const { params, setParams, running, setRunning, reset } = useSimulationStore()
  const fluids = getAllFluids()

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>Parámetros</span>
        <div style={styles.controls}>
          <button
            style={{ ...styles.btn, ...(running ? styles.btnPause : styles.btnPlay) }}
            onClick={() => setRunning(!running)}
          >
            {running ? '⏸' : '▶'}
          </button>
          <button style={{ ...styles.btn, ...styles.btnReset }} onClick={reset}>
            ↺
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionTitle}>Geometría</span>

        <Slider
          label="Longitud L"
          unit="m"
          value={params.L}
          min={0.05} max={3.0} step={0.01} digits={2}
          onChange={v => setParams({ L: v })}
        />

        <Slider
          label="Masa extremo mᵣ"
          unit="kg"
          value={params.mr}
          min={0.01} max={0.5} step={0.005} digits={3}
          onChange={v => setParams({ mr: v })}
        />

        <Slider
          label="Masa barra m"
          unit="kg"
          value={params.m}
          min={0.001} max={0.2} step={0.001} digits={3}
          onChange={v => setParams({ m: v })}
        />
      </div>

      <div style={styles.section}>
        <span style={styles.sectionTitle}>Condición inicial</span>

        <Slider
          label="Ángulo inicial θ₀"
          unit="°"
          value={params.theta0 * (180 / Math.PI)}
          min={1} max={90} step={1} digits={0}
          onChange={v => setParams({ theta0: v * (Math.PI / 180) })}
        />
      </div>

      <div style={styles.section}>
        <span style={styles.sectionTitle}>Entorno</span>

        <div style={styles.sliderRow}>
          <div style={styles.sliderHeader}>
            <span style={styles.sliderLabel}>Fluido</span>
          </div>
          <div style={styles.fluidGrid}>
            {fluids.map(f => (
              <button
                key={f.id}
                style={{
                  ...styles.fluidBtn,
                  ...(params.fluid === f.id ? styles.fluidBtnActive : {}),
                }}
                onClick={() => setParams({ fluid: f.id as FluidId })}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Temperatura"
          unit="°C"
          value={params.tempC}
          min={0} max={100} step={1} digits={0}
          onChange={v => setParams({ tempC: v })}
        />

        <Slider
          label="Gravedad g"
          unit="m/s²"
          value={params.g}
          min={1.6} max={24.8} step={0.01} digits={2}
          onChange={v => setParams({ g: v })}
        />

        {/* Atajos de gravedad */}
        <div style={styles.gravBtns}>
          {GRAVITY_PRESETS.map(p => (
            <button
              key={p.label}
              style={{
                ...styles.gravBtn,
                ...(Math.abs(params.g - p.g) < 0.01 ? styles.gravBtnActive : {}),
              }}
              onClick={() => setParams({ g: p.g })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Presets de gravedad ──────────────────────────────────────────────────────

const GRAVITY_PRESETS = [
  { label: 'Luna',    g: 1.62  },
  { label: 'Marte',   g: 3.72  },
  { label: 'Medellín',g: 9.78  },
  { label: 'Tierra',  g: 9.81  },
  { label: 'Júpiter', g: 24.79 },
]

// ─── Estilos inline (compatibles con dark mode via CSS vars) ──────────────────

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary, #94a3b8)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  controls: {
    display: 'flex',
    gap: '6px',
  },
  btn: {
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '30px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s',
  },
  btnPlay: {
    background: '#22c55e22',
    color: '#4ade80',
  },
  btnPause: {
    background: '#f59e0b22',
    color: '#fbbf24',
  },
  btnReset: {
    background: '#6366f122',
    color: '#818cf8',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px 0',
    borderTop: '1px solid rgba(148,163,184,0.12)',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(148,163,184,0.6)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sliderLabel: {
    fontSize: '12px',
    color: 'rgba(226,232,240,0.85)',
  },
  sliderValue: {
    fontSize: '12px',
    fontVariantNumeric: 'tabular-nums',
    color: '#f97316',
    fontWeight: 500,
  },
  unit: {
    fontSize: '11px',
    color: 'rgba(148,163,184,0.6)',
  },
  range: {
    width: '100%',
    accentColor: '#f97316',
    cursor: 'pointer',
  },
  fluidGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    marginTop: '2px',
  },
  fluidBtn: {
    padding: '4px 2px',
    fontSize: '11px',
    borderRadius: '6px',
    border: '1px solid rgba(148,163,184,0.15)',
    background: 'rgba(30,41,59,0.6)',
    color: 'rgba(148,163,184,0.8)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center' as const,
  },
  fluidBtnActive: {
    background: '#f9731622',
    borderColor: '#f97316',
    color: '#fb923c',
  },
  gravBtns: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  gravBtn: {
    padding: '3px 8px',
    fontSize: '11px',
    borderRadius: '6px',
    border: '1px solid rgba(148,163,184,0.15)',
    background: 'rgba(30,41,59,0.6)',
    color: 'rgba(148,163,184,0.7)',
    cursor: 'pointer',
  },
  gravBtnActive: {
    background: '#6366f122',
    borderColor: '#818cf8',
    color: '#a5b4fc',
  },
}