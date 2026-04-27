// ─── ESQUEMAS DE FÍSICA ──────────────────────────────────────────────────────
//
// Validación runtime de los parámetros del péndulo en el límite del API.
// Espeja la interfaz PendulumParams del paquete @pendulo/physics, pero como
// schemas Zod para que Fastify pueda validar el body de /physics/simulate.
//
// El paquete @pendulo/physics es TS puro y NO depende de Zod (no debe).
// Esta validación ocurre solo en la frontera HTTP.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ─── Fluidos disponibles ──────────────────────────────────────────────────────
export const FluidIdSchema = z.enum(['vacuum', 'air', 'water', 'oil', 'glycerin'])
export type FluidId = z.infer<typeof FluidIdSchema>

// ─── Parámetros del péndulo ───────────────────────────────────────────────────
//
// Los rangos se eligen para cubrir todos los escenarios pedagógicamente útiles
// sin permitir valores patológicos (que romperían RK4 o saturarían el servidor).
//
export const PendulumParamsSchema = z
  .object({
    L:           z.number().positive().max(10),                 // m
    m:           z.number().nonnegative().max(50),              // kg (barra)
    mr:          z.number().nonnegative().max(100),             // kg (extremo)
    g:           z.number().positive().max(50),                 // m/s²
    theta0:      z.number().min(-Math.PI).max(Math.PI),         // rad — amplitud inicial
    fluid:       FluidIdSchema,
    tempC:       z.number().min(-100).max(200),                 // °C
    pivotOffset: z.number().nonnegative(),                      // m, en [0, L]
  })
  .refine(p => p.pivotOffset <= p.L, {
    message: 'pivotOffset debe estar dentro de [0, L]',
    path:    ['pivotOffset'],
  })
  .refine(p => p.m + p.mr > 0, {
    message: 'la masa total (m + mr) debe ser positiva',
    path:    ['m'],
  })

export type PendulumParams = z.infer<typeof PendulumParamsSchema>

// ─── Estado del péndulo (lo que devuelve un step de RK4) ─────────────────────
export const PendulumStateSchema = z.object({
  theta: z.number(),
  omega: z.number(),
  time:  z.number().nonnegative(),
})
export type PendulumState = z.infer<typeof PendulumStateSchema>

// ─── Cantidades derivadas (las que muestra InfoDisplay) ──────────────────────
export const StabilitySchema = z.enum(['stable', 'critical', 'unstable'])
export const RegimeSchema    = z.enum(['laminar', 'transition', 'turbulent'])

export const DerivedQuantitiesSchema = z.object({
  I:         z.number(),
  d:         z.number(),
  M:         z.number(),
  T:         z.number(),
  f:         z.number(),
  Leq:       z.number(),
  Ec:        z.number(),
  Ep:        z.number(),
  Etotal:    z.number(),
  Re:        z.number(),
  regime:    RegimeSchema,
  b:         z.number(),
  stability: StabilitySchema,
})
export type DerivedQuantities = z.infer<typeof DerivedQuantitiesSchema>
