// ─── PANEL DE CONTROL DE PARÁMETROS ──────────────────────────────────────────
//
// Permite modificar en tiempo real los 7 parámetros físicos del simulador:
//   L, m, mr, θ₀, fluido, temperatura, gravedad
//
// Principios de diseño:
//   • Componentes controlados: el valor de cada input viene del store,
//     no del DOM. La fuente de verdad es siempre Zustand.
//   • Conversión en la frontera: la UI muestra unidades humanas (grados,
//     gramos), el store siempre guarda unidades del SI (radianes, kg).
//   • Componente Slider reutilizable: evita duplicar HTML/CSS.
//   • Sin lógica de física aquí — solo lectura y escritura de parámetros.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import { useSimulationStore, selectParams, selectRunning } from '../store/simulationStore'
import { getAllFluids } from '../physics/fluids'
import type { FluidId } from '../types/physics.types'

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface SliderProps {
  label:    string        // nombre del parámetro (ej. "Longitud L")
  symbol:   string        // símbolo matemático (ej. "L")
  unit:     string        // unidad de medida (ej. "m")
  value:    number        // valor actual (en unidades de display)
  min:      number
  max:      number
  step:     number
  digits?:  number        // decimales a mostrar (default: 3)
  color?:   string        // color del valor (default: naranja)
  onChange: (v: number) => void
}

// ─── Componente Slider ────────────────────────────────────────────────────────
//
// Un slider consiste en:
//   • Header: nombre del parámetro a la izquierda, valor numérico a la derecha
//   • Input range: el control deslizable
//
// Es un componente "puro": dado los mismos props, siempre produce el mismo HTML.
// No tiene estado propio — todo viene de fuera (componente controlado).
//
function Slider({
  label, symbol, unit, value, min, max, step,
  digits = 3, color = TOKEN.orange, onChange,
}: SliderProps) {
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
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={s.range}
      />
    </div>
  )
}

