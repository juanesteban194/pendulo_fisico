'use client'

// ─── SIMULADOR FULLSCREEN ────────────────────────────────────────────────────
// Variante de pantalla completa: ocupa 100vh y reordena el layout para tener
// el canvas como protagonista y un sidebar más ancho con controles + info.

import type { CSSProperties } from 'react'
import { PendulumScene } from './scene/PendulumScene'
import { ControlPanel }  from './ui/ControlPanel'
import { InfoDisplay }   from './ui/InfoDisplay'
import { Charts }        from './ui/Charts'
import { useSimulationStore, selectParams } from './store/simulationStore'
import type { FluidId }  from '@pendulo/physics'

const SIDEBAR = '320px'
const CHARTS_H = '280px'
const BORDER = '1px solid rgba(15,23,42,0.08)'

const FLUID_BG: Record<FluidId, string> = {
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
  position: 'absolute', top: 12,
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '5px 10px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(15,23,42,0.06)',
  fontSize: '11px', fontFamily: 'ui-monospace, monospace',
  color: '#475569', pointerEvents: 'none', zIndex: 5,
}

function SceneOverlay() {
  const params = useSimulationStore(selectParams)
  return (
    <>
      <div style={{ ...overlayBase, left: 14 }}>
        <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>medio</span>
        <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: 700 }}>{FLUID_LABEL[params.fluid]}</span>
        <span style={{ color: '#cbd5e1' }}>·</span>
        <span style={{ color: '#94a3b8', fontSize: '10px' }}>{params.tempC}°C</span>
      </div>
      <div style={{ ...overlayBase, right: 14 }}>
        <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>g</span>
        <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: 700 }}>{params.g.toFixed(2)}</span>
        <span style={{ color: '#94a3b8', fontSize: '10px' }}>m/s²</span>
        <span style={{ color: '#475569', fontSize: '13px', marginLeft: '2px' }}>↓</span>
      </div>
    </>
  )
}

export function SimuladorFull() {
  const params = useSimulationStore(selectParams)
  const canvasBackground = FLUID_BG[params.fluid]

  return (
    <div style={st.root}>
      <header style={st.header}>
        <a href="/" style={st.backLink} aria-label="Volver al curso">
          <span style={st.backArrow}>←</span>
          <span>Volver al curso</span>
        </a>
        <div style={st.title}>
          <span style={st.dot} />
          <span style={st.titleText}>Laboratorio · Péndulo Físico</span>
        </div>
        <div style={st.meta}>
          <span style={st.metaText}>Universidad de Medellín · Física II</span>
        </div>
      </header>

      <div style={st.body}>
        <div style={st.leftCol}>
          <main style={{ ...st.canvasArea, background: canvasBackground }}>
            <PendulumScene />
            <SceneOverlay />
            <div style={st.hint}>
              <span>🖱 Rueda: zoom · Arrastre: mover · Doble clic: centrar</span>
            </div>
          </main>
          <section style={st.chartsArea}>
            <Charts />
          </section>
        </div>

        <aside style={st.rightCol}>
          <div style={st.controlBox}><ControlPanel /></div>
          <div style={st.infoBox}><InfoDisplay /></div>
        </aside>
      </div>
    </div>
  )
}

const st: Record<string, CSSProperties> = {
  root: {
    display: 'grid', gridTemplateRows: '52px 1fr',
    height: '100vh', width: '100vw', overflow: 'hidden',
    background: '#f1f5f9', color: '#0f172a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '0 18px',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    borderBottom: BORDER,
    zIndex: 10,
  },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', color: '#475569', textDecoration: 'none',
    padding: '6px 10px', borderRadius: '6px',
    transition: 'background 0.15s, color 0.15s',
  },
  backArrow: {
    fontSize: '16px', display: 'inline-block',
    transition: 'transform 0.2s',
  },
  title: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', fontWeight: 600, color: '#1e293b',
  },
  dot: {
    display: 'inline-block', width: '8px', height: '8px',
    borderRadius: '50%', background: '#10b981',
    boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
  },
  titleText: { letterSpacing: '0.01em' },
  meta: { display: 'flex', justifyContent: 'flex-end' },
  metaText: { fontSize: '11px', color: '#94a3b8' },
  body: {
    display: 'grid',
    gridTemplateColumns: `1fr ${SIDEBAR}`,
    overflow: 'hidden',
  },
  leftCol: {
    display: 'grid',
    gridTemplateRows: `1fr ${CHARTS_H}`,
    overflow: 'hidden',
    borderRight: BORDER,
  },
  hint: {
    position: 'absolute', bottom: 10, left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px', color: '#94a3b8',
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(6px)',
    padding: '4px 10px', borderRadius: '999px',
    border: '1px solid rgba(15,23,42,0.05)',
    pointerEvents: 'none',
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
  },
  controlBox: { overflow: 'hidden', borderBottom: BORDER },
  infoBox: { overflow: 'hidden' },
}
