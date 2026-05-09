// ─── <InlineStage /> ─────────────────────────────────────────────────────────
//
// En mobile (< md) el StickyStage no es viable. Cada sección embebe esta
// versión pequeña de la pieza correspondiente al inicio de su contenido.
// Renderiza la pieza fija del slug que se le pasa (no la activa global).

'use client'

import { PendulumStage } from '@pendulo/ui'

const STAGE_BG =
  'radial-gradient(ellipse at 50% 35%, #f8fafc 0%, #f1f5f9 55%, #e2e8f0 100%)'

export function InlineStage({ slug }: { slug: string }) {
  return (
    <div className="md:hidden">
      <div
        className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl border border-border-subtle shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_4px_16px_-8px_rgba(15,23,42,0.12)]"
        style={{ background: STAGE_BG }}
      >
        <PendulumStage activeSlug={slug} />
      </div>
    </div>
  )
}
