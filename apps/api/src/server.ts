// ─── ENTRY POINT DEL SERVIDOR API ────────────────────────────────────────────
//
// Construye la app via buildApp() y la arranca con .listen().
// Manejo de señales (SIGTERM/SIGINT) para graceful shutdown.

import { buildApp } from './app'
import { env }      from './env'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    app.log.info(`📡 API ${env.NODE_ENV} en http://${env.HOST}:${env.PORT}/api/v1`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  for (const sig of ['SIGTERM', 'SIGINT'] as const) {
    process.on(sig, async () => {
      app.log.info(`Recibido ${sig}, cerrando servidor…`)
      await app.close()
      process.exit(0)
    })
  }
}

start()
