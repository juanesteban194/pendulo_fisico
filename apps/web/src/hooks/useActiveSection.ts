// ─── useActiveSection ────────────────────────────────────────────────────────
//
// Observa todos los elementos con `data-section-slug` y reporta cuál está
// más arriba en el viewport. Sincroniza el `stageStore` para que el SVG
// sticky cambie de pieza al hacer scroll.
//
// Heurística:
//   • Solo entra en consideración si la sección está cerca de la mitad
//     superior del viewport (rootMargin "-30% 0px -50% 0px").
//   • Entre los candidatos elegimos el de mayor intersectionRatio.
//   • Cuando el usuario está en lo alto de la página (scrollY < 300),
//     forzamos el primer slug para no quedarnos en "ninguno".

'use client'

import { useEffect } from 'react'
import { useStageStore } from '@/store/stageStore'

export function useActiveSection(slugs: string[]) {
  const setActiveSlug = useStageStore(s => s.setActiveSlug)

  useEffect(() => {
    if (slugs.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const slug = visible[0]?.target.getAttribute('data-section-slug')
        if (slug) setActiveSlug(slug)
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold:  [0, 0.25, 0.5, 0.75, 1],
      },
    )

    const els = document.querySelectorAll<HTMLElement>('[data-section-slug]')
    els.forEach(el => observer.observe(el))

    // Forzar al primer slug si estamos arriba de todo
    const onScroll = () => {
      if (window.scrollY < 300 && slugs[0]) {
        setActiveSlug(slugs[0])
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [slugs, setActiveSlug])
}
