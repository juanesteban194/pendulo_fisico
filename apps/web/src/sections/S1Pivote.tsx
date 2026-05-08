// ─── Sección 1 — El pivote y la idea de oscilación ───────────────────────────

import { SectionShell, EquationBlock, DataReadout } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { NumericExercise } from '@/components/Exercises'

export function S1Pivote() {
  return (
    <SectionShell
      slug="pivote"
      number={1}
      eyebrow="Capítulo 1"
      title="El pivote y la idea de oscilación"
      estimatedTime="6 min"
    >
      <InlineStage slug="pivote" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">¿Por qué un columpio largo se balancea más despacio?</span>
          {' '}Antes de responder eso con una ecuación, necesitamos un lenguaje común.
        </p>
      </div>

      {/* Concepto */}
      <p>
        Fija un punto en el espacio. Cuélga de él cualquier objeto. Dale un empujón.
        El objeto irá y vendrá, siempre alrededor de su posición de reposo.
        Eso es <strong>movimiento oscilatorio</strong> — el fenómeno que estudiaremos
        durante toda esta página.
      </p>

      <p>
        Tres cantidades describen completamente el ritmo de cualquier oscilación:
      </p>

      {/* Período */}
      <EquationBlock
        latex={String.raw`T = \frac{\text{tiempo total}}{\text{número de oscilaciones}}`}
        annotation="El período T es el tiempo en segundos de una oscilación completa: ida y vuelta."
        number="1.1"
      />

      {/* Frecuencia */}
      <EquationBlock
        latex={String.raw`f = \frac{1}{T}`}
        annotation="La frecuencia f (en Hz) cuenta cuántas oscilaciones ocurren cada segundo."
        number="1.2"
      />

      {/* Frecuencia angular */}
      <EquationBlock
        latex={String.raw`\omega = \frac{2\pi}{T} = 2\pi f`}
        annotation="La frecuencia angular ω (en rad/s) es útil porque aparece naturalmente en las ecuaciones de movimiento."
        number="1.3"
      />

      {/* Analogía */}
      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">Analogía</p>
        <p className="text-sm text-text-secondary">
          Piensa en un reloj de péndulo. El segundero da una vuelta cada 60 s → f = 1/60 Hz.
          El péndulo que mueve el reloj tiene T mucho menor — un buen reloj de pie usa T = 1 s exacto.
          La precisión del reloj depende de que T no cambie ni un milisegundo por hora.
        </p>
      </div>

      {/* Magnitudes del lab */}
      <div className="space-y-1 rounded-lg border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">Datos del laboratorio (10 oscilaciones)</p>
        <DataReadout label="tiempo total medido" symbol="t" value={9.847} unit="s" digits={3} />
        <DataReadout label="número de oscilaciones" symbol="N" value={10} unit="" digits={0} />
        <DataReadout label="período calculado" symbol="T" value={0.9847} unit="s" digits={4} color="orange" />
        <DataReadout label="frecuencia" symbol="f" value={1 / 0.9847} unit="Hz" digits={4} color="blue" />
        <DataReadout label="frecuencia angular" symbol="ω" value={2 * Math.PI / 0.9847} unit="rad/s" digits={4} color="purple" />
      </div>

      {/* Ejercicio */}
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
        <p className="ui-label mb-3">Ejercicio 1.1 — Con los datos reales del laboratorio</p>
        <NumericExercise
          id="s1-period-from-count"
          unit="s"
          prompt="El péndulo del laboratorio completó 10 oscilaciones en 9.847 s. ¿Cuánto vale el período T en segundos?"
        />
      </div>
    </SectionShell>
  )
}
