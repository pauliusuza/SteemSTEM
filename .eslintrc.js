const OFF = 0;
const ERROR = 2;

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: ['airbnb', 'prettier', 'prettier/react'],
  rules: {
    'linebreak-style': ["error", "windows"],
    'jsx-a11y/anchor-is-valid': 0,
    'react/jsx-curly-brace-presence': 0,
    'prefer-destructuring': 0,
    'react/no-unused-state': 0,
    'react/no-unused-prop-types': 0,
    'react/jsx-no-target-blank': 0,
    'react/sort-comp': 0,
    'react/jsx-filename-extension': [ERROR, { extensions: ['.js'] }],
    'import/no-extraneous-dependencies': [
      ERROR,
      { devDependencies: ['**/__tests__/*.js', 'scripts/**/*.js', 'webpack/**/*.js'] },
    ],
    'no-console': OFF,
    'global-require': OFF,
  },
};
