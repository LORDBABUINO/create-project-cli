import { system, filesystem } from 'gluegun'

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

  it('should configurate saga on index file', async () => {
    const file = filesystem.path(projectPath, 'src', 'store', 'index.js')
    const content = filesystem.read(file)
    const expectedContent1 = `import createSagaMiddleware from 'redux-saga'`
    const expectedContent2 = `import saga from './modules/rootSaga'`
    const expectedContent3 = `applyMiddleware(sagaMiddleware)`
    const expectedContent4 = `sagaMiddleware.run(saga)`
    expect(content).toContain(expectedContent1)
    expect(content).toContain(expectedContent2)
    expect(content).toContain(expectedContent3)
    expect(content).toContain(expectedContent4)
  })

  // it('should add new saga request if saga is already configurated', async () => {
  //   const file = filesystem.path(
  //     projectPath,
  //     'src',
  //     'modules',
  //     reducer,
  //     'actions.js'
  //   )
  //   const content = `\n\nexport const bananaToCanelaRequest = () => ({type: '@banana/CANELA_REQUEST'})`
  //   await cli(`saga banana canela --dir ${projectPath}`)
  //   const hasContent = patching.exists(file, content)
  //   expect(hasContent).toBeTruthy()
  // })
})
