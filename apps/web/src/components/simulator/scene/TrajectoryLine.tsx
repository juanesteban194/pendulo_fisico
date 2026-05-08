'use client'

// ─── TRAYECTORIA DEL PÉNDULO ──────────────────────────────────────────────────

import { useRef, useEffect, useMemo } from 'react'
import { useFrame }  from '@react-three/fiber'
import * as THREE    from 'three'
import { useSimulationStore, selectParams } from '../store/simulationStore'

const SCALE      = 2.5
const MAX_POINTS = 500

const BG: [number, number, number] = [0.91, 0.93, 0.97]

function speedToColor(omega: number, maxOmega: number): [number, number, number] {
  const t = maxOmega > 0.001 ? Math.min(1, Math.abs(omega) / maxOmega) : 0
  return [0.25 + t * 0.73, 0.55 - t * 0.10, 0.95 - t * 0.87]
}

function fadedColor(omega: number, maxOmega: number, age: number): [number, number, number] {
  const [r, g, b] = speedToColor(omega, maxOmega)
  return [
    BG[0] + age * (r - BG[0]),
    BG[1] + age * (g - BG[1]),
    BG[2] + age * (b - BG[2]),
  ]
}

type Point = [number, number, number]

export function TrajectoryLine() {
  const params   = useSimulationStore(selectParams)
  const pointsRef  = useRef<Point[]>([])
  const maxOmega   = useRef(0.01)
  const lineRef    = useRef<THREE.Line | null>(null)
  const prevParams = useRef(params)

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

  useEffect(() => {
    pointsRef.current = []
    maxOmega.current  = 0.01
    prevParams.current = params
  }, [params])

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: false })
    return { geometry: geo, material: mat }
  }, [])

  useFrame(() => {
    if (!lineRef.current) return
    const store            = useSimulationStore.getState()
    const { theta, omega } = store.state
    const radius = (store.params.L - store.params.pivotOffset) * SCALE
    const x =  Math.sin(theta) * radius
    const y = -Math.cos(theta) * radius

    const absOmega = Math.abs(omega)
    maxOmega.current = absOmega > maxOmega.current
      ? absOmega
      : Math.max(0.01, maxOmega.current * 0.9998)

    pointsRef.current.push([x, y, omega])
    if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift()

    const pts = pointsRef.current
    const n   = pts.length
    if (n < 2) return

    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const p    = pts[i]!
      const age  = n > 1 ? i / (n - 1) : 1
      const base = i * 3
      pos[base] = p[0]; pos[base + 1] = p[1]; pos[base + 2] = 0.005
      const [r, g, b] = fadedColor(p[2], maxOmega.current, age)
      col[base] = r; col[base + 1] = g; col[base + 2] = b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    geometry.setDrawRange(0, n)
  })

  return <primitive ref={lineRef} object={new THREE.Line(geometry, material)} />
}
