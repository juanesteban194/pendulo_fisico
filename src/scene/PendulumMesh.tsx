// ─── GEOMETRÍA VISUAL DEL PÉNDULO ────────────────────────────────────────────
//
// Construye las tres partes del péndulo en la escena Three.js:
//   1. Soporte  — la estructura fija de donde cuelga el péndulo
//   2. Barra    — el brazo que oscila (representa la tabla de MDF)
//   3. Masa     — la esfera en el extremo (representa la masa de laboratorio)
//
// Estrategia de rotación:
//   En vez de calcular la posición X,Y de cada pieza con sin(θ) y cos(θ),
//   usamos un <group> cuyo punto de origen está en el pivote y lo rotamos
//   con θ. Todo lo que esté dentro del grupo rota automáticamente.
//   Esto es más limpio, más eficiente, y evita errores de trigonometría.
//
// Escala visual:
//   SCALE convierte metros reales a unidades Three.js.
//   L_real = 0.25 m  →  L_visual = 0.25 × 2.5 = 0.625 unidades Three.js
//   La física SIEMPRE usa metros reales. SCALE solo afecta lo que se dibuja.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef }    from 'react'
import { useFrame }  from '@react-three/fiber'
import { useSimulationStore, selectTheta, selectParams } from '../store/simulationStore'
import type { Mesh, Group } from 'three'

// ─── Constantes visuales ─────────────────────────────────────────────────────

/** 1 metro real = SCALE unidades Three.js. */
const SCALE = 2.5

/** Grosor visual de la barra (no tiene relación con la física). */
const BAR_WIDTH    = 0.028
const BAR_DEPTH    = 0.018

/** Radio del pivote (punto de giro). */
const PIVOT_RADIUS = 0.038

// ─── Componente ───────────────────────────────────────────────────────────────

export function PendulumMesh() {
  // ── Refs a los objetos 3D ─────────────────────────────────────────────────
  //
  // useRef guarda una referencia directa al objeto Three.js en memoria.
  // Esto nos permite modificarlo cada frame SIN pasar por React,
  // lo que es mucho más eficiente que re-renderizar el componente 60 veces/s.
  //
  const groupRef = useRef<Group>(null)
  const massRef  = useRef<Mesh>(null)

  // ── Leer parámetros del store ─────────────────────────────────────────────
  //
  // selectParams usa el selector del store: solo re-renderiza este componente
  // cuando los parámetros cambian (no en cada tick de física).
  //
  const params = useSimulationStore(selectParams)
  const L      = params.L * SCALE

  // Radio visual de la masa: proporcional a mr, con límites razonables.
  // Con mr=0.075 kg → radius ≈ 0.09 unidades → 16 px a zoom=180
  const massRadius = Math.max(0.06, Math.min(0.16, Math.sqrt(params.mr) * 0.34))

  // ── Actualizar rotación cada frame ───────────────────────────────────────
  //
  // En lugar de leer theta con un selector reactivo (que causaría
  // re-renders del componente a 60 Hz), lo leemos directamente del store
  // con getState() y lo aplicamos al ref. Esto es el patrón correcto para
  // animaciones de alta frecuencia en R3F.
  //
  useFrame(() => {
    if (!groupRef.current) return
    const theta = selectTheta(useSimulationStore.getState())
    // rotation.z = θ rota el grupo alrededor del eje Z (perpendicular a la pantalla)
    // En Three.js el eje Y apunta hacia arriba, por eso la barra cuelga hacia -Y
    groupRef.current.rotation.z = theta
  })

  return (
    <group>
      {/* ── Soporte horizontal (fijo, no rota) ──────────────────────────────
       *
       * Simula la estructura de la que cuelga el péndulo en el laboratorio.
       * Está fuera del grupo rotante para que permanezca estático.
       */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Tornillo central del soporte */}
      <mesh position={[0, 0, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ── Grupo rotante — todo lo que oscila ──────────────────────────────
       *
       * El punto de origen de este grupo está en [0,0,0] (el pivote).
       * Al cambiar rotation.z en useFrame, todo el contenido rota
       * alrededor del pivote exactamente como un péndulo real.
       */}
      <group ref={groupRef}>

        {/* Barra del péndulo
         *
         * BoxGeometry args: [ancho, alto, profundidad]
         * La barra tiene alto = L (la longitud del péndulo en unidades visuales).
         * La geometría se crea centrada en el origen de Three.js, así que
         * su centro queda en Y=0 (el pivote). Para que cuelgue hacia abajo
         * desplazamos su posición a Y = -L/2.
         *
         *   pivote (Y=0)
         *      │  ← extremo superior de la barra
         *      │
         *      │  ← centro de la barra en Y = -L/2
         *      │
         *      ●  ← extremo inferior (masa) en Y = -L
         */}
        <mesh position={[0, -L / 2, 0]}>
          <boxGeometry args={[BAR_WIDTH, L, BAR_DEPTH]} />
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.55}
            metalness={0.15}
          />
        </mesh>

        {/* Masa en el extremo
         *
         * Se posiciona en Y = -L (el extremo de la barra).
         * Su radio varía con la masa real mr para dar feedback visual
         * inmediato cuando el usuario cambia el parámetro.
         */}
        <mesh ref={massRef} position={[0, -L, 0]}>
          <sphereGeometry args={[massRadius, 36, 36]} />
          <meshStandardMaterial
            color="#f97316"
            roughness={0.25}
            metalness={0.45}
            emissive="#7c2d12"
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Conector barra→masa: pequeño cilindro que une visualmente */}
        <mesh position={[0, -L + massRadius * 0.5, 0]}>
          <cylinderGeometry args={[BAR_WIDTH * 0.4, BAR_WIDTH * 0.4, massRadius, 12]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.2} />
        </mesh>

      </group>

      {/* ── Pivote (fijo, encima del grupo rotante) ──────────────────────────
       *
       * Se dibuja último para quedar visualmente encima de la barra.
       * Su posición es fija en el origen — es el punto de giro.
       */}
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[PIVOT_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.2}
          metalness={0.75}
        />
      </mesh>
    </group>
  )
}