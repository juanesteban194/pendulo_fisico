// ─── STORE DEL STAGE ─────────────────────────────────────────────────────────
//
// Estado global del SVG sticky de la izquierda. Lo mantenemos pequeñísimo:
// solo el slug activo. El componente PendulumStage se subscribe vía hook
// y anima la transición de pieza.
//
// ¿Por qué un store y no un useState en Layout?
//   • La detección de scroll-active vive en useActiveSection (hook compartido).
//   • El Stage es un descendiente lejano del observador.
//   • Pasar props por 4 niveles ensucia el árbol.
// Zustand con subscribe es la solución más simple sin Context overhead.

'use client'

import { create } from 'zustand'

interface StageState {
  /** Slug actualmente activo (sección más visible). */
  activeSlug: string
  /** Acción para actualizarlo desde useActiveSection. */
  setActiveSlug: (slug: string) => void
}

export const useStageStore = create<StageState>(set => ({
  activeSlug: 'bienvenida',
  setActiveSlug: slug => set({ activeSlug: slug }),
}))

export const selectActiveSlug = (s: StageState) => s.activeSlug
