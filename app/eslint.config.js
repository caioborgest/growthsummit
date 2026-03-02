import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Avisa sobre `any` — não quebra o build, mas fica visível no IDE
      '@typescript-eslint/no-explicit-any': 'warn',
      // Avisa sobre console.log em produção (logger.ts deve ser usado)
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug', 'table', 'group', 'groupEnd', 'time', 'timeEnd'] }],
      // Permite variáveis prefixadas com _ sem erro de "unused"
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])

