// ─── SEED DE LA BASE DE DATOS ────────────────────────────────────────────────
//
// Lee las 9 secciones de @pendulo/content (MDX) y las inserta en SQLite.
// Es idempotente: usa upsert por slug, así puedes correrlo múltiples veces.
//
// Los ejercicios viven aparte en este archivo (Phase B): cuando la fase D
// añada los ejercicios reales en cada MDX, este seed los leerá del frontmatter
// también. Por ahora rellenamos con uno o dos ejercicios placeholder por
// sección para validar el endpoint /exercises/validate.

import { PrismaClient } from '@prisma/client'
import { loadSections } from '@pendulo/content'
import type { Exercise as ExerciseSchema } from '@pendulo/schemas'

const prisma = new PrismaClient()

// ─── Ejercicios placeholder por sección ──────────────────────────────────────
//
// Datos del laboratorio (consistentes con el simulador y los tests):
//   L = 0.25 m, m = 0.020 kg, mr = 0.075 kg, g = 9.78 m/s²
//   d ≈ 0.2237 m, I ≈ 0.005105 kg·m², T_calc ≈ 0.9847 s, T_lab = 1.04 s
//
const SEED_EXERCISES: Record<string, Omit<ExerciseSchema, 'sectionId'>[]> = {
  pivote: [
    {
      id: 's1-period-from-count',
      prompt: 'Un péndulo completa 10 oscilaciones en 9.847 segundos. ¿Cuál es su período T en segundos?',
      expectedAnswer: { type: 'number', value: 0.9847 },
      tolerance: 0.02,
      unit: 's',
      feedbackOk: '¡Correcto! T = tiempo total / número de oscilaciones.',
      feedbackFail: 'Pista: T = tiempo_total / N_oscilaciones.',
    },
  ],
  'pendulo-simple': [
    {
      id: 's2-length-for-T1',
      prompt: '¿Cuánto debe medir L (en metros) para que T = 1 s en Medellín (g = 9.78 m/s²)?',
      expectedAnswer: { type: 'number', value: 0.2479 },
      tolerance: 0.02,
      unit: 'm',
      feedbackOk: '¡Bien! Despejaste L de T = 2π√(L/g).',
      feedbackFail: 'Pista: T = 2π√(L/g) → L = g·T²/(4π²).',
    },
    {
      id: 's2-mass-independence',
      prompt: '¿Por qué la masa NO aparece en T = 2π√(L/g)?',
      expectedAnswer: { type: 'multiple', value: 'b' },
      feedbackOk: 'Exacto: la fuerza de gravedad es proporcional a la masa, pero la inercia también — se cancelan.',
      feedbackFail: 'Piensa en la 2ª ley de Newton: F = m·a. La gravedad da F = m·g. Iguala fuerzas.',
    },
  ],
  'momento-inercia': [
    {
      id: 's4-inertia-lab',
      prompt: 'Calcula I_total para el péndulo del laboratorio (L=0.25 m, m_b=0.020 kg, m_e=0.075 kg). Resultado en kg·m².',
      expectedAnswer: { type: 'number', value: 0.005105 },
      tolerance: 0.01,
      unit: 'kg·m²',
      feedbackOk: '¡Correcto! I = (1/3)·m_b·L² + m_e·L².',
      feedbackFail: 'Pista: suma I_barra = (1/3)·m_b·L² más I_masa = m_e·L².',
    },
  ],
  'pendulo-fisico': [
    {
      id: 's5-cm-distance',
      prompt: 'Calcula d (distancia pivote→CM) para el péndulo del laboratorio. Resultado en metros.',
      expectedAnswer: { type: 'number', value: 0.2237 },
      tolerance: 0.01,
      unit: 'm',
      feedbackOk: '¡Bien! d = (m_b·L/2 + m_e·L) / (m_b + m_e).',
      feedbackFail: 'Pista: media ponderada de las posiciones del CM de cada parte.',
    },
    {
      id: 's5-period-physical',
      prompt: 'Calcula T para el péndulo físico real del laboratorio. Resultado en segundos.',
      expectedAnswer: { type: 'number', value: 0.9847 },
      tolerance: 0.02,
      unit: 's',
      feedbackOk: '¡Correcto! T = 2π√(I/(M·g·d)) ≈ 0.985 s. El lab midió 1.04 s — discrepancia de ~5.3% por idealizaciones del modelo.',
      feedbackFail: 'Pista: T = 2π√(I/(M·g·d)) con M = m_b + m_e.',
    },
    {
      id: 's5-discrepancy-source',
      prompt: '¿Qué fuentes de error podrían explicar la discrepancia de ~5.3% entre T_calc=0.985 s y T_lab=1.04 s?',
      expectedAnswer: { type: 'open' },
      feedbackOk: 'Tu respuesta queda registrada. Pistas habituales: distribución no-uniforme de masa de la barra, fricción del pivote, amplitud no infinitesimal (corrección de Landau), aire.',
      feedbackFail: '',
    },
  ],
  amortiguamiento: [
    {
      id: 's6-quality-factor',
      prompt: 'Si τ = 16.9 s y ω₀ = 2π/0.985 rad/s, ¿cuál es Q = ω₀·τ/2?',
      expectedAnswer: { type: 'number', value: 53.9 },
      tolerance: 0.05,
      feedbackOk: '¡Bien! Q ≈ 54 — el péndulo de MDF dura unas 50 oscilaciones detectables en aire.',
      feedbackFail: 'Pista: Q = ω₀·τ/2 = (2π/T)·τ/2.',
    },
    {
      id: 's6-which-fluid-damps-most',
      prompt: '¿Qué medio amortigua MÁS rápido el péndulo del laboratorio?',
      expectedAnswer: { type: 'multiple', value: 'c' },
      feedbackOk: 'Correcto: la glicerina, por su altísima viscosidad (η ≈ 1.5 Pa·s a 20°C).',
      feedbackFail: 'Piensa en cuál fluido tiene mayor viscosidad dinámica η.',
    },
  ],
  rk4: [
    {
      id: 's7-rk4-vs-euler',
      prompt: '¿Por qué RK4 conserva mejor la energía que Euler explícito?',
      expectedAnswer: { type: 'multiple', value: 'a' },
      feedbackOk: 'Exacto: RK4 promedia 4 evaluaciones de la derivada por paso, anulando los errores de orden bajo.',
      feedbackFail: 'Pista: RK4 tiene error local O(Δt⁵), Euler tiene O(Δt²). El factor importa.',
    },
  ],
}

