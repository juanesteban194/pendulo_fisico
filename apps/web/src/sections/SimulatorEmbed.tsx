'use client'

// ─── CTA del simulador (Sección 8) ───────────────────────────────────────────
// Reemplaza el embed por una tarjeta de invitación que abre /lab en una
// pestaña nueva — el simulador a pantalla completa es la experiencia primaria.

import { motion, useReducedMotion } from 'framer-motion'

const FEATURES = [
  { icon: '⏱', title: 'Tiempo real', desc: 'Integración RK4 a 60 fps con histórico de 30 fps' },
  { icon: '🌊', title: '5 fluidos',   desc: 'Vacío, aire, agua, aceite y glicerina con drag físico' },
  { icon: '🪐', title: '5 gravedades', desc: 'Luna, Marte, Medellín, Tierra y Júpiter' },
  { icon: '📊', title: '4 gráficas',  desc: 'θ(t), ω(t), espacio fase y energía' },
  { icon: '📐', title: 'Modo didáctico', desc: 'Vectores de torque, peso y péndulo equivalente' },
  { icon: '⚡', title: 'Ligero',     desc: 'WebGL optimizado · funciona en cualquier portátil' },
]

export function SimulatorEmbed() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-white via-bg-elevated to-accent-orange-soft shadow-lg"
    >
      {/* Decoración: péndulo SVG estilizado al fondo */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-8 h-72 w-72 opacity-[0.07]"
        viewBox="0 0 200 200"
      >
        <line x1="100" y1="20" x2="100" y2="160" stroke="currentColor" strokeWidth="2" className="text-accent-orange" />
        <circle cx="100" cy="20" r="6" fill="currentColor" className="text-accent-orange" />
        <circle cx="100" cy="160" r="22" fill="currentColor" className="text-accent-orange" />
      </svg>

      <div className="relative p-8 md:p-10">
        <span className="ui-label">Laboratorio interactivo</span>
        <h3 className="mt-3 font-sans text-2xl font-bold leading-tight tracking-tight text-text-primary md:text-3xl">
          Abre el simulador a pantalla completa
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
          Toda la física construida en los capítulos anteriores — geometría, inercia,
          gravedad, fluidos, integración numérica — converge en este simulador.
          Lo abrimos en una pestaña dedicada para que tengas el espacio que merece.
        </p>

        {/* Grid de features */}
        <ul className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.title}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 0.05 * i, ease: 'easeOut' }}
              className="flex items-start gap-2 rounded-lg border border-border-subtle/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm"
            >
              <span className="text-base leading-none">{f.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary">{f.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-text-tertiary">{f.desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* CTA primaria */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <motion.a
            href="/lab"
            target="_blank"
            rel="noopener"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group inline-flex items-center gap-2 rounded-full bg-accent-orange px-6 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-accent-orange/20 transition-shadow hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent-orange/30"
          >
            <span>Abrir laboratorio</span>
            <svg
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </motion.a>
          <a
            href="/lab"
            className="text-xs text-text-tertiary underline-offset-4 hover:text-text-secondary hover:underline"
          >
            o ábrelo en esta misma ventana
          </a>
        </div>
      </div>
    </motion.div>
  )
}
