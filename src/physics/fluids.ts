// ─── MODELO DE FLUIDOS Y AMORTIGUAMIENTO ─────────────────────────────────────
// Modela la resistencia que opone el fluido al movimiento del péndulo.
//
// Implementa dos regímenes físicos según el Número de Reynolds:
//   Re < 1       → Ley de Stokes (arrastre lineal, flujo laminar)
//   1 < Re < 1000 → Interpolación ponderada (régimen de transición)
//   Re > 1000    → Arrastre de forma cuadrático (flujo turbulento)
//
// IMPORTANTE: Este archivo es TypeScript puro.
// Cero imports de React, Three.js, Zustand ni nada externo.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PendulumParams,
  FluidProperties,
  FluidId,
} from '../types/physics.types'
import { computeMassRadius, computeFrontalArea } from './geometry'

// ─────────────────────────────────────────────────────────────────────────────
// TABLA DE FLUIDOS A 20°C (referencia de laboratorio)
// ─────────────────────────────────────────────────────────────────────────────
//
// Propiedades físicas de cada fluido a 20°C:
//   rho       → densidad (kg/m³)
//   eta       → viscosidad dinámica a tempRef (Pa·s)
//   tempRef   → temperatura de referencia (°C)
//   etaTempCoef → coeficiente de variación de viscosidad por °C
//                 modelo: η(T) = η_ref · exp(−k · (T − T_ref))
//                 k > 0: viscosidad cae al aumentar T (líquidos)
//                 k < 0: viscosidad sube al aumentar T (gases)
//   Cd        → coeficiente de arrastre (esfera: 0.47, experimental)
//
// ─────────────────────────────────────────────────────────────────────────────

