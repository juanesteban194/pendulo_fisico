// ─── ESQUEMAS DE SESIÓN Y PROGRESO ───────────────────────────────────────────
//
// Fase 1: el alumno es anónimo. Genera un UUID en localStorage al primer
// ingreso (sessionId) y todo el progreso se asocia a ese UUID.
//
// Fase 2 (futuro): este UUID podrá vincularse a una cuenta institucional
// (CAS/SSO de UdeM) sin migración de datos — solo se añade un userId opcional.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

export const SessionIdSchema = z.string().uuid()
export type  SessionId       = z.infer<typeof SessionIdSchema>

// ─── Intento de un ejercicio ──────────────────────────────────────────────────
export const AttemptSchema = z.object({
  id:         z.number().int(),
  sessionId:  SessionIdSchema,
  exerciseId: z.string(),
  userAnswer: z.string(),                                  // siempre serializado a string
  correct:    z.boolean(),
  createdAt:  z.string().datetime(),
})
export type Attempt = z.infer<typeof AttemptSchema>

// ─── Progreso por sección ─────────────────────────────────────────────────────
export const ProgressEntrySchema = z.object({
  sectionId: z.number().int().positive(),
  completed: z.boolean(),
  updatedAt: z.string().datetime(),
})
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>

// ─── POST /api/v1/progress ───────────────────────────────────────────────────
export const PostProgressRequestSchema = z.object({
  sessionId:  SessionIdSchema,
  sectionId:  z.number().int().positive(),
  exerciseId: z.string().optional(),
  completed:  z.boolean(),
})
export type PostProgressRequest = z.infer<typeof PostProgressRequestSchema>

export const PostProgressResponseSchema = z.object({
  ok: z.literal(true),
})
export type PostProgressResponse = z.infer<typeof PostProgressResponseSchema>

// ─── GET /api/v1/progress/:sessionId ─────────────────────────────────────────
export const SessionProgressResponseSchema = z.object({
  sessionId: SessionIdSchema,
  progress:  z.array(ProgressEntrySchema),
  attempts:  z.array(AttemptSchema),
})
export type SessionProgressResponse = z.infer<typeof SessionProgressResponseSchema>
