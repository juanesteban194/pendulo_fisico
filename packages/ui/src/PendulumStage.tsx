// ─── <PendulumStage /> ───────────────────────────────────────────────────────
//
// SVG vectorial que se arma pieza a pieza siguiendo la sección activa.
// Inspiración relojera: trazos finos, achurado para superficies fijas,
// líneas de cota dashed estilo plano de ingeniería.
//
// 9 estados (uno por sección):
//   0 bienvenida        → un punto solitario (futuro pivote)
//   1 pivote            → pivote + achurado de pared fija
//   2 pendulo-simple    → cuerda + masa puntual ideal
//   3 energias          → flecha de velocidad + cota de altura h
//   4 momento-inercia   → la cuerda se vuelve barra rígida
//   5 pendulo-fisico    → marca del CM ⊕ con cota d
//   6 amortiguamiento   → ondas del fluido + espiral en pivote
//   7 rk4               → cuadrícula temporal discreta debajo
//   8 simulador         → todo integrado, listo para morphing al simulador
//
// Cada pieza:
//   • visible si su índice ≤ activeIdx
//   • activa (saturada) si su índice == activeIdx
//   • histórica (atenuada a opacity 0.45) si visible pero no activa

'use client'

import { motion } from 'framer-motion'

const PIECE_ORDER = [
  'bienvenida',       // 0
  'pivote',           // 1
  'pendulo-simple',   // 2
  'energias',         // 3
  'momento-inercia',  // 4
  'pendulo-fisico',   // 5
  'amortiguamiento',  // 6
  'rk4',              // 7
  'simulador',        // 8
] as const

export type PendulumStageSlug = (typeof PIECE_ORDER)[number]

export interface PendulumStageProps {
  /** Slug actualmente visible. Si null, se muestra el estado 0 (bienvenida). */
  activeSlug?: string
  className?: string
  /** Etiqueta a11y. */
  ariaLabel?: string
}

// ─── Constantes geométricas (en unidades del viewBox) ────────────────────────
const PIVOT_X = 0
const PIVOT_Y = 0
const L_VIS   = 220                    // longitud visual del péndulo
const MASS_RADIUS  = 16
const BAR_WIDTH    = 14
const D_VIS   = 200                    // distancia visual al CM

// Colores (referenciados desde CSS vars en runtime)
const C_ACTIVE  = 'rgb(var(--accent-orange))'
const C_INACTIVE = 'rgb(var(--text-tertiary))'
const C_BAR     = 'rgb(var(--text-secondary))'
const C_LINE    = 'rgb(var(--border-default))'
const C_DASHED  = 'rgb(var(--text-tertiary))'

// ─── Wrapper de pieza con animación coherente ────────────────────────────────
interface PieceProps {
  visible: boolean
  active:  boolean
  children: React.ReactNode
}

