import { system, filesystem } from 'gluegun'

describe('saga command integration', () => {
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
    const expectedContent1 = `export const ${functionName}Request = () => ({ type: '${type}_REQUEST' })`
    const expectedContent2 = `export const ${functionName}Success = () => ({ type: '${type}_SUCCESS' })`

    expect(content).toContain(expectedContent1)
    expect(content).toContain(expectedContent2)
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

  it('should add new saga reducer on rootSaga file if saga is already configurated', async () => {
    const reducer2 = 'banana'
    const file = filesystem.path(
      projectPath,
      'src',
      'store',
      'modules',
      'rootSaga.js'
    )
    await cli(`saga ${reducer2} canela --dir ${projectPath}`)
    const expectedContent1 = expect.stringMatching(
      new RegExp(`import ${reducer} from './${reducer}/sagas'`)
    )
    const expectedContent2 = expect.stringMatching(
      new RegExp(`import ${reducer2} from './${reducer2}/sagas'`)
    )
    const expectedContent3 = expect.stringMatching(
      new RegExp(
        `return yield all\\(\\[(\\s*(${reducer}),\\s*(${reducer2})|\\s*\\2,\\s*\\1)\\s*\\]\\)`
      )
    )
    const content = filesystem.read(file)
    expect(content).toEqual(expectedContent1)
    expect(content).toEqual(expectedContent2)
    expect(content).toEqual(expectedContent3)
  })

  it('should add new saga action on sagas file if saga is already configurated', async () => {
    const action2 = 'calma'
    const functionName2 = 'batataCalma'
    const type2 = '@batata\\/CALMA'
    const type3 = '@batata\\/NERVOSA'
    const file = filesystem.path(
      projectPath,
      'src',
      'store',
      'modules',
      reducer,
      'sagas.js'
    )
    await cli(`saga ${reducer} ${action2} --dir ${projectPath}`)
    const expectedContent1 = expect.stringMatching(
      new RegExp(
        `import \\{\\s*${functionName}Success,\\s*${functionName2}Success\\s*\\} from './actions'`
      )
    )
    const expectedContent2 = expect.stringMatching(
      new RegExp(
        `function\\* ${functionName}\\(\\)\\s\\{\\s*yield put\\(${functionName}Success\\(\\)\\)\\s*\\}`
      )
    )
    const expectedContent3 = expect.stringMatching(
      new RegExp(
        `function\\* ${functionName2}\\(\\)\\s\\{\\s*yield put\\(${functionName2}Success\\(\\)\\)\\s*\\}`
      )
    )
    const expectedContent4 = expect.stringMatching(
      new RegExp(
        // `export default all\\(\\[\\s*takeEvery\\('${type3}',\\s*${functionName}\\),\\s*takeEvery\\('${type2}',\\s*${functionName2}\\)\\s*\\]\\)`
        `export default all\\(\\[\\s*takeEvery\\('${type3}',\\s*${functionName}\\),\\s*takeEvery\\('${type2}',\\s*${functionName2}\\),?\\s*\\]\\)`
      )
    )
    const content = filesystem.read(file)
    expect(content).toEqual(expectedContent1)
    expect(content).toEqual(expectedContent2)
    expect(content).toEqual(expectedContent3)
    expect(content).toEqual(expectedContent4)
  })
})
