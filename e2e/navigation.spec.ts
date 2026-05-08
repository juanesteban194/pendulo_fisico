import { test, expect } from '@playwright/test'

// ─── Tests de navegación ──────────────────────────────────────────────────────

test.describe('Navegación y contenido', () => {

  test('hace scroll a la sección al hacer clic en el rail', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Clic en el botón del capítulo 3 (energías) del progress rail
    const btn = page.locator('[data-slug="energias"]')
    await btn.click()

    // La sección energías debe entrar en el viewport
    const section = page.locator('[data-section-slug="energias"]')
    await expect(section).toBeInViewport({ timeout: 3000 })
  })

  test('los EquationBlock renderizan KaTeX', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.katex').first()).toBeVisible({ timeout: 8000 })
  })

  test('el slider interactivo de L está en la sección péndulo simple', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-section-slug="pendulo-simple"]')
    await section.scrollIntoViewIfNeeded()
    // Debe haber un input range (slider de L) dentro de esa sección
    await expect(section.locator('input[type="range"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('las tarjetas de ejercicio se renderizan en S1', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-section-slug="pivote"]')
    await section.scrollIntoViewIfNeeded()
    // Debe haber al menos un ejercicio (NumericExercise o MultipleChoice)
    const exercise = section.locator('form, [class*="exercise"], input[type="number"]')
    await expect(exercise.first()).toBeAttached({ timeout: 3000 })
  })

})
