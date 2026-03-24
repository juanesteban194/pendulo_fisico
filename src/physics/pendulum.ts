// ─────────────────────────────────────────────────────────────────────────────
// MOTOR FÍSICO DEL PÉNDULO
//
// Este archivo es el corazón del simulador.
// Implementa la ecuación diferencial de movimiento del péndulo físico:
//
//   I · θ'' = − M·g·d·sin(θ)  −  b(ω)·ω
//              ───────────────    ────────
//              torque             torque de
//              gravitacional      amortiguamiento
//
// donde:
//   θ  = ángulo respecto a la vertical (rad)
//   ω  = dθ/dt = velocidad angular (rad/s)
//   I  = momento de inercia total respecto al pivote (kg·m²)
//   M  = masa total (kg)
//   g  = gravedad (m/s²)
//   d  = distancia pivote → centro de masa (m)
//   b  = coeficiente de amortiguamiento del fluido (N·m·s/rad)
//
// IMPORTANTE: este archivo NO importa React, Three.js ni ninguna librería
// de UI. Es TypeScript puro. Puede usarse en web, móvil, Node.js o tests.
// ─────────────────────────────────────────────────────────────────────────────

import { rk4Step, rk4Integrate } from './rk4'
import { getFluidProperties, computeDamping } from './fluids'
import { computeInertia, computeCenterOfMass } from './geometry'
import type {
  PendulumState,
  PendulumParams,
  DerivedQuantities,
} from '../types/physics.types'

// ─── Parámetros del experimento real (valores de laboratorio) ─────────────
// Estos son los valores medidos en el experimento de MDF.
// Se usan como valores por defecto y para validación en los tests.
export const LAB_PARAMS: PendulumParams = {
  L:      0.25,           // 25 cm — longitud del péndulo
  m:      0.020,          // 20 g  — masa de la barra MDF
  mr:     0.075,          // 75 g  — masa en el extremo
  g:      9.78,           // Medellín, Colombia
  theta0: 5 * Math.PI / 180, // 5° convertido a radianes
  fluid:  'air',
  tempC:  20,
}

export const LAB_T_MEASURED = 1.04  // período medido en laboratorio (s)
export const LAB_I_MEASURED = 0.00509 // momento de inercia medido (kg·m²)

