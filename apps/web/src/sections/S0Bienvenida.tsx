// ─── Sección 0 — Hero de bienvenida ─────────────────────────────────────────

import { InlineStage } from '@/components/InlineStage'

export function S0Bienvenida() {
  return (
    <section
      id="bienvenida"
      data-section-slug="bienvenida"
      data-section-number="0"
      className="relative flex min-h-[calc(100vh-3rem)] flex-col justify-center scroll-mt-12 py-20"
      aria-labelledby="bienvenida-heading"
    >
      {/* En mobile aparece el punto/pivote inline antes del texto */}
      <InlineStage slug="bienvenida" />

      <div className="space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-xs font-medium text-accent-orange">00</span>
          <p className="ui-label">Universidad de Medellín · Física II · 2025-2</p>
        </div>

        <h1
          id="bienvenida-heading"
          className="font-sans text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl"
        >
          Construyamos un péndulo físico{' '}
          <span className="text-accent-orange">desde cero.</span>
        </h1>

        <p className="max-w-prose text-lg leading-relaxed text-text-secondary">
          Empezamos con un punto solitario en el espacio. Al terminar, tendrás
          todos los conceptos para entender, calcular y simular un péndulo
          físico real — el mismo que medimos en el laboratorio.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <a
            href="#pivote"
            className="inline-flex items-center gap-2 rounded-md bg-accent-orange px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2"
          >
            Comenzar
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3L13 8L8 13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <span className="text-sm text-text-tertiary">8 capítulos · ~45 min</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border-subtle pt-6 sm:grid-cols-4">
          {[
            { num: '8', label: 'capítulos' },
            { num: 'g = 9.78', label: 'm/s² — Medellín' },
            { num: 'T ≈ 0.985', label: 's calculado' },
            { num: '5.3%', label: 'discrepancia lab.' },
          ].map(({ num, label }) => (
            <div key={label} className="space-y-0.5">
              <p className="font-mono text-lg font-medium text-accent-orange">{num}</p>
              <p className="text-xs text-text-tertiary">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden flex-col items-center gap-1 md:flex" aria-hidden>
        <span className="text-xs text-text-tertiary">scroll</span>
        <div className="h-5 w-px bg-gradient-to-b from-text-tertiary to-transparent" />
      </div>
    </section>
  )
}
