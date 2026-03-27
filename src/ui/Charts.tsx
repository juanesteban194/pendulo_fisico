// ─── GRÁFICAS CIENTÍFICAS ─────────────────────────────────────────────────────
//
// Cuatro gráficas que muestran el comportamiento físico del péndulo
// a lo largo del tiempo, usando el historial del store (30 Hz).
//
// Fuente de datos:
//   useSimulationStore(selectHistory) → SimulationFrame[]
//   Cada frame tiene: { time, theta (rad), omega, Ec, Ep }
//
// Las gráficas usan Recharts, una librería declarativa construida sobre D3.
// La idea central de Recharts: describes QUÉ quieres graficar, no CÓMO
// dibujarlo. Recharts se encarga de escalar los ejes, dibujar las líneas, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, type CSSProperties } from 'react'
import {
  ResponsiveContainer,
  LineChart, Line,
  ScatterChart, Scatter,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend,
} from 'recharts'
import { useSimulationStore, selectHistory } from '../store/simulationStore'
import type { SimulationFrame } from '../types/physics.types'

// ─── Constantes de diseño ─────────────────────────────────────────────────────

const TOKEN = {
  violet:  '#a78bfa',
  blue:    '#60a5fa',
  orange:  '#fb923c',
  green:   '#4ade80',
  muted:   'rgba(148,163,184,0.45)',
  border:  'rgba(148,163,184,0.08)',
  tooltip: {
    background: 'rgba(8,14,26,0.97)',
    border:     '1px solid rgba(148,163,184,0.2)',
    borderRadius: '6px',
    fontSize:   '11px',
    color:      '#e2e8f0',
    padding:    '4px 8px',
  } as CSSProperties,
}

/** Estilo común para los ticks (números) de los ejes. */
const TICK = { fontSize: 9, fill: 'rgba(148,163,184,0.5)' }

/** Margen interno de todas las gráficas. */
const MARGIN = { top: 6, right: 6, bottom: 4, left: -18 }

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Tarjeta contenedora de cada gráfica individual. */
function ChartCard({
  title, children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={s.card}>
      <p style={s.cardTitle}>{title}</p>
      {children}
    </div>
  )
}

// ─── Transformación de datos ──────────────────────────────────────────────────
//
// Los frames del store guardan theta en radianes (para consistencia con
// la física). Las gráficas muestran grados (más intuitivo para el usuario).
// La conversión se hace aquí, una sola vez con useMemo.
//

interface DisplayFrame {
  time:   number   // segundos
  theta:  number   // grados (convertido de radianes)
  omega:  number   // rad/s
  Ec:     number   // Julios
  Ep:     number   // Julios
  Etotal: number   // Julios
}

