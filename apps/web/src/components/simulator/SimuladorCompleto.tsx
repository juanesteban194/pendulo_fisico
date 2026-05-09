'use client'

// ─── SIMULADOR EMBEBIDO EN LA SECCIÓN 8 ──────────────────────────────────────
//
// Adaptación de App.tsx de apps/simulator-2d para uso dentro de la plataforma
// educativa. Layout en dos columnas: canvas+gráficas a la izquierda,
// controles+info a la derecha. Altura fija de 620px para encajar en la sección.

import type { CSSProperties } from 'react'
import { PendulumScene } from './scene/PendulumScene'
import { ControlPanel }  from './ui/ControlPanel'
import { InfoDisplay }   from './ui/InfoDisplay'
import { Charts }        from './ui/Charts'
import { useSimulationStore, selectParams } from './store/simulationStore'
import type { FluidId }  from '@pendulo/physics'
import { Icon }          from '@/components/Icon'

const SIDE_WIDTH    = '220px'
const CHARTS_HEIGHT = '280px'
const BORDER        = '1px solid rgba(15,23,42,0.08)'

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

const overlayBase: CSSProperties = {
  position: 'absolute', top: 8,
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '3px 8px', borderRadius: '6px',
  background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(6px)',
  border: '1px solid rgba(15,23,42,0.06)',
  fontSize: '10px', fontFamily: 'ui-monospace, monospace',
  color: '#475569', pointerEvents: 'none', zIndex: 5,
}

function SceneOverlay() {
  const params = useSimulationStore(selectParams)
  return (
    <>
      <div style={{ ...overlayBase, left: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>medio</span>
        <span style={{ color: '#1e293b', fontSize: '10.5px', fontWeight: 700 }}>{FLUID_LABEL[params.fluid]}</span>
        <span style={{ color: '#cbd5e1' }}>·</span>
        <span style={{ color: '#94a3b8', fontSize: '9px' }}>{params.tempC}°C</span>
      </div>
      <div style={{ ...overlayBase, right: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>g</span>
        <span style={{ color: '#1e293b', fontSize: '10.5px', fontWeight: 700 }}>{params.g.toFixed(2)}</span>
        <span style={{ color: '#94a3b8', fontSize: '9px' }}>m/s²</span>
        <span style={{ color: '#475569', fontSize: '11px', marginLeft: '1px' }}>↓</span>
      </div>
    </>
  )
}

export function SimuladorCompleto() {
  const params = useSimulationStore(selectParams)
  const canvasBackground = FLUID_BACKGROUNDS[params.fluid]

  return (
    <div style={s.root}>
      {/* Columna izquierda: canvas + gráficas */}
      <div style={s.leftCol}>
        {/* Hint de controles */}
        <div style={s.hint}>
          <Icon name="mouse" size={11} strokeWidth={1.6} />
          <span>Rueda: zoom · Arrastre: mover · Doble clic: centrar</span>
        </div>

        {/* Canvas de la escena 3D */}
        <main style={{ ...s.canvasArea, background: canvasBackground }}>
          <PendulumScene />
          <SceneOverlay />
        </main>

        {/* Gráficas en tiempo real */}
        <section style={s.chartsArea}>
          <Charts />
        </section>
      </div>

      {/* Columna derecha: controles + info */}
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
    height:              '620px',
    width:               '100%',
    background:          '#f1f5f9',
    color:               '#0f172a',
    fontFamily:          'system-ui, -apple-system, sans-serif',
    overflow:            'hidden',
    borderRadius:        '10px',
    border:              BORDER,
    boxShadow:           '0 4px 24px rgba(15,23,42,0.08)',
  },
  leftCol: {
    display:          'grid',
    gridTemplateRows: `20px 1fr ${CHARTS_HEIGHT}`,
    overflow:         'hidden',
    borderRight:      BORDER,
  },
  hint: {
    display: 'flex', alignItems: 'center', padding: '0 12px',
    fontSize: '9px', color: '#94a3b8',
    background: 'rgba(241,245,249,0.9)', borderBottom: BORDER,
    gap: '4px', overflow: 'hidden', whiteSpace: 'nowrap' as const,
  },
  canvasArea: {
    position: 'relative', overflow: 'hidden',
    transition: 'background 0.4s ease',
  },
  chartsArea: {
    borderTop: BORDER, overflow: 'hidden', background: '#f8fafc',
  },
  rightCol: {
    display: 'grid', gridTemplateRows: '1fr 1fr',
    background: '#ffffff', overflow: 'hidden',
    boxShadow: '-1px 0 0 rgba(15,23,42,0.06)',
  },
  controlBox: { overflow: 'hidden', borderBottom: BORDER },
  infoBox:    { overflow: 'hidden' },
}
