// ─── <InlineStage /> ─────────────────────────────────────────────────────────
//
// En mobile (< md) el StickyStage no es viable. Cada sección embebe esta
// versión pequeña de la pieza correspondiente al inicio de su contenido.
// Renderiza la pieza fija del slug que se le pasa (no la activa global).

'use client'

import { PendulumStage } from '@pendulo/ui'

export function InlineStage({ slug }: { slug: string }) {
  return (
    <div className="md:hidden">
      <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
        <PendulumStage activeSlug={slug} />
      </div>
    </div>
  )
}
