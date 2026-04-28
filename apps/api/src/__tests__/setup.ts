// ─── HELPERS DE SETUP DE TESTS ───────────────────────────────────────────────
//
// Construye una app Fastify aislada con DB sembrada para cada suite.
// Usa la misma SQLite (apps/api/prisma/dev.db) — los tests asumen que
// `pnpm db:reset` ya corrió. Si no, se ejecuta automáticamente desde
// el script de package.json antes de testear.

import { buildApp } from '../app'
import type { FastifyInstance } from 'fastify'

export async function makeTestApp(): Promise<FastifyInstance> {
  // En modo test desactivamos logs ruidosos
  process.env.NODE_ENV = 'test'
  const app = await buildApp()
  await app.ready()
  return app
}
