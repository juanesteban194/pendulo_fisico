// ─── ESQUEMAS DE EJERCICIOS ──────────────────────────────────────────────────
//
// Cada sección pedagógica tiene 0..N ejercicios de tres tipos:
//   • numeric  — el alumno escribe un número, validado contra `value` ± tolerance
//   • multiple — el alumno selecciona una opción ('a', 'b', ...)
//   • open     — texto libre, no auto-evaluado (se guarda para revisión)
//
// La respuesta esperada se serializa como ExpectedAnswer (discriminated union)
// y se persiste como JSON string en SQLite.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ─── Respuesta esperada (3 tipos) ─────────────────────────────────────────────
export const ExpectedAnswerNumericSchema = z.object({
  type:  z.literal('number'),
  value: z.number(),
})

export const ExpectedAnswerMultipleSchema = z.object({
  type:  z.literal('multiple'),
  value: z.string().min(1),
})

export const ExpectedAnswerOpenSchema = z.object({
  type: z.literal('open'),
})

export const ExpectedAnswerSchema = z.discriminatedUnion('type', [
  ExpectedAnswerNumericSchema,
  ExpectedAnswerMultipleSchema,
  ExpectedAnswerOpenSchema,
])
export type ExpectedAnswer = z.infer<typeof ExpectedAnswerSchema>

// ─── Ejercicio (registro en BD + en seed MDX) ────────────────────────────────
export const ExerciseSchema = z.object({
  id:             z.string().min(1),                             // ej "s2-period-medellin"
  sectionId:      z.number().int().positive(),
  prompt:         z.string().min(1),
  expectedAnswer: ExpectedAnswerSchema,
  tolerance:      z.number().nonnegative().optional(),           // solo numeric
  unit:           z.string().optional(),
  feedbackOk:     z.string(),
  feedbackFail:   z.string(),
})
export type Exercise = z.infer<typeof ExerciseSchema>

// ─── Validación: POST /api/v1/exercises/validate ─────────────────────────────
export const ValidateExerciseRequestSchema = z.object({
  exerciseId: z.string().min(1),
  userAnswer: z.union([z.number(), z.string()]),
  sessionId:  z.string().uuid().optional(),
})
export type ValidateExerciseRequest = z.infer<typeof ValidateExerciseRequestSchema>

export const ValidateExerciseResponseSchema = z.object({
  correct:   z.boolean(),
  expected:  z.union([z.number(), z.string()]),
  tolerance: z.number().nonnegative().optional(),
  feedback:  z.string(),
})
export type ValidateExerciseResponse = z.infer<typeof ValidateExerciseResponseSchema>
