import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '_site/**',
      'node_modules/**',
      'src/assets/css/tailwind-built.css',
      'playwright-report/**',
      'test-results/**',
      '.cache/**',
    ],
  },

  js.configs.recommended,

  {
    files: [
      'scripts/**/*.js',
      'lib/**/*.js',
      'src/_data/**/*.js',
      'src/notes/**/*.js',
      '.eleventy.js',
      'tailwind.config.js',
      'postcss.config.js',
      'tests/unit/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  {
    files: ['src/assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: { ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['tests/**/*.ts', 'playwright.config.ts'],
  })),
  {
    files: ['tests/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  prettier,
];
