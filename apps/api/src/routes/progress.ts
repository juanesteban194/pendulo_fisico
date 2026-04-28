// ─── RUTAS DE PROGRESO ───────────────────────────────────────────────────────
//
// POST /progress              → upsert de Progress (auto-crea Session)
// GET  /progress/:sessionId   → SessionProgressResponse (entries + attempts)

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  PostProgressRequestSchema,
  PostProgressResponseSchema,
  SessionProgressResponseSchema,
  SessionIdSchema,
} from '@pendulo/schemas'
import { prisma } from '../db'

export const progressRoutes: FastifyPluginAsyncZod = async app => {
  // ── POST /progress ─────────────────────────────────────────────────────
  app.post(
    '/',
    {
      schema: {
        body:     PostProgressRequestSchema,
        response: { 200: PostProgressResponseSchema },
      },
    },
    async req => {
      const { sessionId, sectionId, completed } = req.body

      // Garantizar que existe la Session (lazy create)
      await prisma.session.upsert({
        where:  { id: sessionId },
        create: { id: sessionId },
        update: {},
      })

      // Verificar que la sección existe
      const sectionExists = await prisma.section.findUnique({ where: { id: sectionId } })
      if (!sectionExists) {
        throw req.server.httpErrors.notFound(`Sección ${sectionId} no existe`)
      }

      await prisma.progress.upsert({
        where:  { sessionId_sectionId: { sessionId, sectionId } },
        create: { sessionId, sectionId, completed },
        update: { completed },
      })

      return { ok: true as const }
    },
  )

  // ── GET /progress/:sessionId ───────────────────────────────────────────
  app.get(
    '/:sessionId',
    {
      schema: {
        params:   z.object({ sessionId: SessionIdSchema }),
        response: { 200: SessionProgressResponseSchema },
      },
    },
    async req => {
      const { sessionId } = req.params

      const [progress, attempts] = await Promise.all([
        prisma.progress.findMany({
          where:  { sessionId },
          select: { sectionId: true, completed: true, updatedAt: true },
        }),
        prisma.attempt.findMany({
          where:   { sessionId },
          orderBy: { createdAt: 'desc' },
          take:    200,
        }),
      ])

      return {
        sessionId,
        progress: progress.map(p => ({
          sectionId: p.sectionId,
          completed: p.completed,
          updatedAt: p.updatedAt.toISOString(),
        })),
        attempts: attempts.map(a => ({
          id:         a.id,
          sessionId:  a.sessionId,
          exerciseId: a.exerciseId,
          userAnswer: a.userAnswer,
          correct:    a.correct,
          createdAt:  a.createdAt.toISOString(),
        })),
      }
    },
  )
}
