// ─── Sección 8 — El simulador completo ───────────────────────────────────────
//
// Fase E migrará el simulador R3F desde apps/simulator-2d/ a este espacio.
// Por ahora incluye el contenido de los 5 retos finales y un placeholder
// con instrucciones para correr el simulador en modo independiente.

import { SectionShell, EquationBlock } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { SimulatorEmbed } from '@/sections/SimulatorEmbed'

export function S8Simulador() {
  return (
    <SectionShell
      slug="simulador"
      number={8}
      eyebrow="Capítulo 8"
      title="El simulador completo"
      estimatedTime="15 min"
    >
      <InlineStage slug="simulador" />

      <p>
        Llegaste al final del viaje. Todos los conceptos que construiste —
        pivote, período, inercia, centro de masa, amortiguamiento, RK4 —
        convergen en este simulador que puede reproducir el comportamiento
        del péndulo real del laboratorio.
      </p>

      {/* Simulador embebido */}
      <SimulatorEmbed />

      {/* Retos finales */}
      <div className="mt-10">
        <p className="ui-label mb-4">5 retos finales — combina todos los conceptos</p>

        <div className="space-y-4">
          {RETOS.map((r, i) => (
            <div key={i} className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-accent-orange">
                  Reto {i + 1}
                </span>
                <span className="ui-label">{r.tag}</span>
              </div>
              <p className="text-sm text-text-primary">{r.prompt}</p>
              {r.hint && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-text-tertiary hover:text-text-secondary">
                    Ver pista
                  </summary>
                  <p className="mt-2 text-xs text-text-secondary">{r.hint}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cierre */}
      <div className="mt-8 rounded-md border border-accent-orange/20 bg-accent-orange-soft px-5 py-5">
        <p className="font-semibold text-text-primary">Has construido un péndulo físico completo.</p>
        <p className="mt-2 text-sm text-text-secondary">
          Empezaste con un punto en el espacio. Terminaste con un modelo que integra
          mecánica newtoniana, energía, inercia, fluidos y métodos numéricos.
          Los mismos principios que gobiernan el péndulo de laboratorio gobiernan
          el movimiento de los planetas, los puentes colgantes y los giroscopios
          de los teléfonos.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Universidad de Medellín · Física II · 2025-2</span>
          {' '}— Esteban Echavarría
        </p>
      </div>
    </SectionShell>
  )
}

const RETOS = [
  {
    tag: 'Optimización',
    prompt: 'Encuentra la longitud L que minimiza T para una masa de extremo m_e = 0.075 kg y masa de barra m_b = 0.020 kg fija. Pista: ¿existe un mínimo real o T siempre decrece con L?',
    hint: 'T = 2π√(I/(Mgd)). Derivando dT/dL e igualando a cero encontrarás que T es monótonamente decreciente con L para este sistema — no hay mínimo local. El mínimo práctico está limitado por la longitud mínima física.',
  },
  {
    tag: 'Amortiguamiento comparado',
    prompt: 'Usa el simulador para comparar cuántas oscilaciones tarda el péndulo en perder el 50% de su amplitud en aire vs. agua. ¿Cuántas veces más rápido amortigua el agua?',
    hint: 'La amplitud cae al 50% cuando e^(-t/τ) = 0.5, es decir t₁₂ = τ·ln(2). Compara τ_aire ≈ 16.9 s con τ_agua que el simulador calcula.',
  },
  {
    tag: 'Diseño de péndulo',
    prompt: 'Diseña un péndulo físico (barra + masa en el extremo) con T = 2.000 s exacto en Medellín (g = 9.78 m/s²). Encuentra las dimensiones L, m_b, m_e que consigan ese período. Verifica con el simulador.',
    hint: 'Hay infinitas soluciones. Una estrategia: fija la razón m_e/m_b y despeja L numéricamente de T = 2π√(I/(Mgd)) = 2.',
  },
  {
    tag: 'Factor de calidad',
    prompt: 'Mide Q directamente del simulador: usa θ₀ = 20°, modo Sin amortiguamiento → observa cuántos períodos tarda la energía en caer al 1/e² del valor inicial.',
    hint: 'Q = ω₀·I/b. La energía (proporcional a θ²) cae como e^(-2t/τ). En t = τ la amplitud está al 37%, en t = τ/2 al 60%. Cuenta oscilaciones.',
  },
  {
    tag: 'Predicción del período',
    prompt: 'Si duplicas la masa del extremo (m_e = 0.150 kg) manteniendo L = 0.25 m y m_b = 0.020 kg — ¿cuánto cambia T? Predice el resultado con las fórmulas antes de verificar con el simulador.',
    hint: 'Calcula el nuevo d, I y T con m_e = 0.150. El período disminuirá porque la masa adicional aleja más el CM del pivote (d aumenta más que I).',
  },
]
