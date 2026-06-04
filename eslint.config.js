import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import path from 'path'

export default defineConfig([
  globalIgnores(['dist']),

  // planner-app
  {
    files: ['apps/planner-app/**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        tsconfigRootDir: path.resolve('apps/planner-app'),
        project: ['./tsconfig.json'],
      },
    },
  },

  // guest-app
  {
    files: ['apps/guest-app/**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        tsconfigRootDir: path.resolve('apps/guest-app'),
        project: ['./tsconfig.json'],
      },
    },
  },
])