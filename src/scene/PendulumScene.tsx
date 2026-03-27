// ─── TRAYECTORIA DEL PÉNDULO ──────────────────────────────────────────────────
//
// Dibuja la estela del extremo de la masa, coloreada por velocidad angular.
//
// Implementación: array ordenado de puntos (más simple y sin artefactos).
// Cada frame agrega el punto más nuevo al final y elimina el más antiguo
// del inicio. Three.js siempre dibuja los puntos en orden → sin líneas
// de "salto" ni artefactos visuales.
//
// Codificación de color:
//   |ω| bajo  (extremos, velocidad mínima) → azul   [0.25, 0.55, 0.95]
//   |ω| alto  (centro,   velocidad máxima) → naranja [0.98, 0.45, 0.08]
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useMemo } from 'react'
import { useFrame }  from '@react-three/fiber'
import * as THREE    from 'three'
import { useSimulationStore, selectParams } from '../store/simulationStore'

const SCALE      = 2.5
const MAX_POINTS = 400

// ─── Color por velocidad ──────────────────────────────────────────────────────

function speedToColor(omega: number, maxOmega: number): [number, number, number] {
  const t = maxOmega > 0.001 ? Math.min(1, Math.abs(omega) / maxOmega) : 0
  return [0.25 + t * 0.73, 0.55 - t * 0.10, 0.95 - t * 0.87]
}

// ─── Tipo de punto ────────────────────────────────────────────────────────────

type Point = [number, number, number, number, number]  // [x, y, r, g, b]

// ─── Componente ───────────────────────────────────────────────────────────────

export function TrajectoryLine() {
  const params   = useSimulationStore(selectParams)

  // Array ordenado: [0] = punto más antiguo, [last] = más nuevo.
  // push() agrega al final, shift() elimina del inicio.
  // Nunca hay saltos de orden → sin artefactos visuales.
  const pointsRef  = useRef<Point[]>([])
  const maxOmega   = useRef(0.01)
  const lineRef    = useRef<THREE.Line | null>(null)
  const prevParams = useRef(params)

  // Limpiar trayectoria cuando el store resetea el historial
  useEffect(() => {
    return useSimulationStore.subscribe(
      s => s.history.length,
      len => {
        if (len === 0) {
          pointsRef.current = []
          maxOmega.current  = 0.01
        }
      }
    )
  }, [])

  // Limpiar si cambian los parámetros (cambia L → la escala visual cambia)
  useEffect(() => {
    pointsRef.current = []
    maxOmega.current  = 0.01
    prevParams.current = params
  }, [params])

  // Geometría y material — creados una sola vez
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      0.8,
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame(() => {
    if (!lineRef.current) return

    const store               = useSimulationStore.getState()
    const { theta, omega }    = store.state
    const L                   = store.params.L * SCALE

    // Posición del extremo de la masa
    const x =  Math.sin(theta) * L
    const y = -Math.cos(theta) * L

    // Actualizar ω máximo con decaimiento suave
    const absOmega = Math.abs(omega)
    maxOmega.current = absOmega > maxOmega.current
      ? absOmega
      : Math.max(0.01, maxOmega.current * 0.9998)

    // Agregar punto al final, eliminar el más antiguo si es necesario
    const [r, g, b] = speedToColor(omega, maxOmega.current)
    pointsRef.current.push([x, y, r, g, b])
    if (pointsRef.current.length > MAX_POINTS) {
      pointsRef.current.shift()
    }

    // Construir Float32Arrays en orden correcto (0 = más antiguo)
    const pts = pointsRef.current
    const n   = pts.length
    if (n < 2) return

    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)

    for (let i = 0; i < n; i++) {
      const p    = pts[i]!
      const base = i * 3
      pos[base]     = p[0]; pos[base + 1] = p[1]; pos[base + 2] = 0.005
      col[base]     = p[2]; col[base + 1] = p[3]; col[base + 2] = p[4]
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    geometry.setDrawRange(0, n)
  })

  return (
    <primitive
      ref={lineRef}
      object={new THREE.Line(geometry, material)}
    />
  )
}