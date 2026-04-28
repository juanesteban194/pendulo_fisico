// ─── PÁGINA HOME — DEMO DE COMPONENTES UI (6 piezas) ─────────────────────────
//
// Smoke + showcase de los componentes en @pendulo/ui:
//   1. EquationBlock     ✓
//   2. DataReadout       ✓
//   3. ParameterSlider   ✓
//   4. SectionShell      ✓ (3 secciones de demo)
//   5. ProgressRail      ✓ (barra naranja a la izquierda, 3 markers)
//   6. NumericExercise   ✓ (consulta real al API en :4000 vía rewrites)
//
// Esta página NO es la home final — es una demo. La home definitiva
// (sticky stage SVG + 9 SectionShells reales con MDX) llega en Fase D.

'use client'

import { useEffect, useState } from 'react'
import {
  EquationBlock,
  DataReadout,
  ParameterSlider,
  SectionShell,
  ProgressRail,
  NumericExercise,
  type ProgressRailSection,
} from '@pendulo/ui'
import {
  computeInertia,
  computeCenterOfMass,
  calculatePeriod,
  LAB_PARAMS,
} from '@pendulo/physics'
import type { PendulumParams } from '@pendulo/physics'

const DEMO_SECTIONS: ProgressRailSection[] = [
  { slug: 'demo-equation', number: 1, title: 'EquationBlock' },
  { slug: 'demo-readout',  number: 2, title: 'DataReadout + ParameterSlider' },
  { slug: 'demo-exercise', number: 3, title: 'NumericExercise (API en vivo)' },
]

export default function HomePage() {
  const [params, setParams] = useState<PendulumParams>(LAB_PARAMS)
  const [activeSlug, setActiveSlug] = useState<string>(DEMO_SECTIONS[0]!.slug)
  const [sessionId, setSessionId] = useState<string | undefined>()

  // Genera un sessionId UUID anónimo y lo persiste en localStorage.
  useEffect(() => {
    const KEY = 'pendulo-session-id'
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    setSessionId(id)
  }, [])

  // Detecta qué SectionShell está más visible para destacar su marker.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // El más alto en el viewport gana
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const slug = visible[0]?.target.getAttribute('data-section-slug')
        if (slug) setActiveSlug(slug)
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    document.querySelectorAll('[data-section-slug]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const T = calculatePeriod(params)
  const M = params.m + params.mr

  return (
    <>
      <ProgressRail sections={DEMO_SECTIONS} activeSlug={activeSlug} />

      <main className="mx-auto max-w-3xl px-6 py-16 md:pl-12">
        <p className="ui-label flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-status-success" />
          Fase C — demo de 6 componentes UI
        </p>

        <header className="mt-3 mb-8 space-y-2">
          <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            Construyamos un péndulo físico desde cero
          </h1>
          <p className="text-text-secondary">
            Universidad de Medellín · Física II · 2025-2
          </p>
          {sessionId && (
            <p className="font-mono text-xs text-text-tertiary">
              session: {sessionId.slice(0, 8)}…
            </p>
          )}
        </header>

        <SectionShell
          slug="demo-equation"
          number={1}
          eyebrow="Demo"
          title="EquationBlock"
          estimatedTime="2 min"
        >
          <p>
            Ecuación KaTeX con anotación opcional y numeración. Renderiza en el
            servidor (sin JS extra en cliente).
          </p>
          <EquationBlock
            latex={String.raw`T = 2\pi\sqrt{\frac{I}{M\,g\,d}}`}
            annotation="Período de un péndulo físico — el péndulo simple es el caso particular con I = mL² y d = L."
            number="5.1"
          />
        </SectionShell>

        <SectionShell
          slug="demo-readout"
          number={2}
          eyebrow="Demo"
          title="DataReadout + ParameterSlider"
          estimatedTime="3 min"
        >
          <p>
            Mueve los sliders y mira las magnitudes derivadas computarse en
            vivo desde <code className="font-mono text-accent-orange">@pendulo/physics</code>.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5 rounded-lg border border-border-subtle bg-bg-surface px-6 py-5 shadow-sm">
              <p className="ui-label">Parámetros</p>
              <ParameterSlider label="Longitud" symbol="L" unit="m"
                value={params.L} min={0.05} max={3.0} step={0.01} digits={2}
                color="orange"
                onChange={v => setParams(p => ({ ...p, L: v }))} />
              <ParameterSlider label="Masa extremo" symbol="m_r" unit="kg"
                value={params.mr} min={0.01} max={10.0} step={0.05} digits={2}
                color="blue"
                onChange={v => setParams(p => ({ ...p, mr: v }))} />
              <ParameterSlider label="Gravedad" symbol="g" unit="m/s²"
                value={params.g} min={1.6} max={24.8} step={0.01} digits={2}
                color="green"
                onChange={v => setParams(p => ({ ...p, g: v }))} />
              <ParameterSlider label="Ángulo inicial" symbol="θ_0" unit="°"
                value={params.theta0 * 180 / Math.PI} min={1} max={90} step={1} digits={0}
                color="purple"
                onChange={v => setParams(p => ({ ...p, theta0: v * Math.PI / 180 }))} />
            </div>

            <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-bg-surface px-6 py-3 shadow-sm">
              <p className="ui-label py-1">Magnitudes</p>
              <DataReadout label="período"            symbol="T" value={T} unit="s"      digits={4} color="orange" />
              <DataReadout label="momento de inercia" symbol="I" value={I} unit="kg·m²" exponential color="blue" />
              <DataReadout label="distancia CM"       symbol="d" value={d} unit="m"      digits={4} />
              <DataReadout label="masa total"         symbol="M" value={M} unit="kg"     digits={3} color="green" />
              <DataReadout label="medio"                         value={params.fluid}                color="purple" />
            </div>
          </div>
        </SectionShell>

        <SectionShell
          slug="demo-exercise"
          number={3}
          eyebrow="Demo"
          title="NumericExercise"
          estimatedTime="4 min"
        >
          <p>
            Pregunta real del laboratorio. Tu respuesta se valida contra el
            backend Fastify (puerto 4000, vía rewrites de Next). Si tienes el
            API arriba (<code className="font-mono">pnpm --filter @pendulo/api dev</code>),
            el botón devuelve feedback verde / amarillo.
          </p>

          <NumericExercise
            id="s5-period-physical"
            sessionId={sessionId}
            unit="s"
            prompt="Calcula T para el péndulo físico real del laboratorio. Datos: L=0.25 m, m=0.020 kg, mᵣ=0.075 kg, g=9.78 m/s². Resultado en segundos."
          />
        </SectionShell>

        <p className="mt-12 text-sm text-text-tertiary">
          Demo de 6 componentes de <code className="font-mono text-accent-orange">@pendulo/ui</code>.
          Las próximas piezas (MultipleChoiceExercise, OpenExercise, PendulumStage)
          y las 9 secciones reales con MDX llegan en la siguiente iteración.
        </p>
      </main>
    </>
  )
}
