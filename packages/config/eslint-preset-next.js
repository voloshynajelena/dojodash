/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./eslint-preset-react.js', 'next/core-web-vitals'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
