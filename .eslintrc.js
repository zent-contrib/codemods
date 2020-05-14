module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  globals: {
    __DEBUG__: false,
  },
  extends: ['eslint:recommended', 'google', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['lean-imports', '@typescript-eslint', 'sort-imports-es6-autofix'],
  rules: {
    'valid-jsdoc': 'off',
    'require-jsdoc': 'off',
    'no-invalid-this': 'off',
    'lean-imports/import': ['error', ['lodash', 'lodash/get']],
    '@typescript-eslint/interface-name-prefix': ['warn', { prefixWithI: 'always' }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    'sort-imports-es6-autofix/sort-imports-es6': [
      'error',
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
      },
    ],
    'no-dupe-class-members': 'off',
  },
};
