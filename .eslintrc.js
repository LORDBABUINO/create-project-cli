module.exports = {
  env: {
    es6: true,
    node: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'prettier/react',
    'plugin:jest/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [
    'react',
    'prettier',
    'jest',
  ],
  rules: {
    'prettier/prettier': 'error',
    'no-param-reassign': ['error', {'props': false}],
    semi: ['error', 'never'],
    'no-underscore-dangle': "off"
  },
};
