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
import { ProgressRail, type ProgressRailSection } from '@pendulo/ui'
import { useStageStore } from '@/store/stageStore'
import { useActiveSection } from '@/hooks/useActiveSection'
import { SessionProvider } from './SessionContext'
import { StickyStage }     from './StickyStage'
import { MiniMap }         from './MiniMap'

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
      {/* Rail vertical 4px (esquerda) */}
      <ProgressRail sections={sections} activeSlug={activeSlug} className="ml-1" />

      {/* MiniMap colapsable */}
      <MiniMap entries={sections} />

      {/* Header global slim */}
      <header className="fixed left-0 right-0 top-0 z-30 hidden border-b border-border-subtle bg-bg-surface/85 backdrop-blur md:block">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-3 px-6">
          <span className="ui-label flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-status-success" />
            Péndulo Físico
          </span>
          <span className="text-xs text-text-tertiary">
            Universidad de Medellín · Física II · 2025-2
          </span>
        </div>
      </header>

      {/* Layout principal */}
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[minmax(0,_45%)_minmax(0,_55%)] md:pt-12">
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
