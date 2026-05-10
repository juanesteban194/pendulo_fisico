// ─── <ProgressRail /> ────────────────────────────────────────────────────────
//
// Mini-nav vertical fijado al borde izquierdo. Diseño "subway-line":
//   • Track central delgado (3px) que se rellena con el scroll (motion).
//   • Markers redondos de 28px con el número del capítulo en mono.
//   • Tooltip lateral derecho con el título de la sección (opacity 0 →
//     1 al hover/focus del marker o cuando el marker está activo).
//   • Activo: fondo naranja, número en blanco, ring del color.
//   • Visitados: borde naranja, número naranja, fondo claro.
//   • Pendientes: borde sutil, número gris, fondo blanco.
//
// Ancho total del rail: 56px (incluye padding). Honra prefers-reduced-motion.

'use client'

import { motion, useScroll, useReducedMotion } from 'framer-motion'

export interface ProgressRailSection {
  slug:   string
  title:  string
  number: number
}

export interface ProgressRailProps {
  sections: ProgressRailSection[]
  /** Slug actualmente activo (por IntersectionObserver). */
  activeSlug?: string
  className?: string
}

const RAIL_WIDTH    = 56
const TRACK_WIDTH   = 3
const MARKER_SIZE   = 28
const TOP_PADDING   = 80
const BOTTOM_PADDING = 80

export function ProgressRail({ sections, activeSlug, className = '' }: ProgressRailProps) {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()

  const scrollToSlug = (slug: string) => {
    const el = document.getElementById(slug)
    if (!el) return
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  if (sections.length === 0) return null

  // Indice del marker activo (para destacar visitados)
  const activeIdx = sections.findIndex(s => s.slug === activeSlug)

  return (
    <nav
      aria-label="Progreso de lectura"
      className={[
        'fixed left-0 top-0 z-40 hidden h-screen md:block',
        'border-r border-border-subtle bg-bg-surface/85 backdrop-blur',
        className,
      ].join(' ')}
      style={{ width: RAIL_WIDTH }}
    >
      <div
        className="relative h-full"
        style={{ paddingTop: TOP_PADDING, paddingBottom: BOTTOM_PADDING }}
      >
        {/* Track central */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-bg-tinted"
          style={{
            top:    TOP_PADDING,
            bottom: BOTTOM_PADDING,
            width:  TRACK_WIDTH,
          }}
        />
        {/* Fill — sincronizado con scrollYProgress */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 origin-top rounded-full bg-accent-orange"
          style={{
            top:    TOP_PADDING,
            bottom: BOTTOM_PADDING,
            width:  TRACK_WIDTH,
            scaleY: scrollYProgress,
          }}
        />

        {/* Markers */}
        <div className="relative h-full">
          {sections.map((s, i) => {
            const yPct  = sections.length === 1 ? 50 : (i / (sections.length - 1)) * 100
            const active   = s.slug === activeSlug
            const visited  = activeIdx >= 0 && i < activeIdx

            return (
              <div
                key={s.slug}
                className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${yPct}%` }}
              >
                <motion.button
                  type="button"
                  onClick={() => scrollToSlug(s.slug)}
                  data-slug={s.slug}
                  whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                  animate={reduceMotion ? undefined : { scale: active ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className={[
                    'relative flex items-center justify-center',
                    'rounded-full border-2 font-mono text-[10px] font-semibold tabular-nums',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2',
                    active
                      ? 'border-accent-orange bg-accent-orange text-white shadow-[0_0_0_4px_rgba(255,107,53,0.18)]'
                      : visited
                        ? 'border-accent-orange/60 bg-accent-orange-soft text-accent-orange hover:border-accent-orange'
                        : 'border-border-default bg-bg-surface text-text-tertiary hover:border-accent-orange hover:text-accent-orange',
                  ].join(' ')}
                  style={{ width: MARKER_SIZE, height: MARKER_SIZE }}
                  aria-label={`Ir a sección ${s.number}: ${s.title}`}
                  aria-current={active ? 'true' : undefined}
                  title={`${String(s.number).padStart(2, '0')} · ${s.title}`}
                >
                  {String(s.number).padStart(2, '0')}
                </motion.button>

                {/* Tooltip lateral con el título */}
                <span
                  aria-hidden
                  className={[
                    'pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md',
                    'px-2.5 py-1 text-xs font-medium',
                    'border border-border-subtle bg-bg-surface text-text-primary shadow-md',
                    'opacity-0 -translate-x-1 transition-all duration-150',
                    'group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0',
                    active ? '!opacity-100 !translate-x-0' : '',
                  ].join(' ')}
                >
                  {s.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
