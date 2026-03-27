// ─── GEOMETRÍA DEL PÉNDULO FÍSICO ────────────────────────────────────────────
// Calcula propiedades geométricas e inerciales del péndulo.
// Modelo: barra de MDF (masa distribuida) + masa puntual en el extremo.
// TypeScript puro — cero imports externos.

import type { PendulumParams } from '../types/physics.types'

/**
 * Momento de inercia total respecto al pivote (kg·m²).
 * I = (1/3)·m·L²  +  mr·L²
 * Verificación lab: (1/3)×0.020×0.0625 + 0.075×0.0625 = 0.005105 kg·m²
 */
export function computeInertia(params: PendulumParams): number {
  const { L, m, mr } = params
  const L2 = L * L
  return (1 / 3) * m * L2 + mr * L2
}

/**
 * Distancia del centro de masa al pivote (m).
 * d = (m·L/2 + mr·L) / (m + mr)
 * Verificación lab: ≈ 0.24997 m ≈ L (barra muy ligera frente a la masa)
 */
export function computeCenterOfMass(params: PendulumParams): number {
  const { L, m, mr } = params
  return (m * (L / 2) + mr * L) / (m + mr)
}

/**
 * Longitud equivalente de péndulo simple con el mismo período (m).
 * Leq = I / (M·d)
 * Se muestra en InfoDisplay para referencia intuitiva.
 */
export function computeEquivalentLength(params: PendulumParams): number {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  if (M === 0 || d === 0) return 0
  return I / (M * d)
}

/**
 * Radio efectivo de la masa (m), asumiendo esfera de densidad ~5000 kg/m³.
 * Usado por fluids.ts para Ley de Stokes y arrastre turbulento.
 */
export function computeMassRadius(params: PendulumParams): number {
  const densidad = 5000 // kg/m³ — metal de laboratorio típico
  const vol = params.mr / densidad
  return Math.cbrt((3 * vol) / (4 * Math.PI))
}

/**
 * Área frontal de la masa esférica (m²).
 * A = π·r²   — usada en F_turbulento = ½·ρ·Cd·A·v²
 */
export function computeFrontalArea(params: PendulumParams): number {
  const r = computeMassRadius(params)
  return Math.PI * r * r
}