// ─── MODELO DE FLUIDOS Y AMORTIGUAMIENTO ─────────────────────────────────────
//
// Modela la resistencia del fluido al movimiento del péndulo.
//
// Fuentes de amortiguamiento implementadas:
//   1. Arrastre aerodinámico de la masa esférica (Stokes / turbulento según Re)
//   2. Arrastre de la barra giratoria (placa plana, integrado a lo largo de L)
//   3. Amortiguamiento estructural: fricción del pivote + pérdidas internas del MDF
//
// El punto 3 es el que hace que el péndulo en aire se detenga en ~30-50 s,
// reproduciendo el comportamiento real de un péndulo de madera en laboratorio.
// ─────────────────────────────────────────────────────────────────────────────

import type { PendulumParams, FluidProperties, FluidId } from './types'
import { computeMassRadius, computeFrontalArea } from './geometry'

// ─── Tabla de fluidos a 20°C ──────────────────────────────────────────────────
const FLUID_TABLE: Record<FluidId, FluidProperties> = {
  vacuum:   { id: 'vacuum',   name: 'Vacío',          rho: 0,      eta: 0,        tempRef: 20, etaTempCoef: 0,     Cd: 0    },
  air:      { id: 'air',      name: 'Aire',            rho: 1.204,  eta: 1.81e-5,  tempRef: 20, etaTempCoef:-0.002, Cd: 0.47 },
  water:    { id: 'water',    name: 'Agua',            rho: 998.2,  eta: 1.002e-3, tempRef: 20, etaTempCoef: 0.025, Cd: 0.47 },
  oil:      { id: 'oil',      name: 'Aceite mineral',  rho: 870,    eta: 0.100,    tempRef: 20, etaTempCoef: 0.050, Cd: 0.47 },
  glycerin: { id: 'glycerin', name: 'Glicerina',       rho: 1261,   eta: 1.500,    tempRef: 20, etaTempCoef: 0.090, Cd: 0.47 },
}

// ─── Parámetros físicos de la barra ──────────────────────────────────────────
/** Ancho de la barra de MDF (m) — igual que BAR_WIDTH en PendulumMesh.tsx */
const BAR_WIDTH = 0.035
/** Cd de placa plana perpendicular al flujo */
const CD_BAR    = 1.17

// ─── Amortiguamiento estructural ─────────────────────────────────────────────
//
// Representa pérdidas mecánicas no aerodinámicas:
//   • Fricción en el pivote (rodamiento / agujero en MDF)
//   • Amortiguamiento interno del material (histéresis del MDF)
//   • Radiación acústica (sonido que emite el péndulo al oscilar)
//
// Valor calibrado para Q ≈ 50 con el péndulo de laboratorio:
//   τ_decay = 2·I / b ≈ 16 s → la amplitud cae al 37% en ~16 oscilaciones.
//   Esto es representativo de un péndulo de madera real en aire.
//
// En vacío se anula para demostrar conservación de energía ideal.
//
const B_STRUCTURAL = 6e-4  // N·m·s — aplica para todos los fluidos excepto vacío

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Retorna las propiedades del fluido ajustadas a la temperatura.
 * η(T) = η_ref · exp(−k · (T − T_ref))
 */
export function getFluidProperties(id: FluidId, tempC: number): FluidProperties {
  const base = FLUID_TABLE[id]
  if (id === 'vacuum') return base
  const T = Math.max(0, Math.min(100, tempC))
  return { ...base, eta: base.eta * Math.exp(-base.etaTempCoef * (T - base.tempRef)) }
}

/**
 * Número de Reynolds: Re = ρ · v · (2r) / η
 * v = |ω| · (L − a) — velocidad lineal del extremo donde está la masa.
 */
export function computeReynolds(
  omega: number,
  params: PendulumParams,
  fluid: FluidProperties
): number {
  if (fluid.id === 'vacuum' || fluid.eta === 0 || fluid.rho === 0) return 0
  const massDist = params.L - params.pivotOffset
  const v = Math.abs(omega) * massDist
  const r = computeMassRadius(params)
  return (fluid.rho * v * 2 * r) / fluid.eta
}

/**
 * Coeficiente de amortiguamiento efectivo total b(ω) [N·m·s/rad].
 *
 * Incluye tres contribuciones:
 *   b_esfera  — arrastre aerodinámico de la masa (Stokes o turbulento)
 *   b_barra   — arrastre de la barra giratoria integrado a lo largo de L
 *   b_struct  — amortiguamiento estructural (pivote + material)
 *
 * Aparece en la ecuación de movimiento como: I·θ'' = −M·g·d·sin(θ) − b·ω
 */
export function computeDamping(
  omega: number,
  params: PendulumParams,
  fluid: FluidProperties
): number {
  // Sin fluido → solo amortiguamiento estructural cero (vacío = conservativo)
  if (fluid.id === 'vacuum') return 0

  const absOmega = Math.abs(omega)
  if (absOmega < 1e-12) return 0

  const { L, pivotOffset: a } = params
  const massDist = L - a
  const r = computeMassRadius(params)
  const A = computeFrontalArea(params)

  // ── 1. Arrastre de la masa esférica ───────────────────────────────────────
  // Distancia masa→pivote = (L − a). El brazo de palanca para el torque
  // y la velocidad lineal v = ω·(L − a).
  const armSq    = massDist * massDist
  const b_stokes = 6 * Math.PI * fluid.eta * r * armSq
  const b_turb   = 0.5 * fluid.rho * fluid.Cd * A * armSq * absOmega

  const Re = computeReynolds(omega, params, fluid)
  let b_esfera: number
  if      (Re < 1)    b_esfera = b_stokes
  else if (Re > 1000) b_esfera = b_turb
  else                b_esfera = (1 - (Re-1)/999) * b_stokes + ((Re-1)/999) * b_turb

  // ── 2. Arrastre de la barra giratoria ────────────────────────────────────
  //
  // La barra rota alrededor del pivote ubicado a distancia `a` del extremo
  // superior. Esto genera dos secciones que aportan torque de arrastre:
  //   • Sección por encima del pivote: longitud `a`,    integral r³dr de 0 a a
  //   • Sección por debajo del pivote: longitud `L−a`,  integral r³dr de 0 a (L−a)
  //
  // Torque total:  τ = ½·ρ·Cd·w·ω²·[a⁴/4 + (L−a)⁴/4]
  // Coeficiente:   b_barra = τ/|ω| = ½·ρ·Cd·w·|ω|·[a⁴ + (L−a)⁴]/4
  //
  // Para a = 0 → coef = L⁴/4 (caso clásico, pivote en el extremo).
  // Para a = L/2 → coef = 2·(L/2)⁴/4 = L⁴/32 (16× menor: barra centrada).
  //
  const aboveLen = a
  const belowLen = massDist
  const barCoef  = (Math.pow(aboveLen, 4) + Math.pow(belowLen, 4)) / 4
  const b_barra  = 0.5 * fluid.rho * CD_BAR * BAR_WIDTH * absOmega * barCoef

  // ── 3. Amortiguamiento estructural ────────────────────────────────────────
  // Independiente del fluido (excepto vacío, ya manejado arriba).

  return b_esfera + b_barra + B_STRUCTURAL
}

/** Clasifica el régimen de flujo según Re. */
export function classifyRegime(Re: number): 'laminar' | 'transition' | 'turbulent' {
  if (Re < 1)    return 'laminar'
  if (Re > 1000) return 'turbulent'
  return 'transition'
}

/** Lista todos los fluidos disponibles (propiedades a 20°C). */
export function getAllFluids(): FluidProperties[] {
  return Object.values(FLUID_TABLE)
}