'use client'

// ─── ESCENA PRINCIPAL — MODO 2D ───────────────────────────────────────────────

import { useRef, useMemo, useEffect }      from 'react'
import { Canvas }                          from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei'
import * as THREE                          from 'three'
import type { OrthographicCamera as OrthoType } from 'three'
import { PendulumMesh }   from './PendulumMesh'
import { TrajectoryLine } from './TrajectoryLine'
import { useSimulation }  from '../hooks/useSimulation'
import { useSimulationStore } from '../store/simulationStore'

const SCALE        = 2.5
const GRID_SPACING = 0.1 * SCALE
const MAJOR_EVERY  = 0.5 * SCALE

function PhysicsLoop() {
  useSimulation()
  return null
}

function ReferenceGrid() {
  const L = useSimulationStore(s => s.params.L)
  const L_vis = L * SCALE

  const grid = useMemo(() => {
    const xRange  = Math.max(L_vis + 0.5, 1.5)
    const yTop    = Math.max(0.5, L_vis * 0.30)
    const yBottom = -Math.max(L_vis + 0.4, 1.5)

    const positions: number[] = []
    const colors:    number[] = []

    const major: [number, number, number] = [0.66, 0.72, 0.81]
    const minor: [number, number, number] = [0.84, 0.88, 0.92]

    const isMajorTick = (v: number) =>
      Math.abs(Math.round(v / MAJOR_EVERY) * MAJOR_EVERY - v) < 1e-3

    const xStart = Math.floor(-xRange / GRID_SPACING) * GRID_SPACING
    for (let x = xStart; x <= xRange + 1e-6; x += GRID_SPACING) {
      const c = isMajorTick(x) ? major : minor
      positions.push(x, yBottom, -0.05, x, yTop, -0.05)
      colors.push(...c, ...c)
    }
    const yStart = Math.floor(yBottom / GRID_SPACING) * GRID_SPACING
    for (let y = yStart; y <= yTop + 1e-6; y += GRID_SPACING) {
      const c = isMajorTick(y) ? major : minor
      positions.push(-xRange, y, -0.05, xRange, y, -0.05)
      colors.push(...c, ...c)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(colors), 3))

    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.50 })
    return new THREE.LineSegments(geo, mat)
  }, [L_vis])

  useEffect(() => {
    return () => {
      grid.geometry.dispose()
      if (grid.material instanceof THREE.Material) grid.material.dispose()
    }
  }, [grid])

  return <primitive object={grid} />
}

export function PendulumScene() {
  const camRef = useRef<OrthoType>(null)

  return (
    <Canvas
      style={{ background: 'transparent', cursor: 'grab' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onDoubleClick={() => {
        if (!camRef.current) return
        camRef.current.zoom = 180
        camRef.current.position.set(0, -0.15, 10)
        camRef.current.updateProjectionMatrix()
      }}
    >
      <OrthographicCamera
        ref={camRef}
        makeDefault
        position={[0, -0.15, 10]}
        zoom={180}
        near={0.1}
        far={100}
      />
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
      <ReferenceGrid />
      <TrajectoryLine />
      <PendulumMesh />
      <PhysicsLoop />
    </Canvas>
  )
}
