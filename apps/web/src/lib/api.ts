// ─── CLIENTE TIPADO DEL API ──────────────────────────────────────────────────
//
// Helpers de fetch que devuelven los tipos inferidos de @pendulo/schemas.
// Lanzan en caso de status no-2xx o body inválido.
//
// `apiBase`:
//   • dev → '' (rewrites de Next proxean a :4000)
//   • prod → process.env.NEXT_PUBLIC_API_URL

import type {
  PendulumParams,
  SimulateRequest,
  SimulateResponse,
  ValidateExerciseResponse,
  SessionProgressResponse,
} from '@pendulo/schemas'

const apiBase = (): string => process.env.NEXT_PUBLIC_API_URL ?? ''

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}/api/v1${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

export const api = {
  validateExercise(body: {
    exerciseId: string
    userAnswer: number | string
    sessionId?: string
  }): Promise<ValidateExerciseResponse> {
    return jsonFetch<ValidateExerciseResponse>('/exercises/validate', {
      method: 'POST',
      body:   JSON.stringify(body),
    })
  },

  postProgress(body: {
    sessionId:  string
    sectionId:  number
    exerciseId?: string
    completed:  boolean
  }): Promise<{ ok: true }> {
    return jsonFetch<{ ok: true }>('/progress', {
      method: 'POST',
      body:   JSON.stringify(body),
    })
  },

  getProgress(sessionId: string): Promise<SessionProgressResponse> {
    return jsonFetch<SessionProgressResponse>(`/progress/${sessionId}`)
  },

  simulate(req: { params: PendulumParams } & Omit<SimulateRequest, 'params'>): Promise<SimulateResponse> {
    return jsonFetch<SimulateResponse>('/physics/simulate', {
      method: 'POST',
      body:   JSON.stringify(req),
    })
  },
}
