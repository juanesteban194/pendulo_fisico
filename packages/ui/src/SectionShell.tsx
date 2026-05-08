// ─── <SectionShell /> ────────────────────────────────────────────────────────
//
// Wrapper de cada sección educativa con animación scroll-reveal del header.
// El número y eyebrow entran con stagger; el título grande con fade-up.
// Honra prefers-reduced-motion vía useReducedMotion.

'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface SectionShellProps {
  slug: string
  number: number
  title: string
  eyebrow?: string
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
  const reduceMotion = useReducedMotion()

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      }

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
      <motion.header className="mb-8 flex flex-col gap-3" {...fadeUp}>
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
      </motion.header>

      <motion.div
        className="space-y-6 text-base leading-relaxed text-text-secondary"
        {...(reduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.1 },
              transition: { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
      >
        {children}
      </motion.div>
    </section>
  )
}
