'use client'

// ─── <ConceptCard /> ─────────────────────────────────────────────────────────
// Callout visual para destacar un concepto físico clave dentro de una sección.
// 5 variantes de color mapeadas a los acentos del design system.

import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

export type ConceptColor = 'orange' | 'blue' | 'purple' | 'green' | 'amber'

const COLOR_TOKEN: Record<ConceptColor, { bg: string; border: string; text: string; iconBg: string }> = {
  orange: {
    bg: 'bg-accent-orange-soft', border: 'border-accent-orange/25',
    text: 'text-accent-orange', iconBg: 'bg-accent-orange/10',
  },
  blue: {
    bg: 'bg-blue-50',  border: 'border-blue-300/40',
    text: 'text-blue-600', iconBg: 'bg-blue-100',
  },
  purple: {
    bg: 'bg-purple-50', border: 'border-purple-300/40',
    text: 'text-accent-purple', iconBg: 'bg-purple-100',
  },
  green: {
    bg: 'bg-emerald-50', border: 'border-emerald-300/40',
    text: 'text-accent-green', iconBg: 'bg-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50', border: 'border-amber-300/40',
    text: 'text-accent-amber', iconBg: 'bg-amber-100',
  },
}

export interface ConceptCardProps {
  icon: string
  title: string
  color?: ConceptColor
  children: ReactNode
}

export function ConceptCard({ icon, title, color = 'orange', children }: ConceptCardProps) {
  const reduceMotion = useReducedMotion()
  const c = COLOR_TOKEN[color]

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={[
        'my-6 flex gap-4 rounded-xl border p-5',
        c.bg, c.border,
      ].join(' ')}
    >
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg',
          c.iconBg,
        ].join(' ')}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={['mb-1 text-sm font-semibold', c.text].join(' ')}>{title}</p>
        <div className="text-sm leading-relaxed text-text-secondary">{children}</div>
      </div>
    </motion.aside>
  )
}
