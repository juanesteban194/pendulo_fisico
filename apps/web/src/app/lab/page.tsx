// ─── /lab — Laboratorio fullscreen del simulador ────────────────────────────

import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const SimuladorFull = dynamic(
  () => import('@/components/simulator/SimuladorFull').then(m => ({ default: m.SimuladorFull })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '100vh', width: '100vw',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '12px',
          background: '#f8fafc', color: '#475569',
        }}
      >
        <div
          style={{
            width: '32px', height: '32px',
            border: '3px solid #e2e8f0', borderTopColor: '#ff6b35',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '13px', margin: 0 }}>Cargando simulador…</p>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Laboratorio · Péndulo Físico',
  description: 'Simulador interactivo a pantalla completa — Universidad de Medellín · Física II',
}

export default function LabPage() {
  return <SimuladorFull />
}
