// ─── <EquationBlock /> ───────────────────────────────────────────────────────
//
// Ecuación KaTeX como bloque centrado, con anotación opcional debajo.
//
// Diseño visual:
//   • Banda lateral izquierda con el color del acento (orange) — refuerza
//     que es contenido formal / referenciable.
//   • Fondo con gradiente sutil hacia el acento para añadir profundidad.
//   • Número como chip flotante en la esquina superior derecha (mono, tabular).
//   • Anotación en italic, justificada al inicio (no centrada) para evitar
//     que líneas largas queden con un río blanco al medio.
//   • La ecuación KaTeX se renderiza un poco más grande (1.15em) que el
//     default — más legible sin invadir la composición.
//
// Renderiza como Server Component (react-katex es SSR-safe).

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
        'group relative my-7 overflow-hidden rounded-xl',
        'border border-border-subtle bg-bg-surface',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-12px_rgba(15,23,42,0.08)]',
        'transition-shadow duration-200',
        'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-12px_rgba(15,23,42,0.14)]',
        className,
      ].join(' ')}
    >
      {/* Banda lateral izquierda */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent-orange/70 via-accent-orange/40 to-accent-orange/10"
      />

      {/* Gradiente sutil de fondo hacia el acento */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent-orange-soft/40"
      />

      {/* Chip del número de ecuación */}
      {number !== undefined && (
        <span
          className={[
            'absolute right-3 top-3 z-10',
            'inline-flex items-center justify-center',
            'rounded-md border border-border-subtle bg-white/90 backdrop-blur-sm',
            'px-2 py-0.5',
            'font-mono text-[11px] font-medium tabular-nums text-text-tertiary',
            'shadow-sm',
          ].join(' ')}
        >
          eq. {number}
        </span>
      )}

      <div className="relative px-7 py-7">
        {/* Ecuación principal — un toque más grande para legibilidad */}
        <div className="eq-block flex items-center justify-center">
          <BlockMath math={latex} />
        </div>

        {annotation && (
          <>
            <span
              aria-hidden
              className="mx-auto my-4 block h-px w-12 bg-border-default/50"
            />
            <figcaption className="mx-auto max-w-prose text-center text-sm italic leading-relaxed text-text-secondary">
              {annotation}
            </figcaption>
          </>
        )}
      </div>
    </figure>
  )
}
