'use client'

// Carga el simulador sin SSR (Three.js/WebGL requiere el navegador).

import dynamic from 'next/dynamic'

export const SimuladorLoader = dynamic(
  () => import('./SimuladorCompleto').then(m => ({ default: m.SimuladorCompleto })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height:         '620px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          borderRadius:   '10px',
          border:         '1px solid rgba(15,23,42,0.08)',
          background:     '#f1f5f9',
          color:          '#94a3b8',
          fontSize:       '13px',
          fontFamily:     'system-ui, sans-serif',
        }}
      >
        Cargando simulador…
      </div>
    ),
  }
)
