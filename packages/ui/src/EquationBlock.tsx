// ─── <EquationBlock /> ───────────────────────────────────────────────────────
//
// Ecuación KaTeX como bloque centrado, con anotación opcional debajo.
// Renderiza como Server Component (react-katex es SSR-safe).
//
// Uso:
//   <EquationBlock latex="T = 2\pi\sqrt{L/g}" annotation="periodo del péndulo simple" />
//   <EquationBlock latex="\theta_0" inline />
//
// Las CSS de KaTeX se importan globalmente en apps/web/src/app/globals.css —
// este componente solo emite markup.

import { BlockMath, InlineMath } from 'react-katex'

export interface EquationBlockProps {
  /** Cuerpo LaTeX de la ecuación (sin `$$…$$`). */
  latex: string
  /** Texto pequeño debajo (traducción a lenguaje natural, etiqueta). */
  annotation?: string
  /** Si true, renderiza inline (no figura). Default: false (bloque). */
  inline?: boolean
  /** Numeración tipo "(eq. 1)" alineada a la derecha. Solo en bloque. */
  number?: string | number
  className?: string
}

export function EquationBlock({
  latex,
  annotation,
  inline = false,
  number,
  className = '',
}: EquationBlockProps) {
  if (inline) {
    return <InlineMath math={latex} />
  }

  return (
    <figure
      className={[
        'my-6 flex flex-col items-stretch gap-2 rounded-lg',
        'border border-border-subtle bg-bg-surface px-6 py-5',
        'shadow-sm',
        className,
      ].join(' ')}
    >
      <div className="relative flex items-center justify-center">
        <BlockMath math={latex} />
        {number !== undefined && (
          <span className="absolute right-0 font-mono text-xs text-text-tertiary">
            ({number})
          </span>
        )}
      </div>
      {annotation && (
        <figcaption className="text-center text-sm leading-relaxed text-text-secondary">
          {annotation}
        </figcaption>
      )}
    </figure>
  )
}
