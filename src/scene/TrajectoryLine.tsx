// ─── TRAYECTORIA DEL PÉNDULO ──────────────────────────────────────────────────
//
// Dibuja la estela del extremo de la masa, coloreada por velocidad angular
// con fade de opacidad: los puntos más antiguos se desvanecen hacia el fondo.
//
// Codificación de color:
//   |ω| bajo  (extremos, velocidad mínima) → azul   [0.25, 0.55, 0.95]
//   |ω| alto  (centro,   velocidad máxima) → naranja [0.98, 0.45, 0.08]
//
// Fade: el color se mezcla hacia el color de fondo (~#e8eef7) según la edad
// del punto (0 = invisible/fondo, 1 = color completo).
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useMemo } from 'react'
import { useFrame }  from '@react-three/fiber'
import * as THREE    from 'three'
import { useSimulationStore, selectParams } from '../store/simulationStore'

const SCALE      = 2.5
const MAX_POINTS = 500

// Color de fondo aproximado del canvas (#e8eef7)
const BG: [number, number, number] = [0.91, 0.93, 0.97]

// ─── Color por velocidad ──────────────────────────────────────────────────────

function speedToColor(omega: number, maxOmega: number): [number, number, number] {
  const t = maxOmega > 0.001 ? Math.min(1, Math.abs(omega) / maxOmega) : 0
  return [0.25 + t * 0.73, 0.55 - t * 0.10, 0.95 - t * 0.87]
}

// Mezcla el color de velocidad con el fondo según la edad del punto.
// age = 0 → punto más antiguo (casi fondo), age = 1 → punto más nuevo (color completo)
function fadedColor(omega: number, maxOmega: number, age: number): [number, number, number] {
  const [r, g, b] = speedToColor(omega, maxOmega)
  return [
    BG[0] + age * (r - BG[0]),
    BG[1] + age * (g - BG[1]),
    BG[2] + age * (b - BG[2]),
  ]
}

// ─── Tipo de punto ────────────────────────────────────────────────────────────

type Point = [number, number, number]  // [x, y, omega]

// ─── Componente ───────────────────────────────────────────────────────────────

export function TrajectoryLine() {
  const params   = useSimulationStore(selectParams)

  const pointsRef  = useRef<Point[]>([])
  const maxOmega   = useRef(0.01)
  const lineRef    = useRef<THREE.Line | null>(null)
  const prevParams = useRef(params)

  // Limpiar cuando el store resetea el historial
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

  // Limpiar si cambian los parámetros
  useEffect(() => {
    pointsRef.current = []
    maxOmega.current  = 0.01
    prevParams.current = params
  }, [params])

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  false,
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame(() => {
    if (!lineRef.current) return

    const store            = useSimulationStore.getState()
    const { theta, omega } = store.state
    const L                = store.params.L * SCALE

    const x =  Math.sin(theta) * L
    const y = -Math.cos(theta) * L

    // Actualizar ω máximo con decaimiento suave
    const absOmega = Math.abs(omega)
    maxOmega.current = absOmega > maxOmega.current
      ? absOmega
      : Math.max(0.01, maxOmega.current * 0.9998)

    pointsRef.current.push([x, y, omega])
    if (pointsRef.current.length > MAX_POINTS) {
      pointsRef.current.shift()
    }

    const pts = pointsRef.current
    const n   = pts.length
    if (n < 2) return

    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)

    for (let i = 0; i < n; i++) {
      const p    = pts[i]!
      // age: 0 = punto más antiguo (inicio del array), 1 = más nuevo (final)
      const age  = n > 1 ? i / (n - 1) : 1
      const base = i * 3
      pos[base]     = p[0]; pos[base + 1] = p[1]; pos[base + 2] = 0.005

      const [r, g, b] = fadedColor(p[2], maxOmega.current, age)
      col[base]     = r; col[base + 1] = g; col[base + 2] = b
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
