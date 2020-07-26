module.exports = {
  name: 'node',
  description: 'Create new node API project',
  run: async ({ builder: { buildMainFunction } }) =>
    buildMainFunction('Project initialized', [
      [
        {
          template: 'node/.editorconfig',
          target: '.editorconfig',
        },
        {
          template: 'node/.env.example',
          target: '.env.example',
        },
        {
          template: 'node/.eslintrc.js',
          target: '.eslintrc.js',
        },
        {
          template: 'node/.gitignore',
          target: '.gitignore',
        },
        {
          template: 'node/.prettierrc',
          target: '.prettierrc',
        },
        {
          template: 'node/app.js',
          target: 'src/app.js',
        },
        {
          template: 'node/auth.js',
          target: 'src/config/auth.js',
        },
        {
          template: 'node/docker-compose.yml',
          target: 'docker-compose.yml',
        },
        {
          template: 'node/index.js',
          target: 'src/database/index.js',
        },
        {
          template: 'node/jest.config.js',
          target: 'jest.config.js',
        },
        {
          template: 'node/middleware-auth.js',
          target: 'src/app/middlewares/auth.js',
        },
        {
          template: 'node/nodemon.json',
          target: 'nodemon.json',
        },
        {
          template: 'node/routes.js',
          target: 'src/routes.js',
        },
        {
          template: 'node/server.js',
          target: 'src/server.js',
        },
        {
          template: 'node/SessionController.js',
          target: 'src/app/controllers/SessionController.js',
        },
        {
          install: {
            packages: [
              'bcryptjs',
              'date-fns',
              'dotenv',
              'express',
              'jsonwebtoken',
              'mongoose',
              'sucrase',
            ],
          },
        },
      ],
      [
        {
          install: {
            dev: true,
            packages: [
              '@sucrase/jest-plugin',
              'eslint',
              'eslint-config-airbnb-base',
              'eslint-config-prettier',
              'eslint-plugin-import',
              'eslint-plugin-jest',
              'eslint-plugin-prettier',
              'jest',
              'nodemon',
              'prettier',
              'supertest',
            ],
          },
        },
      ],
    ]),
}
