// ─── PUNTO DE ENTRADA ────────────────────────────────────────────────────────
//
// Este es el primer archivo que ejecuta el navegador.
// Su trabajo es encontrar el elemento <div id="root"> en el HTML
// y montar la aplicación React dentro de él.
//
// StrictMode: en desarrollo, React ejecuta cada componente dos veces
// para detectar efectos secundarios inesperados. No afecta producción.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Buscar el elemento raíz en el HTML
const container = document.getElementById('root')

// Si no existe, el HTML está mal configurado — mejor fallar con un mensaje claro
if (!container) {
  throw new Error(
    '[main.tsx] No se encontró <div id="root"> en el HTML. ' +
    'Verifica que index.html tenga ese elemento.'
  )
}

// Crear la raíz de React y montar la aplicación
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
)