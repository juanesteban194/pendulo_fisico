import { test, expect } from '@playwright/test'

// ─── Tests de la página principal ────────────────────────────────────────────

test.describe('Página de inicio', () => {

  test('carga sin errores JS fatales', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('muestra el título y la afiliación institucional', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /péndulo físico/i }).first()).toBeVisible()
    await expect(page.getByText(/Universidad de Medellín/i).first()).toBeVisible()
  })

  test('el progress rail muestra los 9 capítulos vía data-slug', async ({ page }) => {
    await page.goto('/')
    const slugs = [
      'bienvenida','pivote','pendulo-simple','energias','momento-inercia',
      'pendulo-fisico','amortiguamiento','rk4','simulador',
    ]
    for (const slug of slugs) {
      await expect(page.locator(`[data-slug="${slug}"]`)).toBeAttached()
    }
  })

  test('las secciones S0–S8 tienen atributo data-section-slug', async ({ page }) => {
    await page.goto('/')
    const slugs = [
      'bienvenida','pivote','pendulo-simple','energias',
      'momento-inercia','pendulo-fisico','amortiguamiento','rk4','simulador',
    ]
    for (const slug of slugs) {
      await expect(page.locator(`[data-section-slug="${slug}"]`)).toBeAttached()
    }
  })

})