function toDisplayFrames(frames: SimulationFrame[]): DisplayFrame[] {
  return frames.map(f => ({
    time:   parseFloat(f.time.toFixed(2)),
    theta:  parseFloat((f.theta * 180 / Math.PI).toFixed(3)),
    omega:  parseFloat(f.omega.toFixed(4)),
    Ec:     f.Ec,
    Ep:     f.Ep,
    Etotal: f.Ec + f.Ep,
  }))
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Charts() {
  // Leer el historial del store.
  // selectHistory solo cambia cuando pushFrame agrega un nuevo frame (~30 Hz),
  // no en cada tick de física (60 Hz). Esto mantiene el render eficiente.
  const history = useSimulationStore(selectHistory)

  // Convertir a unidades de display una sola vez por actualización del historial.
  const frames = useMemo(() => toDisplayFrames(history), [history])

  // El diagrama de fase necesita {theta, omega} por punto, no el frame completo.
  // Lo derivamos del mismo array ya convertido.
  const phaseData = useMemo(
    () => frames.map(f => ({ theta: f.theta, omega: f.omega })),
    [frames]
  )

  // Si no hay datos aún, mostrar estado vacío
  if (frames.length < 2) {
    return (
      <div style={s.empty}>
        <span style={s.emptyText}>Iniciando simulación…</span>
      </div>
    )
  }

  return (
    <div style={s.grid}>

      {/* ── 1. θ(t) — Posición angular ──────────────────────────────────── */}
      {/*
       * Muestra cómo el ángulo oscila con el tiempo.
       * En vacío: sinusoide perfecta, amplitud constante.
       * Con amortiguamiento: sinusoide cuya amplitud decrece exponencialmente.
       * El período T es la distancia entre dos picos consecutivos.
       */}
      <ChartCard title="θ(t) — posición angular">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={TOKEN.border} />
            <XAxis
              dataKey="time"
              tick={TICK}
              label={{ value: 't (s)', position: 'insideBottomRight', offset: -2, style: { ...TICK, fontSize: 9 } }}
            />
            <YAxis
              tick={TICK}
              label={{ value: '°', angle: -90, position: 'insideLeft', style: { ...TICK, fontSize: 9 } }}
            />
            <Tooltip
              contentStyle={TOKEN.tooltip}
              formatter={(v: number) => [`${v.toFixed(3)}°`, 'θ']}
              labelFormatter={(t: number) => `t = ${t} s`}
            />
            <Line
              type="monotone"
              dataKey="theta"
              stroke={TOKEN.violet}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── 2. ω(t) — Velocidad angular ─────────────────────────────────── */}
      {/*
       * Siempre desfasada exactamente 90° (un cuarto de período) respecto a θ.
       * Cuando θ es máximo (extremo), ω = 0 (el péndulo se detiene un instante).
       * Cuando θ = 0 (centro), |ω| es máximo (máxima velocidad).
       * Esto es la ley de conservación de energía en acción.
       */}
      <ChartCard title="ω(t) — velocidad angular">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={TOKEN.border} />
            <XAxis dataKey="time" tick={TICK} />
            <YAxis
              tick={TICK}
              label={{ value: 'rad/s', angle: -90, position: 'insideLeft', style: { ...TICK, fontSize: 8 } }}
            />
            <Tooltip
              contentStyle={TOKEN.tooltip}
              formatter={(v: number) => [`${v.toFixed(4)} rad/s`, 'ω']}
              labelFormatter={(t: number) => `t = ${t} s`}
            />
            <Line
              type="monotone"
              dataKey="omega"
              stroke={TOKEN.blue}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── 3. Diagrama de fase θ vs ω ───────────────────────────────────── */}
      {/*
       * El diagrama de fase es la visualización más poderosa del sistema.
       * Grafica ω (vertical) contra θ (horizontal) sin el tiempo.
       *
       * Sin amortiguamiento → ELIPSE perfecta, cerrada (mismo ciclo infinito).
       * Con amortiguamiento → ESPIRAL que se enrolla hacia (0, 0).
       *   Cada vuelta de la espiral es un período. La espiral se achica
       *   porque el fluido disipa energía en cada oscilación.
       *
       * Cuando la espiral llega al centro: el péndulo está en reposo.
       * En glicerina (sobreamortiguado): no hay espiral — la curva va
       * directamente al centro sin dar vueltas.
       */}
      <ChartCard title="Fase — θ vs ω">
        <ResponsiveContainer width="100%" height={108}>
          <ScatterChart margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={TOKEN.border} />
            <XAxis
              dataKey="theta"
              type="number"
              name="θ"
              tick={TICK}
              label={{ value: 'θ (°)', position: 'insideBottomRight', offset: -2, style: { ...TICK, fontSize: 9 } }}
            />
            <YAxis
              dataKey="omega"
              type="number"
              name="ω"
              tick={TICK}
              label={{ value: 'ω', angle: -90, position: 'insideLeft', style: { ...TICK, fontSize: 9 } }}
            />
            <Tooltip
              contentStyle={TOKEN.tooltip}
              formatter={(v: number, name: string) =>
                name === 'θ'
                  ? [`${v.toFixed(2)}°`, 'θ']
                  : [`${v.toFixed(3)} rad/s`, 'ω']
              }
            />
            <Scatter
              data={phaseData}
              // line conecta los puntos en orden temporal → dibuja la espiral
              line={{ stroke: TOKEN.green, strokeWidth: 1.2 }}
              lineType="joint"
              // shape=null: no dibujar marcadores en cada punto, solo la línea
              shape={() => null as unknown as React.ReactElement}
              fill={TOKEN.green}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── 4. Energía vs tiempo ─────────────────────────────────────────── */}
      {/*
       * Tres líneas superpuestas:
       *   Ec (naranja): energía cinética — máxima en el centro, cero en extremos
       *   Ep (azul):    energía potencial — cero en el centro, máxima en extremos
       *   E_total (verde, punteada): suma de las dos anteriores
       *
       * En vacío: Ec y Ep oscilan en contrafase (cuando una sube la otra baja),
       *   pero E_total permanece CONSTANTE → línea horizontal verde perfecta.
       *   Esto es la ley de conservación de energía mecánica.
       *
       * Con fluido: E_total decrece monotónicamente → el fluido convierte
       *   energía mecánica en calor por fricción.
       */}
      <ChartCard title="Energía mecánica">
        <ResponsiveContainer width="100%" height={108}>
          <LineChart data={frames} margin={MARGIN}>
            <CartesianGrid strokeDasharray="2 3" stroke={TOKEN.border} />
            <XAxis dataKey="time" tick={TICK} />
            <YAxis
              tick={TICK}
              label={{ value: 'J', angle: -90, position: 'insideLeft', style: { ...TICK, fontSize: 9 } }}
            />
            <Tooltip
              contentStyle={TOKEN.tooltip}
              formatter={(v: number, name: string) =>
                [`${(v as number).toExponential(3)} J`, name]
              }
              labelFormatter={(t: number) => `t = ${t} s`}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: '9px', paddingTop: '2px' }}
            />
            <Line
              type="monotone"
              dataKey="Ec"
              name="Ec cinética"
              stroke={TOKEN.orange}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Ep"
              name="Ep potencial"
              stroke={TOKEN.blue}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Etotal"
              name="E total"
              stroke={TOKEN.green}
              strokeWidth={1}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {

  grid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows:    '1fr 1fr',
    gap:                 '8px',
    padding:             '8px',
    height:              '100%',
    boxSizing:           'border-box',
    overflow:            'hidden',
  },

  card: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    background:    'rgba(15,23,42,0.55)',
    borderRadius:  '8px',
    padding:       '8px 10px 6px',
    border:        '1px solid rgba(148,163,184,0.09)',
    overflow:      'hidden',
  },

  cardTitle: {
    margin:        0,
    fontSize:      '10px',
    fontWeight:    600,
    color:         'rgba(148,163,184,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  empty: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
  },

  emptyText: {
    fontSize: '12px',
    color:    'rgba(148,163,184,0.4)',
  },
}