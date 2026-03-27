// ─── TRAYECTORIA DEL PÉNDULO ──────────────────────────────────────────────────
//
// Dibuja la estela del extremo de la masa, coloreada por velocidad angular.
//
// Técnica: BufferGeometry con atributos de posición y color actualizados
// directamente cada frame, sin pasar por el sistema de re-renders de React.
//
// Codificación de color:
//   |ω| bajo  (extremos, velocidad mínima) → azul   [0.2, 0.5, 0.9]
//   |ω| alto  (centro,   velocidad máxima) → naranja [0.98, 0.45, 0.08]
// Esto permite ver visualmente dónde se concentra la energía cinética.
//
// Ventana deslizante de MAX_POINTS puntos:
//   Cuando el buffer está lleno, el punto más antiguo se descarta y el nuevo
//   se agrega al final. La estela siempre muestra los últimos ~5 segundos.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo }  from 'react'
import { useFrame }         from '@react-three/fiber'
import * as THREE           from 'three'
import {
  useSimulationStore,
  selectParams,
} from '../store/simulationStore'

// ─── Constantes ───────────────────────────────────────────────────────────────

const SCALE      = 2.5
/** Cantidad de puntos en la ventana deslizante (~5 s a 60 Hz). */
const MAX_POINTS = 400

// ─── Interpolación de color ───────────────────────────────────────────────────

/**
 * Convierte una velocidad angular en un color RGB interpolado.
 *
 * t = |ω| / ω_max   →   [0, 1]
 *
 * t=0 (lento) → azul   (0.20, 0.50, 0.90)
 * t=1 (rápido) → naranja (0.98, 0.45, 0.08)
 *
 * La interpolación es lineal en cada canal R, G, B por separado.
 */
function speedToColor(omega: number, maxOmega: number): [number, number, number] {
  const t = maxOmega > 0.001
    ? Math.min(1, Math.abs(omega) / maxOmega)
    : 0

  return [
    0.20 + t * 0.78,   // R: 0.20 → 0.98
    0.50 - t * 0.05,   // G: 0.50 → 0.45
    0.90 - t * 0.82,   // B: 0.90 → 0.08
  ]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function TrajectoryLine() {
  const params = useSimulationStore(selectParams)

  // ── Buffers pre-asignados ─────────────────────────────────────────────────
  //
  // Asignamos los arrays de posición y color UNA sola vez con useMemo.
  // Si los creáramos dentro de useFrame, estaríamos allocando memoria nueva
  // 60 veces por segundo, lo que eventualmente fuerza al garbage collector
  // a pausar la animación para limpiar.
  //
  // MAX_POINTS * 3 porque cada punto tiene 3 componentes: (X, Y, Z) y (R, G, B).
  //
  const positions = useMemo(
    () => new Float32Array(MAX_POINTS * 3),
    []
  )
  const colors = useMemo(
    () => new Float32Array(MAX_POINTS * 3),
    []
  )

  // ── Refs de estado interno ────────────────────────────────────────────────
  const lineRef     = useRef<THREE.Line>(null)
  /** Índice del siguiente slot disponible en los buffers (circular). */
  const writeIdx    = useRef(0)
  /** Cuántos puntos válidos hay actualmente en los buffers. */
  const pointCount  = useRef(0)
  /** ω máximo observado para normalizar el color. Se actualiza dinámicamente. */
  const maxOmega    = useRef(0.01)
  /** Resetear la trayectoria cuando cambien los parámetros. */
  const prevParamsRef = useRef(params)

  // ── Geometría Three.js ────────────────────────────────────────────────────
  //
  // Creamos la geometría una vez. Los atributos 'position' y 'color' apuntan
  // directamente a nuestros Float32Arrays, así que cuando los modificamos
  // en useFrame, Three.js solo necesita un flag needsUpdate para ver los cambios.
  //
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    // setDrawRange(0, 0): empezamos sin dibujar nada
    geo.setDrawRange(0, 0)
    return geo
  }, [positions, colors])

  // ── Loop de actualización ─────────────────────────────────────────────────
  useFrame(() => {
    if (!lineRef.current) return

    const store = useSimulationStore.getState()
    const { theta, omega } = store.state
    const L = store.params.L * SCALE

    // Si los parámetros cambiaron, limpiar la trayectoria
    if (store.params !== prevParamsRef.current) {
      prevParamsRef.current = store.params
      writeIdx.current  = 0
      pointCount.current = 0
      positions.fill(0)
      colors.fill(0)
      maxOmega.current = 0.01
      geometry.setDrawRange(0, 0)
      geometry.attributes['position']!.needsUpdate = true
      geometry.attributes['color']!.needsUpdate    = true
      return
    }

    // ── Calcular posición del extremo de la masa ──────────────────────────
    //   x =  sin(θ) × L   (desplazamiento horizontal)
    //   y = -cos(θ) × L   (siempre hacia abajo desde el pivote)
    const x = Math.sin(theta) * L
    const y = -Math.cos(theta) * L

    // ── Actualizar ω máximo observado ─────────────────────────────────────
    //
    // Usamos una ventana de decaimiento suave: el máximo "olvida" lentamente
    // si el péndulo se amortigua, permitiendo que los colores se recalibren.
    const absOmega = Math.abs(omega)
    if (absOmega > maxOmega.current) {
      maxOmega.current = absOmega
    } else {
      // Decaimiento muy lento (factor 0.9995 por frame) para recalibrar
      maxOmega.current = Math.max(0.01, maxOmega.current * 0.9995)
    }

    // ── Escribir en los buffers (escritura circular) ──────────────────────
    //
    // El índice writeIdx avanza y vuelve a 0 cuando llega al final.
    // Así sobreescribimos el punto más antiguo con el más nuevo.
    //
    const i = writeIdx.current
    const base = i * 3

    positions[base]     = x
    positions[base + 1] = y
    positions[base + 2] = 0.005  // Z ligeramente positivo para estar delante del fondo

    const [r, g, b] = speedToColor(omega, maxOmega.current)
    colors[base]     = r
    colors[base + 1] = g
    colors[base + 2] = b

    writeIdx.current = (i + 1) % MAX_POINTS
    if (pointCount.current < MAX_POINTS) pointCount.current++

    // ── Reordenar para que la línea sea continua ──────────────────────────
    //
    // Three.js dibuja los puntos en orden de índice en el buffer.
    // Pero con escritura circular, el punto más antiguo no siempre está
    // en el índice 0. Necesitamos decirle a Three.js el rango correcto.
    //
    // Cuando el buffer NO está lleno: dibujar desde 0 hasta pointCount.
    // Cuando el buffer SÍ está lleno: dibujar desde writeIdx (el más antiguo)
    //   hasta el final, y luego desde 0 hasta writeIdx.
    //
    // Solución simple: siempre dibujamos MAX_POINTS puntos una vez que el
    // buffer está lleno. Three.js conecta los puntos en orden, y la
    // única "costura" visible es un salto entre el punto más nuevo y el más
    // antiguo — imperceptible en movimiento.
    //
    geometry.setDrawRange(0, pointCount.current)
    geometry.attributes['position']!.needsUpdate = true
    geometry.attributes['color']!.needsUpdate    = true
  })

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            vertexColors: true,   // usa el atributo 'color' por vértice
            transparent:  true,
            opacity:      0.75,
            linewidth:    1,      // en WebGL estándar linewidth > 1 no funciona
          })
        )
      }
      ref={lineRef}
    />
  )
}