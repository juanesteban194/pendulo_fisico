// ─── ESQUEMAS DE SECCIONES ───────────────────────────────────────────────────
//
// Cada archivo MDX en packages/content/src/sections tiene este frontmatter.
// El seed lee los MDX y los inserta en la tabla Section de SQLite.
//
// El endpoint GET /api/v1/content/sections devuelve SectionMeta[] (sin el body
// MDX, solo metadata para el menú/mapa). El endpoint /sections/:slug devuelve
// SectionFull (con body).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { ExerciseSchema } from './exercise'

// ─── Frontmatter del MDX ──────────────────────────────────────────────────────
//
// El slug debe ser kebab-case ASCII (sin tildes ni espacios) — usado en URLs.
// `prerequisites` referencia slugs de otras secciones que el alumno debió
// completar antes (validación pedagógica suave).
//
export const SectionFrontmatterSchema = z.object({
  slug:             z.string().regex(/^[a-z0-9-]+$/, 'slug debe ser kebab-case ASCII'),
  order:            z.number().int().nonnegative(),
  title:            z.string().min(1),
  summary:          z.string().min(1),
  prerequisites:    z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().positive().max(60),
})
export type SectionFrontmatter = z.infer<typeof SectionFrontmatterSchema>

// ─── Metadata de sección (sin el body MDX) ───────────────────────────────────
export const SectionMetaSchema = SectionFrontmatterSchema.extend({
  id: z.number().int().positive(),
})
export type SectionMeta = z.infer<typeof SectionMetaSchema>

// ─── Sección completa (con cuerpo MDX y ejercicios) ──────────────────────────
export const SectionFullSchema = SectionMetaSchema.extend({
  contentMdx: z.string(),
  exercises:  z.array(ExerciseSchema).default([]),
})
export type SectionFull = z.infer<typeof SectionFullSchema>

// ─── Listado de secciones (lo que devuelve GET /sections) ────────────────────
export const SectionsListResponseSchema = z.object({
  sections: z.array(SectionMetaSchema),
})
export type SectionsListResponse = z.infer<typeof SectionsListResponseSchema>
