// ─── LOADER DE CONTENIDO MDX ─────────────────────────────────────────────────
//
// Lee los archivos MDX de `sections/`, parsea frontmatter con gray-matter,
// valida contra SectionFrontmatterSchema (de @pendulo/schemas) y devuelve
// la lista ordenada por `order`.
//
// Consumidores:
//   • apps/api  — el seed Prisma usa esto para poblar la tabla Section.
//   • apps/web  — el endpoint /content/sections/:slug puede leer directo.
//
// Notas:
//   • Este loader corre en Node (no en browser). En frontend se usa vía API.
//   • El cuerpo MDX se devuelve como string; el rendering React/MDX se hace
//     en apps/web con next-mdx-remote o similar.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { SectionFrontmatterSchema, type SectionFrontmatter } from '@pendulo/schemas'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/** Directorio absoluto donde viven los .mdx — exportado para que el seed lo use. */
export const SECTIONS_DIR = path.join(__dirname, 'sections')

export interface LoadedSection {
  /** Frontmatter validado del MDX. */
  frontmatter: SectionFrontmatter
  /** Cuerpo MDX (sin frontmatter). */
  body: string
  /** Nombre del archivo en `sections/`, ej: "02-pendulo-simple.mdx". */
  filename: string
}

/**
 * Carga y valida todas las secciones MDX. Lanza si alguna tiene frontmatter
 * inválido — esto es intencional: queremos romper el build, no degradar.
 *
 * Devuelve las secciones ordenadas por `order` ascendente.
 */
export function loadSections(): LoadedSection[] {
  if (!fs.existsSync(SECTIONS_DIR)) {
    throw new Error(`No se encontró el directorio de secciones: ${SECTIONS_DIR}`)
  }

  const files = fs
    .readdirSync(SECTIONS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .sort()

  const sections: LoadedSection[] = files.map(filename => {
    const filepath = path.join(SECTIONS_DIR, filename)
    const raw      = fs.readFileSync(filepath, 'utf-8')
    const parsed   = matter(raw)

    const fmResult = SectionFrontmatterSchema.safeParse(parsed.data)
    if (!fmResult.success) {
      const issues = fmResult.error.issues
        .map(i => `  • ${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('\n')
      throw new Error(`Frontmatter inválido en ${filename}:\n${issues}`)
    }

    return {
      frontmatter: fmResult.data,
      body:        parsed.content,
      filename,
    }
  })

  // Detectar slugs duplicados (rompe URLs)
  const seen = new Set<string>()
  for (const s of sections) {
    if (seen.has(s.frontmatter.slug)) {
      throw new Error(`Slug duplicado: "${s.frontmatter.slug}" (${s.filename})`)
    }
    seen.add(s.frontmatter.slug)
  }

  // Detectar orders duplicados (rompe la barra de progreso)
  const orders = new Set<number>()
  for (const s of sections) {
    if (orders.has(s.frontmatter.order)) {
      throw new Error(`Order duplicado: ${s.frontmatter.order} (${s.filename})`)
    }
    orders.add(s.frontmatter.order)
  }

  return sections.sort((a, b) => a.frontmatter.order - b.frontmatter.order)
}

/**
 * Carga una sola sección por su slug. Útil para el endpoint
 * GET /content/sections/:slug.
 */
export function loadSectionBySlug(slug: string): LoadedSection | null {
  const all = loadSections()
  return all.find(s => s.frontmatter.slug === slug) ?? null
}
