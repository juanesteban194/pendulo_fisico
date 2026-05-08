// ─── Wrappers de ejercicios que inyectan sessionId desde el contexto ──────────
//
// Permiten usar <NumericExercise>, <MultipleChoiceExercise> y <OpenExercise>
// en los JSX de las secciones sin pasar sessionId manualmente en cada call.
// Leen el UUID anónimo de SessionContext (provisto por PageShell).

'use client'

import {
  NumericExercise as BaseNumeric,
  MultipleChoiceExercise as BaseMulti,
  OpenExercise as BaseOpen,
  type NumericExerciseProps,
  type MultipleChoiceExerciseProps,
  type OpenExerciseProps,
} from '@pendulo/ui'
import { useSessionId } from './SessionContext'

export function NumericExercise(props: Omit<NumericExerciseProps, 'sessionId'>) {
  const sessionId = useSessionId()
  return <BaseNumeric {...props} sessionId={sessionId} />
}

export function MultipleChoiceExercise(props: Omit<MultipleChoiceExerciseProps, 'sessionId'>) {
  const sessionId = useSessionId()
  return <BaseMulti {...props} sessionId={sessionId} />
}

export function OpenExercise(props: Omit<OpenExerciseProps, 'sessionId'>) {
  const sessionId = useSessionId()
  return <BaseOpen {...props} sessionId={sessionId} />
}
