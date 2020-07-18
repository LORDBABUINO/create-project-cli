module.exports = {
  name: 'react',
  description: 'Create new React project',
  run: async ({ builder: { buildMainFunction } }) =>
    buildMainFunction('Project initialized', [
      [
        { template: 'react/App.js', target: `src/App.js` },
        { template: 'react/global.js', target: `src/styles/global.js` },
        { template: 'react/index.js', target: `src/index.js` },
        { template: 'react/routes.js', target: `src/routes.js` },
        { template: 'react/index.html', target: `public/index.html` },
        { template: 'editorconfig', target: `.editorconfig` },
        { template: 'react/eslintrc.js', target: `.eslintrc.js` },
        { template: 'react/prettierrc', target: `.prettierrc` },
        { template: 'react/gitignore', target: `.gitignore` },
        {
          install: {
            packages: [
              'prop-types',
              'react',
              'react-dom',
              'react-router-dom',
              'react-scripts',
              'styled-components',
            ],
          },
        },
      ],
      [
        {
          install: {
            dev: true,
            packages: [
              'babel-eslint',
              'eslint',
              'eslint-config-airbnb',
              'eslint-config-prettier',
              'eslint-plugin-import',
              'eslint-plugin-jsx-a11y',
              'eslint-plugin-prettier',
              'eslint-plugin-react',
              'eslint-plugin-react-hooks',
              'prettier',
            ],
          },
        },
      ],
    ]),
}