// ─── Componente SectionTitle ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export function ControlPanel() {
  const params  = useSimulationStore(selectParams)
  const running = useSimulationStore(selectRunning)
  const { setParams, setRunning, reset } = useSimulationStore.getState()

  const fluids = getAllFluids()

  // Convertir θ₀ de radianes (store) a grados (display)
  const theta0Deg = params.theta0 * (180 / Math.PI)

  return (
    <div style={s.panel}>

      {/* ── Encabezado con controles de ejecución ───────────────────────── */}
      <div style={s.header}>
        <span style={s.panelTitle}>Parámetros</span>
        <div style={s.headerBtns}>

          {/* Botón play/pausa */}
          <button
            style={{
              ...s.iconBtn,
              background: running ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)',
              color:       running ? TOKEN.amber : TOKEN.green,
              borderColor: running ? 'rgba(251,191,36,0.3)' : 'rgba(74,222,128,0.3)',
            }}
            onClick={() => setRunning(!running)}
            title={running ? 'Pausar' : 'Reanudar'}
          >
            {running ? '⏸' : '▶'}
          </button>

          {/* Botón reset */}
          <button
            style={{
              ...s.iconBtn,
              background:  'rgba(129,140,248,0.12)',
              color:        TOKEN.indigo,
              borderColor: 'rgba(129,140,248,0.3)',
            }}
            onClick={reset}
            title="Reiniciar simulación"
          >
            ↺
          </button>

        </div>
      </div>

      {/* ── Sección: Geometría ───────────────────────────────────────────── */}
      <Section title="Geometría del péndulo">

        <Slider
          label="Longitud" symbol="L" unit="m"
          value={params.L} min={0.05} max={3.0} step={0.01} digits={2}
          onChange={v => setParams({ L: v })}
        />

        <Slider
          label="Masa extremo" symbol="mᵣ" unit="kg"
          value={params.mr} min={0.01} max={0.5} step={0.005} digits={3}
          onChange={v => setParams({ mr: v })}
        />

        <Slider
          label="Masa barra" symbol="m" unit="kg"
          value={params.m} min={0.001} max={0.2} step={0.001} digits={3}
          color={TOKEN.blue}
          onChange={v => setParams({ m: v })}
        />

      </Section>

      {/* ── Sección: Condición inicial ───────────────────────────────────── */}
      <Section title="Condición inicial">

        {/*
         * θ₀ se muestra en grados pero se guarda en radianes.
         * Conversión: grados × (π/180) = radianes
         * Ejemplo: 45° × 0.01745 = 0.7854 rad
         */}
        <Slider
          label="Ángulo inicial" symbol="θ₀" unit="°"
          value={theta0Deg} min={1} max={90} step={1} digits={0}
          color={TOKEN.violet}
          onChange={v => setParams({ theta0: v * (Math.PI / 180) })}
        />

      </Section>

      {/* ── Sección: Fluido ──────────────────────────────────────────────── */}
      <Section title="Medio y temperatura">

        {/* Selector de fluido: cada botón activa un fluido diferente */}
        <div style={s.fluidGrid}>
          {fluids.map(f => {
            const active = params.fluid === f.id
            return (
              <button
                key={f.id}
                style={{
                  ...s.fluidBtn,
                  ...(active ? s.fluidBtnActive : {}),
                }}
                onClick={() => setParams({ fluid: f.id as FluidId })}
              >
                <span style={s.fluidIcon}>{FLUID_ICONS[f.id]}</span>
                <span>{f.name}</span>
              </button>
            )
          })}
        </div>

        <Slider
          label="Temperatura" symbol="T" unit="°C"
          value={params.tempC} min={0} max={100} step={1} digits={0}
          color={TOKEN.red}
          onChange={v => setParams({ tempC: v })}
        />

      </Section>

      {/* ── Sección: Gravedad ────────────────────────────────────────────── */}
      <Section title="Entorno gravitacional">

        <Slider
          label="Gravedad" symbol="g" unit="m/s²"
          value={params.g} min={1.6} max={24.8} step={0.01} digits={2}
          color={TOKEN.teal}
          onChange={v => setParams({ g: v })}
        />

        {/* Presets de planetas — atajos para valores conocidos de g */}
        <div style={s.presetGrid}>
          {GRAVITY_PRESETS.map(({ label, g, icon }) => {
            const active = Math.abs(params.g - g) < 0.05
            return (
              <button
                key={label}
                style={{
                  ...s.presetBtn,
                  ...(active ? s.presetBtnActive : {}),
                }}
                onClick={() => setParams({ g })}
                title={`g = ${g} m/s²`}
              >
                <span style={s.presetIcon}>{icon}</span>
                <span style={s.presetLabel}>{label}</span>
                <span style={s.presetG}>{g}</span>
              </button>
            )
          })}
        </div>

      </Section>

    </div>
  )
}

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const GRAVITY_PRESETS = [
  { label: 'Luna',     g: 1.62,  icon: '🌙' },
  { label: 'Marte',    g: 3.72,  icon: '🔴' },
  { label: 'Medellín', g: 9.78,  icon: '🇨🇴' },
  { label: 'Tierra',   g: 9.81,  icon: '🌍' },
  { label: 'Júpiter',  g: 24.79, icon: '🪐' },
]

const FLUID_ICONS: Record<FluidId, string> = {
  vacuum:   '○',
  air:      '~',
  water:    '≋',
  oil:      '◉',
  glycerin: '●',
}

// ─── Tokens de color ──────────────────────────────────────────────────────────

