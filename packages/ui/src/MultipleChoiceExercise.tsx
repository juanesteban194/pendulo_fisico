// ─── <MultipleChoiceExercise /> ──────────────────────────────────────────────
//
// Pregunta de opción múltiple. El alumno selecciona una opción (a/b/c/d…),
// pulsa Verificar y obtiene feedback contra el endpoint del API.
//
// Las opciones se pasan como array; las letras (a, b, c…) se generan
// internamente. El backend espera la letra como string, no el texto.

'use client'

import { useState } from 'react'
import type { ValidateExerciseResponse } from '@pendulo/schemas'

const LETTERS = 'abcdefghij'

export interface MultipleChoiceExerciseProps {
  id:        string
  prompt:    string
  /** Texto de cada opción, en el orden a, b, c, … */
  options:   string[]
  sessionId?: string
  apiBase?:  string
  onValidated?: (result: ValidateExerciseResponse) => void
  className?: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'correct';   data: ValidateExerciseResponse }
  | { kind: 'incorrect'; data: ValidateExerciseResponse }
  | { kind: 'error';     message: string }

export function MultipleChoiceExercise({
  id, prompt, options, sessionId, apiBase, onValidated, className = '',
}: MultipleChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState]       = useState<State>({ kind: 'idle' })

  const base = apiBase ?? process.env.NEXT_PUBLIC_API_URL ?? ''

  async function submit() {
    if (!selected) return
    setState({ kind: 'submitting' })
    try {
      const res = await fetch(`${base}/api/v1/exercises/validate`, {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ exerciseId: id, userAnswer: selected, sessionId }),
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

  const submitting = state.kind === 'submitting'
  const isCorrect  = state.kind === 'correct'
  const isLocked   = isCorrect

  return (
    <div
      className={[
        'rounded-lg border bg-bg-surface p-5 shadow-sm transition-colors',
        isCorrect ? 'border-accent-green/40' : 'border-border-subtle',
        className,
      ].join(' ')}
    >
      <p className="text-base leading-relaxed text-text-primary">{prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {options.map((text, i) => {
          const letter = LETTERS[i]!
          const checked = selected === letter
          const correct = isCorrect && checked
          return (
            <label
              key={letter}
              className={[
                'group flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition',
                'hover:border-accent-orange/40',
                isLocked && 'cursor-not-allowed opacity-90 hover:border-border-subtle',
                checked
                  ? correct
                    ? 'border-accent-green bg-accent-green/8'
                    : 'border-accent-orange bg-accent-orange-soft'
                  : 'border-border-subtle bg-bg-surface',
              ].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name={`mc-${id}`}
                value={letter}
                checked={checked}
                disabled={isLocked || submitting}
                onChange={() => setSelected(letter)}
                className="mt-1 h-4 w-4 cursor-pointer accent-orange-500"
                aria-label={`Opción ${letter.toUpperCase()}`}
                style={{ accentColor: correct ? 'rgb(var(--accent-green))' : 'rgb(var(--accent-orange))' }}
              />
              <div className="flex-1">
                <span className="font-mono text-xs font-semibold text-text-tertiary">
                  {letter})
                </span>
                <span className="ml-2 text-sm leading-relaxed text-text-primary">
                  {text}
                </span>
              </div>
            </label>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {selected && !isLocked && (
          <span className="text-xs text-text-tertiary">
            Seleccionado: <span className="font-mono">{selected})</span>
          </span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!selected || submitting || isLocked}
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
        <div role="alert"
             className="mt-4 rounded border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">
          {state.message}
        </div>
      )}
    </div>
  )
}
