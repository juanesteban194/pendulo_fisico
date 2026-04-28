import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment:    'node',
    globals:        false,
    include:        ['src/**/*.test.ts'],
    setupFiles:     ['src/__tests__/env-setup.ts'],
    pool:           'forks',
    poolOptions:    { forks: { singleFork: true } }, // 1 fork: SQLite no se debe abrir N veces
    testTimeout:    20_000,
  },
})
