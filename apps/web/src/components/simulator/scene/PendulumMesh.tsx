'use client'

// ─── GEOMETRÍA VISUAL DEL PÉNDULO ────────────────────────────────────────────

import { useRef, useMemo }           from 'react'
import { useFrame }                  from '@react-three/fiber'
import { Html }                      from '@react-three/drei'
import * as THREE                    from 'three'
import { useSimulationStore, selectParams, selectShowAdvanced } from '../store/simulationStore'
import type { Mesh, Group }          from 'three'

const SCALE        = 2.5
const BAR_WIDTH    = 0.028
const BAR_DEPTH    = 0.018
const PIVOT_RADIUS = 0.038
const ARC_SEGS     = 48

export function PendulumMesh() {
  const groupRef    = useRef<Group>(null)
  const massRef     = useRef<Mesh>(null)
  const massMatRef  = useRef<THREE.MeshStandardMaterial>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const labelGroup  = useRef<Group>(null)

  const params       = useSimulationStore(selectParams)
  const showAdvanced = useSimulationStore(selectShowAdvanced)
  const L            = params.L * SCALE
  const a_vis        = params.pivotOffset * SCALE
  const massDist     = params.L - params.pivotOffset
  const r_mass       = massDist * SCALE
  const barCenterY   = a_vis - L / 2

  const massRadius = Math.max(0.06, Math.min(0.22, Math.sqrt(params.mr) * 0.34))
  const barWidth   = Math.max(BAR_WIDTH, Math.min(0.060, Math.sqrt(params.m) * 0.085))
  const barDepth   = Math.max(BAR_DEPTH, Math.min(0.040, Math.sqrt(params.m) * 0.055))

  const a       = params.pivotOffset
  const I_val   = (1 / 12) * params.m * params.L * params.L
                + params.m * (params.L / 2 - a) * (params.L / 2 - a)
                + params.mr * (params.L - a) * (params.L - a)
  const M_total = params.m + params.mr
  const d_cm    = M_total > 0
    ? (params.m * (params.L / 2 - a) + params.mr * (params.L - a)) / M_total
    : 0
  const Leq     = M_total > 0 && Math.abs(d_cm) > 1e-9
    ? I_val / (M_total * Math.abs(d_cm))
    : Infinity
  const d_vis   = d_cm * SCALE
  const Leq_vis = isFinite(Leq) ? Leq * SCALE : 0

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

  const arcPositions = useMemo(() => new Float32Array((ARC_SEGS + 1) * 3), [])

  const arcLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const mat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, opacity: 0.65, transparent: true })
    const line = new THREE.Line(geo, mat)
    line.visible = false
    return line
  }, [])

  const velArrowDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const velArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
      0.1, 0x22d3ee, 0.07, 0.045,
    )
    a.visible = false
    return a
  }, [])

  const weightArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0),
      0.15, 0xdc2626, 0.06, 0.04,
    )
    a.visible = false
    return a
  }, [])

  const torqueArrowDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const torqueArrow = useMemo(() => {
    const a = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0),
      0.1, 0xf59e0b, 0.06, 0.04,
    )
    a.visible = false
    return a
  }, [])

  useFrame(() => {
    const store    = useSimulationStore.getState()
    const theta    = store.state.theta
    const omega    = store.state.omega
    const p        = store.params
    const aDyn     = p.pivotOffset
    const massDistDyn = p.L - aDyn
    const r_mass_dyn  = massDistDyn * SCALE
    const advanced = store.showAdvanced
    const absOmega = Math.abs(omega)

    if (groupRef.current) groupRef.current.rotation.z = theta

    refLinePositions[4] = -r_mass_dyn
    const refAttr = refLine.geometry.attributes.position as THREE.BufferAttribute
    refAttr.needsUpdate = true
    refLine.computeLineDistances()

    const absTheta = Math.abs(theta)
    if (absTheta > 0.02) {
      const arcRadius = Math.max(0.08, Math.min(0.30, r_mass_dyn * 0.27))
      const steps     = Math.min(ARC_SEGS, Math.max(4, Math.round(absTheta * ARC_SEGS / (Math.PI / 2))))
      const startA    = -Math.PI / 2
      const endA      = startA + theta
      const minA      = Math.min(startA, endA)
      const maxA      = Math.max(startA, endA)

      for (let i = 0; i <= steps; i++) {
        const angle               = minA + (i / steps) * (maxA - minA)
        arcPositions[i * 3]     = Math.cos(angle) * arcRadius
        arcPositions[i * 3 + 1] = Math.sin(angle) * arcRadius
        arcPositions[i * 3 + 2] = 0.005
      }
      if (!arcLine.geometry.attributes.position) {
        arcLine.geometry.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3))
      } else {
        const arcAttr = arcLine.geometry.attributes.position as THREE.BufferAttribute
        arcAttr.needsUpdate = true
      }
      arcLine.geometry.setDrawRange(0, steps + 1)
      arcLine.visible = true

      if (labelGroup.current) {
        const midA        = -Math.PI / 2 + theta / 2
        const labelRadius = arcRadius + 0.08
        labelGroup.current.position.set(
          Math.cos(midA) * labelRadius,
          Math.sin(midA) * labelRadius,
          0.05,
        )
        labelGroup.current.visible = absTheta > 0.05
      }
      if (labelRef.current) {
        labelRef.current.textContent = `θ = ${(theta * 180 / Math.PI).toFixed(1)}°`
      }
    } else {
      arcLine.visible = false
      if (labelGroup.current) labelGroup.current.visible = false
    }

    if (absOmega > 0.04 && r_mass_dyn > 0.01) {
      const sign     = Math.sign(omega)
      const arrowLen = Math.min(0.45, absOmega * r_mass_dyn * 0.30)
      const headLen  = Math.min(0.08, arrowLen * 0.35)
      const headWid  = headLen * 0.65
      velArrowDir.set(sign * Math.cos(theta), sign * Math.sin(theta), 0)
      velArrow.position.set(Math.sin(theta) * r_mass_dyn, -Math.cos(theta) * r_mass_dyn, 0.025)
      velArrow.setDirection(velArrowDir)
      velArrow.setLength(Math.max(0.06, arrowLen), headLen, headWid)
      velArrow.visible = true
    } else {
      velArrow.visible = false
    }

    if (advanced) {
      const dDyn = M_total > 0
        ? (p.m * (p.L / 2 - aDyn) + p.mr * (p.L - aDyn)) / M_total
        : 0
      const dvDyn = dDyn * SCALE
      const cmX   = Math.sin(theta) * dvDyn
      const cmY   = -Math.cos(theta) * dvDyn
      const weightMag = M_total * p.g
      const weightLen = Math.max(0.10, Math.min(0.45, weightMag * 0.45))
      weightArrow.position.set(cmX, cmY, 0.020)
      weightArrow.setDirection(new THREE.Vector3(0, -1, 0))
      weightArrow.setLength(weightLen, 0.06, 0.04)
      weightArrow.visible = true
    } else {
      weightArrow.visible = false
    }

    if (advanced && absTheta > 0.03 && r_mass_dyn > 0.01) {
      const tipX = Math.sin(theta) * r_mass_dyn
      const tipY = -Math.cos(theta) * r_mass_dyn
      const dDyn = M_total > 0
        ? (p.m * (p.L / 2 - aDyn) + p.mr * (p.L - aDyn)) / M_total
        : 0
      const torqueSign = -Math.sign(dDyn * Math.sin(theta))
      torqueArrowDir.set(torqueSign * Math.cos(theta), torqueSign * Math.sin(theta), 0)
      const torqueMag = M_total * p.g * Math.abs(dDyn) * Math.abs(Math.sin(theta))
      const torqueLen = Math.max(0.08, Math.min(0.35, torqueMag * 1.5))
      torqueArrow.position.set(tipX, tipY, 0.022)
      torqueArrow.setDirection(torqueArrowDir)
      torqueArrow.setLength(torqueLen, 0.06, 0.04)
      torqueArrow.visible = true
    } else {
      torqueArrow.visible = false
    }

    if (massMatRef.current) {
      const I_l = (1 / 12) * p.m * p.L * p.L
                + p.m * (p.L / 2 - aDyn) * (p.L / 2 - aDyn)
                + p.mr * (p.L - aDyn) * (p.L - aDyn)
      const M_l = p.m + p.mr
      const d_l = M_l > 0
        ? (p.m * (p.L / 2 - aDyn) + p.mr * (p.L - aDyn)) / M_l
        : 0
      let t: number
      if (d_l > 1e-6) {
        const omegaMax = Math.sqrt(
          2 * M_l * p.g * d_l * (1 - Math.cos(p.theta0)) / Math.max(I_l, 1e-10)
        )
        t = omegaMax > 0.001 ? Math.min(1, absOmega / omegaMax) : 0
      } else {
        t = Math.min(1, absOmega / 5)
      }
      massMatRef.current.emissiveIntensity = 0.05 + t * 0.42
    }
  })

  return (
    <group>
      <primitive object={refLine} />
      <primitive object={arcLine} />
      <primitive object={velArrow} />

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

      <primitive object={weightArrow} />
      <primitive object={torqueArrow} />

      {showAdvanced && (
        <group>
          <mesh position={[0, barCenterY, -0.015]}>
            <boxGeometry args={[BAR_WIDTH * 0.6, L, BAR_DEPTH * 0.4]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.18} />
          </mesh>
          <mesh position={[0, -r_mass, -0.015]}>
            <sphereGeometry args={[massRadius * 0.95, 24, 24]} />
            <meshBasicMaterial color="#cbd5e1" transparent opacity={0.30} />
          </mesh>
        </group>
      )}

      {/* Soporte de laboratorio */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-0.255, 0.10, -0.008]}>
        <boxGeometry args={[0.022, 0.20, 0.018]} />
        <meshStandardMaterial color="#475569" roughness={0.65} metalness={0.35} />
      </mesh>
      <mesh position={[0.255, 0.10, -0.008]}>
        <boxGeometry args={[0.022, 0.20, 0.018]} />
        <meshStandardMaterial color="#475569" roughness={0.65} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.21, -0.008]}>
        <boxGeometry args={[0.55, 0.022, 0.022]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Grupo rotante */}
      <group ref={groupRef}>
        {showAdvanced && isFinite(Leq) && Leq_vis > 0 && Leq_vis < L * 1.5 && d_cm > 0 && (
          <group>
            <mesh position={[0, -Leq_vis / 2, 0.012]}>
              <boxGeometry args={[barWidth * 0.4, Leq_vis, barDepth * 0.3]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.50} />
            </mesh>
            <mesh position={[0, -Leq_vis, 0.012]}>
              <sphereGeometry args={[massRadius * 0.55, 20, 20]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.55} />
            </mesh>
          </group>
        )}

        <mesh position={[0, barCenterY, 0]}>
          <boxGeometry args={[barWidth, L, barDepth]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.55} metalness={0.15} />
        </mesh>

        <mesh position={[0, -d_vis, 0.011]}>
          <sphereGeometry args={[0.020, 16, 16]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, -d_vis, 0.0105]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>

        <mesh ref={massRef} position={[0, -r_mass, 0]}>
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

        {r_mass > 0.05 && (
          <mesh position={[0, -r_mass + massRadius * 0.5, 0]}>
            <cylinderGeometry args={[barWidth * 0.4, barWidth * 0.4, massRadius, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.2} />
          </mesh>
        )}
      </group>

      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[PIVOT_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.75} />
      </mesh>
    </group>
  )
}
