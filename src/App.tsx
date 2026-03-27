// ─── LAYOUT PRINCIPAL — TEMA CLARO ───────────────────────────────────────────

import type { CSSProperties } from 'react'
import { PendulumScene } from './scene/PendulumScene'
import { ControlPanel }  from './ui/ControlPanel'
import { InfoDisplay }   from './ui/InfoDisplay'
import { Charts }        from './ui/Charts'

const SIDE_WIDTH    = '224px'
const HEADER_HEIGHT = '42px'
const CHARTS_HEIGHT = '292px'
const BORDER        = '1px solid rgba(15,23,42,0.08)'

export default function App() {
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

        <main style={s.canvasArea}>
          <PendulumScene />
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
  titleGroup: {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
  },
  statusDot: {
    width:        '7px',
    height:       '7px',
    borderRadius: '50%',
    background:   '#22c55e',
    boxShadow:    '0 0 6px rgba(34,197,94,0.5)',
    flexShrink:   0,
  },
  appTitle: {
    margin:        0,
    fontSize:      '13px',
    fontWeight:    600,
    color:         '#0f172a',
    letterSpacing: '-0.01em',
  },
  appSubtitle: {
    margin:   0,
    fontSize: '10px',
    color:    '#94a3b8',
  },
  hint: {
    display:    'flex',
    alignItems: 'center',
    padding:    '0 14px',
    fontSize:   '9.5px',
    color:      '#94a3b8',
    background: 'rgba(241,245,249,0.8)',
    borderBottom: BORDER,
    gap:        '4px',
    overflow:   'hidden',
    whiteSpace: 'nowrap' as const,
  },
  canvasArea: {
    position:   'relative',
    overflow:   'hidden',
    background: 'radial-gradient(ellipse at 50% 35%, #dde8f5 0%, #e8eef7 50%, #f1f5f9 100%)',
  },
  chartsArea: {
    borderTop:  BORDER,
    overflow:   'hidden',
    background: '#f8fafc',
  },
  rightCol: {
    display:          'grid',
    gridTemplateRows: '1fr 1fr',
    background:       '#ffffff',
    overflow:         'hidden',
    boxShadow:        '-1px 0 0 rgba(15,23,42,0.06)',
  },
  controlBox: {
    overflow:     'hidden',
    borderBottom: BORDER,
  },
  infoBox: {
    overflow: 'hidden',
  },
}