const TOKEN = {
  orange: '#fb923c',
  blue:   '#60a5fa',
  violet: '#a78bfa',
  amber:  '#fbbf24',
  green:  '#4ade80',
  indigo: '#818cf8',
  red:    '#f87171',
  teal:   '#2dd4bf',
  text:   'rgba(226,232,240,0.9)',
  muted:  'rgba(148,163,184,0.55)',
  border: 'rgba(148,163,184,0.1)',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
//
// Todos los colores usan tokens semánticos para que sea fácil cambiarlos.
// Los fondos oscuros se escriben con rgba para que funcionen sobre cualquier fondo.
//

const s: Record<string, CSSProperties> = {

  panel: {
    display:    'flex',
    flexDirection: 'column',
    gap:        '2px',
    padding:    '14px 12px',
    height:     '100%',
    overflowY:  'auto',
    boxSizing:  'border-box',
  },

  // ── Encabezado ─────────────────────────────────────────────────────────────
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '8px',
  },
  panelTitle: {
    fontSize:      '11px',
    fontWeight:    600,
    color:         TOKEN.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  headerBtns: {
    display: 'flex',
    gap:     '6px',
  },
  iconBtn: {
    width:        '28px',
    height:       '26px',
    border:       '1px solid',
    borderRadius: '6px',
    cursor:       'pointer',
    fontSize:     '13px',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'opacity 0.15s',
    padding:      0,
  },

  // ── Sección ────────────────────────────────────────────────────────────────
  section: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '11px',
    padding:       '12px 0',
    borderTop:     `1px solid ${TOKEN.border}`,
  },
  sectionTitle: {
    fontSize:      '10px',
    fontWeight:    600,
    color:         TOKEN.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin:        0,
  },

  // ── Slider ─────────────────────────────────────────────────────────────────
  sliderWrap: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '5px',
  },
  sliderHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'baseline',
  },
  paramLabel: {
    fontSize: '12px',
    color:    TOKEN.text,
  },
  paramSymbol: {
    fontSize: '11px',
    color:    TOKEN.muted,
    fontStyle: 'italic',
  },
  paramValue: {
    fontSize:           '12px',
    fontWeight:         600,
    fontVariantNumeric: 'tabular-nums',
  },
  paramUnit: {
    fontSize:   '10px',
    fontWeight: 400,
    color:      TOKEN.muted,
  },
  range: {
    width:       '100%',
    accentColor: TOKEN.orange,
    cursor:      'pointer',
    height:      '3px',
  },

  // ── Fluidos ────────────────────────────────────────────────────────────────
  fluidGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 '5px',
  },
  fluidBtn: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '2px',
    padding:       '7px 4px',
    fontSize:      '10px',
    fontWeight:    500,
    color:         TOKEN.muted,
    background:    'rgba(15,23,42,0.6)',
    border:        `1px solid ${TOKEN.border}`,
    borderRadius:  '7px',
    cursor:        'pointer',
    transition:    'all 0.15s',
    lineHeight:    1.2,
  },
  fluidBtnActive: {
    background:  'rgba(249,115,22,0.12)',
    borderColor: 'rgba(249,115,22,0.5)',
    color:       TOKEN.orange,
  },
  fluidIcon: {
    fontSize: '14px',
    lineHeight: 1,
  },

  // ── Presets de gravedad ────────────────────────────────────────────────────
  presetGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap:                 '4px',
  },
  presetBtn: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '2px',
    padding:       '6px 2px',
    background:    'rgba(15,23,42,0.6)',
    border:        `1px solid ${TOKEN.border}`,
    borderRadius:  '7px',
    cursor:        'pointer',
    transition:    'all 0.15s',
  },
  presetBtnActive: {
    background:  'rgba(45,212,191,0.1)',
    borderColor: 'rgba(45,212,191,0.45)',
  },
  presetIcon: {
    fontSize: '14px',
    lineHeight: 1,
  },
  presetLabel: {
    fontSize:  '9px',
    color:     TOKEN.muted,
    fontWeight: 500,
  },
  presetG: {
    fontSize:           '9px',
    color:              TOKEN.teal,
    fontVariantNumeric: 'tabular-nums',
  },
}