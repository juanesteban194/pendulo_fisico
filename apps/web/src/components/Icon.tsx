// ─── <Icon /> ────────────────────────────────────────────────────────────────
// SVGs temáticos line-art que reemplazan a los emojis. Todos comparten el
// mismo lenguaje visual: stroke 1.5px, currentColor, viewBox 24×24, esquinas
// redondas. Server-component-friendly (solo markup).

export type IconName =
  | 'clock'         // cronómetro · feature "Tiempo real"
  | 'wave'          // ondas · feature "5 fluidos" / amortiguamiento
  | 'planet-rings' // planeta con anillos · feature "5 gravedades"
  | 'bar-chart'    // gráfico de barras · feature "4 gráficas"
  | 'compass'       // brújula/escuadra · feature "Modo didáctico"
  | 'bolt'          // rayo · feature "Ligero"
  | 'target'        // diana · concepto MAS
  | 'cycle'         // ciclo · concepto conservación
  | 'mouse'         // ratón · hint controles
  | 'moon'          // luna · gravedad Luna
  | 'mars'          // marte · gravedad Marte
  | 'pin'           // chincheta · gravedad Medellín
  | 'globe'         // globo terráqueo · gravedad Tierra
  | 'jupiter'       // jupiter · gravedad Júpiter

export interface IconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  'aria-hidden'?: boolean
}

export function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.6,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  const path = ICON_PATHS[name]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {path}
    </svg>
  )
}

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  // Cronómetro: círculo + manecilla a 11 + corona arriba
  clock: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13l-2.6-2.8" />
      <path d="M9.5 3h5" />
      <path d="M12 3v2.5" />
    </>
  ),
  // Tres ondas paralelas
  wave: (
    <>
      <path d="M3 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M3 13c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M3 18c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
    </>
  ),
  // Planeta con anillo elíptico
  'planet-rings': (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-22 12 12)" />
    </>
  ),
  // Tres barras crecientes
  'bar-chart': (
    <>
      <path d="M5 19v-6" />
      <path d="M12 19v-10" />
      <path d="M19 19v-14" />
      <path d="M3 21h18" />
    </>
  ),
  // Compás de dibujo (escuadra-compás)
  compass: (
    <>
      <path d="M12 3v18" />
      <path d="M5 21l7-14 7 14" />
      <circle cx="12" cy="3" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Rayo
  bolt: (
    <path d="M13 2L4 14h6l-2 8 9-12h-6l2-8z" />
  ),
  // Diana: círculos concéntricos
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  // Ciclo: dos flechas circulares
  cycle: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.2" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2" />
      <path d="M14 6h4.5V1.5" />
      <path d="M10 18H5.5V22.5" />
    </>
  ),
  // Mouse silueta
  mouse: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="6" />
      <path d="M12 3v6" />
    </>
  ),
  // Luna creciente
  moon: (
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  ),
  // Marte: círculo con flecha noreste (símbolo ♂)
  mars: (
    <>
      <circle cx="10" cy="14" r="6" />
      <path d="M14.2 9.8L20 4" />
      <path d="M15 4h5v5" />
    </>
  ),
  // Pin de ubicación
  pin: (
    <>
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  // Globo terráqueo: círculo con meridiano + ecuador
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  // Júpiter: círculo con tres bandas horizontales
  jupiter: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M4 9h16" opacity="0.55" />
      <path d="M3.5 13h17" opacity="0.55" />
      <path d="M5 16.5h14" opacity="0.55" />
    </>
  ),
}
