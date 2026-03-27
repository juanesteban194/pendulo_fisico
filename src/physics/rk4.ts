// ─── INTEGRADOR RUNGE-KUTTA ORDEN 4 ──────────────────────────────────────────
// Resuelve ecuaciones diferenciales con alta precisión numérica.
// Completamente genérico — no sabe nada del péndulo.
// TypeScript puro — cero imports externos.

export type DerivativeFn = (state: number[], t: number) => number[]

/**
 * Avanza el sistema un paso dt usando RK4.
 * Hace 4 estimaciones de la derivada y promedia ponderando el resultado.
 * Error de orden O(dt⁴) — millones de veces mejor que Euler (O(dt)).
 */
export function rk4Step(
  f: DerivativeFn,
  state: number[],
  t: number,
  dt: number
): number[] {
  const k1 = f(state, t)
  const s2 = state.map((x, i) => x + (k1[i] ?? 0) * dt * 0.5)
  const k2 = f(s2, t + dt * 0.5)
  const s3 = state.map((x, i) => x + (k2[i] ?? 0) * dt * 0.5)
  const k3 = f(s3, t + dt * 0.5)
  const s4 = state.map((x, i) => x + (k3[i] ?? 0) * dt)
  const k4 = f(s4, t + dt)

  return state.map(
    (x, i) => x + ((k1[i] ?? 0) + 2 * (k2[i] ?? 0) + 2 * (k3[i] ?? 0) + (k4[i] ?? 0)) * dt / 6
  )
}

/**
 * Integra el sistema durante totalTime segundos con pasos de dt.
 * Retorna el estado final y el tiempo final.
 */
export function rk4Integrate(
  f: DerivativeFn,
  state: number[],
  t: number,
  totalTime: number,
  dt: number = 0.001
): [number[], number] {
  let s = [...state]
  let time = t
  const steps = Math.round(totalTime / dt)

  for (let i = 0; i < steps; i++) {
    s = rk4Step(f, s, time, dt)
    time += dt
  }

  return [s, time]
}