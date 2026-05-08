'use client'

// ─── HOOK DE SIMULACIÓN ───────────────────────────────────────────────────────

import { useRef } from 'react'
import { useFrame }  from '@react-three/fiber'
import { useSimulationStore } from '../store/simulationStore'
import { advancePendulum, computeDerived } from '@pendulo/physics'
import type { PendulumState, PendulumParams } from '@pendulo/physics'

const MAX_DELTA       = 0.05
const HISTORY_INTERVAL = 1 / 30

export function useSimulation() {
  const stateRef  = useRef<PendulumState>(useSimulationStore.getState().state)
  const paramsRef = useRef<PendulumParams>(useSimulationStore.getState().params)
  const historyAccRef = useRef<number>(0)

  useSimulationStore.subscribe(s => s.state,  next => { stateRef.current  = next })
  useSimulationStore.subscribe(s => s.params, next => { paramsRef.current = next })

  useFrame((_root, delta) => {
    if (!useSimulationStore.getState().running) return

    const safeDelta = Math.min(delta, MAX_DELTA)
    const next = advancePendulum(stateRef.current, paramsRef.current, safeDelta)
    useSimulationStore.getState().tick(next)

    historyAccRef.current += safeDelta
    if (historyAccRef.current >= HISTORY_INTERVAL) {
      historyAccRef.current = 0
      const derived = computeDerived(next, paramsRef.current)
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
