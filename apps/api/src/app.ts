// ─── BUILDER DE LA APP FASTIFY ───────────────────────────────────────────────
//
// `buildApp()` construye la aplicación SIN arrancarla, para que los tests
// puedan inyectarla con supertest. `server.ts` la usa con `.listen()`.
//
// Stack:
//   • @fastify/cors          — CORS configurable por env
//   • @fastify/sensible      — helpers de errores HTTP estándar
//   • @fastify/rate-limit    — protección anti-DoS en endpoints sensibles
//   • fastify-type-provider-zod — validación + serialización de Zod schemas
//
// Todos los endpoints viven bajo el prefijo /api/v1.

import Fastify, { type FastifyInstance } from 'fastify'
import cors                              from '@fastify/cors'
import rateLimit                         from '@fastify/rate-limit'
import sensible                          from '@fastify/sensible'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
}                                        from 'fastify-type-provider-zod'

import { env, corsOrigins } from './env'
import { prisma }           from './db'

import { contentRoutes }   from './routes/content'
import { exercisesRoutes } from './routes/exercises'
import { progressRoutes }  from './routes/progress'
import { physicsRoutes }   from './routes/physics'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV === 'test'
      ? false
      : {
          level: env.NODE_ENV === 'development' ? 'info' : 'warn',
          transport: env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', colorize: true } }
            : undefined,
        },
  }).withTypeProvider<ZodTypeProvider>()

  // ── Validación con Zod ──────────────────────────────────────────────────
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // ── Plugins ─────────────────────────────────────────────────────────────
  await app.register(sensible)
  await app.register(cors, {
    origin: (origin, cb) => {
      // Sin origen (curl, mismo-origen) → permitir
      if (!origin) return cb(null, true)
      if (corsOrigins.includes(origin)) return cb(null, true)
      cb(new Error('CORS: origen no permitido'), false)
    },
    credentials: true,
  })
  await app.register(rateLimit, {
    max:        env.RATE_LIMIT_MAX,
    timeWindow: '1 second',
    // Solo aplica el límite a las rutas que lo declaran explícitamente
    // (evitamos limitar GETs de contenido).
    global: false,
  })

  // ── Hook para liberar Prisma al cerrar ──────────────────────────────────
  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  // ── Health check ────────────────────────────────────────────────────────
  app.get('/health', async () => ({ ok: true, env: env.NODE_ENV }))

  // ── Rutas de la API ─────────────────────────────────────────────────────
  await app.register(
    async scope => {
      await scope.register(contentRoutes,   { prefix: '/content' })
      await scope.register(exercisesRoutes, { prefix: '/exercises' })
      await scope.register(progressRoutes,  { prefix: '/progress' })
      await scope.register(physicsRoutes,   { prefix: '/physics' })
    },
    { prefix: '/api/v1' },
  )

  return app
}
