// ─── ESCENA PRINCIPAL — MODO 2D ───────────────────────────────────────────────
//
// Cámara ortográfica → apariencia 2D perfecta.
// MapControls → zoom con rueda del ratón, paneo con clic + arrastre.
//
// Controles de navegación:
//   • Rueda del ratón        → zoom in / zoom out
//   • Clic izquierdo + drag  → desplazar la vista (pan)
//   • Doble clic             → resetear la vista al centro
// ─────────────────────────────────────────────────────────────────────────────

import { useRef }                          from 'react'
import { Canvas }                          from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei'
import type { OrthographicCamera as OrthoType } from 'three'
import { PendulumMesh }   from './PendulumMesh'
import { TrajectoryLine } from './TrajectoryLine'
import { useSimulation }  from '../hooks/useSimulation'

function PhysicsLoop() {
  useSimulation()
  return null
}

export function PendulumScene() {
  const camRef = useRef<OrthoType>(null)

  return (
    <Canvas
      style={{ background: 'transparent', cursor: 'grab' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onDoubleClick={() => {
        // Doble clic: resetear zoom y posición de la cámara
        if (!camRef.current) return
        camRef.current.zoom     = 180
        camRef.current.position.set(0, -0.15, 10)
        camRef.current.updateProjectionMatrix()
      }}
    >
      {/* Cámara ortográfica
       *  position Y=-0.15: baja el origen ligeramente para que el péndulo
       *  (que cuelga hacia -Y desde el pivote en 0,0) quede más centrado.
       *  zoom=180: 1 unidad Three.js ≈ 180px en pantalla.
       */}
      <OrthographicCamera
        ref={camRef}
        makeDefault
        position={[0, -0.15, 10]}
        zoom={180}
        near={0.1}
        far={100}
      />

      {/* MapControls: zoom + pan sin rotación.
       *  enableRotate={false} desactiva el clic derecho/medio para rotar.
       *  screenSpacePanning mueve la cámara en el plano de la pantalla,
       *  no hacia/desde el objetivo — correcto para 2D.
       *  minZoom/maxZoom limitan el rango de zoom útil.
       */}
      <MapControls
        enableRotate={false}
        screenSpacePanning={true}
        minZoom={30}
        maxZoom={800}
        zoomSpeed={0.8}
        panSpeed={0.9}
      />

      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 5]} intensity={0.85} />
      <pointLight position={[-3, 2, 4]} intensity={0.3} color="#dbeafe" />

      <TrajectoryLine />
      <PendulumMesh />
      <PhysicsLoop />
    </Canvas>
  )
}