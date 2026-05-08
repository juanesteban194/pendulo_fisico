// ─── Sección 2 — La cuerda ideal: péndulo simple ─────────────────────────────

import { SectionShell, EquationBlock } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { NumericExercise, MultipleChoiceExercise } from '@/components/Exercises'
import { SmallAngleChart } from '@/components/charts/SmallAngleChart'
import { SimplePendulumSlider } from '@/sections/SimplePendulumSlider'

export function S2PenduloSimple() {
  return (
    <SectionShell
      slug="pendulo-simple"
      number={2}
      eyebrow="Capítulo 2"
      title="La cuerda ideal — el péndulo simple"
      estimatedTime="10 min"
    >
      <InlineStage slug="pendulo-simple" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Galileo midió el período de las lámparas de la catedral de Pisa con su pulso.</span>
          {' '}Notó algo extraño: dos lámparas idénticas oscilaban al mismo ritmo aunque
          empezaran con amplitudes muy distintas. ¿Por qué?
        </p>
      </div>

      <p>
        El modelo más sencillo de péndulo es el <strong>péndulo matemático</strong>:
        una masa puntual al final de una cuerda sin masa, sin fricción, sin volumen.
        Física ideal — útil para entender la intuición antes de añadir complejidad.
      </p>

      {/* Aproximación ángulos pequeños */}
      <h3 className="text-lg font-semibold text-text-primary">La clave: ángulos pequeños</h3>

      <p>
        La fuerza que restaura el péndulo al equilibrio es proporcional a{' '}
        <code className="rounded bg-bg-elevated px-1 font-mono text-sm">sin(θ)</code>.
        Para ángulos pequeños, sin(θ) es casi idéntico a θ medido en radianes:
      </p>

      <EquationBlock
        latex={String.raw`\sin(\theta) \approx \theta \quad (\theta \text{ en radianes, } \theta \lesssim 15°)`}
        annotation="Esta es la piedra angular de la física de oscilaciones. Sin esta aproximación, la ecuación no tiene solución analítica."
        number="2.1"
      />

      <SmallAngleChart />

      {/* Ecuación de movimiento */}
      <h3 className="text-lg font-semibold text-text-primary">Ecuación de movimiento</h3>

      <EquationBlock
        latex={String.raw`\ddot{\theta} + \frac{g}{L}\sin(\theta) = 0`}
        annotation="Ecuación exacta del péndulo simple. No tiene solución en funciones elementales para amplitudes grandes."
        number="2.2"
      />

      <EquationBlock
        latex={String.raw`\ddot{\theta} + \omega_0^2\,\theta = 0 \quad\text{con}\quad \omega_0^2 = \frac{g}{L}`}
        annotation="Versión linealizada (ángulos pequeños). Tiene solución analítica: θ(t) = θ₀ cos(ω₀ t)."
        number="2.3"
      />

      {/* Período */}
      <h3 className="text-lg font-semibold text-text-primary">El período sorprendente</h3>

      <EquationBlock
        latex={String.raw`T = 2\pi\sqrt{\frac{L}{g}}`}
        annotation="El período solo depende de la longitud L y de la gravedad g. La masa del extremo no aparece — eso fue la observación de Galileo."
        number="2.4"
      />

      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">Analogía con el resorte</p>
        <p className="text-sm text-text-secondary">
          La ecuación 2.3 (<code className="font-mono text-xs">θ̈ + ω₀²θ = 0</code>) es
          idéntica a la del resorte masa-resorte (<code className="font-mono text-xs">ẍ + k/m · x = 0</code>).
          Ambos son <em>osciladores armónicos simples</em>. La única diferencia es qué significa
          ω₀: en el resorte es √(k/m), en el péndulo es √(g/L).
        </p>
      </div>

      {/* Slider interactivo */}
      <SimplePendulumSlider />

      {/* Ejercicios */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 2.1 — Diseña el péndulo de un reloj</p>
          <NumericExercise
            id="s2-length-for-T1"
            unit="m"
            prompt="¿Cuánto debe medir L para que T = 1 s exacto en Medellín (g = 9.78 m/s²)? Despeja L de la ecuación 2.4."
          />
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 2.2 — La masa no importa</p>
          <MultipleChoiceExercise
            id="s2-mass-independence"
            prompt="¿Por qué la masa del extremo no aparece en T = 2π√(L/g)?"
            options={[
              'Porque la masa es demasiado pequeña para importar',
              'Porque la fuerza gravitacional es proporcional a la masa, pero la inercia también — se cancelan en la ecuación de movimiento',
              'Porque el período depende del volumen, no de la masa',
              'Porque la fricción compensa la diferencia de masa',
            ]}
          />
        </div>
      </div>
    </SectionShell>
  )
}
