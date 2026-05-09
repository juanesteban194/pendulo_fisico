// ─── <StickyStage /> ─────────────────────────────────────────────────────────
//
// Wrapper client-side del PendulumStage de @pendulo/ui. Lee el slug activo
// del stageStore y se lo pasa al Stage. Sticky en desktop, oculto en mobile
// (en mobile, el Stage aparece inline al inicio de cada sección).
//
// Fondo: gradiente radial slate (claro al centro, ligeramente más oscuro en
// los bordes) que mejora el contraste de las líneas finas del SVG y hace
// destacar el naranja del estado activo.

'use client'

import { PendulumStage } from '@pendulo/ui'
import { useStageStore } from '@/store/stageStore'

const STAGE_BG =
  'radial-gradient(ellipse at 50% 35%, #f8fafc 0%, #f1f5f9 55%, #e2e8f0 100%)'

export function StickyStage() {
  const activeSlug = useStageStore(s => s.activeSlug)

  return (
    <aside className="hidden md:block">
      <div className="sticky top-0 flex h-screen items-center justify-center px-8">
        <div
          className="aspect-square w-full max-w-[520px] overflow-hidden rounded-2xl border border-border-subtle shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_8px_24px_-12px_rgba(15,23,42,0.12)]"
          style={{
            background: STAGE_BG,
            maxHeight: '80vh',
          }}
        >
          <PendulumStage activeSlug={activeSlug} />
        </div>
      </div>
    </aside>
  )
}
