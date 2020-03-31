import { system, filesystem, patching } from 'gluegun'

describe('saga command integration', () => {
  const src = filesystem.path(__dirname, '..')
  const project = 'test-project'
  const projectPath = filesystem.path(src, project)
  const reducer = 'batata'
  const action = 'nervosa'
  const functionName = 'nervosaBatata'
  const type = '@batata/NERVOSA'

  const cli = async (cmd) =>
    system.run(`node ${filesystem.path(src, 'bin', 'omni')} ${cmd}`, {
      cwd: projectPath,
    })

  beforeEach(async () => {
    if (!filesystem.exists(projectPath)) await system.run(`mkdir ${project}`)
    return cli(`saga ${reducer} ${action} --dir ${projectPath}`)
  })

  afterEach(async () => system.run(`rm -rf ${project}`))

  it('should add request action on action.js file', async () => {
    const file = filesystem.path(
      projectPath,
      'src',
      'store',
      'modules',
      reducer,
      'actions.js'
    )
    const content = filesystem.read(file)
    const expectedContent = `export const ${functionName}Request = () => ({type: '${type}_REQUEST'})`

    expect(content).toContain(expectedContent)
  })

  it('should install redux-saga', () => {
    const dir = filesystem.path(projectPath, 'node_modules', 'redux-saga')

    expect(filesystem.exists(dir)).toBeTruthy()
  })

  it('should install reactotron-redux-saga', () => {
    const dir = filesystem.path(
      projectPath,
      'node_modules',
      'reactotron-redux-saga'
    )

    expect(filesystem.exists(dir)).toBeTruthy()
  })
})
