// ─── Sección 3 — Energías en el péndulo simple ───────────────────────────────

import { SectionShell, EquationBlock, DataReadout } from '@pendulo/ui'
import { InlineStage } from '@/components/InlineStage'
import { EnergyBarsChart } from '@/components/charts/EnergyBarsChart'

// Datos del laboratorio — se calculan en servidor (Server Component)
const L   = 0.25
const M   = 0.020 + 0.075
const G   = 9.78
const D   = (0.020 * L / 2 + 0.075 * L) / M
const TH0 = 5 * Math.PI / 180

const Ep_max = M * G * D * (1 - Math.cos(TH0))
const Ec_max = Ep_max  // conservación: Ep_max = Ec_max
const E_total = Ep_max

export function S3Energias() {
  return (
    <SectionShell
      slug="energias"
      number={3}
      eyebrow="Capítulo 3"
      title="Energías en el péndulo — conservación"
      estimatedTime="9 min"
    >
      <InlineStage slug="energias" />

      {/* Anzuelo */}
      <div className="rounded-md border-l-4 border-accent-purple bg-bg-elevated px-5 py-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">¿Qué tiene la energía que el relojero no ve?</span>
          {' '}Cuando el péndulo está en su punto más alto, parece inmóvil. Cuando pasa
          por el centro, va rapidísimo. ¿Qué pasó con la energía entre un extremo y el otro?
        </p>
      </div>

      <p>
        La energía total de un péndulo ideal no se crea ni se destruye:
        simplemente cambia de forma, alternando entre energía potencial gravitacional
        y energía cinética. Esta es la <strong>conservación de la energía mecánica</strong>.
      </p>

      {/* Altura */}
      <h3 className="text-lg font-semibold text-text-primary">La altura que gana el péndulo</h3>

      <EquationBlock
        latex={String.raw`h = L\,(1 - \cos\theta)`}
        annotation="Altura del CM sobre el punto más bajo. Cuando θ = 0 (abajo), h = 0. Cuando θ = θ₀ (extremo), h es máxima."
        number="3.1"
      />

      {/* Energía potencial */}
      <EquationBlock
        latex={String.raw`E_p = m\,g\,L\,(1-\cos\theta)`}
        annotation="Energía potencial gravitacional respecto al punto de equilibrio. Máxima en los extremos, cero al pasar por abajo."
        number="3.2"
      />

      {/* Energía cinética */}
      <EquationBlock
        latex={String.raw`E_c = \tfrac{1}{2}\,m\,v^2 = \tfrac{1}{2}\,m\,L^2\,\dot{\theta}^2`}
        annotation="Energía cinética. v = L·θ̇ es la velocidad tangencial de la masa. Máxima al pasar por abajo, cero en los extremos."
        number="3.3"
      />

      {/* Conservación */}
      <EquationBlock
        latex={String.raw`E_{\text{total}} = E_p + E_c = \text{cte}`}
        annotation="En ausencia de fricción, la energía total se conserva. Esta igualdad permite calcular la velocidad máxima sin resolver la EDO."
        number="3.4"
      />

      {/* Gráfica dinámica */}
      <EnergyBarsChart />

      {/* Magnitudes del laboratorio */}
      <div className="space-y-1 rounded-lg border border-border-subtle bg-bg-surface px-5 py-4 shadow-sm">
        <p className="ui-label mb-2">Energías del péndulo del laboratorio (θ₀ = 5°)</p>
        <DataReadout label="E. potencial máxima" symbol="E_p" value={Ep_max}  unit="J" exponential color="amber" />
        <DataReadout label="E. cinética máxima"  symbol="E_c" value={Ec_max}  unit="J" exponential color="blue" />
        <DataReadout label="E. total (constante)" symbol="E"  value={E_total} unit="J" exponential color="green" />
      </div>

      {/* Analogía guitarra */}
      <div className="rounded-md bg-bg-elevated px-5 py-4">
        <p className="ui-label mb-2">Analogía — la guitarra</p>
        <p className="text-sm text-text-secondary">
          Cuando pulsas una cuerda de guitarra, le das energía potencial elástica (la deformas).
          Al soltarla, esa energía se convierte en cinética (vibra). Si no hubiera rozamiento,
          sonaría para siempre — igual que un péndulo ideal. En la realidad, ambos se amortiguan.
        </p>
      </div>

      {/* Nota sobre velocidad máxima */}
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm">
        <p className="ui-label mb-2">Truco de conservación de energía</p>
        <p className="text-sm text-text-secondary">
          En el extremo superior: <code className="font-mono text-xs">Ec = 0</code>, toda la energía es potencial.<br />
          En el punto más bajo: <code className="font-mono text-xs">Ep = 0</code>, toda la energía es cinética.<br />
          Entonces:{' '}
          <code className="font-mono text-xs">½mv²_max = mgL(1-cosθ₀)</code>{' '}
          → <code className="font-mono text-xs">v_max = √(2gL(1-cosθ₀))</code>
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Para nuestro lab (L=0.25 m, θ₀=5°):{' '}
          <span className="font-mono text-accent-orange">
            v_max ≈ {(Math.sqrt(2 * G * L * (1 - Math.cos(TH0))) * 100).toFixed(1)} cm/s
          </span>
        </p>
      </div>
    </SectionShell>
  )
}
