// ─── RUTAS DE CONTENIDO ──────────────────────────────────────────────────────
//
// GET  /content/sections            → SectionsListResponse (sin body MDX)
// GET  /content/sections/:slug      → SectionFull (con body MDX y ejercicios)

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  SectionsListResponseSchema,
  SectionFullSchema,
  ExpectedAnswerSchema,
} from '@pendulo/schemas'
import { prisma } from '../db'

export const contentRoutes: FastifyPluginAsyncZod = async app => {
  // ── GET /sections ──────────────────────────────────────────────────────
  app.get(
    '/sections',
    {
      schema: {
        response: { 200: SectionsListResponseSchema },
      },
    },
    async () => {
      const rows = await prisma.section.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true, slug: true, order: true, title: true, summary: true,
          prerequisites: true, estimatedMinutes: true,
        },
      })
      return {
        sections: rows.map(r => ({
          id:               r.id,
          slug:             r.slug,
          order:            r.order,
          title:            r.title,
          summary:          r.summary,
          prerequisites:    JSON.parse(r.prerequisites) as string[],
          estimatedMinutes: r.estimatedMinutes,
        })),
      }
    },
  )

  // ── GET /sections/:slug ────────────────────────────────────────────────
  app.get(
    '/sections/:slug',
    {
      schema: {
        params:   z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) }),
        response: { 200: SectionFullSchema },
      },
    },
    async (req, reply) => {
      const row = await prisma.section.findUnique({
        where: { slug: req.params.slug },
        include: { exercises: true },
      })
      if (!row) return reply.notFound(`Sección no encontrada: ${req.params.slug}`)
      return {
        id:               row.id,
        slug:             row.slug,
        order:            row.order,
        title:            row.title,
        summary:          row.summary,
        prerequisites:    JSON.parse(row.prerequisites) as string[],
        estimatedMinutes: row.estimatedMinutes,
        contentMdx:       row.contentMdx,
        exercises: row.exercises.map(e => ({
          id:             e.id,
          sectionId:      e.sectionId,
          prompt:         e.prompt,
          expectedAnswer: ExpectedAnswerSchema.parse(JSON.parse(e.expectedAnswer)),
          tolerance:      e.tolerance ?? undefined,
          unit:           e.unit ?? undefined,
          feedbackOk:     e.feedbackOk,
          feedbackFail:   e.feedbackFail,
        })),
      }
    },
  )
}
