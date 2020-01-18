import { system, filesystem } from 'gluegun'

describe('saga command', () => {
  const type = '@batata/NERVOSA'
  const functionName = 'nervosaToBatata'
  const src = filesystem.path(__dirname, '..')
  const cli = async cmd =>
    system.run(`node ${filesystem.path(src, 'bin', 'omni')} ${cmd}`)

  it("should generate 'sagas.js' file", async () => {
    await cli('saga batata nervosa')
    const file = filesystem.read('src/store/modules/batata/sagas.js')
    expect(file).toContain(type)
    expect(file).toContain(functionName)
    filesystem.remove('src/store')
  })
})
