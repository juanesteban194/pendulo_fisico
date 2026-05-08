'use client'

// ─── STORE GLOBAL DE SIMULACIÓN ───────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  PendulumState,
  PendulumParams,
  SimulationFrame,
} from '@pendulo/physics'
import { LAB_PARAMS, createInitialState } from '@pendulo/physics'

const MAX_HISTORY = 900

export interface SimulationStore {
  state:        PendulumState
  params:       PendulumParams
  running:      boolean
  showAdvanced: boolean
  history:      SimulationFrame[]

  tick:          (next: PendulumState) => void
  pushFrame:     (frame: SimulationFrame) => void
  setParams:     (partial: Partial<PendulumParams>) => void
  setRunning:    (running: boolean) => void
  reset:         () => void
  toggleAdvanced: () => void
}

export const useSimulationStore = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({
    state:        createInitialState(LAB_PARAMS),
    params:       LAB_PARAMS,
    running:      true,
    history:      [],
    showAdvanced: false,

    tick: (next) => set({ state: next }),

    pushFrame: (frame) =>
      set(({ history }) => ({
        history:
          history.length >= MAX_HISTORY
            ? [...history.slice(1), frame]
            : [...history, frame],
      })),

    setParams: (partial) => {
      const params = { ...get().params, ...partial }
      if (params.pivotOffset < 0) params.pivotOffset = 0
      if (params.pivotOffset > params.L) params.pivotOffset = params.L
      set({
        params,
        state:   createInitialState(params),
        history: [],
        running: true,
      })
    },

    setRunning: (running) => set({ running }),

    reset: () => {
      const { params } = get()
      set({
        state:   createInitialState(params),
        history: [],
        running: true,
      })
    },

    toggleAdvanced: () => set(s => ({ showAdvanced: !s.showAdvanced })),
  }))
)

export const selectState        = (s: SimulationStore) => s.state
export const selectParams       = (s: SimulationStore) => s.params
export const selectRunning      = (s: SimulationStore) => s.running
export const selectHistory      = (s: SimulationStore) => s.history
export const selectTheta        = (s: SimulationStore) => s.state.theta
export const selectOmega        = (s: SimulationStore) => s.state.omega
export const selectTime         = (s: SimulationStore) => s.state.time
export const selectShowAdvanced = (s: SimulationStore) => s.showAdvanced
