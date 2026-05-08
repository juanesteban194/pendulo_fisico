// ─── Sección 6 — Amortiguamiento: el péndulo en el mundo real ────────────────

import { SectionShell, EquationBlock, DataReadout } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { NumericExercise, MultipleChoiceExercise } from '@/components/Exercises'

// Parámetros del simulador
const L    = 0.25
const M_B  = 0.020
const M_E  = 0.075
const G    = 9.78
const M    = M_B + M_E
const D    = (M_B * L / 2 + M_E * L) / M
const I    = (1 / 3) * M_B * L ** 2 + M_E * L ** 2
const B    = 6.041e-4      // N·m·s — del simulador
const OMEGA0 = Math.sqrt(M * G * D / I)
const TAU    = 2 * I / B
const OMEGA_D = Math.sqrt(OMEGA0 ** 2 - (B / (2 * I)) ** 2)
const Q      = OMEGA0 * TAU / 2

export function S6Amortiguamiento() {
  return (
    <SectionShell
      slug="amortiguamiento"
      number={6}
      eyebrow="Capítulo 6"
      title="Amortiguamiento — el péndulo en el mundo real"
      estimatedTime="12 min"
    >
      <InlineStage slug="amortiguamiento" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">La cuerda de una guitarra que se afina.</span>
          {' '}Al pulsar la cuerda, vibra fuerte y el sonido se va apagando
          gradualmente. El péndulo físico hace lo mismo: el aire y la fricción del pivote
          se llevan energía con cada oscilación. Eventualmente se detiene.
        </p>
      </div>

      <p>
        El péndulo ideal de los capítulos anteriores oscila para siempre.
        El real no. Dos mecanismos disipan su energía:
      </p>
      <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
        <li><strong>Arrastre del fluido</strong> (aire): la barra y la masa empujan el aire al moverse.</li>
        <li><strong>Fricción del pivote</strong>: pequeño pero no despreciable en mediciones largas.</li>
      </ul>

      {/* Ecuación amortiguada */}
      <h3 className="text-lg font-semibold text-text-primary">La ecuación amortiguada</h3>

      <EquationBlock
        latex={String.raw`I\,\ddot{\theta} + b\,\dot{\theta} + M\,g\,d\,\sin(\theta) = 0`}
        annotation="El término b·θ̇ es el torque de amortiguamiento. b es el coeficiente de amortiguamiento (N·m·s). Proporcional a la velocidad angular."
        number="6.1"
      />

      {/* Solución sub-amortiguada */}
      <EquationBlock
        latex={String.raw`\theta(t) = \theta_0\,e^{-t/\tau}\cos(\omega_d\,t + \varphi)`}
        annotation="Solución para el caso sub-amortiguado (b pequeño): oscilación coseno con amplitud que decae exponencialmente."
        number="6.2"
      />

      {/* Tiempo de decaimiento */}
      <EquationBlock
        latex={String.raw`\tau = \frac{2I}{b}`}
        annotation="Tiempo de decaimiento: en t=τ, la amplitud ha caído al 37% del valor inicial. Cuanto mayor b, más rápido decae."
        number="6.3"
      />

      {/* Frecuencia amortiguada */}
      <EquationBlock
        latex={String.raw`\omega_d = \sqrt{\omega_0^2 - \left(\frac{b}{2I}\right)^2}`}
        annotation="La oscilación amortiguada es un poco más lenta que la libre. Para Q >> 1 (caso del laboratorio), ωd ≈ ω₀."
        number="6.4"
      />

      {/* Factor de calidad */}
      <EquationBlock
        latex={String.raw`Q = \frac{\omega_0\,\tau}{2} = \frac{\omega_0\,I}{b}`}
        annotation="El factor de calidad Q indica cuántas oscilaciones completa el péndulo antes de perder energía significativa. Mayor Q = menos amortiguamiento."
        number="6.5"
      />

      {/* Número de Reynolds */}
      <h3 className="text-lg font-semibold text-text-primary">El régimen de flujo</h3>

      <EquationBlock
        latex={String.raw`Re = \frac{\rho\,v\,L_c}{\mu}`}
        annotation="Número de Reynolds: clasifica el régimen de flujo (laminar, transición, turbulento). Para el péndulo del lab en aire, Re ≈ 10³ → régimen transicional."
        number="6.6"
      />

      {/* Valores del simulador */}
      <div className="space-y-1 rounded-lg border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">Parámetros de amortiguamiento del simulador</p>
        <DataReadout label="coef. amortiguamiento" symbol="b"  value={B}       unit="N·m·s"  exponential color="blue" />
        <DataReadout label="ω₀ — frecuencia natural" symbol="ω₀" value={OMEGA0} unit="rad/s" digits={4} />
        <DataReadout label="τ — tiempo de decaimiento" symbol="τ" value={TAU}   unit="s"     digits={1} color="orange" />
        <DataReadout label="ω_d — frecuencia amortiguada" symbol="ω_d" value={OMEGA_D} unit="rad/s" digits={4} color="purple" />
        <DataReadout label="Q — factor de calidad"  symbol="Q"  value={Q}       unit=""      digits={1} color="green" />
      </div>

      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">¿Qué significa Q ≈ 54?</p>
        <p className="text-sm text-text-secondary">
          El péndulo de MDF en aire completa unas{' '}
          <span className="font-mono text-accent-orange">Q/π ≈ 17 oscilaciones</span>{' '}
          antes de que su amplitud caiga a la mitad. En comparación, un péndulo sumergido en agua
          tendría Q &lt; 5 — visible a simple vista en segundos.
        </p>
      </div>

      {/* Ejercicios */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 6.1 — Calcula Q</p>
          <NumericExercise
            id="s6-quality-factor"
            unit=""
            prompt={`Con τ = ${TAU.toFixed(1)} s y ω₀ = ${OMEGA0.toFixed(4)} rad/s, calcula Q = ω₀·τ/2.`}
          />
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 6.2 — Comparación de fluidos</p>
          <MultipleChoiceExercise
            id="s6-which-fluid-damps-most"
            prompt="¿Qué medio hace que el péndulo del laboratorio se detenga más rápido?"
            options={[
              'Aire (η ≈ 1.8×10⁻⁵ Pa·s)',
              'Agua (η ≈ 1×10⁻³ Pa·s)',
              'Glicerina (η ≈ 1.5 Pa·s a 20°C)',
              'Vacío (sin amortiguamiento)',
            ]}
          />
        </div>
      </div>
    </SectionShell>
  )
}
