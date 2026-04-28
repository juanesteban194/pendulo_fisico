// ─── RUTAS DE EJERCICIOS ─────────────────────────────────────────────────────
//
// POST /exercises/validate   → valida userAnswer contra expectedAnswer.
//
// Si viene sessionId, se registra un Attempt (auto-creando Session si no
// existe). El frontend genera el sessionId UUID en localStorage al primer
// uso — fase 1 sin login.

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  ValidateExerciseRequestSchema,
  ValidateExerciseResponseSchema,
} from '@pendulo/schemas'
import { prisma }         from '../db'
import { validateAnswer } from '../lib/validate-answer'

export const exercisesRoutes: FastifyPluginAsyncZod = async app => {
  app.post(
    '/validate',
    {
      // Rate limit aplicado solo a este endpoint (potencialmente caro de spammear)
      config: { rateLimit: { max: 30, timeWindow: '1 second' } },
      schema: {
        body:     ValidateExerciseRequestSchema,
        response: { 200: ValidateExerciseResponseSchema },
      },
    },
    async (req, reply) => {
      const { exerciseId, userAnswer, sessionId } = req.body

      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
      })
      if (!exercise) return reply.notFound(`Ejercicio no encontrado: ${exerciseId}`)

      const result = validateAnswer(
        {
          expectedAnswer: exercise.expectedAnswer,
          tolerance:      exercise.tolerance ?? undefined,
          feedbackOk:     exercise.feedbackOk,
          feedbackFail:   exercise.feedbackFail,
        },
        userAnswer,
      )

      // Registrar el intento si tenemos sessionId
      if (sessionId) {
        await prisma.session.upsert({
          where:  { id: sessionId },
          create: { id: sessionId },
          update: {},
        })
        await prisma.attempt.create({
          data: {
            sessionId,
            exerciseId,
            userAnswer: String(userAnswer),
            correct:    result.correct,
          },
        })
      }

      return {
        correct:   result.correct,
        expected:  result.expected,
        tolerance: result.tolerance,
        feedback:  result.feedback,
      }
    },
  )
}
