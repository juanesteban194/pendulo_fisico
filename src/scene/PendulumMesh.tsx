// ─── GEOMETRÍA VISUAL DEL PÉNDULO ────────────────────────────────────────────
//
// CAPAS BÁSICAS (siempre visibles):
//   • Soporte de laboratorio (postes verticales + viga superior + viga inferior)
//   • Línea de referencia vertical (posición de equilibrio)
//   • Arco de ángulo θ + etiqueta numérica
//   • Punto del centro de masa (CM) en la barra
//   • Flecha de velocidad tangencial v = ω·L
//   • Masa con brillo proporcional a Ec
//
// CAPAS AVANZADAS (toggleables vía showAdvanced):
//   • Vector de peso M·g (vertical desde el CM)
//   • Vector de torque restaurador τ_grav = −Mgd·sin(θ) (tangencial al arco)
//   • Esfera fantasma del equilibrio (semi-transparente en θ=0)
//   • Péndulo simple equivalente (longitud Leq, mismo ángulo θ)
//
// Todas las cantidades físicas se computan en metros reales.
// SCALE solo afecta el renderizado: 1 m real = 2.5 unidades Three.js.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo }           from 'react'
import { useFrame }                  from '@react-three/fiber'
import { Html }                      from '@react-three/drei'
import * as THREE                    from 'three'
import { useSimulationStore, selectParams, selectShowAdvanced } from '../store/simulationStore'
import type { Mesh, Group }          from 'three'

// ─── Constantes visuales ─────────────────────────────────────────────────────

const SCALE        = 2.5
const BAR_WIDTH    = 0.028
const BAR_DEPTH    = 0.018
const PIVOT_RADIUS = 0.038
const ARC_SEGS     = 48

// ─── Componente ───────────────────────────────────────────────────────────────

