// ─── SIMULACIÓN SERVER-SIDE DEL PÉNDULO ──────────────────────────────────────
//
// Corre RK4 con el motor @pendulo/physics y muestrea la trayectoria a
// `sampleHz` Hz. Devuelve arrays paralelos de t, θ, ω, Ec, Ep, Etotal.
//
// Capping: nunca producir más de MAX_SAMPLES puntos para acotar payload
// (incluso si un cliente solicita 60 s × 1000 Hz = 60k puntos).

import {
  createInitialState,
  stepPendulum,
  computeDerived,
  type PendulumParams as PhysicsParams,
  type PendulumState,
} from '@pendulo/physics'
import type { SimulateRequest, SimulateResponse } from '@pendulo/schemas'

const MAX_SAMPLES = 6_000  // 60 s × 100 Hz, suficiente para retos finales

export function runSimulation(req: SimulateRequest): SimulateResponse {
  // El schema de @pendulo/schemas y el de @pendulo/physics son estructuralmente
  // idénticos. Hacemos un cast explícito para que TS lo confirme.
  const params: PhysicsParams = req.params

  // Pasos internos por muestra
  const stepsPerSample = Math.max(1, Math.round(1 / (req.sampleHz * req.dt)))
  const totalSamples   = Math.min(MAX_SAMPLES, Math.floor(req.duration * req.sampleHz))

  const t:      number[] = []
  const theta:  number[] = []
  const omega:  number[] = []
  const Ec:     number[] = []
  const Ep:     number[] = []
  const Etotal: number[] = []

  let state: PendulumState = createInitialState(params)

  // Punto inicial
  pushSample(state)

  for (let i = 1; i <= totalSamples; i++) {
    for (let s = 0; s < stepsPerSample; s++) {
      state = stepPendulum(state, params)
    }
    pushSample(state)
  }

  return {
    t, theta, omega, Ec, Ep, Etotal,
    meta: {
      steps:    totalSamples * stepsPerSample,
      samples:  t.length,
      duration: req.duration,
    },
  }

  function pushSample(s: PendulumState) {
    const d = computeDerived(s, params)
    t.push(s.time)
    theta.push(s.theta)
    omega.push(s.omega)
    Ec.push(d.Ec)
    Ep.push(d.Ep)
    Etotal.push(d.Etotal)
  }
}
