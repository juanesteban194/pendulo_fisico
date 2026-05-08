// ─── Sección 5 — El péndulo físico real ──────────────────────────────────────

import { SectionShell, EquationBlock, DataReadout } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { NumericExercise, OpenExercise } from '@/components/Exercises'

// Datos del laboratorio — server-side
const L    = 0.25
const M_B  = 0.020
const M_E  = 0.075
const G    = 9.78
const M    = M_B + M_E
const D    = (M_B * L / 2 + M_E * L) / M
const I    = (1 / 3) * M_B * L ** 2 + M_E * L ** 2
const L_EQ = I / (M * D)
const T_CALC = 2 * Math.PI * Math.sqrt(I / (M * G * D))
const T_LAB  = 1.04
const ERROR  = Math.abs(T_CALC - T_LAB) / T_LAB * 100

export function S5PenduloFisico() {
  return (
    <SectionShell
      slug="pendulo-fisico"
      number={5}
      eyebrow="Capítulo 5"
      title="El péndulo físico real"
      estimatedTime="12 min"
    >
      <InlineStage slug="pendulo-fisico" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Un cronómetro biológico de precisión: las libélulas.</span>
          {' '}Sus alas son barras rígidas, no cuerdas con masas puntuales. Sus vuelos dependen del
          período de vibración real de la estructura, no del modelo ideal. Necesitamos el péndulo físico.
        </p>
      </div>

      <p>
        Un <strong>péndulo físico</strong> es cualquier cuerpo rígido que oscila alrededor
        de un eje que no pasa por su centro de masa. La barra + masa del laboratorio es exactamente eso.
      </p>

      {/* Centro de masa */}
      <h3 className="text-lg font-semibold text-text-primary">Paso 1 — Encontrar el centro de masa</h3>

      <EquationBlock
        latex={String.raw`d = \frac{m_b \cdot \tfrac{L}{2} + m_e \cdot L}{m_b + m_e}`}
        annotation="d es la distancia del pivote al CM del sistema. Es una media ponderada por masa de las posiciones de cada parte."
        number="5.1"
      />

      {/* Ecuación de movimiento */}
      <h3 className="text-lg font-semibold text-text-primary">Paso 2 — Newton rotacional</h3>

      <EquationBlock
        latex={String.raw`I\,\ddot{\theta} = -M\,g\,d\,\sin(\theta)`}
        annotation="El torque gravitacional es −Mgd·sin(θ). El signo negativo indica que restaura al equilibrio. I es el momento de inercia respecto al pivote."
        number="5.2"
      />

      <EquationBlock
        latex={String.raw`\ddot{\theta} + \frac{M\,g\,d}{I}\,\theta = 0 \quad\Rightarrow\quad T = 2\pi\sqrt{\frac{I}{M\,g\,d}}`}
        annotation="Linearizada (ángulos pequeños). Tiene la misma estructura que el péndulo simple, pero con I y d en lugar de mL²  y L."
        number="5.3"
      />

      {/* Longitud equivalente */}
      <h3 className="text-lg font-semibold text-text-primary">La longitud equivalente</h3>

      <EquationBlock
        latex={String.raw`L_{\text{eq}} = \frac{I}{M\,d} \quad\Rightarrow\quad T = 2\pi\sqrt{\frac{L_{\text{eq}}}{g}}`}
        annotation="Cualquier péndulo físico es equivalente a un péndulo simple de longitud L_eq. Permite comparar péndulos muy distintos."
        number="5.4"
      />

      {/* Valores del laboratorio */}
      <div className="space-y-1 rounded-lg border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">Resultados del laboratorio</p>
        <DataReadout label="distancia CM"        symbol="d"      value={D}      unit="m"    digits={4} />
        <DataReadout label="momento de inercia"  symbol="I"      value={I}      unit="kg·m²" exponential color="blue" />
        <DataReadout label="longitud equivalente" symbol="L_eq"  value={L_EQ}  unit="m"    digits={4} color="purple" />
        <DataReadout label="T calculado"          symbol="T_calc" value={T_CALC} unit="s"   digits={4} color="orange" />
        <DataReadout label="T medido en lab"      symbol="T_lab"  value={T_LAB}  unit="s"   digits={2} color="green" />
      </div>

      {/* Discrepancia — honestidad pedagógica */}
      <div className="rounded-md border border-status-warning/30 bg-status-warning/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-status-warning" aria-hidden>▲</span>
          <div>
            <p className="font-semibold text-text-primary">
              Discrepancia de {ERROR.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              El modelo predice T = {T_CALC.toFixed(4)} s pero el laboratorio midió T = {T_LAB} s.
              Una discrepancia del {ERROR.toFixed(1)}% es real y vale la pena discutirla abiertamente —
              no es un error de cálculo sino el límite del modelo ideal.
            </p>
          </div>
        </div>
      </div>

      {/* Ejercicios */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 5.1 — Calcula d</p>
          <NumericExercise
            id="s5-cm-distance"
            unit="m"
            prompt="Con L=0.25 m, m_b=0.020 kg, m_e=0.075 kg — calcula d (distancia pivote→CM) en metros."
          />
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 5.2 — Calcula T</p>
          <NumericExercise
            id="s5-period-physical"
            unit="s"
            prompt="Con los datos del laboratorio (I≈5.105×10⁻³ kg·m², M=0.095 kg, g=9.78 m/s², d≈0.2237 m) — calcula T en segundos."
          />
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-sm">
          <p className="ui-label mb-3">Ejercicio 5.3 — Reflexión abierta sobre la discrepancia</p>
          <p className="mb-3 text-sm text-text-secondary">
            El modelo predice {T_CALC.toFixed(4)} s. El laboratorio midió 1.04 s.
            La diferencia es {ERROR.toFixed(1)}%. ¿Qué podría explicar esa discrepancia?
          </p>
          <OpenExercise
            id="s5-discrepancy-source"
            prompt="¿Qué fuentes de error podrían explicar la discrepancia de ~5.3% entre T_calc y T_lab?"
            placeholder="Piensa en: distribución de masa de la barra, fricción del pivote, amplitud real vs. aproximación de ángulos pequeños, efecto del aire..."
          />
        </div>
      </div>
    </SectionShell>
  )
}
