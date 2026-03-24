// ─────────────────────────────────────────────────────────────────────────────
// CONTRATOS DE DATOS — todos los archivos del proyecto importan desde aquí.
// Si cambias una interface aquí, TypeScript te avisa en TODOS los lugares
// que usan ese dato. Así nunca hay inconsistencias silenciosas.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * El estado completo del péndulo en un instante de tiempo.
 * El motor RK4 toma un PendulumState y produce el siguiente PendulumState.
 */
export interface PendulumState {
  theta:  number   // ángulo actual respecto a la vertical (radianes)
  omega:  number   // velocidad angular dθ/dt (radianes/segundo)
  time:   number   // tiempo transcurrido desde el inicio (segundos)
}

/**
 * Todos los parámetros físicos que el usuario puede modificar.
 * Viven en el store de Zustand y los sliders de la UI los actualizan.
 */
export interface PendulumParams {
  L:        number   // longitud del péndulo pivote→masa (metros)  — exp: 0.25 m
  m:        number   // masa de la barra/tabla (kg)                — exp: 0.020 kg
  mr:       number   // masa concentrada en el extremo (kg)        — exp: 0.075 kg
  g:        number   // aceleración gravitacional (m/s²)           — Medellín: 9.78
  theta0:   number   // ángulo inicial (radianes)                  — exp: 5° = 0.0873 rad
  fluid:    FluidId  // identificador del fluido del entorno
  tempC:    number   // temperatura del fluido (°C) — afecta la viscosidad
}

/**
 * Fluidos disponibles en la simulación.
 * 'vacuum' es el caso ideal sin amortiguamiento.
 */
export type FluidId = 'vacuum' | 'air' | 'water' | 'oil' | 'glycerin'

/**
 * Propiedades físicas de un fluido a una temperatura de referencia.
 * fluids.ts define estos valores para cada FluidId.
 */
export interface FluidProperties {
  id:          FluidId
  name:        string
  rho:         number   // densidad (kg/m³)
  eta:         number   // viscosidad dinámica (Pa·s) a tempRef
  tempRef:     number   // temperatura de referencia para eta (°C)
  etaTempCoef: number   // coeficiente de variación de eta con temperatura (1/°C)
  Cd:          number   // coeficiente de arrastre de forma (adimensional)
}

/**
 * Resultados derivados que se calculan a partir del estado y los parámetros.
 * La UI los muestra en el panel InfoDisplay.
 */
export interface DerivedQuantities {
  I:          number   // momento de inercia total respecto al pivote (kg·m²)
  d:          number   // distancia pivote → centro de masa (metros)
  M:          number   // masa total m + mr (kg)
  T:          number   // período teórico calculado con la fórmula (segundos)
  f:          number   // frecuencia teórica = 1/T (Hz)
  Leq:        number   // longitud equivalente del péndulo simple (metros)
  Ec:         number   // energía cinética instantánea (joules)
  Ep:         number   // energía potencial instantánea (joules)
  Etotal:     number   // energía mecánica total (joules)
  Re:         number   // número de Reynolds instantáneo
  regime:     'laminar' | 'transition' | 'turbulent'
  b:          number   // coeficiente de amortiguamiento efectivo (N·m·s/rad)
}

/**
 * Un punto en el historial de la simulación.
 * Charts.tsx guarda los últimos N frames en un array de SimulationFrame[].
 */
export interface SimulationFrame {
  time:   number   // segundos
  theta:  number   // radianes
  omega:  number   // rad/s
  Ec:     number   // joules
  Ep:     number   // joules
}