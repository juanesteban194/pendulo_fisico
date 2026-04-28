// ─── SessionContext ──────────────────────────────────────────────────────────
//
// Provee el sessionId UUID al árbol de componentes. Lo lee de localStorage
// (vía useSession) y lo expone vía useSessionId() a cualquier descendiente.
//
// Uso típico desde MDX:
//   <NumericExercise id="..." prompt="..." />   ← lee sessionId vía contexto

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSession } from '@/hooks/useSession'

const Ctx = createContext<string | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const sessionId = useSession()
  return <Ctx.Provider value={sessionId}>{children}</Ctx.Provider>
}

export function useSessionId(): string | undefined {
  return useContext(Ctx)
}
