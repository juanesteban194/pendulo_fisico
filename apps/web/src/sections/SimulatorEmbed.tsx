// ─── SimulatorEmbed — placeholder hasta la Fase E ─────────────────────────────
//
// La Fase E migrará el simulador R3F desde apps/simulator-2d/ a este módulo.
// Por ahora muestra el estado del simulador y un enlace para correrlo en modo
// independiente (pnpm --filter @pendulo/simulator-2d dev).

'use client'

export function SimulatorEmbed() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border-default bg-bg-elevated">
      {/* Header del simulador */}
      <div className="flex items-center gap-3 border-b border-border-subtle bg-bg-surface px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-status-error/70" />
          <span className="h-3 w-3 rounded-full bg-status-warning/70" />
          <span className="h-3 w-3 rounded-full bg-status-success/70" />
        </div>
        <span className="font-mono text-xs text-text-tertiary">
          apps/simulator-2d — Péndulo Físico 2D
        </span>
        <span className="ml-auto rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-medium text-status-warning">
          Fase E — pendiente de migración
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex min-h-[380px] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        {/* Ícono de péndulo animado */}
        <div className="relative h-24 w-24" aria-hidden>
          <svg viewBox="-40 -10 80 100" className="h-full w-full" role="img" aria-label="Péndulo animado">
            <line x1="0" y1="0" x2="0" y2="-8" stroke="rgb(var(--border-default))" strokeWidth="2" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="rgb(var(--text-tertiary))" strokeWidth="1.5" />
            <g style={{ transformOrigin: '0px 0px', animation: 'pendulumSwing 2s ease-in-out infinite alternate' }}>
              <line x1="0" y1="0" x2="0" y2="65" stroke="rgb(var(--text-secondary))" strokeWidth="2" />
              <circle cx="0" cy="65" r="12" fill="rgb(var(--accent-orange))" opacity="0.85" />
            </g>
          </svg>
          <style>{`
            @keyframes pendulumSwing {
              from { transform: rotate(-20deg); }
              to   { transform: rotate(20deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes pendulumSwing { from { transform: none; } to { transform: none; } }
            }
          `}</style>
        </div>

        <div className="max-w-sm space-y-2">
          <h3 className="font-semibold text-text-primary">
            Simulador completo — próximamente aquí
          </h3>
          <p className="text-sm text-text-secondary">
            El simulador 2D con React Three Fiber, RK4 y todos los controles
            del laboratorio se integrará en esta sección durante la Fase E.
          </p>
        </div>

        <div className="rounded-lg bg-bg-surface px-5 py-4 shadow-sm border border-border-subtle text-left w-full max-w-sm">
          <p className="ui-label mb-2">Corre el simulador ahora mismo</p>
          <code className="block rounded bg-bg-elevated px-3 py-2 font-mono text-xs text-text-primary">
            pnpm --filter @pendulo/simulator-2d dev
          </code>
          <p className="mt-2 text-xs text-text-tertiary">
            Abre en <span className="font-mono">localhost:5173</span> con todos los controles activos.
          </p>
        </div>
      </div>
    </div>
  )
}