// ─── Ejecución del seed ──────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed…\n')

  const sections = loadSections()
  console.log(`📚 ${sections.length} secciones encontradas en @pendulo/content`)

  for (const s of sections) {
    const fm = s.frontmatter
    const section = await prisma.section.upsert({
      where:  { slug: fm.slug },
      create: {
        slug:             fm.slug,
        order:            fm.order,
        title:            fm.title,
        summary:          fm.summary,
        prerequisites:    JSON.stringify(fm.prerequisites),
        estimatedMinutes: fm.estimatedMinutes,
        contentMdx:       s.body,
      },
      update: {
        order:            fm.order,
        title:            fm.title,
        summary:          fm.summary,
        prerequisites:    JSON.stringify(fm.prerequisites),
        estimatedMinutes: fm.estimatedMinutes,
        contentMdx:       s.body,
      },
    })
    console.log(`  ✓ [${fm.order}] ${fm.slug} (id=${section.id})`)

    // Insertar ejercicios del slug si tenemos en SEED_EXERCISES
    const exercises = SEED_EXERCISES[fm.slug] ?? []
    for (const ex of exercises) {
      await prisma.exercise.upsert({
        where:  { id: ex.id },
        create: {
          id:             ex.id,
          sectionId:      section.id,
          prompt:         ex.prompt,
          expectedAnswer: JSON.stringify(ex.expectedAnswer),
          tolerance:      ex.tolerance ?? null,
          unit:           ex.unit ?? null,
          feedbackOk:     ex.feedbackOk,
          feedbackFail:   ex.feedbackFail,
        },
        update: {
          sectionId:      section.id,
          prompt:         ex.prompt,
          expectedAnswer: JSON.stringify(ex.expectedAnswer),
          tolerance:      ex.tolerance ?? null,
          unit:           ex.unit ?? null,
          feedbackOk:     ex.feedbackOk,
          feedbackFail:   ex.feedbackFail,
        },
      })
      console.log(`      • ${ex.id}`)
    }
  }

  const totalSections  = await prisma.section.count()
  const totalExercises = await prisma.exercise.count()
  console.log(`\n✅ Seed completado: ${totalSections} secciones, ${totalExercises} ejercicios.`)
}

main()
  .catch(e => {
    console.error('❌ Seed falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
