// ─── TAILWIND CONFIG ─────────────────────────────────────────────────────────
//
// Los colores referencian CSS variables definidas en `src/app/globals.css`,
// de modo que un futuro modo oscuro o "tema relojero" se cambie sin tocar
// componentes. Los valores numéricos (los del brief) viven en globals.css —
// fuente única de verdad.

import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fondo y superficies
        bg: {
          primary:  'rgb(var(--bg-primary)  / <alpha-value>)',
          surface:  'rgb(var(--bg-surface)  / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
          tinted:   'rgb(var(--bg-tinted)   / <alpha-value>)',
        },
        // Bordes
        border: {
          subtle:  'rgb(var(--border-subtle)  / <alpha-value>)',
          default: 'rgb(var(--border-default) / <alpha-value>)',
        },
        // Texto
        text: {
          primary:   'rgb(var(--text-primary)   / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary:  'rgb(var(--text-tertiary)  / <alpha-value>)',
          label:     'rgb(var(--text-label)     / <alpha-value>)',
        },
        // Acentos del simulador (RESPETAR del brief)
        accent: {
          orange:      'rgb(var(--accent-orange)      / <alpha-value>)',
          'orange-soft': 'rgb(var(--accent-orange-soft) / <alpha-value>)',
          purple:      'rgb(var(--accent-purple)      / <alpha-value>)',
          blue:        'rgb(var(--accent-blue)        / <alpha-value>)',
          green:       'rgb(var(--accent-green)       / <alpha-value>)',
          amber:       'rgb(var(--accent-amber)       / <alpha-value>)',
        },
        // Estados
        status: {
          success: 'rgb(var(--status-success) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
          error:   'rgb(var(--status-error)   / <alpha-value>)',
          info:    'rgb(var(--status-info)    / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)',         'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // "PARÁMETROS", "GEOMETRÍA DEL PÉNDULO" — etiquetas del simulador
        'label': ['11px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      letterSpacing: {
        'label': '0.08em',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
