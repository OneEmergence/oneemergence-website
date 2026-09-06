import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Vendored agent-skill scripts and generated artifacts — not our source.
    // Linting them produced ~270 warnings that drowned out real findings.
    '.agents/**',
    '.claude/**',
    '.codex/**',
    'playwright-report/**',
    'test-results/**',
    'tmp/**',
    '.pnpm-store/**',
  ]),
])

export default eslintConfig