export function PendulumMesh() {
  const groupRef    = useRef<Group>(null)
  const massRef     = useRef<Mesh>(null)
  const massMatRef  = useRef<THREE.MeshStandardMaterial>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const labelGroup  = useRef<Group>(null)

  const params       = useSimulationStore(selectParams)
  const showAdvanced = useSimulationStore(selectShowAdvanced)
  const L            = params.L * SCALE
  const massRadius   = Math.max(0.06, Math.min(0.16, Math.sqrt(params.mr) * 0.34))

  // Cantidades derivadas (recomputadas solo cuando cambian params)
  const I_val   = (1 / 3) * params.m * params.L * params.L + params.mr * params.L * params.L
  const d_cm    = (params.m * params.L / 2 + params.mr * params.L) / (params.m + params.mr)
  const M_total = params.m + params.mr
  const Leq     = M_total > 0 && d_cm > 0 ? I_val / (M_total * d_cm) : params.L
  const d_vis   = d_cm * SCALE
  const Leq_vis = Leq * SCALE

  // ── Línea de referencia vertical ──────────────────────────────────────────
  const refLinePositions = useMemo(() => {
    const arr = new Float32Array(6)
    arr[2] = -0.025; arr[5] = -0.025
    return arr
  }, [])

  const refLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(refLinePositions, 3))
    const mat = new THREE.LineDashedMaterial({
      color: 0x94a3b8, dashSize: 0.035, gapSize: 0.025, opacity: 0.40, transparent: true,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [refLinePositions])

  // ── Arco de ángulo θ ──────────────────────────────────────────────────────
  const arcPositions = useMemo(() => new Float32Array((ARC_SEGS + 1) * 3), [])

  const arcLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, opacity: 0.65, transparent: true })
    const line = new THREE.Line(geo, mat)
    line.visible = false
    return line
  }, [])

  // ── Flecha de velocidad tangencial ────────────────────────────────────────
  const velArrowDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const velArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
      0.1, 0x22d3ee, 0.07, 0.045,
    )
    a.visible = false
    return a
  }, [])

  // ── Vector de peso M·g (capa avanzada) ────────────────────────────────────
  const weightArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0),
      0.15, 0xdc2626, 0.06, 0.04,
    )
    a.visible = false
    return a
  }, [])

  // ── Vector de torque restaurador (capa avanzada) ──────────────────────────
  const torqueArrowDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const torqueArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0),
      0.1, 0xf59e0b, 0.06, 0.04,
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
    const advanced = store.showAdvanced
    const absOmega = Math.abs(omega)

    // Rotación del grupo del péndulo
    if (groupRef.current) groupRef.current.rotation.z = theta

    // ── Línea de referencia ───────────────────────────────────────────────
    refLinePositions[4] = -L_vis
    ;(refLine.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    refLine.computeLineDistances()

    // ── Arco de ángulo θ + etiqueta ───────────────────────────────────────
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

      // Etiqueta del ángulo: posicionada en el punto medio del arco
      if (labelGroup.current) {
        const midA        = -Math.PI / 2 + theta / 2
        const labelRadius = arcRadius + 0.08
        labelGroup.current.position.set(
          Math.cos(midA) * labelRadius,
          Math.sin(midA) * labelRadius,
          0.05,
        )
        labelGroup.current.visible = absTheta > 0.05  // ~3°
      }
      if (labelRef.current) {
        labelRef.current.textContent = `θ = ${(theta * 180 / Math.PI).toFixed(1)}°`
      }
    } else {
      arcLine.visible = false
      if (labelGroup.current) labelGroup.current.visible = false
    }

    // ── Flecha de velocidad tangencial ────────────────────────────────────
    if (absOmega > 0.04) {
      const sign     = Math.sign(omega)
      const arrowLen = Math.min(0.45, absOmega * L_vis * 0.30)
      const headLen  = Math.min(0.08, arrowLen * 0.35)
      const headWid  = headLen * 0.65
      velArrowDir.set(sign * Math.cos(theta), sign * Math.sin(theta), 0)
      velArrow.position.set(Math.sin(theta) * L_vis, -Math.cos(theta) * L_vis, 0.025)
      velArrow.setDirection(velArrowDir)
      velArrow.setLength(Math.max(0.06, arrowLen), headLen, headWid)
      velArrow.visible = true
    } else {
      velArrow.visible = false
    }

    // ── Capa avanzada: vector de peso M·g desde el CM ────────────────────
    //
    // Posición del CM en mundo (rotado): (sin θ · d, −cos θ · d)
    // Dirección: siempre vertical hacia abajo (eje −Y) en mundo.
    // Longitud: proporcional a M·g (con escala visual capada).
    //
    if (advanced) {
      const cmX = Math.sin(theta) * d_vis
      const cmY = -Math.cos(theta) * d_vis
      const M_local = p.m + p.mr
      const weightMag = M_local * p.g
      const weightLen = Math.max(0.10, Math.min(0.45, weightMag * 0.45))
      weightArrow.position.set(cmX, cmY, 0.020)
      weightArrow.setDirection(new THREE.Vector3(0, -1, 0))
      weightArrow.setLength(weightLen, 0.06, 0.04)
      weightArrow.visible = true
    } else {
      weightArrow.visible = false
    }

    // ── Capa avanzada: vector de torque restaurador ──────────────────────
    //
    // τ = −Mgd·sin(θ), tangencial al arco en el extremo de la masa,
    // siempre apuntando hacia el equilibrio (signo opuesto a θ).
    //
    if (advanced && absTheta > 0.03) {
      const tipX = Math.sin(theta) * L_vis
      const tipY = -Math.cos(theta) * L_vis
      // Dirección tangencial hacia el equilibrio: -sign(θ) · (cos θ, sin θ)
      const torqueSign = -Math.sign(theta)
      torqueArrowDir.set(torqueSign * Math.cos(theta), torqueSign * Math.sin(theta), 0)
      // Magnitud del torque: |τ| = M·g·d·|sin θ|, escalada a unidades visuales
      const torqueMag = M_total * p.g * d_cm * Math.abs(Math.sin(theta))
      const torqueLen = Math.max(0.08, Math.min(0.35, torqueMag * 1.5))
      torqueArrow.position.set(tipX, tipY, 0.022)
      torqueArrow.setDirection(torqueArrowDir)
      torqueArrow.setLength(torqueLen, 0.06, 0.04)
      torqueArrow.visible = true
    } else {
      torqueArrow.visible = false
    }

    // ── Intensidad de emisión de la masa ∝ Ec/E_inicial ───────────────────
    if (massMatRef.current) {
      const I_l    = (1 / 3) * p.m * p.L * p.L + p.mr * p.L * p.L
      const d_l    = (p.m * p.L / 2 + p.mr * p.L) / (p.m + p.mr)
      const M_l    = p.m + p.mr
      const omegaMax = Math.sqrt(2 * M_l * p.g * d_l * (1 - Math.cos(p.theta0)) / Math.max(I_l, 1e-10))
      const t = omegaMax > 0.001 ? Math.min(1, absOmega / omegaMax) : 0
      massMatRef.current.emissiveIntensity = 0.05 + t * 0.42
    }
  })

  return (
    <group>

      {/* ─── Capas estáticas siempre visibles ───────────────────────────── */}

      {/* Línea de referencia vertical (equilibrio) */}
      <primitive object={refLine} />

      {/* Arco de ángulo θ */}
      <primitive object={arcLine} />

      {/* Flecha de velocidad tangencial */}
      <primitive object={velArrow} />

      {/* Etiqueta numérica del ángulo (HTML overlay) */}
      <group ref={labelGroup}>
        <Html center distanceFactor={undefined} style={{ pointerEvents: 'none' }}>
          <span ref={labelRef} style={{
            background:    'rgba(255,255,255,0.92)',
            border:        '1px solid rgba(139,92,246,0.35)',
            borderRadius:  '4px',
            padding:       '2px 6px',
            fontSize:      '10.5px',
            fontWeight:    600,
            color:         '#7c3aed',
            fontFamily:    'ui-monospace, monospace',
            whiteSpace:    'nowrap',
            boxShadow:     '0 1px 2px rgba(15,23,42,0.06)',
          }}>θ = 0°</span>
        </Html>
      </group>

      {/* ─── Capas avanzadas (toggleables) ───────────────────────────────── */}

      {/* Vector de peso */}
      <primitive object={weightArrow} />

      {/* Vector de torque restaurador */}
      <primitive object={torqueArrow} />

      {/* Esfera fantasma del equilibrio */}
      {showAdvanced && (
        <group>
          <mesh position={[0, -L / 2, -0.015]}>
            <boxGeometry args={[BAR_WIDTH * 0.6, L, BAR_DEPTH * 0.4]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.18} />
          </mesh>
          <mesh position={[0, -L, -0.015]}>
            <sphereGeometry args={[massRadius * 0.95, 24, 24]} />
            <meshBasicMaterial color="#cbd5e1" transparent opacity={0.30} />
          </mesh>
        </group>
      )}

      {/* ─── Soporte de laboratorio (estructura realista) ───────────────── */}

      {/* Viga horizontal inferior (donde está el pivote) */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Postes verticales izquierdo y derecho */}
      <mesh position={[-0.255, 0.10, -0.008]}>
        <boxGeometry args={[0.022, 0.20, 0.018]} />
        <meshStandardMaterial color="#475569" roughness={0.65} metalness={0.35} />
      </mesh>
      <mesh position={[0.255, 0.10, -0.008]}>
        <boxGeometry args={[0.022, 0.20, 0.018]} />
        <meshStandardMaterial color="#475569" roughness={0.65} metalness={0.35} />
      </mesh>

      {/* Viga horizontal superior (cap del soporte) */}
      <mesh position={[0, 0.21, -0.008]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Tornillo central del pivote */}
      <mesh position={[0, 0, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ─── Grupo rotante — todo lo que oscila ─────────────────────────── */}
      <group ref={groupRef}>

        {/* Capa avanzada: péndulo simple equivalente (longitud Leq) */}
        {showAdvanced && Leq_vis < L && (
          <group>
            <mesh position={[0, -Leq_vis / 2, 0.012]}>
              <boxGeometry args={[BAR_WIDTH * 0.4, Leq_vis, BAR_DEPTH * 0.3]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.50} />
            </mesh>
            <mesh position={[0, -Leq_vis, 0.012]}>
              <sphereGeometry args={[massRadius * 0.55, 20, 20]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.55} />
            </mesh>
          </group>
        )}

        {/* Barra del péndulo */}
        <mesh position={[0, -L / 2, 0]}>
          <boxGeometry args={[BAR_WIDTH, L, BAR_DEPTH]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Punto del centro de masa (CM) — siempre visible */}
        <mesh position={[0, -d_vis, 0.011]}>
          <sphereGeometry args={[0.020, 16, 16]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        {/* Anillo blanco alrededor del CM para destacarlo sobre la barra */}
        <mesh position={[0, -d_vis, 0.0105]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>

        {/* Masa en el extremo */}
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

        {/* Conector */}
        <mesh position={[0, -L + massRadius * 0.5, 0]}>
          <cylinderGeometry args={[BAR_WIDTH * 0.4, BAR_WIDTH * 0.4, massRadius, 12]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.2} />
        </mesh>

      </group>

      {/* Pivote (encima del grupo rotante) */}
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[PIVOT_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.75} />
      </mesh>

    </group>
  )
}
