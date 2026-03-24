// ─────────────────────────────────────────────────────────────────────────────
// INTEGRADOR RUNGE-KUTTA ORDEN 4 (RK4)
//
// ¿Qué hace este archivo?
// Resuelve ecuaciones diferenciales paso a paso con alta precisión.
//
// ¿Por qué RK4 y no simplemente sumar velocidad × tiempo?
// El método de Euler simple (x_nueva = x + v·dt) acumula error:
//   → Con dt = 16ms (60fps), el péndulo gana o pierde energía visible en minutos.
// RK4 hace 4 estimaciones internas por paso y promedia el resultado:
//   → Con dt = 1ms, el error acumulado en 1 hora de simulación < 0.0001°
//
// Este archivo es 100% genérico: no sabe nada del péndulo.
// Funciona para cualquier sistema físico que se pueda describir como
// un vector de estado y una función derivada.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Función derivada genérica.
 * Recibe el estado actual y el tiempo, retorna las derivadas del estado.
 *
 * Para el péndulo: state = [theta, omega]
 *   → derivada[0] = dtheta/dt = omega
 *   → derivada[1] = domega/dt = -(M·g·d/I)·sin(theta) - (b/I)·omega
 */
export type DerivativeFn = (state: number[], t: number) => number[]

/**
 * Avanza el estado un paso de tiempo dt usando el método RK4.
 *
 * Matemáticamente:
 *   k1 = f(state,          t)
 *   k2 = f(state + k1·dt/2, t + dt/2)
 *   k3 = f(state + k2·dt/2, t + dt/2)
 *   k4 = f(state + k3·dt,   t + dt)
 *   state_nuevo = state + (k1 + 2·k2 + 2·k3 + k4) · dt/6
 *
 * @param f      - función derivada del sistema
 * @param state  - vector de estado actual [theta, omega, ...]
 * @param t      - tiempo actual (segundos)
 * @param dt     - paso de tiempo (segundos) — usar 0.001 (1ms)
 * @returns      - nuevo vector de estado después de dt segundos
 */
export function rk4Step(
  f:     DerivativeFn,
  state: number[],
  t:     number,
  dt:    number
): number[] {
  const n = state.length

  // ── Etapa 1: derivada en el punto inicial ──────────────────────────────
  const k1 = f(state, t)

  // ── Etapa 2: derivada en el punto medio usando k1 ──────────────────────
  const s2 = state.map((x, i) => x + k1[i] * dt * 0.5)
  const k2 = f(s2, t + dt * 0.5)

  // ── Etapa 3: derivada en el punto medio usando k2 (mejor estimación) ───
  const s3 = state.map((x, i) => x + k2[i] * dt * 0.5)
  const k3 = f(s3, t + dt * 0.5)

  // ── Etapa 4: derivada al final del paso usando k3 ──────────────────────
  const s4 = state.map((x, i) => x + k3[i] * dt)
  const k4 = f(s4, t + dt)

  // ── Promedio ponderado de las 4 estimaciones ───────────────────────────
  // k2 y k3 (estimaciones del punto medio) tienen el doble de peso.
  return state.map(
    (x, i) => x + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6
  )
}

/**
 * Ejecuta múltiples pasos RK4 para avanzar desde t hasta t + totalTime.
 * Útil para sincronizar la física con frames del navegador que llegan
 * en intervalos variables (13ms, 17ms, 20ms según la carga del sistema).
 *
 * @param f         - función derivada del sistema
 * @param state     - estado inicial
 * @param t         - tiempo inicial
 * @param totalTime - tiempo total a avanzar (segundos)
 * @param dt        - tamaño de cada micro-paso (segundos)
 * @returns         - [estado final, tiempo final]
 */
export function rk4Integrate(
  f:         DerivativeFn,
  state:     number[],
  t:         number,
  totalTime: number,
  dt:        number = 0.001
): [number[], number] {
  let s = [...state]
  let time = t
  const steps = Math.round(totalTime / dt)

  for (let i = 0; i < steps; i++) {
    s    = rk4Step(f, s, time, dt)
    time += dt
  }

  return [s, time]
}