// ─── <OpenExercise /> ────────────────────────────────────────────────────────
//
// Pregunta abierta — el alumno escribe libre. Siempre se considera "registrado"
// (el backend devuelve correct:true para tipo 'open'). El feedback explica
// qué cosas pudo haber considerado el alumno y queda como referencia.
//
// Mínimo de caracteres antes de poder enviar (default: 30).

'use client'

import { useState } from 'react'
import type { ValidateExerciseResponse } from '@pendulo/schemas'

export interface OpenExerciseProps {
  id:        string
  prompt:    string
  /** Hint del placeholder. */
  placeholder?: string
  /** Mínimo de caracteres antes de habilitar el envío. Default: 30. */
  minChars?: number
  sessionId?: string
  apiBase?:  string
  className?: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent';  data: ValidateExerciseResponse }
  | { kind: 'error'; message: string }

export function OpenExercise({
  id, prompt, placeholder = 'Escribe tu razonamiento…',
  minChars = 30, sessionId, apiBase, className = '',
}: OpenExerciseProps) {
  const [text, setText]   = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const base = apiBase ?? process.env.NEXT_PUBLIC_API_URL ?? ''
  const enoughChars = text.trim().length >= minChars

  async function submit() {
    if (!enoughChars) return
    setState({ kind: 'submitting' })
    try {
      const res = await fetch(`${base}/api/v1/exercises/validate`, {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ exerciseId: id, userAnswer: text.trim(), sessionId }),
      })
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}${t ? ` · ${t.slice(0, 80)}` : ''}`)
      }
      const data = (await res.json()) as ValidateExerciseResponse
      setState({ kind: 'sent', data })
    } catch (e) {
      setState({
        kind: 'error',
        message: e instanceof Error ? e.message : 'Error de red',
      })
    }
  }

  const submitting = state.kind === 'submitting'
  const isSent     = state.kind === 'sent'

  return (
    <div
      className={[
        'rounded-lg border bg-bg-surface p-5 shadow-sm transition-colors',
        isSent ? 'border-accent-purple/40' : 'border-border-subtle',
        className,
      ].join(' ')}
    >
      <p className="text-base leading-relaxed text-text-primary">{prompt}</p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitting || isSent}
        placeholder={placeholder}
        rows={5}
        aria-label={prompt}
        className={[
          'mt-4 w-full resize-y rounded border border-border-default bg-bg-elevated px-3 py-2.5',
          'text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary/70',
          'focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple',
          'disabled:cursor-not-allowed disabled:opacity-70',
        ].join(' ')}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={[
            'text-xs',
            enoughChars ? 'text-text-tertiary' : 'text-status-warning/80',
          ].join(' ')}
        >
          {text.trim().length}/{minChars} caracteres
          {!enoughChars && ' — sigue desarrollando tu idea'}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!enoughChars || submitting || isSent}
          className={[
            'rounded px-4 py-2 text-sm font-medium shadow-sm transition',
            'bg-accent-purple text-white',
            'hover:opacity-90',
            'focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        >
          {submitting ? 'Enviando…' : isSent ? '✓ Registrado' : 'Registrar respuesta'}
        </button>
      </div>

      {state.kind === 'sent' && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded border border-accent-purple/30 bg-accent-purple/10 p-3 text-sm leading-relaxed text-accent-purple"
        >
          <p className="font-semibold">Respuesta registrada</p>
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