// ─── Estado inicial por defecto ────────────────────────────────────────────
export function createInitialState(params: PendulumParams): PendulumState {
  return {
    theta: params.theta0,
    omega: 0,
    time:  0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN DERIVADA — el corazón de la simulación
//
// Esta función toma el estado actual [theta, omega] y devuelve
// sus derivadas [dtheta/dt, domega/dt].
//
// El integrador RK4 la llama 4 veces por cada paso de 1ms.
// ─────────────────────────────────────────────────────────────────────────────
function makePendulumDerivative(params: PendulumParams) {
  // Pre-calculamos las cantidades que NO cambian entre pasos
  // (evitar recalcular en cada una de las 4 llamadas de RK4)
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  const g = params.g
  const fluid = getFluidProperties(params.fluid, params.tempC)

  // Retornamos la función derivada como clausura (closure)
  // que captura I, d, M, g y fluid
  return function derivative(state: number[], _t: number): number[] {
    const [theta, omega] = state

    // ── Torque gravitacional ───────────────────────────────────────────
    // Fuerza que empuja el péndulo de regreso al centro.
    // Usamos sin(theta) real — NO la aproximación theta para ángulos pequeños.
    // Esto hace el simulador preciso también para ángulos grandes (>5°).
    const tauGravity = -M * g * d * Math.sin(theta)

    // ── Torque de amortiguamiento ──────────────────────────────────────
    // El fluido resiste el movimiento. La magnitud depende de:
    //   - las propiedades del fluido (ρ, η)
    //   - la velocidad del extremo del péndulo: v = |omega| × L
    //   - el régimen (laminar/turbulento) determinado por el número de Reynolds
    const b = computeDamping(omega, params, fluid)
    const tauDamping = -b * omega

    // ── Aceleración angular ────────────────────────────────────────────
    // Despejando θ'' de: I·θ'' = tauGravity + tauDamping
    const alpha = (tauGravity + tauDamping) / I

    // ── Retorno: [dθ/dt, dω/dt] = [ω, α] ─────────────────────────────
    return [omega, alpha]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA — funciones que usa el resto del proyecto
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Avanza el estado del péndulo exactamente un paso de dt segundos.
 * El hook useSimulation.ts llama esta función ~1000 veces por segundo.
 *
 * @param state   - estado actual {theta, omega, time}
 * @param params  - parámetros físicos actuales
 * @param dt      - paso de tiempo (segundos) — recomendado: 0.001 (1ms)
 */
export function stepPendulum(
  state:  PendulumState,
  params: PendulumParams,
  dt:     number = 0.001
): PendulumState {
  const deriv = makePendulumDerivative(params)
  const s = [state.theta, state.omega]
  const [sNew] = [rk4Step(deriv, s, state.time, dt)]

  return {
    theta: sNew[0],
    omega: sNew[1],
    time:  state.time + dt,
  }
}

/**
 * Avanza el péndulo un número de pasos para cubrir `frameTime` segundos.
 * Esto desacopla la física (siempre a 1ms fijo) del framerate del navegador
 * (variable: 13ms, 16ms, 20ms según la carga).
 *
 * Ejemplo: frameTime = 0.016s → ejecuta 16 pasos de 1ms cada uno.
 *
 * @param state      - estado al inicio del frame
 * @param params     - parámetros físicos
 * @param frameTime  - tiempo del frame en segundos (delta del useFrame de R3F)
 * @param dt         - micro-paso de integración (default: 1ms)
 */
export function advancePendulum(
  state:     PendulumState,
  params:    PendulumParams,
  frameTime: number,
  dt:        number = 0.001
): PendulumState {
  const deriv = makePendulumDerivative(params)
  const steps = Math.max(1, Math.round(frameTime / dt))
  let s = [state.theta, state.omega]
  let t = state.time

  for (let i = 0; i < steps; i++) {
    s = rk4Step(deriv, s, t, dt)
    t += dt
  }

  return { theta: s[0], omega: s[1], time: t }
}

/**
 * Calcula todas las cantidades derivadas a partir del estado y parámetros.
 * InfoDisplay.tsx y Charts.tsx consumen este objeto.
 */
export function computeDerived(
  state:  PendulumState,
  params: PendulumParams
): DerivedQuantities {
  const I   = computeInertia(params)
  const d   = computeCenterOfMass(params)
  const M   = params.m + params.mr
  const fluid = getFluidProperties(params.fluid, params.tempC)

  // Período teórico (fórmula exacta para ángulos pequeños)
  const T   = 2 * Math.PI * Math.sqrt(I / (M * params.g * d))
  const f   = 1 / T
  const Leq = I / (M * d)  // longitud equivalente del péndulo simple

  // Energías
  const Ec  = 0.5 * I * state.omega ** 2
  const Ep  = M * params.g * d * (1 - Math.cos(state.theta))
  const Etotal = Ec + Ep

  // Régimen del fluido
  const vTip = Math.abs(state.omega) * params.L  // velocidad del extremo (m/s)
  const Re   = (fluid.rho * vTip * params.mr ** (1/3)) / fluid.eta
  const regime =
    Re < 1    ? 'laminar'    :
    Re < 1000 ? 'transition' : 'turbulent'

  const b = computeDamping(state.omega, params, fluid)

  return { I, d, M, T, f, Leq, Ec, Ep, Etotal, Re, regime, b }
}

/**
 * Calcula el período teórico usando los parámetros dados.
 * Usado en los tests de Vitest para validar contra T_lab = 1.04s.
 */
export function calculatePeriod(params: PendulumParams): number {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  return 2 * Math.PI * Math.sqrt(I / (M * params.g * d))
}

/**
 * Valida que el período calculado esté dentro del ±2% del valor medido.
 * Si retorna false, el motor tiene un bug o los parámetros son incorrectos.
 */
export function validateAgainstLab(params: PendulumParams = LAB_PARAMS): boolean {
  const T_calc = calculatePeriod(params)
  const error  = Math.abs(T_calc - LAB_T_MEASURED) / LAB_T_MEASURED
  return error <= 0.02  // tolerancia 2%
}