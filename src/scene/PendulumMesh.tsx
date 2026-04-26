// ─── GEOMETRÍA VISUAL DEL PÉNDULO ────────────────────────────────────────────
//
// Construye las partes del péndulo + mejoras visuales físicamente correctas:
//
//   1. Soporte   — estructura fija de donde cuelga el péndulo
//   2. Barra     — brazo oscilante (MDF)
//   3. Masa      — esfera en el extremo; brilla más con mayor Ec
//
// Elementos añadidos:
//   4. Línea de referencia vertical — muestra la posición de equilibrio (θ=0)
//   5. Arco de ángulo θ            — representación estándar de manuales de física
//   6. Flecha de velocidad v        — tangente al arco, |v| = |ω|·L, apunta en
//                                     la dirección de movimiento instantáneo
//
// Estrategia de rotación: el <group> cuyo origen está en el pivote se rota con θ.
// Escala visual: SCALE convierte metros reales → unidades Three.js (1 m = 2.5 u).
// La física SIEMPRE usa metros reales; SCALE solo afecta el renderizado.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo }  from 'react'
import { useFrame }         from '@react-three/fiber'
import * as THREE           from 'three'
import { useSimulationStore, selectParams } from '../store/simulationStore'
import type { Mesh, Group } from 'three'

// ─── Constantes visuales ─────────────────────────────────────────────────────

const SCALE        = 2.5
const BAR_WIDTH    = 0.028
const BAR_DEPTH    = 0.018
const PIVOT_RADIUS = 0.038
const ARC_SEGS     = 48   // segmentos máximos del arco de ángulo

// ─── Componente ───────────────────────────────────────────────────────────────

