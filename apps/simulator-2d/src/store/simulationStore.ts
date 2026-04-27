// ─── STORE GLOBAL DE SIMULACIÓN ───────────────────────────────────────────────
//
// Arquitectura de capas — este archivo es la única frontera entre:
//   physics/  (TypeScript puro, sin React)
//   scene/    (React Three Fiber, solo lee estado)
//   ui/       (React, lee y escribe parámetros)
//   hooks/    (conecta el loop de R3F con el motor)
//
// Reglas:
//   • Zustand NO hace física ni renderizado — solo almacena estado.
//   • Todos los cambios de parámetros resetean la simulación automáticamente.
//   • El historial de frames se mantiene aquí para que Charts no re-derive.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  PendulumState,
  PendulumParams,
  SimulationFrame,
} from '@pendulo/physics'
import { LAB_PARAMS, createInitialState } from '@pendulo/physics'

// ─── Configuración del historial ─────────────────────────────────────────────

/** Máximo de frames almacenados para las gráficas (~30 s a 30 Hz). */
const MAX_HISTORY = 900

// ─── Tipos del store ──────────────────────────────────────────────────────────

export interface SimulationStore {
  // ── Estado dinámico de la simulación ──────────────────────────────────────
  /** Estado físico actual: θ, ω, tiempo. Actualizado cada frame (~60 Hz). */
  state: PendulumState

  // ── Parámetros del sistema ────────────────────────────────────────────────
  /** Parámetros físicos del péndulo. Cambiarlos resetea la simulación. */
  params: PendulumParams

  // ── Control de ejecución ─────────────────────────────────────────────────
  /** true = simulación corriendo, false = pausada. */
  running: boolean

  // ── Visualización ────────────────────────────────────────────────────────
  /** true = mostrar capas didácticas (vectores, fantasma, péndulo equiv., envelope). */
  showAdvanced: boolean

  // ── Historial para gráficas ───────────────────────────────────────────────
  /**
   * Buffer circular de frames capturados a ~30 Hz.
   * Cada frame: { time, theta, omega, Ec, Ep }
   * Usado por Charts.tsx — evita recalcular desde el estado crudo.
   */
  history: SimulationFrame[]

  // ── Acciones ──────────────────────────────────────────────────────────────

  /**
   * Actualiza el estado físico del péndulo.
   * Llamado por useSimulation.ts en cada frame de React Three Fiber.
   * Es la acción más frecuente (~60 Hz) — debe ser mínima y sin side-effects.
   */
  tick: (next: PendulumState) => void

  /**
   * Agrega un frame al historial de gráficas (~30 Hz).
   * Separado de tick para no forzar re-renders en la escena 3D.
   */
  pushFrame: (frame: SimulationFrame) => void

  /**
   * Actualiza uno o varios parámetros físicos.
   * Resetea automáticamente la simulación al nuevo estado inicial.
   * Limpia el historial de gráficas para evitar datos mezclados.
   */
  setParams: (partial: Partial<PendulumParams>) => void

  /**
   * Pausa o reanuda la simulación sin perder el estado físico actual.
   */
  setRunning: (running: boolean) => void

  /**
   * Reinicia la simulación a theta0, omega=0, time=0.
   * Conserva los parámetros actuales. Limpia el historial.
   */
  reset: () => void

  /** Alterna el modo didáctico avanzado (vectores físicos, comparaciones, envelope). */
  toggleAdvanced: () => void
}

// ─── Implementación ───────────────────────────────────────────────────────────

export const useSimulationStore = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({

    // ── Estado inicial ───────────────────────────────────────────────────────
    state:        createInitialState(LAB_PARAMS),
    params:       LAB_PARAMS,
    running:      true,
    history:      [],
    showAdvanced: false,

    // ── tick ─────────────────────────────────────────────────────────────────
    tick: (next) => set({ state: next }),

    // ── pushFrame ─────────────────────────────────────────────────────────────
    pushFrame: (frame) =>
      set(({ history }) => ({
        history:
          history.length >= MAX_HISTORY
            ? [...history.slice(1), frame]
            : [...history, frame],
      })),

    // ── setParams ─────────────────────────────────────────────────────────────
    setParams: (partial) => {
      const params = { ...get().params, ...partial }
      // Asegurar que pivotOffset esté siempre dentro de [0, L].
      // Necesario cuando el usuario reduce L y el pivote queda fuera de la barra.
      if (params.pivotOffset < 0) params.pivotOffset = 0
      if (params.pivotOffset > params.L) params.pivotOffset = params.L
      set({
        params,
        state:   createInitialState(params),
        history: [],
        running: true,
      })
    },

    // ── setRunning ────────────────────────────────────────────────────────────
    setRunning: (running) => set({ running }),

    // ── reset ─────────────────────────────────────────────────────────────────
    reset: () => {
      const { params } = get()
      set({
        state:   createInitialState(params),
        history: [],
        running: true,
      })
    },

    // ── toggleAdvanced ────────────────────────────────────────────────────────
    toggleAdvanced: () => set(s => ({ showAdvanced: !s.showAdvanced })),
  }))
)

// ─── Selectores tipados ───────────────────────────────────────────────────────
//
// Usar selectores en lugar de acceder al store completo evita re-renders.
//
// Uso correcto:
//   const theta = useSimulationStore(selectTheta)   // re-renderiza solo si θ cambia
//
// Uso incorrecto:
//   const { state } = useSimulationStore()          // re-renderiza en CADA tick

export const selectState        = (s: SimulationStore) => s.state
export const selectParams       = (s: SimulationStore) => s.params
export const selectRunning      = (s: SimulationStore) => s.running
export const selectHistory      = (s: SimulationStore) => s.history
export const selectTheta        = (s: SimulationStore) => s.state.theta
export const selectOmega        = (s: SimulationStore) => s.state.omega
export const selectTime         = (s: SimulationStore) => s.state.time
export const selectShowAdvanced = (s: SimulationStore) => s.showAdvanced