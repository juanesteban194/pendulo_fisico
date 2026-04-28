// ─── TESTS DEL LOADER DE CONTENIDO ───────────────────────────────────────────
//
// Verifica que las 9 secciones MDX (0–8) cargan, validan y se ordenan
// correctamente. Si alguien rompe el frontmatter de un MDX, este test falla.

import { describe, it, expect } from 'vitest'
import { loadSections, loadSectionBySlug } from './index'

describe('loadSections', () => {
  it('carga las 9 secciones (0 a 8)', () => {
    const sections = loadSections()
    expect(sections).toHaveLength(9)
  })

  it('las secciones están ordenadas por order ascendente', () => {
    const sections = loadSections()
    const orders = sections.map(s => s.frontmatter.order)
    expect(orders).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('todos los slugs son únicos', () => {
    const sections = loadSections()
    const slugs = sections.map(s => s.frontmatter.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('cada sección tiene cuerpo MDX no vacío', () => {
    for (const s of loadSections()) {
      expect(s.body.trim().length).toBeGreaterThan(0)
    }
  })

  it('los prerequisitos referencian slugs existentes', () => {
    const sections = loadSections()
    const slugs = new Set(sections.map(s => s.frontmatter.slug))
    for (const s of sections) {
      for (const prereq of s.frontmatter.prerequisites) {
        expect(slugs.has(prereq)).toBe(true)
      }
    }
  })
})

describe('loadSectionBySlug', () => {
  it('encuentra la sección "pendulo-fisico"', () => {
    const s = loadSectionBySlug('pendulo-fisico')
    expect(s).not.toBeNull()
    expect(s!.frontmatter.order).toBe(5)
  })

  it('retorna null si el slug no existe', () => {
    expect(loadSectionBySlug('no-existe')).toBeNull()
  })
})
