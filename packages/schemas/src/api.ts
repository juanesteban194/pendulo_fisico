// ─── ESQUEMAS DE LOS ENDPOINTS DE API ────────────────────────────────────────
//
// Centraliza los request/response del API Fastify para que el cliente
// tenga inferencia de tipos automática (vía z.infer).
//
// Endpoints (prefijo /api/v1):
//   GET    /content/sections           → SectionsListResponse
//   GET    /content/sections/:slug     → SectionFull
//   POST   /exercises/validate         → ValidateExerciseResponse
//   POST   /progress                   → PostProgressResponse
//   GET    /progress/:sessionId        → SessionProgressResponse
//   POST   /physics/simulate           → SimulateResponse
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { PendulumParamsSchema } from './physics'

// ─── POST /api/v1/physics/simulate ───────────────────────────────────────────
//
// Corre N pasos de RK4 server-side y devuelve la trayectoria muestreada.
// Útil para los retos finales sin saturar el cliente.
//
//   duration:  segundos a simular (máx 60 — limita CPU del servidor)
//   dt:        paso interno de RK4 en segundos (1 ms = 0.001, default)
//   sampleHz:  frecuencia de muestreo de la respuesta (Hz). Por defecto 60.
//              Si dt = 0.001 y sampleHz = 60, el servidor avanza 1000/60 ≈ 17
//              pasos por muestra y devuelve 1 punto cada ~16.7 ms.
//
export const SimulateRequestSchema = z.object({
  params:   PendulumParamsSchema,
  duration: z.number().positive().max(60),
  dt:       z.number().positive().max(0.01).default(0.001),
  sampleHz: z.number().positive().max(1000).default(60),
})
export type SimulateRequest = z.infer<typeof SimulateRequestSchema>

export const SimulateResponseSchema = z.object({
  t:        z.array(z.number()),
  theta:    z.array(z.number()),
  omega:    z.array(z.number()),
  Ec:       z.array(z.number()),
  Ep:       z.array(z.number()),
  Etotal:   z.array(z.number()),
  // Diagnóstico — útil para el panel de retos
  meta: z.object({
    steps:    z.number().int().nonnegative(),
    samples:  z.number().int().nonnegative(),
    duration: z.number().nonnegative(),
  }),
})
export type SimulateResponse = z.infer<typeof SimulateResponseSchema>

// ─── Errores estándar del API ────────────────────────────────────────────────
export const ApiErrorSchema = z.object({
  error:   z.string(),
  message: z.string(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
