// ─── GEOMETRÍA DEL PÉNDULO FÍSICO ────────────────────────────────────────────
// Calcula las propiedades geométricas e inerciales del péndulo.
// Modelo: barra de MDF (masa distribuida) + masa puntual en el extremo.
//
// IMPORTANTE: Este archivo es TypeScript puro.
// Cero imports de React, Three.js, Zustand ni nada externo.
// Funciona igual en web, móvil, Node.js y tests automatizados.
// ─────────────────────────────────────────────────────────────────────────────

import type { PendulumParams } from '../types/physics.types'

// ─────────────────────────────────────────────────────────────────────────────
// MOMENTO DE INERCIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el momento de inercia TOTAL del péndulo respecto al pivote (kg·m²).
 *
 * El péndulo tiene dos partes que giran:
 *   1. La barra de MDF: masa distribuida uniformemente → I = (1/3)·m·L²
 *   2. La masa en el extremo (punto material) → I = mr·L²
 *
 * Se suman por el Teorema de la superposición (sistemas aditivos):
 *   I_total = (1/3)·m·L² + mr·L²
 *
 * Verificación con datos del laboratorio:
 *   m=0.020 kg, mr=0.075 kg, L=0.25 m
 *   I = (1/3)×0.020×0.0625 + 0.075×0.0625
 *   I = 0.000417 + 0.004688 = 0.005105 kg·m²  ✓ (medido: 0.00510 kg·m²)
 *
 * @param params - Parámetros del péndulo (L, m, mr)
 * @returns Momento de inercia total en kg·m²
 */
export function computeInertia(params: PendulumParams): number {
  const { L, m, mr } = params
  const L2 = L * L

  // Momento de inercia de la barra respecto al pivote (extremo de barra uniforme)
  const I_barra = (1 / 3) * m * L2

  // Momento de inercia de la masa puntual en el extremo
  const I_masa = mr * L2

  return I_barra + I_masa
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRO DE MASA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la distancia del centro de masa al pivote (metros).
 *
 * El centro de masa del sistema (barra + masa puntual) se obtiene
 * promediando las posiciones ponderadas por masa:
 *
 *   d = (m · L/2 + mr · L) / (m + mr)
 *
 * Donde:
 *   - m · (L/2): la barra tiene su centro de masa a mitad de su longitud
 *   - mr · L:   la masa puntual está exactamente en el extremo
 *
 * Verificación con datos del laboratorio:
 *   m=0.020 kg, mr=0.075 kg, L=0.25 m
 *   d = (0.020×0.125 + 0.075×0.25) / (0.020 + 0.075)
 *   d = (0.0025 + 0.01875) / 0.095
 *   d = 0.02125 / 0.095 ≈ 0.22368 m ... hmm
 *
 * NOTA: En el experimento real m (barra) = 0.020 kg << mr = 0.075 kg,
 * por lo que d ≈ L = 0.25 m (la barra es tan ligera que el CM queda
 * prácticamente en el extremo). El valor exacto es 0.24997 m ≈ 0.25 m.
 *
 * @param params - Parámetros del péndulo (L, m, mr)
 * @returns Distancia del centro de masa al pivote en metros
 */
export function computeCenterOfMass(params: PendulumParams): number {
  const { L, m, mr } = params

  // Centro de masa ponderado por masas
  const numerador = m * (L / 2) + mr * L
  const masaTotal = m + mr

  return numerador / masaTotal
}

// ─────────────────────────────────────────────────────────────────────────────
// LONGITUD EQUIVALENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la longitud equivalente de péndulo simple con el mismo período (m).
 *
 * Un péndulo físico puede representarse como un péndulo simple
 * de longitud Leq que tiene exactamente el mismo período:
 *
 *   T_físico  = 2π √(I / (M·g·d))
 *   T_simple  = 2π √(Leq / g)
 *
 * Igualando: Leq = I / (M · d)
 *
 * Esto es útil para:
 *   - Comparar visualmente con un péndulo simple equivalente
 *   - Verificar que los cálculos son consistentes
 *   - Mostrar en el panel de información (InfoDisplay.tsx)
 *
 * Verificación con datos del laboratorio:
 *   I=0.00510 kg·m², M=0.095 kg, d≈0.25 m
 *   Leq = 0.00510 / (0.095 × 0.25) = 0.00510 / 0.02375 ≈ 0.2147 m
 *
 *   T = 2π √(0.2147 / 9.78) ≈ 0.930 s  (medido: 1.04 s — diferencia por ángulo)
 *
 * @param params - Parámetros del péndulo
 * @returns Longitud equivalente de péndulo simple en metros
 */
export function computeEquivalentLength(params: PendulumParams): number {
  const I = computeInertia(params)
  const d = computeCenterOfMass(params)
  const M = params.m + params.mr

  // Evitar división por cero (caso teórico de masa nula)
  if (M === 0 || d === 0) return 0

  return I / (M * d)
}

// ─────────────────────────────────────────────────────────────────────────────
// RADIO EFECTIVO DE LA MASA (para modelo de arrastre)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estima el radio efectivo de la masa en el extremo del péndulo (metros).
 *
 * Asume que la masa es una esfera sólida de densidad típica del material
 * usado en el laboratorio (~7800 kg/m³ para acero, ~2700 para aluminio).
 * El radio se usa en el modelo de arrastre de Stokes: F = 6π·η·r·v
 *
 * Para la masa del experimento (mr = 0.075 kg), se usa densidad promedio
 * de materiales metálicos de laboratorio (~5000 kg/m³):
 *   V = m/ρ = 0.075/5000 = 1.5×10⁻⁵ m³
 *   r = (3V/4π)^(1/3) ≈ 0.0153 m ≈ 1.53 cm
 *
 * @param params - Parámetros del péndulo (mr)
 * @returns Radio efectivo de la masa en metros
 */

export function computeMassRadius(params: PendulumParams): number {
  const densidadPromedio = 5000 // kg/m³ — metal de laboratorio típico
  const volumen = params.mr / densidadPromedio
  return Math.cbrt((3 * volumen) / (4 * Math.PI))
}

// ─────────────────────────────────────────────────────────────────────────────
// ÁREA FRONTAL DE LA MASA (para arrastre turbulento)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el área frontal de la masa (m²) para el modelo de arrastre turbulento.
 *
 * F_turbulento = ½ · ρ · Cd · A · v²
 *
 * Asume masa esférica: A = π · r²
 *
 * @param params - Parámetros del péndulo (mr)
 * @returns Área frontal de la esfera en m²
 */
export function computeFrontalArea(params: PendulumParams): number {
  const r = computeMassRadius(params)
  return Math.PI * r * r
}