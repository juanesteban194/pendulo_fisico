// ─── RUTAS DE FÍSICA ─────────────────────────────────────────────────────────
//
// POST /physics/simulate   → corre RK4 server-side y devuelve la trayectoria.
//
// Útil para los retos finales (sección 8) sin saturar el cliente con
// integraciones de minutos. Rate-limit aplicado: este endpoint es CPU-pesado.

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  SimulateRequestSchema,
  SimulateResponseSchema,
} from '@pendulo/schemas'
import { runSimulation } from '../lib/simulate'

export const physicsRoutes: FastifyPluginAsyncZod = async app => {
  app.post(
    '/simulate',
    {
      // Rate-limit más estricto: la simulación gasta CPU
      config: { rateLimit: { max: 5, timeWindow: '1 second' } },
      schema: {
        body:     SimulateRequestSchema,
        response: { 200: SimulateResponseSchema },
      },
    },
    async req => runSimulation(req.body),
  )
}
