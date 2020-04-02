import { system, filesystem } from 'gluegun'

describe('redux command integration', () => {
  const src = filesystem.path(__dirname, '..')
  const project = 'test-project'
  const projectPath = filesystem.path(src, project)
  const reducer = 'batata'
  const action = 'nervosa'
  const functionName = 'batataNervosa'
  const type = '@batata/NERVOSA'

  const cli = async (cmd) =>
    system.run(`node ${filesystem.path(src, 'bin', 'omni')} ${cmd}`, {
      cwd: projectPath,
    })

  beforeEach(async () => {
    if (!filesystem.exists(projectPath)) await system.run(`mkdir ${project}`)
    return cli(`redux ${reducer} ${action}`)
  })

  afterEach(async () => system.run(`rm -rf ${project}`))

  it('should add request action on action.js file', () => {
    const file = filesystem.path(
      projectPath,
      'src',
      'store',
      'modules',
      reducer,
      'actions.js'
    )
    const expected = `export const ${functionName} = () => ({ type: '${type}' })`
    const content = filesystem.read(file)

    expect(content).toMatch(expected)
  })
})
