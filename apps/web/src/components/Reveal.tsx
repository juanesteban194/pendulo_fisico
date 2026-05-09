'use client'

// ─── <Reveal /> ──────────────────────────────────────────────────────────────
// Wrapper de animación scroll-triggered. Aparece con fade + slide-up cuando
// entra al viewport. Honra prefers-reduced-motion automáticamente.

import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

type RevealVariant = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right'

const VARIANTS = {
  'fade-up':     { initial: { opacity: 0, y: 24 },      animate: { opacity: 1, y: 0 } },
  'fade-in':     { initial: { opacity: 0 },              animate: { opacity: 1 } },
  'scale-in':    { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 } },
  'slide-right': { initial: { opacity: 0, x: -24 },      animate: { opacity: 1, x: 0 } },
} as const satisfies Record<RevealVariant, { initial: object; animate: object }>

export interface RevealProps {
  variant?: RevealVariant
  delay?: number
  duration?: number
  amount?: number
  once?: boolean
  className?: string
  children: ReactNode
}

export function Reveal({
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  amount = 0.25,
  once = true,
  className,
  children,
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const v = VARIANTS[variant]

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── <RevealStagger /> — anima a sus hijos en cascada ──────────────────────
export interface RevealStaggerProps {
  children: ReactNode
  stagger?: number
  delay?: number
  className?: string
  amount?: number
}

export function RevealStagger({
  children, stagger = 0.08, delay = 0, className, amount = 0.2,
}: RevealStaggerProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const revealItem = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}
