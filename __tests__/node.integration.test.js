import { system, filesystem } from 'gluegun'

describe('node command integration', () => {
  const src = filesystem.path(__dirname, '..')
  const project = 'test-project'
  const projectPath = filesystem.path(src, project)
  const route = 'batata'

  const cli = async (cmd) =>
    system.run(`node ${filesystem.path(src, 'bin', 'omni')} ${cmd}`, {
      cwd: projectPath,
    })

  beforeEach(async () => {
    if (!filesystem.exists(projectPath)) await system.run(`mkdir ${project}`)
    return cli(`node ${route}`)
  })

  afterEach(async () => system.run(`rm -rf ${project}`))

  it('should install default dependencies', async () => {
    const dependencies = [
      ['bcryptjs'],
      ['date-fns'],
      ['dotenv'],
      ['express'],
      ['jsonwebtoken'],
      ['mongoose'],
      ['sucrase'],
      ['@sucrase', 'jest-plugin'],
      ['eslint'],
      ['eslint-config-airbnb-base'],
      ['eslint-config-prettier'],
      ['eslint-plugin-import'],
      ['eslint-plugin-jest'],
      ['eslint-plugin-prettier'],
      ['jest'],
      ['nodemon'],
      ['prettier'],
      ['supertest'],
    ]

    const modulesPath = filesystem.path(projectPath, 'node_modules')
    const tree = await system.run(`tree ${modulesPath} -inafd --noreport -L 2`)
    return Promise.all(
      dependencies.map(async (dependencie) => {
        expect(tree).toContain(filesystem.path(modulesPath, ...dependencie))
      })
    )
  })

  it('should add default templates', async () => {
    const files = [
      ['.eslintrc.js'],
      ['.editorconfig'],
      ['.gitignore'],
      ['nodemon.json'],
      ['.env.example'],
      ['.prettierrc'],
      ['jest.config.js'],
      ['docker-compose.yml'],
      ['src', 'app.js'],
      ['src', 'server.js'],
      ['src', 'routes.js'],
      ['src', 'database', 'index.js'],
      ['src', 'config', 'auth.js'],
      ['src', 'app', 'middlewares', 'auth.js'],
      ['src', 'app', 'controllers', 'SessionController.js'],
    ]

    const tree = await system.run(
      `tree ${projectPath} -I 'node_modules|coverage|.git' -inaf --noreport`
    )
    return Promise.all(
      files.map(async (file) => {
        expect(tree).toContain(filesystem.path(projectPath, ...file))
      })
    )
  })
})
