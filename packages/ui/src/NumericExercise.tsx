// ─── <NumericExercise /> ─────────────────────────────────────────────────────
//
// Input numérico con verificación contra el endpoint POST /api/v1/exercises/validate.
//
// Estados:
//   • idle       → input vacío o pendiente
//   • submitting → llamando al API
//   • correct    → última respuesta correcta (verde + feedbackOk)
//   • incorrect  → última respuesta incorrecta (rojo + feedbackFail, sin
//                  revelar el valor esperado — la pista pedagógica es el
//                  feedback definido por el ejercicio)
//   • error      → fallo de red / 4xx-5xx (separado de "incorrecto")
//
// Si el padre pasa `sessionId` (UUID anónimo en localStorage), el backend
// registra el intento. Sin sessionId, la validación funciona pero no se
// guarda historial.
//
// Variable de entorno:
//   NEXT_PUBLIC_API_URL — base del API. Default: '' (rutas relativas vía
//   rewrites de Next en dev). En prod (Vercel + Railway): 'https://api.pendulo.app'.

'use client'

import { useState, type KeyboardEvent } from 'react'
import type { ValidateExerciseResponse } from '@pendulo/schemas'

export interface NumericExerciseProps {
  /** ID único en el backend (debe existir en la DB). */
  id: string
  /** Texto de la pregunta. */
  prompt: string
  /** Unidad mostrada al lado del input. */
  unit?: string
  /** UUID anónimo de la sesión del navegador. */
  sessionId?: string
  /** Override del API base (default: '' o NEXT_PUBLIC_API_URL). */
  apiBase?: string
  /** Callback opcional cuando se valida (útil para actualizar progreso). */
  onValidated?: (result: ValidateExerciseResponse) => void
  className?: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'correct';   data: ValidateExerciseResponse }
  | { kind: 'incorrect'; data: ValidateExerciseResponse }
  | { kind: 'error';     message: string }

export function NumericExercise({
  id,
  prompt,
  unit,
  sessionId,
  apiBase,
  onValidated,
  className = '',
}: NumericExerciseProps) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const base = apiBase ?? process.env.NEXT_PUBLIC_API_URL ?? ''

  async function submit() {
    const num = Number(value)
    if (!value.trim() || !Number.isFinite(num)) {
      setState({ kind: 'error', message: 'Ingresa un número válido.' })
      return
    }

    setState({ kind: 'submitting' })
    try {
      const res = await fetch(`${base}/api/v1/exercises/validate`, {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ exerciseId: id, userAnswer: num, sessionId }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}${text ? ` · ${text.slice(0, 80)}` : ''}`)
      }
      const data = (await res.json()) as ValidateExerciseResponse
      setState({ kind: data.correct ? 'correct' : 'incorrect', data })
      onValidated?.(data)
    } catch (e) {
      setState({
        kind: 'error',
        message: e instanceof Error ? e.message : 'Error de red',
      })
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && state.kind !== 'submitting') submit()
  }

  const submitting = state.kind === 'submitting'
  const isCorrect  = state.kind === 'correct'

  return (
    <div
      className={[
        'rounded-lg border bg-bg-surface p-5 shadow-sm transition-colors',
        isCorrect ? 'border-accent-green/40' : 'border-border-subtle',
        className,
      ].join(' ')}
    >
      <p className="text-base leading-relaxed text-text-primary">{prompt}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={submitting || isCorrect}
          placeholder="…"
          aria-label={prompt}
          className={[
            'w-36 rounded border px-3 py-2',
            'font-mono text-sm tabular-nums text-text-primary',
            'bg-bg-elevated border-border-default',
            'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange',
            'disabled:cursor-not-allowed disabled:opacity-70',
          ].join(' ')}
        />
        {unit && (
          <span className="text-sm font-medium text-text-tertiary">{unit}</span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting || isCorrect || !value.trim()}
          className={[
            'ml-auto rounded px-4 py-2 text-sm font-medium shadow-sm transition',
            'bg-accent-orange text-white',
            'hover:opacity-90',
            'focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        >
          {submitting ? 'Verificando…' : isCorrect ? '✓ Resuelto' : 'Verificar'}
        </button>
      </div>

      {/* Feedback */}
      {(state.kind === 'correct' || state.kind === 'incorrect') && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'mt-4 rounded border p-3 text-sm leading-relaxed',
            state.kind === 'correct'
              ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
              : 'border-status-warning/30 bg-status-warning/10 text-status-warning',
          ].join(' ')}
        >
          <p className="font-semibold">
            {state.kind === 'correct' ? '✓ Correcto' : '✗ Aún no'}
          </p>
          {state.data.feedback && (
            <p className="mt-1 text-text-primary/85">{state.data.feedback}</p>
          )}
        </div>
      )}

      {state.kind === 'error' && (
        <div
          role="alert"
          className="mt-4 rounded border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error"
        >
          {state.message}
        </div>
      )}
    </div>
  )
}
