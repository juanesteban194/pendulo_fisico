// ─── CLIENTE PRISMA SINGLETON ────────────────────────────────────────────────
//
// Una sola instancia de PrismaClient en todo el proceso. En tests usamos
// `await prisma.$disconnect()` al teardown.

import { PrismaClient } from '@prisma/client'
import { env } from './env'

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export type Db = typeof prisma
