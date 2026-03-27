// ─── CONFIGURACIÓN DE VITE ───────────────────────────────────────────────────
//
// Vite es el servidor de desarrollo y el bundler (empaquetador) del proyecto.
// En desarrollo: sirve los archivos directamente sin compilar, lo que hace
//   que los cambios en el código aparezcan en pantalla en < 50 ms.
// En producción: compila y optimiza todo en archivos estáticos listos para
//   subir a cualquier servidor web.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Plugin oficial de React para Vite.
    // Activa el Fast Refresh: cuando editas un componente, solo ese componente
    // se actualiza en pantalla sin recargar la página completa ni perder el
    // estado de la simulación.
    react(),
  ],

  // ── Configuración de Vitest (tests) ──────────────────────────────────────
  //
  // Vitest lee esta sección cuando corre `npm run test`.
  // Reutiliza la misma configuración de Vite, así que los mismos alias
  // de imports y plugins aplican en los tests.
  //
  test: {
    // globals: true permite usar describe/it/expect sin importarlos en cada test
    globals: true,
    // jsdom simula un navegador en Node.js para poder usar APIs del DOM en tests
    environment: 'jsdom',
    // Patrón de archivos de test
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})