// ─── LAYOUT PRINCIPAL — TEMA CLARO ───────────────────────────────────────────

import type { CSSProperties } from 'react'
import { PendulumScene } from './scene/PendulumScene'
import { ControlPanel }  from './ui/ControlPanel'
import { InfoDisplay }   from './ui/InfoDisplay'
import { Charts }        from './ui/Charts'
import { useSimulationStore, selectParams } from './store/simulationStore'
import type { FluidId }  from './types/physics.types'

const SIDE_WIDTH    = '224px'
const HEADER_HEIGHT = '42px'
const CHARTS_HEIGHT = '292px'
const BORDER        = '1px solid rgba(15,23,42,0.08)'

// Tinte de fondo según el fluido — pista visual instantánea del medio.
// Mantenidos sutiles para no saturar visualmente.
const FLUID_BACKGROUNDS: Record<FluidId, string> = {
  vacuum:   'radial-gradient(ellipse at 50% 35%, #f4f1ec 0%, #f5f2ed 50%, #faf8f3 100%)',
  air:      'radial-gradient(ellipse at 50% 35%, #dde8f5 0%, #e8eef7 50%, #f1f5f9 100%)',
  water:    'radial-gradient(ellipse at 50% 35%, #c5dde9 0%, #d4e6ee 50%, #dceef3 100%)',
  oil:      'radial-gradient(ellipse at 50% 35%, #efdfc7 0%, #f0e5cf 50%, #f5edd8 100%)',
  glycerin: 'radial-gradient(ellipse at 50% 35%, #f0e6c4 0%, #f0eacc 50%, #f5f0d8 100%)',
}

const FLUID_LABEL: Record<FluidId, string> = {
  vacuum: 'Vacío', air: 'Aire', water: 'Agua', oil: 'Aceite', glycerin: 'Glicerina',
}

/** Etiqueta superior izquierda con el fluido y la gravedad actuales. */
function SceneOverlay() {
  const params = useSimulationStore(selectParams)
  return (
    <>
      {/* Indicador de fluido (esquina superior izquierda) */}
      <div style={s.overlayLeft}>
        <span style={s.overlayDim}>medio</span>
        <span style={s.overlayValue}>{FLUID_LABEL[params.fluid]}</span>
        <span style={s.overlaySep}>·</span>
        <span style={s.overlayDim}>{params.tempC}°C</span>
      </div>

      {/* Indicador de gravedad (esquina superior derecha) */}
      <div style={s.overlayRight}>
        <span style={s.overlayDim}>g</span>
        <span style={s.overlayValue}>{params.g.toFixed(2)}</span>
        <span style={s.overlayDim}>m/s²</span>
        <span style={s.gravArrow}>↓</span>
      </div>
    </>
  )
}

export default function App() {
  const params = useSimulationStore(selectParams)
  const canvasBackground = FLUID_BACKGROUNDS[params.fluid]

  return (
    <div style={s.root}>

      <div style={s.leftCol}>

        <header style={s.header}>
          <div style={s.titleGroup}>
            <span style={s.statusDot} />
            <h1 style={s.appTitle}>Simulador de Péndulo Físico</h1>
          </div>
          <p style={s.appSubtitle}>
            Universidad de Medellín · Física II · 2025-2
          </p>
        </header>

        {/* Hint de controles */}
        <div style={s.hint}>
          <span>🖱 Rueda: zoom · Arrastre: mover · Doble clic: centrar</span>
        </div>

        <main style={{ ...s.canvasArea, background: canvasBackground }}>
          <PendulumScene />
          <SceneOverlay />
        </main>

        <section style={s.chartsArea}>
          <Charts />
        </section>

      </div>

      <aside style={s.rightCol}>
        <div style={s.controlBox}><ControlPanel /></div>
        <div style={s.infoBox}><InfoDisplay /></div>
      </aside>

    </div>
  )
}

const overlayBase: CSSProperties = {
  position:       'absolute',
  top:            10,
  display:        'flex',
  alignItems:     'center',
  gap:            '5px',
  padding:        '4px 10px',
  borderRadius:   '6px',
  background:     'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(6px)',
  border:         '1px solid rgba(15,23,42,0.06)',
  fontSize:       '10.5px',
  fontFamily:     'ui-monospace, monospace',
  color:          '#475569',
  pointerEvents:  'none',
  zIndex:         5,
}

const s: Record<string, CSSProperties> = {
  root: {
    display:             'grid',
    gridTemplateColumns: `1fr ${SIDE_WIDTH}`,
    height:              '100vh',
    width:               '100vw',
    background:          '#f1f5f9',
    color:               '#0f172a',
    fontFamily:          'system-ui, -apple-system, sans-serif',
    overflow:            'hidden',
  },
  leftCol: {
    display:          'grid',
    gridTemplateRows: `${HEADER_HEIGHT} 22px 1fr ${CHARTS_HEIGHT}`,
    overflow:         'hidden',
    borderRight:      BORDER,
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 16px',
    borderBottom:   BORDER,
    background:     'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
  },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)', flexShrink: 0,
  },
  appTitle: {
    margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.01em',
  },
  appSubtitle: { margin: 0, fontSize: '10px', color: '#94a3b8' },
  hint: {
    display: 'flex', alignItems: 'center', padding: '0 14px',
    fontSize: '9.5px', color: '#94a3b8',
    background: 'rgba(241,245,249,0.8)', borderBottom: BORDER,
    gap: '4px', overflow: 'hidden', whiteSpace: 'nowrap' as const,
  },
  canvasArea: {
    position:   'relative',
    overflow:   'hidden',
    transition: 'background 0.4s ease',
  },
  chartsArea: {
    borderTop:  BORDER,
    overflow:   'hidden',
    background: '#f8fafc',
  },
  rightCol: {
    display: 'grid', gridTemplateRows: '1fr 1fr',
    background: '#ffffff', overflow: 'hidden',
    boxShadow: '-1px 0 0 rgba(15,23,42,0.06)',
  },
  controlBox: { overflow: 'hidden', borderBottom: BORDER },
  infoBox:    { overflow: 'hidden' },

  // ── Overlays sobre el canvas ─────────────────────────────────────────────
  overlayLeft:  { ...overlayBase, left: 12 },
  overlayRight: { ...overlayBase, right: 12 },
  overlayDim:   { color: '#94a3b8', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  overlayValue: { color: '#1e293b', fontSize: '11px', fontWeight: 700 },
  overlaySep:   { color: '#cbd5e1', fontSize: '11px' },
  gravArrow:    { color: '#475569', fontSize: '12px', marginLeft: '2px' },
}
