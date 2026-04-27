// ─── GEOMETRÍA DEL PÉNDULO FÍSICO ────────────────────────────────────────────
// Calcula propiedades geométricas e inerciales del péndulo.
// Modelo: barra de MDF (masa distribuida) + masa puntual en el extremo inferior,
//         con el pivote a distancia `a = pivotOffset` del extremo superior.
// TypeScript puro — cero imports externos.

import type { PendulumParams } from '../types/physics.types'

/**
 * Momento de inercia total respecto al pivote (kg·m²).
 *
 * Aplicando el teorema de los ejes paralelos a la barra (uniforme, longitud L):
 *   I_bar = I_cm + m·d²  =  (1/12)·m·L²  +  m·(L/2 − a)²
 *
 * La masa puntual en el extremo inferior está a distancia (L − a) del pivote:
 *   I_masa = mr·(L − a)²
 *
 * Para a = 0 (pivote en el extremo): I = (1/3)·m·L² + mr·L² (caso clásico).
 */
export function computeInertia(params: PendulumParams): number {
  const { L, m, mr, pivotOffset: a } = params
  const dBarFromPivot = L / 2 - a
  const dMassFromPivot = L - a
  const I_bar  = (1 / 12) * m * L * L + m * dBarFromPivot * dBarFromPivot
  const I_mass = mr * dMassFromPivot * dMassFromPivot
  return I_bar + I_mass
}

/**
 * Distancia con signo del pivote al centro de masa (m).
 *
 *   d = [m·(L/2 − a) + mr·(L − a)] / (m + mr)
 *
 * Convención de signos:
 *   d > 0 → CM por debajo del pivote → equilibrio ESTABLE (oscila)
 *   d = 0 → pivote en el CM           → equilibrio NEUTRO  (no oscila, gira libre)
 *   d < 0 → CM por encima del pivote  → equilibrio INESTABLE (péndulo invertido)
 */
export function computeCenterOfMass(params: PendulumParams): number {
  const { L, m, mr, pivotOffset: a } = params
  const M = m + mr
  if (M === 0) return 0
  return (m * (L / 2 - a) + mr * (L - a)) / M
}

/**
 * Longitud equivalente de péndulo simple con el mismo período (m).
 *   Leq = I / (M·|d|)
 *
 * Solo definida para equilibrio estable (d > 0). Retorna Infinity si d ≤ 0
 * (sistema crítico o inestable: no existe péndulo simple equivalente).
 */
export function computeEquivalentLength(params: PendulumParams): number {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr
  if (M === 0 || Math.abs(d) < 1e-9) return Infinity
  return I / (M * Math.abs(d))
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

/**
 * Distancia del pivote a la masa puntual (m).
 * = L − pivotOffset.
 * Usado por la visualización y la trayectoria.
 */
export function computeMassDistance(params: PendulumParams): number {
  return params.L - params.pivotOffset
}
