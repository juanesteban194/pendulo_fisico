// ─── ROOT LAYOUT ─────────────────────────────────────────────────────────────
//
// • lang="es" (brief sección 9: español por defecto, i18n preparado).
// • Inter como sans + JetBrains Mono como mono, vía next/font con CSS vars
//   que coinciden con las que tailwind.config.ts referencia.
// • <html className={...}> añade ambas variables al árbol global.

import type { Metadata }    from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets:   ['latin'],
  display:   'swap',
  variable:  '--font-inter',
  weight:    ['400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets:   ['latin'],
  display:   'swap',
  variable:  '--font-jetbrains-mono',
  weight:    ['400', '500'],
})

export const metadata: Metadata = {
  title:       'Péndulo Físico · Universidad de Medellín',
  description: 'Plataforma educativa interactiva — Física II 2025-2. Construye un péndulo físico desde cero.',
  authors:     [{ name: 'Esteban Echavarría' }],
  robots:      { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
