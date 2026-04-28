// ─── SETUP DE ENTORNO PARA TESTS ─────────────────────────────────────────────
//
// Vitest no carga el .env automáticamente. Este archivo se ejecuta antes que
// cualquier import (config: setupFiles), de modo que `env.ts` ya encuentra
// los valores cuando hace su parseo Zod.
//
// Apuntamos a la misma SQLite (apps/api/prisma/dev.db) que ya tiene seed.

process.env.NODE_ENV     = 'test'
process.env.PORT         = '4001'
process.env.HOST         = '127.0.0.1'
process.env.CORS_ORIGINS = 'http://localhost:3000'
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
process.env.RATE_LIMIT_MAX = '100'
