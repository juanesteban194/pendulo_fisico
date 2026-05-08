// ─── Sección 4 — La barra rígida: momento de inercia ─────────────────────────

import { SectionShell, EquationBlock, DataReadout } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { NumericExercise } from '@/components/Exercises'

// Datos del laboratorio
const L   = 0.25
const M_B = 0.020
const M_E = 0.075
const I_bar  = (1 / 3) * M_B * L * L
const I_mass = M_E * L * L
const I_total = I_bar + I_mass

export function S4MomentoInercia() {
  return (
    <SectionShell
      slug="momento-inercia"
      number={4}
      eyebrow="Capítulo 4"
      title="La barra rígida — momento de inercia"
      estimatedTime="10 min"
    >
      <InlineStage slug="momento-inercia" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">¿Por qué es más difícil girar un martillo agarrado del extremo que del mango?</span>
          {' '}La respuesta está en el momento de inercia — el equivalente rotacional de la masa.
        </p>
      </div>

      <p>
        Hasta ahora teníamos una masa puntual en el extremo de una cuerda sin masa.
        En el laboratorio real, la barra de MDF tiene masa distribuida a lo largo de
        toda su longitud. Eso cambia la resistencia al movimiento rotacional.
      </p>

      {/* Definición */}
      <h3 className="text-lg font-semibold text-text-primary">¿Qué es el momento de inercia?</h3>

      <p>
        Así como la masa m cuantifica la resistencia a acelerarse en línea recta,
        el momento de inercia I cuantifica la resistencia a la aceleración angular.
        Depende de cuánta masa hay y de <em>cuán lejos está del eje de rotación</em>:
      </p>

      <EquationBlock
        latex={String.raw`I = \int r^2 \, dm`}
        annotation="Definición general. Cada elemento de masa dm contribuye con r² (distancia al eje al cuadrado). Masa lejos del eje → mayor I."
        number="4.1"
      />

      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">Analogía — el bailarín</p>
        <p className="text-sm text-text-secondary">
          Un patinador que gira recoge los brazos para girar más rápido. Al estirarlos, frena.
          Al alejar la masa del eje, aumenta I → disminuye ω (conservación del momento angular).
          En el péndulo: cambiar la posición de la masa en el extremo cambia I y por tanto T.
        </p>
      </div>

      {/* Resultados específicos */}
      <h3 className="text-lg font-semibold text-text-primary">Para nuestro péndulo del laboratorio</h3>

      <p>
        El sistema tiene dos partes: la barra de MDF y la masa puntual en el extremo.
        Los momentos de inercia se suman:
      </p>

      <EquationBlock
        latex={String.raw`I_{\text{barra}} = \frac{1}{3}\,m_b\,L^2`}
        annotation="Barra uniforme delgada que gira alrededor de un extremo. El factor 1/3 viene de integrar r² desde 0 hasta L."
        number="4.2"
      />

      <EquationBlock
        latex={String.raw`I_{\text{masa}} = m_e\,L^2`}
        annotation="Masa puntual a distancia L del eje. Todo su contenido está a la misma distancia."
        number="4.3"
      />

      <EquationBlock
        latex={String.raw`I_{\text{total}} = I_{\text{barra}} + I_{\text{masa}} = \frac{1}{3}\,m_b\,L^2 + m_e\,L^2`}
        annotation="El principio de superposición permite sumar los momentos de inercia de partes independientes."
        number="4.4"
      />

      {/* Valores del laboratorio */}
      <div className="space-y-1 rounded-lg border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">Valores del laboratorio (L=0.25 m, m_b=0.020 kg, m_e=0.075 kg)</p>
        <DataReadout label="I — barra"  symbol="I_b" value={I_bar}   unit="kg·m²" exponential color="blue" />
        <DataReadout label="I — masa"   symbol="I_m" value={I_mass}  unit="kg·m²" exponential color="purple" />
        <DataReadout label="I — total"  symbol="I"   value={I_total} unit="kg·m²" exponential color="orange" />
      </div>

      {/* Ejercicio */}
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
        <p className="ui-label mb-3">Ejercicio 4.1 — Calcula I con los datos reales</p>
        <p className="mb-3 text-sm text-text-secondary">
          Aplica las ecuaciones 4.2, 4.3 y 4.4. Datos: L = 0.25 m, m_b = 0.020 kg, m_e = 0.075 kg.
        </p>
        <NumericExercise
          id="s4-inertia-lab"
          unit="kg·m²"
          prompt="Calcula I_total para el péndulo del laboratorio. Resultado en kg·m²."
        />
      </div>

      {/* Nota sobre el resultado */}
      <p className="text-sm text-text-tertiary">
        Nota: <span className="font-mono text-accent-orange">{I_total.toExponential(4)} kg·m²</span> puede parecer
        un número pequeño, pero es exactamente el que el simulador usa para calcular el período.
        En la próxima sección veremos cómo conectarlo con la ecuación de movimiento completa.
      </p>
    </SectionShell>
  )
}
