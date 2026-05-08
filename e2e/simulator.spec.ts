import { test, expect } from '@playwright/test'

// ─── Tests del simulador ──────────────────────────────────────────────────────

test.describe('Simulador (Sección 8 + ruta /lab)', () => {

  test('la sección simulador está en el DOM', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-section-slug="simulador"]')).toBeAttached()
  })

  test('los 5 retos finales se muestran', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-section-slug="simulador"]')
    await section.scrollIntoViewIfNeeded()
    for (let i = 1; i <= 5; i++) {
      await expect(section.getByText(`Reto ${i}`)).toBeAttached()
    }
  })

  test('la sección 8 muestra la CTA al laboratorio', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-section-slug="simulador"]')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('link', { name: /Abrir laboratorio/i }).first()).toBeVisible()
  })

  test('/lab carga el canvas WebGL en menos de 20 s', async ({ page }) => {
    await page.goto('/lab')
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible({ timeout: 20_000 })
  })

  test('/lab muestra el botón Lab del panel de control', async ({ page }) => {
    await page.goto('/lab')
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20_000 })
    await expect(page.getByRole('button', { name: 'Lab' })).toBeVisible({ timeout: 3000 })
  })

  test('/lab tiene enlace de regreso al curso', async ({ page }) => {
    await page.goto('/lab')
    await expect(page.getByRole('link', { name: /Volver al curso/i })).toBeVisible()
  })

})
