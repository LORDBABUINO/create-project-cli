import { system, filesystem } from 'gluegun'

describe('saga command', () => {
  const type = '@batata/NERVOSA'
  const reducer = 'batata'
  const functionName = 'nervosaToBatata'
  const src = filesystem.path(__dirname, '..')
  const cli = async cmd =>
    system.run(`node ${filesystem.path(src, 'bin', 'omni')} ${cmd}`)

  beforeEach(async () => {
    await cli('saga batata nervosa')
  })

  afterEach(() => {
    if (filesystem.exists('src/store')) filesystem.remove('src/store')
  })

  it("should generate 'sagas.js' file", async () => {
    const file = filesystem.read(`src/store/modules/${reducer}/sagas.js`)
    expect(file).toContain(type)
    expect(file).toContain(functionName)
  })

  it("should generate 'rootSaga.js' file", async () => {
    const file = filesystem.read('src/store/modules/rootSaga.js')
    expect(file).toContain(reducer)
  })
})
