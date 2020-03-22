import { run as saga } from '../src/commands/saga'
import * as cli from '../src/cli'

describe('saga command', () => {
  const type = '@batata/NERVOSA'
  const reducer = 'batata'
  const action = 'nervosa'
  const functionName = 'nervosaToBatata'
  const mockTemplate = jest.fn()
  const mockPatch = jest.fn()
  cli.run = jest.fn()

  beforeEach(() =>
    saga({
      template: { generate: mockTemplate },
      parameters: { first: reducer, second: action },
      utils: {
        camelcase: () => 'Batata',
        getModuleDetails: () => ({ reducer, action })
      },
      patching: { patch: mockPatch }
    })
  )

  afterEach(() => {
    mockTemplate.mockClear()
  })

  it("should generate 'sagas.js' file", () => {
    expect(mockTemplate).toHaveBeenCalledWith({
      template: 'redux/sagas.js.ejs',
      target: `src/store/modules/${reducer}/sagas.js`,
      props: { type, functionName }
    })
  })

  it("should generate 'rootSagas.js' file", () => {
    expect(mockTemplate).toHaveBeenCalledWith({
      template: 'redux/rootSaga.js.ejs',
      target: 'src/store/modules/rootSaga.js',
      props: { reducer }
    })
  })

  it("should add 'request' action", () => {
    expect(mockPatch).toHaveBeenCalledWith(
      `src/store/modules/${reducer}/actions.js`,
      {
        insert: `\nexport const ${functionName}Request = () => ({type: '${type}_REQUEST}')`,
        before: /$(?![\r\n])/gm // EOF
      }
    )
  })

  it('should configurate redux', () => {
    expect(cli.run).toHaveBeenCalledWith(`redux ${reducer} ${action}-success`)
  })
})
