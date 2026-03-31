import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

// jsx-a11y recommended: label-has-for exige nesting + id a la vez (demasiado estricto).
// label-has-associated-control con assert 'either' acepta htmlFor o anidación.
const jsxA11yRecommended = { ...jsxA11y.configs.recommended.rules }
delete jsxA11yRecommended['jsx-a11y/label-has-for']

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11yRecommended,
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: { version: '18.2.0' },
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'src-tauri/**', 'coverage/**'],
  }
)
