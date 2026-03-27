// ─── ESCENA PRINCIPAL — MODO 2D ───────────────────────────────────────────────
//
// Configura el entorno 3D de React Three Fiber para renderizar el péndulo
// en modo 2D usando cámara ortográfica.
//
// ¿Por qué "3D" si el simulador es 2D?
//   React Three Fiber siempre trabaja en 3D internamente. Lo que hacemos
//   es elegir una cámara ortográfica que aplana la profundidad, dando un
//   resultado visualmente idéntico a un renderer 2D, pero con toda la
//   potencia de Three.js disponible para escalar a 3D en el futuro.
//
// Para pasar a 3D completo en el futuro (Avance 4):
//   1. Cambiar <OrthographicCamera> por <PerspectiveCamera fov={50} />
//   2. Añadir geometría volumétrica en PendulumMesh.tsx
//   3. La física en physics/ NO cambia en absoluto.
// ─────────────────────────────────────────────────────────────────────────────

import { Canvas }            from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { PendulumMesh }      from './PendulumMesh'
import { TrajectoryLine }    from './TrajectoryLine'
import { useSimulation }     from '../hooks/useSimulation'

// ─── Loop de física (vive dentro del Canvas) ─────────────────────────────────
//
// useSimulation usa useFrame internamente, y useFrame SOLO puede llamarse
// desde dentro de un componente que esté dentro de un <Canvas>.
// Por eso lo encapsulamos en un componente hijo vacío en lugar de llamarlo
// directamente en PendulumScene.
//
function PhysicsLoop() {
  useSimulation()
  return null
}

// ─── Escena ───────────────────────────────────────────────────────────────────

export function PendulumScene() {
  return (
    <Canvas
      // fondo transparente: el color de fondo lo define App.tsx via CSS
      style={{ background: 'transparent' }}
      gl={{
        antialias: true,   // suaviza los bordes dentados (antialiasing)
        alpha:     true,   // activa el canal alfa para fondo transparente
      }}
      // dpr = device pixel ratio: usa la resolución real del monitor
      // [1, 2] significa: mínimo 1x, máximo 2x (evita resoluciones excesivas)
      dpr={[1, 2]}
    >
      {/* ── Cámara ortográfica ───────────────────────────────────────────────
       *
       * zoom={180}: 1 unidad de Three.js = 180 píxeles en pantalla.
       * Con L=0.25 m y SCALE=2.5 en PendulumMesh, el péndulo mide
       * 0.25 × 2.5 = 0.625 unidades → 0.625 × 180 = 112 px de largo.
       *
       * position={[0,0,10]}: la cámara mira desde Z=10 hacia el origen.
       * En modo ortográfico la distancia Z no afecta el tamaño,
       * solo asegura que los objetos queden dentro del rango near/far.
       *
       * makeDefault: indica a R3F que esta es la cámara principal.
       */}
      <OrthographicCamera
        makeDefault
        position={[0, 0.3, 10]}
        zoom={180}
        near={0.1}
        far={100}
      />

      {/* ── Iluminación ──────────────────────────────────────────────────────
       *
       * ambientLight: ilumina todos los objetos por igual desde todas
       * las direcciones. Sin esta luz, las caras no iluminadas serían
       * completamente negras. intensity=0.6 es suave para no lavar los colores.
       *
       * directionalLight: simula luz solar (rayos paralelos desde una
       * dirección fija). Crea el degradado de luz/sombra en la esfera
       * de la masa que le da sensación de volumen.
       */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={0.9}
        castShadow={false}
      />

      {/* ── Contenido de la escena ───────────────────────────────────────────
       *
       * Orden de renderizado (de atrás hacia adelante):
       *   1. TrajectoryLine — la estela (se dibuja primero, queda "detrás")
       *   2. PendulumMesh   — el péndulo encima de la estela
       *   3. PhysicsLoop    — no dibuja nada, solo corre la física
       */}
      <TrajectoryLine />
      <PendulumMesh />
      <PhysicsLoop />
    </Canvas>
  )
}