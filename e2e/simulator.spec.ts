import { test, expect } from '@playwright/test'

// ─── Tests del simulador ──────────────────────────────────────────────────────

test.describe('Simulador R3F (Sección 8)', () => {

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

  test('el canvas WebGL carga dentro de 20 segundos', async ({ page }) => {
    // Three.js necesita tiempo para descargar el bundle y montar el canvas
    await page.goto('/')
    const section = page.locator('[data-section-slug="simulador"]')
    await section.scrollIntoViewIfNeeded()

    // El SimuladorLoader primero muestra "Cargando simulador…" y luego el canvas
    const canvas = section.locator('canvas')
    await expect(canvas).toBeVisible({ timeout: 20_000 })
  })

  test('el panel de control muestra el botón Lab', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-section-slug="simulador"]')
    await section.scrollIntoViewIfNeeded()

    // Esperar a que el simulador cargue
    await section.locator('canvas').waitFor({ state: 'visible', timeout: 20_000 })

    // El ControlPanel debe tener el botón "Lab" (reset a parámetros del laboratorio)
    await expect(section.getByRole('button', { name: 'Lab' })).toBeVisible({ timeout: 3000 })
  })

})
