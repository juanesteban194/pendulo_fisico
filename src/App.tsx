// ─── LAYOUT PRINCIPAL ────────────────────────────────────────────────────────
//
// Ensambla todos los componentes en la pantalla usando CSS Grid.
// No contiene lógica de física ni de estado — solo estructura visual.
//
// Layout:
//   ┌──────────────────────────┬──────────────────┐
//   │  header (título)         │                  │
//   ├──────────────────────────┤  ControlPanel    │
//   │  PendulumScene (canvas)  │  (parámetros)    │
//   │                          ├──────────────────┤
//   ├──────────────────────────┤  InfoDisplay     │
//   │  Charts (4 gráficas)     │  (telemetría)    │
//   └──────────────────────────┴──────────────────┘
//
// Columna derecha: ancho fijo 220px (panel de control denso).
// Columna izquierda: 1fr — toma todo el espacio restante.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import { PendulumScene } from './scene/PendulumScene'
import { ControlPanel }  from './ui/ControlPanel'
import { InfoDisplay }   from './ui/InfoDisplay'
import { Charts }        from './ui/Charts'

// ─── Tokens ───────────────────────────────────────────────────────────────────

const SIDE_WIDTH    = '220px'
const HEADER_HEIGHT = '42px'
const CHARTS_HEIGHT = '290px'
const BORDER        = '1px solid rgba(148,163,184,0.1)'
const BG_DEEP       = '#060b14'
const BG_PANEL      = 'rgba(10,18,32,0.97)'
const BG_CANVAS     = 'radial-gradient(ellipse at 50% 40%, #0d1f3c 0%, #060b14 100%)'

// ─── Componente ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={s.root}>

      {/* ── Columna izquierda ──────────────────────────────────────────── */}
      <div style={s.leftCol}>

        {/* Encabezado */}
        <header style={s.header}>
          <div style={s.titleGroup}>
            {/* Indicador de estado — punto verde animado */}
            <span style={s.statusDot} />
            <h1 style={s.appTitle}>Simulador de Péndulo Físico</h1>
          </div>
          <p style={s.appSubtitle}>
            Universidad de Medellín · Física II · 2025-2
          </p>
        </header>

        {/* Canvas principal — aquí vive el péndulo */}
        <main style={s.canvasArea}>
          <PendulumScene />
        </main>

        {/* Gráficas en la parte inferior */}
        <section style={s.chartsArea}>
          <Charts />
        </section>

      </div>

      {/* ── Columna derecha ────────────────────────────────────────────── */}
      <aside style={s.rightCol}>

        {/* Panel de parámetros (mitad superior) */}
        <div style={s.controlBox}>
          <ControlPanel />
        </div>

        {/* Panel de telemetría (mitad inferior) */}
        <div style={s.infoBox}>
          <InfoDisplay />
        </div>

      </aside>

    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {

  // ── Contenedor raíz ───────────────────────────────────────────────────────
  //
  // CSS Grid de 2 columnas × altura total de la ventana.
  // overflow: hidden evita barras de scroll en el contenedor raíz.
  //
  root: {
    display:             'grid',
    gridTemplateColumns: `1fr ${SIDE_WIDTH}`,
    height:              '100vh',
    width:               '100vw',
    background:          BG_DEEP,
    color:               'rgba(226,232,240,0.9)',
    fontFamily:          'system-ui, -apple-system, sans-serif',
    overflow:            'hidden',
  },

  // ── Columna izquierda ─────────────────────────────────────────────────────
  //
  // Tres filas: header fijo, canvas flexible (toma el espacio sobrante), charts fijo.
  // El canvas usa "1fr" implícito — CSS Grid le da todo lo que no usan header y charts.
  //
  leftCol: {
    display:             'grid',
    gridTemplateRows:    `${HEADER_HEIGHT} 1fr ${CHARTS_HEIGHT}`,
    overflow:            'hidden',
    borderRight:         BORDER,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 16px',
    borderBottom:   BORDER,
    background:     'rgba(8,14,26,0.8)',
    backdropFilter: 'blur(8px)',
  },
  titleGroup: {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
  },
  // Punto verde pulsante que indica que la simulación está activa
  statusDot: {
    width:        '7px',
    height:       '7px',
    borderRadius: '50%',
    background:   '#4ade80',
    boxShadow:    '0 0 6px rgba(74,222,128,0.6)',
    flexShrink:   0,
  },
  appTitle: {
    margin:        0,
    fontSize:      '13px',
    fontWeight:    600,
    color:         'rgba(241,245,249,0.95)',
    letterSpacing: '-0.015em',
  },
  appSubtitle: {
    margin:   0,
    fontSize: '10px',
    color:    'rgba(148,163,184,0.45)',
  },

  // ── Área del canvas ───────────────────────────────────────────────────────
  canvasArea: {
    position:   'relative',
    overflow:   'hidden',
    background: BG_CANVAS,
  },

  // ── Área de gráficas ──────────────────────────────────────────────────────
  chartsArea: {
    borderTop:  BORDER,
    overflow:   'hidden',
    background: 'rgba(6,11,20,0.9)',
  },

  // ── Columna derecha ───────────────────────────────────────────────────────
  //
  // Dos filas de igual altura (1fr cada una).
  // La división en mitad superior (controles) e inferior (info) es intencional:
  // el usuario necesita los controles cerca de los ojos mientras ajusta,
  // y la telemetría debajo para verificar.
  //
  rightCol: {
    display:             'grid',
    gridTemplateRows:    '1fr 1fr',
    background:          BG_PANEL,
    overflow:            'hidden',
  },

  controlBox: {
    overflow:     'hidden',
    borderBottom: BORDER,
  },

  infoBox: {
    overflow: 'hidden',
  },
}