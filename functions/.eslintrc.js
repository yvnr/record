module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    'jest**',
    '/test/**',
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'quotes': [2, 'single', {'avoidEscape': true}],
    'import/no-unresolved': 0,
    'max-len': 'off',
    'new-cap': 'off',
    'require-jsdoc': 'off',
  },
};