export function PendulumMesh() {
  // ── Refs a objetos 3D ────────────────────────────────────────────────────
  const groupRef   = useRef<Group>(null)
  const massRef    = useRef<Mesh>(null)
  const massMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // ── Parámetros reactivos (re-render solo cuando cambia el usuario) ────────
  const params     = useSimulationStore(selectParams)
  const L          = params.L * SCALE
  const massRadius = Math.max(0.06, Math.min(0.16, Math.sqrt(params.mr) * 0.34))

  // ── Línea de referencia vertical (posición de equilibrio) ────────────────
  //
  // Usa LineDashedMaterial para visualizarse como línea punteada.
  // El extremo inferior se actualiza cada frame en useFrame para seguir a L.
  //
  const refLinePositions = useMemo(() => {
    const arr = new Float32Array(6)
    arr[2] = -0.025   // z del punto 0 (pivote)
    arr[5] = -0.025   // z del punto 1 (extremo inferior)
    return arr
  }, [])

  const refLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(refLinePositions, 3))
    const mat = new THREE.LineDashedMaterial({
      color:       0x94a3b8,
      dashSize:    0.035,
      gapSize:     0.025,
      opacity:     0.40,
      transparent: true,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [refLinePositions])

  // ── Arco de ángulo θ ──────────────────────────────────────────────────────
  //
  // Muestra el ángulo actual respecto a la vertical, como en los manuales.
  // Buffer pre-asignado; se actualiza in-place cada frame para evitar GC.
  //
  const arcPositions = useMemo(() => new Float32Array((ARC_SEGS + 1) * 3), [])

  const arcLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({
      color:       0x8b5cf6,
      opacity:     0.65,
      transparent: true,
    })
    const line = new THREE.Line(geo, mat)
    line.visible = false
    return line
  }, [])

  // ── Flecha de velocidad tangencial ────────────────────────────────────────
  //
  // v = ω × L, perpendicular al brazo, apunta en la dirección de movimiento.
  // Dirección: sign(ω) × (cos θ, sin θ) — derivada del vector de posición.
  //
  const arrowDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])

  const arrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),   // dirección inicial
      new THREE.Vector3(0, 0, 0),   // origen inicial
      0.1,                           // longitud inicial
      0x22d3ee,                      // color teal (indica velocidad)
      0.07,                          // longitud de la cabeza
      0.045,                         // ancho de la cabeza
    )
    a.visible = false
    return a
  }, [])

  // ── useFrame: actualizar todos los elementos dinámicos ────────────────────
  useFrame(() => {
    const store    = useSimulationStore.getState()
    const theta    = store.state.theta
    const omega    = store.state.omega
    const L_vis    = store.params.L * SCALE
    const p        = store.params
    const absOmega = Math.abs(omega)

    // Rotación del grupo (péndulo completo)
    if (groupRef.current) groupRef.current.rotation.z = theta

    // ── Línea de referencia: actualizar extremo inferior ──────────────────
    refLinePositions[4] = -L_vis
    ;(refLine.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    refLine.computeLineDistances()

    // ── Arco de ángulo θ ──────────────────────────────────────────────────
    //
    // El arco va de -π/2 (vertical abajo) a -π/2 + θ (posición actual).
    // arcRadius crece con L para mantener proporción, con límites visuales.
    //
    const absTheta = Math.abs(theta)
    if (absTheta > 0.02) {
      const arcRadius = Math.max(0.08, Math.min(0.30, L_vis * 0.27))
      const steps     = Math.min(ARC_SEGS, Math.max(4, Math.round(absTheta * ARC_SEGS / (Math.PI / 2))))
      const startA    = -Math.PI / 2
      const endA      = startA + theta
      const minA      = Math.min(startA, endA)
      const maxA      = Math.max(startA, endA)

      for (let i = 0; i <= steps; i++) {
        const a                 = minA + (i / steps) * (maxA - minA)
        arcPositions[i * 3]     = Math.cos(a) * arcRadius
        arcPositions[i * 3 + 1] = Math.sin(a) * arcRadius
        arcPositions[i * 3 + 2] = 0.005
      }

      if (!arcLine.geometry.attributes.position) {
        arcLine.geometry.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3))
      } else {
        ;(arcLine.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
      }
      arcLine.geometry.setDrawRange(0, steps + 1)
      arcLine.visible = true
    } else {
      arcLine.visible = false
    }

    // ── Flecha de velocidad tangencial ────────────────────────────────────
    //
    // La velocidad del extremo es v = ω × L (tangencial al círculo).
    // Dirección: rotar el vector del brazo 90° en la dirección de ω.
    //   brazo = (sin θ, −cos θ)
    //   tangente CCW = (cos θ, sin θ)  [rotar 90° CCW]
    //
    if (absOmega > 0.04) {
      const sign     = Math.sign(omega)
      const arrowLen = Math.min(0.45, absOmega * L_vis * 0.30)
      const headLen  = Math.min(0.08, arrowLen * 0.35)
      const headWid  = headLen * 0.65

      arrowDir.set(sign * Math.cos(theta), sign * Math.sin(theta), 0)
      arrow.position.set(Math.sin(theta) * L_vis, -Math.cos(theta) * L_vis, 0.025)
      arrow.setDirection(arrowDir)
      arrow.setLength(Math.max(0.06, arrowLen), headLen, headWid)
      arrow.visible = true
    } else {
      arrow.visible = false
    }

    // ── Intensidad de emisión de la masa ∝ Ec / E_inicial ─────────────────
    //
    // La masa brilla más cuando pasa por el punto más bajo (máx. Ec).
    // Se normaliza con ω_max teórico calculado desde la energía inicial.
    //
    if (massMatRef.current) {
      const I_val    = (1 / 3) * p.m * p.L * p.L + p.mr * p.L * p.L
      const d_cm     = (p.m * p.L / 2 + p.mr * p.L) / (p.m + p.mr)
      const M        = p.m + p.mr
      const omegaMax = Math.sqrt(
        2 * M * p.g * d_cm * (1 - Math.cos(p.theta0)) / Math.max(I_val, 1e-10)
      )
      const t = omegaMax > 0.001 ? Math.min(1, absOmega / omegaMax) : 0
      massMatRef.current.emissiveIntensity = 0.05 + t * 0.42
    }
  })

  return (
    <group>

      {/* ── Línea de referencia vertical (equilibrio, fija) ──────────────── */}
      <primitive object={refLine} />

      {/* ── Arco de ángulo θ (fijo, actualizado en useFrame) ─────────────── */}
      <primitive object={arcLine} />

      {/* ── Flecha de velocidad tangencial ───────────────────────────────── */}
      <primitive object={arrow} />

      {/* ── Soporte horizontal (fijo, no rota) ───────────────────────────── */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Tornillo central del soporte */}
      <mesh position={[0, 0, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ── Grupo rotante — todo lo que oscila ───────────────────────────── */}
      <group ref={groupRef}>

        {/* Barra del péndulo */}
        <mesh position={[0, -L / 2, 0]}>
          <boxGeometry args={[BAR_WIDTH, L, BAR_DEPTH]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Masa en el extremo — emissiveIntensity actualizado en useFrame */}
        <mesh ref={massRef} position={[0, -L, 0]}>
          <sphereGeometry args={[massRadius, 36, 36]} />
          <meshStandardMaterial
            ref={massMatRef}
            color="#f97316"
            roughness={0.25}
            metalness={0.45}
            emissive="#7c2d12"
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Conector barra → masa */}
        <mesh position={[0, -L + massRadius * 0.5, 0]}>
          <cylinderGeometry args={[BAR_WIDTH * 0.4, BAR_WIDTH * 0.4, massRadius, 12]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.2} />
        </mesh>

      </group>

      {/* ── Pivote (fijo, encima del grupo rotante) ───────────────────────── */}
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[PIVOT_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.75} />
      </mesh>

    </group>
  )
}
