// ─── Sección 7 — Integración numérica: RK4 ────────────────────────────────────

import { SectionShell, EquationBlock } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { MultipleChoiceExercise } from '@/components/Exercises'
import { NumericalChart } from '@/components/charts/NumericalChart'

export function S7RK4() {
  return (
    <SectionShell
      slug="rk4"
      number={7}
      eyebrow="Capítulo 7"
      title="Integración numérica — cómo simula el computador"
      estimatedTime="10 min"
    >
      <InlineStage slug="rk4" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Preguntar la dirección una vez vs. cuatro veces.</span>
          {' '}Imagina que estás en un laberinto con curvas. Si solo preguntas al inicio del
          pasillo, puedes equivocarte. Si preguntas 4 veces durante el recorrido y promedias,
          aciertas casi siempre. RK4 hace exactamente eso con las ecuaciones diferenciales.
        </p>
      </div>

      <p>
        La ecuación diferencial del péndulo físico amortiguado no tiene solución analítica
        exacta para amplitudes grandes. El computador la resuelve paso a paso:
        dado el estado <code className="rounded bg-bg-elevated px-1 font-mono text-xs">[θ, ω]</code> en
        el instante t, predice el estado en <code className="rounded bg-bg-elevated px-1 font-mono text-xs">t + Δt</code>.
      </p>

      {/* Euler */}
      <h3 className="text-lg font-semibold text-text-primary">El método más simple: Euler explícito</h3>

      <EquationBlock
        latex={String.raw`\theta_{n+1} = \theta_n + \omega_n\,\Delta t \qquad \omega_{n+1} = \omega_n + \alpha_n\,\Delta t`}
        annotation="Euler usa la derivada al inicio del paso para predecir el siguiente punto. Simple, pero acumula error rápidamente."
        number="7.1"
      />

      <p>
        El problema de Euler: usa la "pendiente" de un solo punto. Si la curva tiene
        curvatura, ese único punto no la representa bien, y el error se acumula.
        Con Δt grande, la energía total crece sin control — el péndulo "explota".
      </p>

      {/* RK4 */}
      <h3 className="text-lg font-semibold text-text-primary">Runge-Kutta de orden 4 (RK4)</h3>

      <p>
        RK4 evalúa la derivada en 4 puntos diferentes del intervalo [t, t+Δt]
        y promedia el resultado ponderado:
      </p>

      <EquationBlock
        latex={String.raw`
          k_1 = f(y_n),\quad
          k_2 = f\!\left(y_n + \tfrac{\Delta t}{2}k_1\right),\quad
          k_3 = f\!\left(y_n + \tfrac{\Delta t}{2}k_2\right),\quad
          k_4 = f\!\left(y_n + \Delta t\,k_3\right)
        `}
        annotation="Las cuatro evaluaciones de la derivada: al inicio, dos veces en el centro y al final del intervalo."
        number="7.2"
      />

      <EquationBlock
        latex={String.raw`y_{n+1} = y_n + \frac{\Delta t}{6}\left(k_1 + 2k_2 + 2k_3 + k_4\right)`}
        annotation="El nuevo valor se obtiene promediando los cuatro k con pesos 1:2:2:1. Error local O(Δt⁵) — mucho mejor que el O(Δt²) de Euler."
        number="7.3"
      />

      {/* Comparación de errores */}
      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">Orden de error — ¿por qué importa?</p>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex items-center justify-between">
            <span>Euler explícito</span>
            <span className="font-mono text-status-error">Error local O(Δt²)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>RK4</span>
            <span className="font-mono text-accent-green">Error local O(Δt⁵)</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          Con Δt = 0.01 s: error de Euler ≈ 10⁻⁴, error de RK4 ≈ 10⁻¹⁰.
          La diferencia de 6 órdenes de magnitud justifica los 4x más cómputo por paso.
        </p>
      </div>

      {/* Gráfica interactiva */}
      <NumericalChart />

      {/* El simulador usa RK4 con dt = 1ms */}
      <div className="rounded-md border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">El simulador de esta plataforma</p>
        <p className="text-sm text-text-secondary">
          Usa RK4 con{' '}
          <span className="font-mono text-accent-orange">Δt = 1 ms</span>{' '}
          (1 000 pasos por segundo). En cada frame de 60 Hz, ejecuta
          {' '}<span className="font-mono text-accent-orange">~16 pasos RK4</span>{' '}
          para cubrir los ~16 ms del frame. Esto garantiza estabilidad
          incluso con amplitudes grandes (90°+).
        </p>
      </div>

      {/* Ejercicio */}
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
        <p className="ui-label mb-3">Ejercicio 7.1 — Conservación de energía</p>
        <MultipleChoiceExercise
          id="s7-rk4-vs-euler"
          prompt="¿Por qué RK4 conserva mejor la energía del péndulo que Euler explícito?"
          options={[
            'Porque usa 4 evaluaciones de la derivada por paso y promedia, reduciendo el error local a O(Δt⁵)',
            'Porque usa un Δt más pequeño automáticamente',
            'Porque aplica corrección de energía en cada paso',
            'Porque es más rápido y puede usar más pasos en el mismo tiempo',
          ]}
        />
      </div>
    </SectionShell>
  )
}
