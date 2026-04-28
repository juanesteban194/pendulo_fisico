// ─── VALIDACIÓN DE RESPUESTAS A EJERCICIOS ───────────────────────────────────
//
// Tres tipos: numeric (con tolerancia relativa), multiple (string exacto),
// open (siempre se acepta — solo se registra).

import {
  ExpectedAnswerSchema,
  type ExpectedAnswer,
} from '@pendulo/schemas'

export interface ValidationResult {
  correct:   boolean
  expected:  number | string
  tolerance: number | undefined
  feedback:  string
}

/**
 * Valida una respuesta contra el ejercicio. La lógica numérica usa error
 * relativo: |user − expected| / |expected| ≤ tolerance. Si expected = 0,
 * usamos error absoluto: |user| ≤ tolerance.
 *
 * `expectedAnswer` puede llegar serializado (string JSON desde SQLite) o
 * como objeto (desde el schema/seed). Aceptamos ambos por conveniencia.
 */
export function validateAnswer(
  exercise: {
    expectedAnswer: ExpectedAnswer | string
    tolerance?:     number | undefined
    feedbackOk:     string
    feedbackFail:   string
  },
  userAnswer: number | string,
): ValidationResult {
  const expected: ExpectedAnswer = ExpectedAnswerSchema.parse(
    typeof exercise.expectedAnswer === 'string'
      ? JSON.parse(exercise.expectedAnswer)
      : exercise.expectedAnswer,
  )

  switch (expected.type) {
    case 'open': {
      return {
        correct:   true,
        expected:  '',
        tolerance: undefined,
        feedback:  exercise.feedbackOk || 'Respuesta registrada.',
      }
    }

    case 'multiple': {
      const u = String(userAnswer).trim().toLowerCase()
      const e = expected.value.trim().toLowerCase()
      const ok = u === e
      return {
        correct:   ok,
        expected:  expected.value,
        tolerance: undefined,
        feedback:  ok ? exercise.feedbackOk : exercise.feedbackFail,
      }
    }

    case 'number': {
      const u = typeof userAnswer === 'number' ? userAnswer : Number(userAnswer)
      if (!Number.isFinite(u)) {
        return {
          correct:   false,
          expected:  expected.value,
          tolerance: exercise.tolerance ?? undefined,
          feedback:  'La respuesta no es un número válido.',
        }
      }

      const tol = exercise.tolerance ?? 0.02
      const eAbs = Math.abs(expected.value)
      const err  = eAbs < 1e-12
        ? Math.abs(u)
        : Math.abs(u - expected.value) / eAbs
      const ok = err <= tol

      return {
        correct:   ok,
        expected:  expected.value,
        tolerance: tol,
        feedback:  ok ? exercise.feedbackOk : exercise.feedbackFail,
      }
    }
  }
}
