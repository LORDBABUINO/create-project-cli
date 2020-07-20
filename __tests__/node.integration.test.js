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

  it('should install express', () => {
    const dir = filesystem.path(projectPath, 'node_modules', 'express')

    expect(filesystem.exists(dir)).toBeTruthy()
  })
})
