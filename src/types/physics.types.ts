// ─── CONTRATOS DE DATOS ──────────────────────────────────────────────────────
// Todos los archivos del proyecto importan interfaces desde aquí.
// TypeScript puro — cero imports externos.

export interface PendulumState {
  theta: number   // ángulo actual respecto a la vertical (radianes)
  omega: number   // velocidad angular dθ/dt (rad/s)
  time:  number   // tiempo transcurrido desde el inicio (s)
}

export interface PendulumParams {
  L:     number   // longitud pivote→masa (m)         — exp: 0.25
  m:     number   // masa de la barra (kg)             — exp: 0.020
  mr:    number   // masa del extremo (kg)             — exp: 0.075
  g:     number   // gravedad (m/s²)                   — Medellín: 9.78
  theta0: number  // ángulo inicial (rad)              — exp: 5°= 0.0873
  fluid: FluidId  // identificador del fluido
  tempC: number   // temperatura del fluido (°C)
}

export type FluidId = 'vacuum' | 'air' | 'water' | 'oil' | 'glycerin'

export interface FluidProperties {
  id:          FluidId
  name:        string
  rho:         number   // densidad (kg/m³)
  eta:         number   // viscosidad dinámica (Pa·s)
  tempRef:     number   // temperatura de referencia (°C)
  etaTempCoef: number   // coef. variación viscosidad por °C
  Cd:          number   // coeficiente de arrastre (esfera ~0.47)
}

export interface DerivedQuantities {
  I:       number   // momento de inercia (kg·m²)
  d:       number   // distancia pivote→CM (m)
  M:       number   // masa total (kg)
  T:       number   // período teórico (s)
  f:       number   // frecuencia (Hz)
  Leq:     number   // longitud equivalente (m)
  Ec:      number   // energía cinética (J)
  Ep:      number   // energía potencial (J)
  Etotal:  number   // energía mecánica total (J)
  Re:      number   // número de Reynolds (adimensional)
  regime:  'laminar' | 'transition' | 'turbulent'
  b:       number   // coeficiente de amortiguamiento (N·m·s/rad)
}

export interface SimulationFrame {
  time:  number
  theta: number
  omega: number
  Ec:    number
  Ep:    number
}