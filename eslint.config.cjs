const parser = require('@typescript-eslint/parser')
const tsEslint = require('@typescript-eslint/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      prettier: prettierPlugin
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  }
]

