import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: ['node_modules', '.next', 'out', '.contentlayer', 'public', 'scripts'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
]
