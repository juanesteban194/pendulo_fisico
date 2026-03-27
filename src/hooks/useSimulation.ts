// ─── HOOK DE SIMULACIÓN ───────────────────────────────────────────────────────
//
// Puente entre el motor de física (TypeScript puro) y el loop de animación
// de React Three Fiber. Se ejecuta dentro del Canvas de R3F.
//
// Responsabilidades:
//   1. En cada frame: avanzar la física el tiempo real transcurrido (delta).
//   2. Escribir el nuevo estado en el store (tick).
//   3. Cada ~30 Hz: calcular cantidades derivadas y agregar un frame al historial.
//
// NO hace:
//   • Renderizado — eso es PendulumMesh.tsx
//   • Cálculos de UI — eso es InfoDisplay.tsx
//   • Lógica de parámetros — eso es ControlPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { useFrame }  from '@react-three/fiber'
import { useSimulationStore } from '../store/simulationStore'
import { advancePendulum, computeDerived } from '../physics/pendulum'
import type { PendulumState, PendulumParams } from '../types/physics.types'

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * Delta máximo aceptado por frame (segundos).
 *
 * Si el usuario cambia de pestaña y vuelve, el navegador puede entregar
 * un delta enorme (ej. 5 s). Dejar que la física avance 5 s de golpe
 * produce resultados inestables. Limitamos a 50 ms (3 frames perdidos máximo).
 */
const MAX_DELTA = 0.05

/**
 * Intervalo de muestreo para el historial de gráficas (segundos).
 * 1/30 = ~33 ms → capturamos ~30 frames por segundo para Charts.
 * Más frecuente sería innecesario; menos frecuente perdería detalle.
 */
const HISTORY_INTERVAL = 1 / 30

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSimulation() {
  // ── Refs internos ─────────────────────────────────────────────────────────
  //
  // ¿Por qué refs y no leer directamente del store?
  //
  // useFrame corre fuera del ciclo de render de React. Si leyéramos
  // `state` y `params` directamente del store con selectores de Zustand,
  // React los capturaría en el closure del último render y no los actualizaría
  // entre frames. Los refs son mutables y siempre apuntan al valor actual.

  /** Ref al estado físico actual — siempre al día entre renders. */
  const stateRef  = useRef<PendulumState>(
    useSimulationStore.getState().state
  )

  /** Ref a los parámetros actuales — se actualiza cuando el usuario los cambia. */
  const paramsRef = useRef<PendulumParams>(
    useSimulationStore.getState().params
  )

  /** Acumulador de tiempo desde el último frame guardado en el historial. */
  const historyAccRef = useRef<number>(0)

  // Mantener los refs sincronizados con el store sin suscripciones costosas.
  // getState() lee el store sin crear una suscripción reactiva.
  useSimulationStore.subscribe(
    s => s.state,
    next => { stateRef.current = next }
  )
  useSimulationStore.subscribe(
    s => s.params,
    next => { paramsRef.current = next }
  )

  // ── Loop principal ────────────────────────────────────────────────────────
  //
  // useFrame se ejecuta justo antes de que R3F dibuje cada frame.
  // Recibe `delta`: segundos reales transcurridos desde el frame anterior.
  //
  // Flujo por frame:
  //   delta real (ej. 0.016 s)
  //     → advancePendulum avanza la física en ~16 pasos de 1 ms
  //     → tick() guarda el nuevo estado en el store
  //     → PendulumMesh lee el store y dibuja en la nueva posición
  //
  useFrame((_root, delta) => {
    // Leer running directamente del store (no necesita ser reactivo)
    if (!useSimulationStore.getState().running) return

    const safeDelta = Math.min(delta, MAX_DELTA)
    const state  = stateRef.current
    const params = paramsRef.current

    // ── Avanzar la física ──────────────────────────────────────────────────
    //
    // advancePendulum resuelve la ecuación diferencial en pasos de 1 ms.
    // Por cada frame de 16 ms hace ~16 iteraciones de RK4.
    // Devuelve el nuevo estado: { theta, omega, time }.
    const next = advancePendulum(state, params, safeDelta)

    // Escribir el nuevo estado en el store → dispara re-render de PendulumMesh
    useSimulationStore.getState().tick(next)

    // ── Historial para gráficas (~30 Hz) ──────────────────────────────────
    //
    // No necesitamos guardar CADA frame (60 Hz) en el historial.
    // Con 30 Hz tenemos suficiente resolución para las gráficas
    // y reducimos a la mitad el trabajo de Charts.tsx.
    historyAccRef.current += safeDelta

    if (historyAccRef.current >= HISTORY_INTERVAL) {
      historyAccRef.current = 0

      // computeDerived calcula I, d, T, f, Ec, Ep, Re, régimen...
      // Solo se llama aquí (30 Hz), no en cada tick (60 Hz).
      const derived = computeDerived(next, params)

      useSimulationStore.getState().pushFrame({
        time:  parseFloat(next.time.toFixed(3)),
        theta: next.theta,
        omega: next.omega,
        Ec:    derived.Ec,
        Ep:    derived.Ep,
      })
    }
  })
}