const FLUID_TABLE: Record<FluidId, FluidProperties> = {
  vacuum: {
    id: 'vacuum',
    name: 'Vacío',
    rho: 0,
    eta: 0,
    tempRef: 20,
    etaTempCoef: 0,
    Cd: 0,
  },
  air: {
    // El aire es un gas: su viscosidad AUMENTA con la temperatura (ley de Sutherland)
    // k < 0 → η crece al subir T
    id: 'air',
    name: 'Aire',
    rho: 1.204,
    eta: 1.81e-5,
    tempRef: 20,
    etaTempCoef: -0.002,   // ≈ +0.2% por °C (Sutherland simplificado)
    Cd: 0.47,
  },
  water: {
    // El agua es un líquido: viscosidad cae fuertemente con la temperatura
    // A 20°C: 1.002 mPa·s | A 60°C: 0.467 mPa·s | A 100°C: 0.282 mPa·s
    id: 'water',
    name: 'Agua',
    rho: 998.2,
    eta: 1.002e-3,
    tempRef: 20,
    etaTempCoef: 0.025,    // cae ~2.5% por °C (aproximación válida 5–80°C)
    Cd: 0.47,
  },
  oil: {
    // Aceite mineral: viscosidad muy sensible a la temperatura
    // A 20°C: ~100 mPa·s | A 60°C: ~15 mPa·s | A 100°C: ~5 mPa·s
    id: 'oil',
    name: 'Aceite mineral',
    rho: 870,
    eta: 0.100,
    tempRef: 20,
    etaTempCoef: 0.050,    // cae ~5% por °C (aceite lubricante estándar)
    Cd: 0.47,
  },
  glycerin: {
    // Glicerina: viscosidad extremadamente dependiente de la temperatura
    // A 20°C: 1.50 Pa·s | A 40°C: 0.28 Pa·s | A 60°C: 0.081 Pa·s
    id: 'glycerin',
    name: 'Glicerina',
    rho: 1261,
    eta: 1.500,
    tempRef: 20,
    etaTempCoef: 0.090,    // cae ~9% por °C (muy alta sensibilidad)
    Cd: 0.47,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna las propiedades físicas del fluido, ajustadas a la temperatura dada.
 *
 * La viscosidad varía con la temperatura según el modelo exponencial:
 *   η(T) = η_ref · exp(−k · (T − T_ref))
 *
 * Donde:
 *   k > 0 → líquidos: η disminuye al aumentar T
 *   k < 0 → gases: η aumenta al aumentar T (ley de Sutherland)
 *
 * La densidad se mantiene constante (variación ≤1% en el rango 0–100°C
 * para los fluidos simulados, no afecta significativamente el período).
 *
 * @param id    - Identificador del fluido ('vacuum'|'air'|'water'|'oil'|'glycerin')
 * @param tempC - Temperatura del fluido en grados Celsius (0–100°C)
 * @returns FluidProperties con viscosidad ajustada a la temperatura
 */
export function getFluidProperties(id: FluidId, tempC: number): FluidProperties {
  const base = FLUID_TABLE[id]

  // Vacío: no hay fluido, no hay ajuste
  if (id === 'vacuum') return base

  // Clamp temperatura al rango físico razonable (0–100°C)
  const T = Math.max(0, Math.min(100, tempC))

  // Modelo exponencial de variación de viscosidad con temperatura
  // η(T) = η_ref · exp(−k · (T − T_ref))
  const deltaT = T - base.tempRef
  const etaAjustada = base.eta * Math.exp(-base.etaTempCoef * deltaT)

  return {
    ...base,
    eta: etaAjustada,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el Número de Reynolds instantáneo del flujo alrededor de la masa.
 *
 * El Número de Reynolds es un número adimensional que caracteriza
 * el tipo de flujo (laminar vs turbulento):
 *
 *   Re = ρ · v · L_car / η
 *
 * Donde:
 *   ρ     → densidad del fluido (kg/m³)
 *   v     → velocidad lineal del extremo del péndulo = |ω| · L (m/s)
 *   L_car → longitud característica = diámetro de la masa = 2·r (m)
 *   η     → viscosidad dinámica del fluido (Pa·s)
 *
 * Regímenes según Re:
 *   Re < 1        → completamente laminar (Ley de Stokes válida)
 *   1 < Re < 1000 → transición (mezcla de ambos modelos)
 *   Re > 1000     → turbulento (arrastre cuadrático domina)
 *
 * @param omega  - Velocidad angular del péndulo (rad/s)
 * @param params - Parámetros del péndulo (L, mr)
 * @param fluid  - Propiedades del fluido (rho, eta)
 * @returns Número de Reynolds (adimensional), 0 si el fluido es vacío
 */
export function computeReynolds(
  omega: number,
  params: PendulumParams,
  fluid: FluidProperties
): number {
  // Sin fluido → Re = 0
  if (fluid.id === 'vacuum' || fluid.eta === 0 || fluid.rho === 0) return 0

  const v = Math.abs(omega) * params.L          // velocidad lineal del extremo (m/s)
  const r = computeMassRadius(params)            // radio de la masa (m)
  const L_car = 2 * r                            // diámetro de la masa (m)

  return (fluid.rho * v * L_car) / fluid.eta
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el coeficiente de amortiguamiento efectivo b(ω) del fluido (N·m·s/rad).
 *
 * El coeficiente b(ω) aparece en la ecuación de movimiento:
 *   I·θ'' = −M·g·d·sin(θ) − b(ω)·ω
 *
 * Su valor depende del régimen de flujo determinado por Re:
 *
 * RÉGIMEN LAMINAR (Re < 1) — Ley de Stokes:
 *   F_Stokes = 6π · η · r · v = 6π · η · r · |ω| · L
 *   τ_Stokes = F_Stokes · L = 6π · η · r · L² · |ω|
 *   b_Stokes = 6π · η · r · L²   (constante, lineal en ω)
 *
 * RÉGIMEN TURBULENTO (Re > 1000) — Arrastre de forma:
 *   F_drag = ½ · ρ · Cd · A · v² = ½ · ρ · Cd · A · (ω·L)²
 *   τ_drag = F_drag · L = ½ · ρ · Cd · A · L³ · ω²
 *   b_turb = ½ · ρ · Cd · A · L² · |ω|   (depende de |ω|, cuadrático)
 *
 * RÉGIMEN DE TRANSICIÓN (1 ≤ Re ≤ 1000):
 *   Interpolación suave entre Stokes y turbulento:
 *   α = (Re − 1) / 999   (0 en Re=1, 1 en Re=1000)
 *   b = (1 − α) · b_Stokes + α · b_turb
 *
 * @param omega  - Velocidad angular del péndulo (rad/s)
 * @param params - Parámetros del péndulo (L, m, mr)
 * @param fluid  - Propiedades del fluido (rho, eta, Cd)
 * @returns Coeficiente de amortiguamiento b(ω) en N·m·s/rad
 */
export function computeDamping(
  omega: number,
  params: PendulumParams,
  fluid: FluidProperties
): number {
  // Sin fluido → sin amortiguamiento
  if (fluid.id === 'vacuum' || fluid.rho === 0) return 0

  const { L } = params
  const r = computeMassRadius(params)    // radio de la masa (m)
  const A = computeFrontalArea(params)   // área frontal (m²)
  const absOmega = Math.abs(omega)

  // ── Caso estático: péndulo parado → sin arrastre ─────────────────────────
  if (absOmega < 1e-12) return 0

  // ── Calcular b_Stokes (laminar) ───────────────────────────────────────────
  // τ = 6π·η·r·v·L = 6π·η·r·L·(|ω|·L) = 6π·η·r·L²·|ω|
  // b = τ / |ω| = 6π·η·r·L²
  const b_stokes = 6 * Math.PI * fluid.eta * r * L * L

  // ── Calcular b_turb (turbulento) ──────────────────────────────────────────
  // τ = ½·ρ·Cd·A·(|ω|·L)²·L = ½·ρ·Cd·A·L³·ω²
  // b = τ / |ω| = ½·ρ·Cd·A·L²·|ω|
  const b_turb = 0.5 * fluid.rho * fluid.Cd * A * L * L * absOmega

  // ── Determinar régimen por Re ─────────────────────────────────────────────
  const Re = computeReynolds(omega, params, fluid)

  if (Re < 1) {
    // Completamente laminar — Ley de Stokes
    return b_stokes
  }

  if (Re > 1000) {
    // Completamente turbulento — arrastre cuadrático
    return b_turb
  }

  // Transición: interpolación lineal suave entre ambos modelos
  // α = 0 en Re=1 (todo Stokes), α = 1 en Re=1000 (todo turbulento)
  const alpha = (Re - 1) / 999
  return (1 - alpha) * b_stokes + alpha * b_turb
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASIFICADOR DE RÉGIMEN (útil para InfoDisplay)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clasifica el régimen de flujo según el Número de Reynolds.
 *
 * @param Re - Número de Reynolds calculado
 * @returns 'laminar' | 'transition' | 'turbulent'
 */
export function classifyRegime(Re: number): 'laminar' | 'transition' | 'turbulent' {
  if (Re < 1) return 'laminar'
  if (Re > 1000) return 'turbulent'
  return 'transition'
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES DE CONSULTA (para ControlPanel e InfoDisplay)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna la lista completa de fluidos disponibles con sus propiedades a 20°C.
 * Útil para poblar el selector de fluidos en ControlPanel.tsx.
 */
export function getAllFluids(): FluidProperties[] {
  return Object.values(FLUID_TABLE)
}

/**
 * Retorna el nombre legible del régimen de flujo para mostrar en la UI.
 */
export function getRegimeName(regime: 'laminar' | 'transition' | 'turbulent'): string {
  const nombres = {
    laminar: 'Laminar (Stokes)',
    transition: 'Transición',
    turbulent: 'Turbulento',
  }
  return nombres[regime]
}