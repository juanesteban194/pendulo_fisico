// ─── TESTS DE ESQUEMAS ZOD ───────────────────────────────────────────────────
//
// Smoke tests: cada schema debe aceptar valores válidos del laboratorio
// y rechazar los inválidos típicos. No es exhaustivo — solo previene drift.

import { describe, it, expect } from 'vitest'
import {
  PendulumParamsSchema,
  ExpectedAnswerSchema,
  ExerciseSchema,
  SectionFrontmatterSchema,
  ValidateExerciseRequestSchema,
  SimulateRequestSchema,
} from './index'

// ─────────────────────────────────────────────────────────────────────────────
describe('PendulumParamsSchema', () => {
  it('acepta los parámetros del laboratorio (Medellín)', () => {
    const ok = PendulumParamsSchema.safeParse({
      L:           0.25,
      m:           0.020,
      mr:          0.075,
      g:           9.78,
      theta0:      5 * Math.PI / 180,
      fluid:       'air',
      tempC:       20,
      pivotOffset: 0,
    })
    expect(ok.success).toBe(true)
  })

  it('rechaza pivotOffset > L', () => {
    const bad = PendulumParamsSchema.safeParse({
      L: 0.25, m: 0.02, mr: 0.075, g: 9.78,
      theta0: 0.1, fluid: 'air', tempC: 20,
      pivotOffset: 0.30,
    })
    expect(bad.success).toBe(false)
  })

  it('rechaza fluido desconocido', () => {
    const bad = PendulumParamsSchema.safeParse({
      L: 0.25, m: 0.02, mr: 0.075, g: 9.78,
      theta0: 0.1, fluid: 'mercurio', tempC: 20,
      pivotOffset: 0,
    })
    expect(bad.success).toBe(false)
  })

  it('rechaza masa total = 0', () => {
    const bad = PendulumParamsSchema.safeParse({
      L: 0.25, m: 0, mr: 0, g: 9.78,
      theta0: 0.1, fluid: 'air', tempC: 20,
      pivotOffset: 0,
    })
    expect(bad.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExpectedAnswerSchema', () => {
  it('acepta numeric, multiple y open', () => {
    expect(ExpectedAnswerSchema.safeParse({ type: 'number', value: 1.04 }).success).toBe(true)
    expect(ExpectedAnswerSchema.safeParse({ type: 'multiple', value: 'b' }).success).toBe(true)
    expect(ExpectedAnswerSchema.safeParse({ type: 'open' }).success).toBe(true)
  })

  it('rechaza tipo desconocido', () => {
    const bad = ExpectedAnswerSchema.safeParse({ type: 'fill-in-blank', value: 'x' })
    expect(bad.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExerciseSchema', () => {
  it('acepta un ejercicio numérico válido', () => {
    const ok = ExerciseSchema.safeParse({
      id:             's2-period-medellin',
      sectionId:      2,
      prompt:         '¿Cuánto debe medir L para que T = 1 s?',
      expectedAnswer: { type: 'number', value: 0.2479 },
      tolerance:      0.02,
      unit:           'm',
      feedbackOk:     '¡Bien! Ese valor de L da T = 1 s en Medellín.',
      feedbackFail:   'Recuerda: T = 2π√(L/g) → despeja L.',
    })
    expect(ok.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('SectionFrontmatterSchema', () => {
  it('acepta frontmatter válido', () => {
    const ok = SectionFrontmatterSchema.safeParse({
      slug:             'pendulo-simple',
      order:            2,
      title:            'La cuerda ideal',
      summary:          'Péndulo matemático: masa puntual, cuerda sin masa.',
      prerequisites:    ['pivote'],
      estimatedMinutes: 12,
    })
    expect(ok.success).toBe(true)
  })

  it('rechaza slug con espacios o tildes', () => {
    expect(
      SectionFrontmatterSchema.safeParse({
        slug: 'péndulo simple', order: 2, title: 't', summary: 's', estimatedMinutes: 5,
      }).success,
    ).toBe(false)
  })

  it('aplica default de prerequisites = []', () => {
    const r = SectionFrontmatterSchema.parse({
      slug: 'intro', order: 0, title: 'Intro', summary: '...', estimatedMinutes: 3,
    })
    expect(r.prerequisites).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ValidateExerciseRequestSchema', () => {
  it('acepta userAnswer numérica o string', () => {
    expect(
      ValidateExerciseRequestSchema.safeParse({ exerciseId: 'x', userAnswer: 1.04 }).success,
    ).toBe(true)
    expect(
      ValidateExerciseRequestSchema.safeParse({ exerciseId: 'x', userAnswer: 'b' }).success,
    ).toBe(true)
  })

  it('rechaza sessionId que no es UUID', () => {
    const bad = ValidateExerciseRequestSchema.safeParse({
      exerciseId: 'x', userAnswer: 1, sessionId: 'no-uuid',
    })
    expect(bad.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('SimulateRequestSchema', () => {
  it('aplica default dt = 0.001 y sampleHz = 60', () => {
    const r = SimulateRequestSchema.parse({
      params: {
        L: 0.25, m: 0.02, mr: 0.075, g: 9.78,
        theta0: 0.1, fluid: 'air', tempC: 20, pivotOffset: 0,
      },
      duration: 5,
    })
    expect(r.dt).toBe(0.001)
    expect(r.sampleHz).toBe(60)
  })

  it('rechaza duration > 60 s (anti-DoS)', () => {
    const bad = SimulateRequestSchema.safeParse({
      params: {
        L: 0.25, m: 0.02, mr: 0.075, g: 9.78,
        theta0: 0.1, fluid: 'air', tempC: 20, pivotOffset: 0,
      },
      duration: 300,
    })
    expect(bad.success).toBe(false)
  })
})
