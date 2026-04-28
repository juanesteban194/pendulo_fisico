// ─── useSession ──────────────────────────────────────────────────────────────
//
// Genera un UUID anónimo en localStorage al primer ingreso del navegador
// y lo persiste. Fase 1 = sin login, sin datos personales.
//
// Devuelve `undefined` durante el primer render (SSR / hidratación) y
// el UUID estable a partir del useEffect.

'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pendulo-session-id'

export function useSession(): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, id)
    }
    setSessionId(id)
  }, [])

  return sessionId
}
