// ─── <StickyStage /> ─────────────────────────────────────────────────────────
//
// Wrapper client-side del PendulumStage de @pendulo/ui. Lee el slug activo
// del stageStore y se lo pasa al Stage. Sticky en desktop, oculto en mobile
// (en mobile, el Stage aparece inline al inicio de cada sección).

'use client'

import { PendulumStage } from '@pendulo/ui'
import { useStageStore } from '@/store/stageStore'

export function StickyStage() {
  const activeSlug = useStageStore(s => s.activeSlug)

  return (
    <aside className="hidden md:block">
      <div className="sticky top-0 flex h-screen items-center justify-center px-8">
        <div className="aspect-square max-h-[80vh] w-full max-w-[520px]">
          <PendulumStage activeSlug={activeSlug} />
        </div>
      </div>
    </aside>
  )
}
