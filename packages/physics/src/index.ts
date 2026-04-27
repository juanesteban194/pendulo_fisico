// ─── PUNTO DE ENTRADA DEL PAQUETE @pendulo/physics ───────────────────────────
//
// Motor de física puro para el simulador del péndulo físico de la
// Universidad de Medellín (Física II, 2025-2). Sin dependencias del DOM,
// React, Three.js ni Zustand — usable en frontend, backend, tests y workers.
//
// Validado contra los datos del laboratorio:
//   L = 0.25 m, m = 0.020 kg, mr = 0.075 kg, g = 9.78 m/s² (Medellín)
//   T_lab medido = 1.04 s   |   T_calc = 0.985 s   |   error = 5.3%
//
// Usa RK4 con dt = 1 ms para integrar:
//   I·θ'' = −M·g·d·sin(θ) − b(ω)·ω
// ─────────────────────────────────────────────────────────────────────────────

// Tipos
export type {
  PendulumState,
  PendulumParams,
  FluidId,
  FluidProperties,
  DerivedQuantities,
  SimulationFrame,
} from './types'

// Integrador numérico genérico
export type { DerivativeFn } from './rk4'
export { rk4Step, rk4Integrate } from './rk4'

// Geometría e inercia
export {
  computeInertia,
  computeCenterOfMass,
  computeEquivalentLength,
  computeMassRadius,
  computeFrontalArea,
  computeMassDistance,
} from './geometry'

// Fluidos y amortiguamiento
export {
  getFluidProperties,
  computeReynolds,
  computeDamping,
  classifyRegime,
  getAllFluids,
} from './fluids'

// Motor del péndulo
export {
  LAB_PARAMS,
  createInitialState,
  stepPendulum,
  advancePendulum,
  computeDerived,
  calculatePeriod,
  validateAgainstLab,
} from './pendulum'
