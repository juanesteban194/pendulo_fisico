// ─── PÁGINA EDUCATIVA — Péndulo Físico desde Cero ────────────────────────────
//
// Fase D — página definitiva con las 9 secciones educativas.
// Layout: PageShell (sticky stage izquierdo + scroll derecho).
//
// Server Component: las secciones son RSC salvo donde se indique
// 'use client' explícitamente (ejercicios, sliders, gráficas).

import { PageShell }          from '@/components/PageShell'
import { S0Bienvenida }      from '@/sections/S0Bienvenida'
import { S1Pivote }          from '@/sections/S1Pivote'
import { S2PenduloSimple }   from '@/sections/S2PenduloSimple'
import { S3Energias }        from '@/sections/S3Energias'
import { S4MomentoInercia }  from '@/sections/S4MomentoInercia'
import { S5PenduloFisico }   from '@/sections/S5PenduloFisico'
import { S6Amortiguamiento } from '@/sections/S6Amortiguamiento'
import { S7RK4 }             from '@/sections/S7RK4'
import { S8Simulador }       from '@/sections/S8Simulador'
import type { ProgressRailSection } from '@pendulo/ui'

// Lista de secciones para el ProgressRail y el MiniMap.
const SECTIONS: ProgressRailSection[] = [
  { slug: 'bienvenida',      number: 0, title: 'Bienvenida' },
  { slug: 'pivote',          number: 1, title: 'El pivote' },
  { slug: 'pendulo-simple',  number: 2, title: 'Péndulo simple' },
  { slug: 'energias',        number: 3, title: 'Energías' },
  { slug: 'momento-inercia', number: 4, title: 'Momento de inercia' },
  { slug: 'pendulo-fisico',  number: 5, title: 'Péndulo físico' },
  { slug: 'amortiguamiento', number: 6, title: 'Amortiguamiento' },
  { slug: 'rk4',             number: 7, title: 'Integración numérica' },
  { slug: 'simulador',       number: 8, title: 'Simulador completo' },
]

export default function HomePage() {
  return (
    <PageShell sections={SECTIONS}>
      <S0Bienvenida />
      <S1Pivote />
      <S2PenduloSimple />
      <S3Energias />
      <S4MomentoInercia />
      <S5PenduloFisico />
      <S6Amortiguamiento />
      <S7RK4 />
      <S8Simulador />
    </PageShell>
  )
}
