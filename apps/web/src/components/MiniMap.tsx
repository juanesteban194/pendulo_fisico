// ─── <MiniMap /> ─────────────────────────────────────────────────────────────
//
// Mini-mapa colapsable de capítulos en la esquina superior derecha. Muestra
// la lista numerada de las 9 secciones; clic en una salta a esa sección.
// El item activo se destaca en naranja.

'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useStageStore } from '@/store/stageStore'

export interface MiniMapEntry {
  slug:   string
  title:  string
  number: number
}

export interface MiniMapProps {
  entries: MiniMapEntry[]
}

export function MiniMap({ entries }: MiniMapProps) {
  const [open, setOpen] = useState(false)
  const activeSlug = useStageStore(s => s.activeSlug)
  const reduce = useReducedMotion()

  const scrollTo = (slug: string) => {
    document.getElementById(slug)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block:    'start',
    })
    setOpen(false)
  }

  const activeIdx = entries.findIndex(e => e.slug === activeSlug)
  const progress  = entries.length > 0 ? Math.max(0, activeIdx) / (entries.length - 1) : 0

  return (
    <div className="fixed right-4 top-4 z-40 hidden md:block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'group flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm backdrop-blur transition',
          open
            ? 'border-accent-orange bg-bg-surface'
            : 'border-border-subtle bg-bg-surface/95 hover:border-accent-orange/50',
        ].join(' ')}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Capítulos"
      >
        <div className="flex flex-col gap-0.5">
          <span className="ui-label">Capítulos</span>
          <span className="font-mono text-xs text-text-secondary">
            {String(Math.max(0, activeIdx)).padStart(2, '0')} / {String(entries.length - 1).padStart(2, '0')}
          </span>
        </div>
        <div className="ml-2 h-8 w-1 overflow-hidden rounded-full bg-bg-tinted">
          <motion.div
            className="origin-bottom bg-accent-orange"
            style={{ height: '100%', scaleY: progress }}
          />
        </div>
        <span
          className={[
            'ml-1 text-text-tertiary transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-md border border-border-subtle bg-bg-surface shadow-lg"
            role="menu"
          >
            {entries.map(e => {
              const active = e.slug === activeSlug
              return (
                <li key={e.slug} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => scrollTo(e.slug)}
                    className={[
                      'flex w-full items-baseline gap-3 border-b border-border-subtle px-4 py-2.5 text-left last:border-b-0 transition-colors',
                      active
                        ? 'bg-accent-orange-soft text-accent-orange'
                        : 'hover:bg-bg-tinted',
                    ].join(' ')}
                  >
                    <span className="font-mono text-xs tabular-nums text-text-tertiary">
                      {String(e.number).padStart(2, '0')}
                    </span>
                    <span className={['text-sm', active ? 'font-semibold' : 'text-text-primary'].join(' ')}>
                      {e.title}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
