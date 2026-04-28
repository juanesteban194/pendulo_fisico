// ─── <ProgressRail /> ────────────────────────────────────────────────────────
//
// Barra vertical de progreso de la lectura. Va al extremo izquierdo (4 px),
// se rellena en color naranja conforme el usuario hace scroll, y muestra
// puntos por sección que se pueden hacer clic para saltar.
//
// El relleno se sincroniza con `useScroll` de Framer Motion (rendimiento
// óptimo, sin re-renders por scroll).
//
// Si la sesión actual está activa (`activeSlug`) sobre algún marker, se
// destaca en naranja sólido.
//
// Honra `prefers-reduced-motion` vía `useReducedMotion`: en ese caso
// salta sin animación al hacer click en un marker.

'use client'

import { motion, useScroll, useReducedMotion } from 'framer-motion'

export interface ProgressRailSection {
  slug:   string
  title:  string
  number: number
}

export interface ProgressRailProps {
  /** Lista de secciones para los markers. */
  sections: ProgressRailSection[]
  /** Slug actualmente activo (por IntersectionObserver) — destaca el marker. */
  activeSlug?: string
  className?: string
}

export function ProgressRail({ sections, activeSlug, className = '' }: ProgressRailProps) {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()

  const scrollToSlug = (slug: string) => {
    const el = document.getElementById(slug)
    if (!el) return
    el.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block:    'start',
    })
  }

  if (sections.length === 0) return null

  return (
    <nav
      aria-label="Progreso de lectura"
      className={[
        'fixed left-0 top-0 z-40 hidden h-screen w-1 md:flex md:flex-col',
        className,
      ].join(' ')}
    >
      {/* Track */}
      <div className="relative h-full w-full bg-bg-tinted">
        {/* Fill — scaleY sincronizado con scrollYProgress (0..1) */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 origin-top bg-accent-orange"
          style={{ height: '100%', scaleY: scrollYProgress }}
        />

        {/* Section markers — equiespaciados sobre el track */}
        {sections.map((s, i) => {
          const yPct  = sections.length === 1 ? 50 : (i / (sections.length - 1)) * 100
          const active = s.slug === activeSlug
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => scrollToSlug(s.slug)}
              style={{ top: `${yPct}%` }}
              className={[
                'absolute left-1/2 -translate-x-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                'h-3 w-3 rounded-full border-2 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2',
                active
                  ? 'border-accent-orange bg-accent-orange shadow-md'
                  : 'border-border-default bg-bg-surface hover:border-accent-orange',
              ].join(' ')}
              aria-label={`Ir a sección ${s.number}: ${s.title}`}
              aria-current={active ? 'true' : undefined}
              title={`${String(s.number).padStart(2, '0')} · ${s.title}`}
            />
          )
        })}
      </div>
    </nav>
  )
}