function Piece({ visible, active, children }: PieceProps) {
  return (
    <motion.g
      initial={false}
      animate={{
        opacity: visible ? (active ? 1 : 0.45) : 0,
        scale:   visible ? 1 : 0.92,
      }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px` }}
    >
      {children}
    </motion.g>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export function PendulumStage({
  activeSlug,
  className = '',
  ariaLabel = 'Diagrama del péndulo en construcción',
}: PendulumStageProps) {
  const activeIdx = activeSlug
    ? Math.max(0, PIECE_ORDER.indexOf(activeSlug as PendulumStageSlug))
    : 0

  const isVisible = (idx: number) => idx <= activeIdx
  const isActive  = (idx: number) => idx === activeIdx

  return (
    <div
      className={['relative h-full w-full select-none', className].join(' ')}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="-200 -120 400 480"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Achurado para superficies fijas (pared del pivote) */}
          <pattern
            id="hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke={C_LINE} strokeWidth="1" />
          </pattern>
          {/* Cuadrícula temporal de RK4 */}
          <pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C_LINE} strokeWidth="0.5" />
          </pattern>
          {/* Flecha estándar */}
          <marker
            id="arrow"
            viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C_ACTIVE} />
          </marker>
        </defs>

        {/* ───── Fondo: cota vertical de referencia (estática y muy suave) ─── */}
        <line
          x1={PIVOT_X} y1={PIVOT_Y}
          x2={PIVOT_X} y2={PIVOT_Y + L_VIS + 60}
          stroke={C_LINE} strokeWidth="0.5" strokeDasharray="3 4"
        />

        {/* ───── Pieza 0: punto solitario (bienvenida) ───────────────────── */}
        <Piece visible={isVisible(0)} active={isActive(0)}>
          <motion.circle
            cx={PIVOT_X} cy={PIVOT_Y} r="4"
            fill={isActive(0) ? C_ACTIVE : C_INACTIVE}
            animate={isActive(0) ? { r: [4, 5.5, 4] } : { r: 4 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </Piece>

        {/* ───── Pieza 1: pivote + achurado de pared ─────────────────────── */}
        <Piece visible={isVisible(1)} active={isActive(1)}>
          {/* Achurado de pared horizontal sobre el pivote */}
          <rect
            x={PIVOT_X - 80} y={PIVOT_Y - 40}
            width="160" height="22"
            fill="url(#hatch)" stroke={C_LINE} strokeWidth="1"
          />
          {/* Línea vertical conectando pared a pivote */}
          <line
            x1={PIVOT_X} y1={PIVOT_Y - 18}
            x2={PIVOT_X} y2={PIVOT_Y - 6}
            stroke={C_LINE} strokeWidth="1.2"
          />
          {/* Pivote (círculo) */}
          <circle
            cx={PIVOT_X} cy={PIVOT_Y} r="6"
            fill="white" stroke={isActive(1) ? C_ACTIVE : C_BAR}
            strokeWidth="2"
          />
        </Piece>

        {/* ───── Pieza 2: cuerda + masa puntual ──────────────────────────── */}
        <Piece visible={isVisible(2) && !isVisible(4)} active={isActive(2)}>
          <line
            x1={PIVOT_X} y1={PIVOT_Y}
            x2={PIVOT_X} y2={PIVOT_Y + L_VIS}
            stroke={isActive(2) ? C_ACTIVE : C_BAR} strokeWidth="1.5"
          />
          <circle
            cx={PIVOT_X} cy={PIVOT_Y + L_VIS} r={MASS_RADIUS}
            fill={isActive(2) ? C_ACTIVE : 'rgb(var(--text-secondary))'}
          />
          <circle
            cx={PIVOT_X} cy={PIVOT_Y + L_VIS} r={MASS_RADIUS - 4}
            fill="white" opacity="0.25"
          />
        </Piece>

        {/* ───── Pieza 3: vector velocidad + cota h ──────────────────────── */}
        <Piece visible={isVisible(3)} active={isActive(3)}>
          {/* Cota de altura h con líneas dashed horizontales */}
          <g stroke={C_DASHED} strokeWidth="0.8" strokeDasharray="3 3">
            <line x1={PIVOT_X + 30}  y1={PIVOT_Y + L_VIS} x2={PIVOT_X + 90}  y2={PIVOT_Y + L_VIS} />
            <line x1={PIVOT_X + 30}  y1={PIVOT_Y + L_VIS - 50} x2={PIVOT_X + 90}  y2={PIVOT_Y + L_VIS - 50} />
            <line x1={PIVOT_X + 60}  y1={PIVOT_Y + L_VIS} x2={PIVOT_X + 60}  y2={PIVOT_Y + L_VIS - 50} />
          </g>
          <text
            x={PIVOT_X + 70} y={PIVOT_Y + L_VIS - 22}
            className="font-mono"
            fontSize="13" fill={isActive(3) ? C_ACTIVE : C_DASHED} fontStyle="italic"
          >h</text>
          {/* Vector velocidad tangencial al arco (apunta al lado contrario) */}
          <g stroke={isActive(3) ? C_ACTIVE : C_INACTIVE} strokeWidth="2"
             markerEnd="url(#arrow)">
            <line
              x1={PIVOT_X} y1={PIVOT_Y + L_VIS - MASS_RADIUS - 2}
              x2={PIVOT_X - 50} y2={PIVOT_Y + L_VIS - MASS_RADIUS - 2}
            />
          </g>
          <text
            x={PIVOT_X - 60} y={PIVOT_Y + L_VIS - MASS_RADIUS - 8}
            className="font-mono"
            fontSize="12" fill={isActive(3) ? C_ACTIVE : C_INACTIVE} fontStyle="italic"
          >v</text>
        </Piece>

        {/* ───── Pieza 4: barra rígida (reemplaza la cuerda) ─────────────── */}
        <Piece visible={isVisible(4)} active={isActive(4)}>
          <rect
            x={PIVOT_X - BAR_WIDTH / 2} y={PIVOT_Y}
            width={BAR_WIDTH} height={L_VIS}
            fill={isActive(4) ? C_ACTIVE : C_BAR}
            rx="2"
          />
          <circle
            cx={PIVOT_X} cy={PIVOT_Y + L_VIS} r={MASS_RADIUS}
            fill={isActive(4) ? C_ACTIVE : 'rgb(var(--text-secondary))'}
          />
          <circle
            cx={PIVOT_X} cy={PIVOT_Y + L_VIS} r={MASS_RADIUS - 4}
            fill="white" opacity="0.25"
          />
        </Piece>

        {/* ───── Pieza 5: marca del CM con cota d ────────────────────────── */}
        <Piece visible={isVisible(5)} active={isActive(5)}>
          {/* Cota d con líneas dashed */}
          <g stroke={isActive(5) ? C_ACTIVE : C_DASHED} strokeWidth="0.9"
             strokeDasharray="3 3">
            <line x1={PIVOT_X - 60} y1={PIVOT_Y}        x2={PIVOT_X - 30} y2={PIVOT_Y} />
            <line x1={PIVOT_X - 60} y1={PIVOT_Y + D_VIS} x2={PIVOT_X - 30} y2={PIVOT_Y + D_VIS} />
            <line x1={PIVOT_X - 50} y1={PIVOT_Y}        x2={PIVOT_X - 50} y2={PIVOT_Y + D_VIS} />
          </g>
          <text
            x={PIVOT_X - 70} y={PIVOT_Y + D_VIS / 2 + 5}
            textAnchor="end"
            className="font-mono"
            fontSize="13"
            fill={isActive(5) ? C_ACTIVE : C_DASHED} fontStyle="italic"
          >d</text>
          {/* Marca del CM ⊕ */}
          <g transform={`translate(${PIVOT_X}, ${PIVOT_Y + D_VIS})`}>
            <circle
              r="9" fill="white"
              stroke={isActive(5) ? C_ACTIVE : 'rgb(var(--accent-amber))'}
              strokeWidth="2"
            />
            <line x1="-9" y1="0" x2="9" y2="0"
                  stroke={isActive(5) ? C_ACTIVE : 'rgb(var(--accent-amber))'}
                  strokeWidth="1.5" />
            <line x1="0" y1="-9" x2="0" y2="9"
                  stroke={isActive(5) ? C_ACTIVE : 'rgb(var(--accent-amber))'}
                  strokeWidth="1.5" />
          </g>
        </Piece>

        {/* ───── Pieza 6: ondas de fluido alrededor de la masa ───────────── */}
        <Piece visible={isVisible(6)} active={isActive(6)}>
          {/* Ondas concéntricas estilizadas */}
          {[1, 2, 3].map(i => (
            <motion.circle
              key={i}
              cx={PIVOT_X} cy={PIVOT_Y + L_VIS}
              r={MASS_RADIUS + 8 + i * 8}
              fill="none"
              stroke={isActive(6) ? C_ACTIVE : 'rgb(var(--accent-blue))'}
              strokeWidth="1"
              strokeDasharray="2 4"
              animate={isActive(6) ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.45 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
          {/* Espiral en pivote (fricción interna) */}
          <motion.path
            d={`M ${PIVOT_X + 12},${PIVOT_Y - 1}
                a 11,11 0 1 1 -10,-2
                a 7,7 0 1 1 6,1
                a 4,4 0 1 1 -3,-1`}
            fill="none"
            stroke={isActive(6) ? C_ACTIVE : 'rgb(var(--accent-blue))'}
            strokeWidth="1"
            transform={`translate(0, -2)`}
          />
        </Piece>

        {/* ───── Pieza 7: cuadrícula temporal discreta (RK4) ─────────────── */}
        <Piece visible={isVisible(7)} active={isActive(7)}>
          <rect
            x={PIVOT_X - 90} y={PIVOT_Y + L_VIS + 50}
            width="180" height="60"
            fill="url(#grid)" opacity="0.6"
          />
          {/* Puntos discretos sobre una línea sinusoidal punteada */}
          {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((dx, i) => {
            const dy = Math.sin((dx / 80) * Math.PI) * 18
            return (
              <circle
                key={i}
                cx={PIVOT_X + dx} cy={PIVOT_Y + L_VIS + 80 + dy}
                r={isActive(7) ? 2.5 : 1.8}
                fill={isActive(7) ? C_ACTIVE : C_INACTIVE}
              />
            )
          })}
          <text
            x={PIVOT_X} y={PIVOT_Y + L_VIS + 130}
            textAnchor="middle"
            className="font-mono"
            fontSize="10" fill={C_DASHED}
          >Δt</text>
        </Piece>

        {/* ───── Pieza 8: corona de "completado" en la sección final ─────── */}
        <Piece visible={isVisible(8)} active={isActive(8)}>
          <motion.circle
            cx={PIVOT_X} cy={PIVOT_Y + L_VIS / 2}
            r="160" fill="none"
            stroke={C_ACTIVE} strokeWidth="0.8"
            strokeDasharray="2 6"
            opacity="0.55"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${PIVOT_X}px ${PIVOT_Y + L_VIS / 2}px` }}
          />
        </Piece>
      </svg>
    </div>
  )
}

export { PIECE_ORDER }
