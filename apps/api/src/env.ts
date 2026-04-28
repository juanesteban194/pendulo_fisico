// ─── PARSEO Y VALIDACIÓN DE VARIABLES DE ENTORNO ─────────────────────────────
//
// Centraliza la carga del entorno con Zod. Si falta algo crítico, el server
// no arranca (fail-fast). El módulo se ejecuta una sola vez al import.

import 'node:process'
import { z } from 'zod'

const EnvSchema = z.object({
  PORT:            z.coerce.number().int().positive().default(4000),
  HOST:            z.string().default('0.0.0.0'),
  NODE_ENV:        z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS:    z.string().default('http://localhost:3000'),
  DATABASE_URL:    z.string().min(1, 'DATABASE_URL es obligatoria'),
  RATE_LIMIT_MAX:  z.coerce.number().int().positive().default(10),
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:\n', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env

/** CORS_ORIGINS llega como CSV; lo expandimos aquí. */
export const corsOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
