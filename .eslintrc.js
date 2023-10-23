export default {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    {
      files: ['knexfile.ts'],
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    {
      files: ['migrations/*.ts'],
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['node_modules/'],
  rules: {
    'no-console': 'error',
    quotes: ['error', 'single'],
  },
};
