// ─── MOTOR PRINCIPAL DEL PÉNDULO FÍSICO ──────────────────────────────────────
// Resuelve I·θ'' = −M·g·d·sin(θ) − b(ω)·ω usando RK4 con dt = 1ms.
// TypeScript puro — cero imports de React, Three.js ni Zustand.

import type { PendulumState, PendulumParams, DerivedQuantities } from '../types/physics.types'
import { rk4Step } from './rk4'
import { computeInertia, computeCenterOfMass, computeEquivalentLength } from './geometry'
import { getFluidProperties, computeDamping, computeReynolds, classifyRegime } from './fluids'

// ─── Parámetros del experimento real de laboratorio ───────────────────────────
export const LAB_PARAMS: PendulumParams = {
  L:      0.25,       // m   — distancia pivote → masa
  m:      0.020,      // kg  — masa de la barra MDF
  mr:     0.075,      // kg  — masa en el extremo
  g:      9.78,       // m/s² — gravedad en Medellín, Colombia
  theta0: 5 * Math.PI / 180,  // 5° en radianes
  fluid:  'air',
  tempC:  20,
}

const DT = 0.001  // paso de integración: 1 ms (1000 pasos por segundo)

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────────────────────────────────────────

/** Crea el estado inicial del péndulo: partido desde theta0 con omega = 0. */
export function createInitialState(params: PendulumParams): PendulumState {
  return { theta: params.theta0, omega: 0, time: 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRACIÓN — corazón del simulador
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Avanza el péndulo exactamente 1 ms usando RK4.
 *
 * La ecuación diferencial es:
 *   [θ, ω]' = [ω,  (−M·g·d·sin(θ) − b(ω)·ω) / I]
 *
 * El vector de estado es [θ, ω].
 * RK4 calcula la derivada 4 veces por paso y promedia el resultado.
 */
export function stepPendulum(
  state: PendulumState,
  params: PendulumParams
): PendulumState {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  const fluid = getFluidProperties(params.fluid, params.tempC)

  // Función de derivadas: f([θ, ω], t) = [ω, α]
  const derivatives = (s: number[], _t: number): number[] => {
    const theta = s[0] ?? 0
    const omega = s[1] ?? 0

    // Torque gravitacional (restaurador): −M·g·d·sin(θ)
    const torqueGrav = -M * params.g * d * Math.sin(theta)

    // Torque de amortiguamiento (disipador): −b(ω)·ω
    const b = computeDamping(omega, params, fluid)
    const torqueDamp = -b * omega

    // Aceleración angular: α = (τ_grav + τ_damp) / I
    const alpha = (torqueGrav + torqueDamp) / I

    return [omega, alpha]
  }

  const newState = rk4Step(derivatives, [state.theta, state.omega], state.time, DT)

  return {
    theta: newState[0] ?? state.theta,
    omega: newState[1] ?? state.omega,
    time:  state.time + DT,
  }
}

/**
 * Avanza el péndulo N pasos de 1ms para cubrir un frame completo.
 * Llamado desde useSimulation.ts en cada useFrame() de React Three Fiber.
 *
 * @param state  - Estado actual del péndulo
 * @param params - Parámetros físicos
 * @param frameTime - Duración del frame en segundos (típico: 1/60 ≈ 0.01667s)
 * @returns Nuevo estado tras avanzar frameTime segundos
 */
export function advancePendulum(
  state: PendulumState,
  params: PendulumParams,
  frameTime: number
): PendulumState {
  const steps = Math.max(1, Math.round(frameTime / DT))
  let current = state

  for (let i = 0; i < steps; i++) {
    current = stepPendulum(current, params)
  }

  return current
}

// ─────────────────────────────────────────────────────────────────────────────
// CANTIDADES DERIVADAS (para InfoDisplay y Charts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula todas las cantidades físicas derivadas del estado actual.
 * Llamado a 30 Hz desde la UI para actualizar paneles e información.
 */
export function computeDerived(
  state: PendulumState,
  params: PendulumParams
): DerivedQuantities {
  const I    = computeInertia(params)
  const d    = computeCenterOfMass(params)
  const Leq  = computeEquivalentLength(params)
  const M    = params.m + params.mr
  const fluid = getFluidProperties(params.fluid, params.tempC)

  // Período teórico (aproximación ángulos pequeños)
  const T = 2 * Math.PI * Math.sqrt(I / (M * params.g * d))
  const f = 1 / T

  // Energías mecánicas
  const Ec = 0.5 * I * state.omega * state.omega
  const Ep = M * params.g * d * (1 - Math.cos(state.theta))
  const Etotal = Ec + Ep

  // Régimen de flujo
  const Re     = computeReynolds(state.omega, params, fluid)
  const regime = classifyRegime(Re)
  const b      = computeDamping(state.omega, params, fluid)

  return { I, d, M, T, f, Leq, Ec, Ep, Etotal, Re, regime, b }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDACIÓN (para Vitest y verificación experimental)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el período teórico T = 2π√(I / (M·g·d)) para los parámetros dados.
 * Usado en tests de validación: debe coincidir con T_lab = 1.04s ±2%.
 */
export function calculatePeriod(params: PendulumParams): number {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  return 2 * Math.PI * Math.sqrt(I / (M * params.g * d))
}

/**
 * Verifica que el período calculado tenga error < tolerancia respecto al lab.
 * @param params      - Parámetros del péndulo
 * @param T_lab       - Período medido en laboratorio (s)
 * @param tolerancia  - Tolerancia máxima permitida (default: 0.02 = 2%)
 * @returns true si el error relativo es menor a la tolerancia
 */
export function validateAgainstLab(
  params: PendulumParams,
  T_lab: number = 1.04,
  tolerancia: number = 0.02
): boolean {
  const T_calc = calculatePeriod(params)
  const error = Math.abs(T_calc - T_lab) / T_lab
  return error <= tolerancia
}