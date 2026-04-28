// ─── <SectionShell /> ────────────────────────────────────────────────────────
//
// Wrapper de cada sección educativa. Renderiza:
//   • Eyebrow opcional ("Capítulo 2", "Anzuelo", …)
//   • Número (formato "01", "02", …)
//   • Título grande
//   • Tiempo estimado de lectura (opcional)
//   • Children (cuerpo MDX)
//
// Marca el elemento con `data-section-slug` para que `useActiveSection` en
// apps/web lo detecte vía IntersectionObserver y dispare el cambio de pieza
// en el SVG sticky de la izquierda.
//
// Layout: este componente NO crea las dos columnas (sticky stage + scroll
// content). Eso es responsabilidad de la página que lo renderiza. SectionShell
// es solo el contenido de la columna derecha de una sección.
//
// Server-Component-friendly (ningún hook, ningún estado).

import type { ReactNode } from 'react'

export interface SectionShellProps {
  /** Slug único: "pivote", "pendulo-simple", … (debe coincidir con MDX). */
  slug: string
  /** Número 0..8 del capítulo. */
  number: number
  /** Título grande de la sección. */
  title: string
  /** Texto pequeño arriba del título (opcional): "Capítulo", "Anzuelo", …  */
  eyebrow?: string
  /** Tiempo estimado de lectura, e.g. "8 min". */
  estimatedTime?: string
  children: ReactNode
  className?: string
}

export function SectionShell({
  slug,
  number,
  title,
  eyebrow,
  estimatedTime,
  children,
  className = '',
}: SectionShellProps) {
  // Padding inferior generoso: el siguiente SectionShell empieza con aire.
  // scroll-mt-24 evita que el header de la sección quede pegado al borde
  // superior cuando el usuario hace scroll a un slug específico.
  return (
    <section
      id={slug}
      data-section-slug={slug}
      data-section-number={number}
      className={[
        'relative scroll-mt-24 py-16 first:pt-8',
        'border-b border-border-subtle last:border-b-0',
        className,
      ].join(' ')}
      aria-labelledby={`${slug}-heading`}
    >
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs font-medium tabular-nums text-accent-orange">
            {String(number).padStart(2, '0')}
          </span>
          {eyebrow && <span className="ui-label">{eyebrow}</span>}
          {estimatedTime && (
            <span className="ml-auto text-xs text-text-tertiary">{estimatedTime}</span>
          )}
        </div>
        <h2
          id={`${slug}-heading`}
          className="font-sans text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl"
        >
          {title}
        </h2>
      </header>

      <div className="space-y-6 text-base leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  )
}
