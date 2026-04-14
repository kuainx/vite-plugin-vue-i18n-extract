import { defineConfig } from '@standard-config/oxlint'
// import { defineConfig } from 'oxlint'

export default defineConfig({
  react: false,
  rules: {
    'no-plusplus': 'off',
    'prefer-template': 'off',
    'no-console': 'off',
    'no-negated-condition': 'off',
    'no-promise-executor-return': 'off',
    'typescript/no-restricted-types': 'off',
    'unicorn/prefer-add-event-listener': 'off',
    'import/unambiguous': 'off',
    'no-warning-comments': 'off',
    radix: 'off',
    curly: ['error', 'multi-line', 'consistent'],
    'typescript/explicit-module-boundary-types': [
      'error',
      {
        allowHigherOrderFunctions: true,
        // allowOverloadFunctions: true,
        // allowedNames: ['use*'],
      },
    ],
    'typescript/consistent-type-definitions': ['error', 'interface'],
  },
})
