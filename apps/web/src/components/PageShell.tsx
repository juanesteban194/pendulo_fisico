// ─── <PageShell /> ───────────────────────────────────────────────────────────
//
// Layout maestro de la página educativa. Lo importante:
//   • Columna izquierda (45%, sticky) con el SVG que se arma → StickyStage.
//   • Columna derecha (55%) con el contenido scrolleable (children).
//   • Rail de progreso vertical (4 px) en el borde izquierdo absoluto.
//   • MiniMap colapsable en la esquina superior derecha.
//
// En mobile (< md) la columna sticky desaparece; cada sección incluye su
// propio InlineStage al inicio.
//
// El SessionProvider envuelve todo para que cualquier ejercicio en MDX pueda
// leer el sessionId del navegador.

'use client'

import { type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ProgressRail, type ProgressRailSection } from '@pendulo/ui'
import { useStageStore } from '@/store/stageStore'
import { useActiveSection } from '@/hooks/useActiveSection'
import { SessionProvider } from './SessionContext'
import { StickyStage }     from './StickyStage'
import { MiniMap }         from './MiniMap'

interface ActiveSectionBadgeProps {
  sections: ProgressRailSection[]
  activeSlug?: string
}

function ActiveSectionBadge({ sections, activeSlug }: ActiveSectionBadgeProps) {
  const reduce = useReducedMotion()
  const active = sections.find(s => s.slug === activeSlug)
  if (!active) return null

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={active.slug}
        initial={reduce ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: 4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="ml-auto hidden items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-xs sm:inline-flex"
      >
        <span className="font-mono font-medium tabular-nums text-accent-orange">
          {String(active.number).padStart(2, '0')}
        </span>
        <span className="text-text-secondary">{active.title}</span>
      </motion.span>
    </AnimatePresence>
  )
}

export interface PageShellProps {
  /** Lista de secciones para Rail + MiniMap + activeSection. */
  sections: ProgressRailSection[]
  /** SectionShells renderizados (server-side). */
  children: ReactNode
}

export function PageShell({ sections, children }: PageShellProps) {
  const activeSlug = useStageStore(s => s.activeSlug)

  // Activa el observador de IntersectionObserver
  useActiveSection(sections.map(s => s.slug))

  return (
    <SessionProvider>
      {/* Rail vertical 56px (izquierda) */}
      <ProgressRail sections={sections} activeSlug={activeSlug} />

      {/* MiniMap colapsable */}
      <MiniMap entries={sections} />

      {/* Header global slim — desplazado a la derecha del rail (md+) */}
      <header className="fixed left-0 right-0 top-0 z-30 hidden border-b border-border-subtle bg-bg-surface/85 backdrop-blur md:block md:pl-14">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-3 px-6">
          <span className="ui-label flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-success" />
            </span>
            Péndulo Físico
          </span>
          <span className="text-xs text-text-tertiary">
            Universidad de Medellín · Física II · 2025-2
          </span>
          {/* Breadcrumb del capítulo actual */}
          <ActiveSectionBadge sections={sections} activeSlug={activeSlug} />
        </div>
      </header>

      {/* Layout principal — padding-left compensa el rail (56px) */}
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[minmax(0,_45%)_minmax(0,_55%)] md:pl-14 md:pt-12">
        {/* Columna izquierda: stage sticky (solo desktop) */}
        <StickyStage />

        {/* Columna derecha: contenido scrollable */}
        <main className="px-6 pb-32 md:px-12 md:pl-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
