module.exports = {
  name: 'node',
  description: 'Create new node API project',
  run: async ({ builder: { buildMainFunction } }) =>
    buildMainFunction('Project initialized', [
      [
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
