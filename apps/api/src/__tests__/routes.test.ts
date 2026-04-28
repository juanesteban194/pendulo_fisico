// ─── TESTS DE LAS RUTAS DEL API ──────────────────────────────────────────────
//
// Smoke + happy paths + error paths para los 6 endpoints.
// Asume que `pnpm db:reset` ya corrió (la DB tiene las 9 secciones + ejercicios).
//
// Si encuentras "no se encontró la BD", corre:
//   pnpm --filter @pendulo/api db:reset

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { makeTestApp } from './setup'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../db'

let app: FastifyInstance

beforeAll(async () => { app = await makeTestApp() })
afterAll(async  () => { await app.close(); await prisma.$disconnect() })

const LAB_PARAMS = {
  L: 0.25, m: 0.020, mr: 0.075, g: 9.78,
  theta0: 0.0873, fluid: 'air' as const, tempC: 20, pivotOffset: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('200 + ok:true', async () => {
    const r = await app.inject({ method: 'GET', url: '/health' })
    expect(r.statusCode).toBe(200)
    expect(r.json()).toMatchObject({ ok: true })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/content/sections', () => {
  it('devuelve las 9 secciones ordenadas', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/content/sections' })
    expect(r.statusCode).toBe(200)
    const body = r.json() as { sections: Array<{ slug: string; order: number }> }
    expect(body.sections).toHaveLength(9)
    expect(body.sections.map(s => s.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(body.sections.find(s => s.slug === 'pendulo-fisico')).toBeDefined()
  })
})

describe('GET /api/v1/content/sections/:slug', () => {
  it('devuelve la sección con body MDX y ejercicios', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/content/sections/pendulo-fisico' })
    expect(r.statusCode).toBe(200)
    const body = r.json() as {
      slug: string; contentMdx: string;
      exercises: Array<{ id: string; expectedAnswer: { type: string } }>
    }
    expect(body.slug).toBe('pendulo-fisico')
    expect(body.contentMdx.length).toBeGreaterThan(0)
    expect(body.exercises.some(e => e.id === 's5-cm-distance')).toBe(true)
  })

  it('404 con slug desconocido', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/content/sections/no-existe' })
    expect(r.statusCode).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/exercises/validate', () => {
  it('numérico correcto dentro de tolerancia', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: 's5-period-physical', userAnswer: 0.985 },
    })
    expect(r.statusCode).toBe(200)
    const body = r.json() as { correct: boolean; expected: number }
    expect(body.correct).toBe(true)
    expect(body.expected).toBeCloseTo(0.9847, 3)
  })

  it('numérico fuera de tolerancia', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: 's5-period-physical', userAnswer: 2.5 },
    })
    expect(r.statusCode).toBe(200)
    expect(r.json()).toMatchObject({ correct: false })
  })

  it('multiple-choice exacto', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: 's2-mass-independence', userAnswer: 'b' },
    })
    expect(r.statusCode).toBe(200)
    expect(r.json()).toMatchObject({ correct: true })
  })

  it('open-ended: siempre correct=true', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: 's5-discrepancy-source', userAnswer: 'amplitud no infinitesimal' },
    })
    expect(r.statusCode).toBe(200)
    expect(r.json()).toMatchObject({ correct: true })
  })

  it('404 con exerciseId desconocido', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: 'no-existe', userAnswer: 1 },
    })
    expect(r.statusCode).toBe(404)
  })

  it('400 si el body no pasa Zod', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: { exerciseId: '', userAnswer: 1 },
    })
    expect(r.statusCode).toBe(400)
  })

  it('registra Attempt cuando viene sessionId', async () => {
    const sessionId = randomUUID()
    await app.inject({
      method: 'POST',
      url:    '/api/v1/exercises/validate',
      payload: {
        exerciseId: 's5-period-physical',
        userAnswer: 0.985,
        sessionId,
      },
    })
    const attempts = await prisma.attempt.findMany({ where: { sessionId } })
    expect(attempts).toHaveLength(1)
    expect(attempts[0]!.correct).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/progress + GET /api/v1/progress/:sessionId', () => {
  it('flujo completo: marcar sección 1 completada y leer progreso', async () => {
    const sessionId = randomUUID()
    const section1 = await prisma.section.findUnique({ where: { slug: 'pivote' } })
    expect(section1).not.toBeNull()

    const r1 = await app.inject({
      method: 'POST',
      url:    '/api/v1/progress',
      payload: { sessionId, sectionId: section1!.id, completed: true },
    })
    expect(r1.statusCode).toBe(200)

    const r2 = await app.inject({
      method: 'GET',
      url:    `/api/v1/progress/${sessionId}`,
    })
    expect(r2.statusCode).toBe(200)
    const body = r2.json() as {
      sessionId: string;
      progress: Array<{ sectionId: number; completed: boolean }>
    }
    expect(body.sessionId).toBe(sessionId)
    expect(body.progress).toEqual([
      expect.objectContaining({ sectionId: section1!.id, completed: true }),
    ])
  })

  it('404 si la sección no existe', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/progress',
      payload: { sessionId: randomUUID(), sectionId: 99999, completed: true },
    })
    expect(r.statusCode).toBe(404)
  })

  it('400 si sessionId no es UUID', async () => {
    const r = await app.inject({
      method: 'GET',
      url:    '/api/v1/progress/no-uuid',
    })
    expect(r.statusCode).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/physics/simulate', () => {
  it('devuelve trayectoria muestreada del lab', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/physics/simulate',
      payload: { params: LAB_PARAMS, duration: 2, sampleHz: 60 },
    })
    expect(r.statusCode).toBe(200)
    const body = r.json() as {
      t: number[]; theta: number[]; omega: number[];
      Ec: number[]; Ep: number[]; Etotal: number[];
      meta: { samples: number; duration: number }
    }
    expect(body.t.length).toBeGreaterThan(60)        // ~120 muestras (2s × 60Hz)
    expect(body.t.length).toBe(body.theta.length)
    expect(body.t[0]).toBeCloseTo(0, 6)
    expect(body.theta[0]).toBeCloseTo(LAB_PARAMS.theta0, 4)
    expect(body.omega[0]).toBe(0)
    expect(body.meta.duration).toBe(2)
  })

  it('400 si pivotOffset > L', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/physics/simulate',
      payload: { params: { ...LAB_PARAMS, pivotOffset: 0.30 }, duration: 1 },
    })
    expect(r.statusCode).toBe(400)
  })

  it('400 si duration > 60', async () => {
    const r = await app.inject({
      method: 'POST',
      url:    '/api/v1/physics/simulate',
      payload: { params: LAB_PARAMS, duration: 3000 },
    })
    expect(r.statusCode).toBe(400)
  })
})
