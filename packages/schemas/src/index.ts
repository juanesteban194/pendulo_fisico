// ─── PUNTO DE ENTRADA DE @pendulo/schemas ────────────────────────────────────
//
// Esquemas Zod compartidos entre apps/api (validación de requests) y apps/web
// (inferencia de tipos de respuesta). Sin estos, cada lado tendría que
// duplicar las definiciones y arriesgar drift.
//
// Reglas de uso:
//   • El backend SIEMPRE valida con `XSchema.parse()` o `safeParse()` en la
//     frontera HTTP — nunca confiar en el cliente.
//   • El frontend usa los `type Y = z.infer<typeof YSchema>` para tipar
//     fetch/axios responses.
//   • Si un schema cambia, ambas apps recompilan automáticamente vía Turbo.
// ─────────────────────────────────────────────────────────────────────────────

export * from './physics'
export * from './exercise'
export * from './section'
export * from './session'
export * from './api'
