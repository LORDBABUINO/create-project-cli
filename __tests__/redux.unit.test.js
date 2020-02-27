import { run as redux } from '../src/commands/redux'

describe('redux command', () => {
  const type = '@batata/NERVOSA_SUCCESS'
  const reducer = 'batata'
  const action = 'nervosa-success'
  const functionName = 'nervosaToBatataSuccess'
  const mockTemplate = jest.fn()

  beforeEach(() =>
    redux({
      filesystem: { dir: () => ({ exists: jest.fn() }) },
      parameters: { first: reducer, second: action },
      patch: jest.fn(),
      system: { run: jest.fn() },
      template: { generate: mockTemplate },
      utils: {
        camelcase: jest.fn(),
        getModuleDetails: () => ({ reducer, action }),
        snakecase: () => 'NERVOSA_SUCCESS',
        pascalcase: () => 'Batata',
        isReactNative: jest.fn()
      }
    })
  )

  afterEach(() => {
    mockTemplate.mockClear()
  })

  it("should generate 'reducer.js' file", () => {
    expect(mockTemplate).toHaveBeenCalledWith({
      template: 'redux/reducer.js.ejs',
      props: { reducer, type },
      target: `src/store/modules/${reducer}/reducer.js`
    })
  })

  it("should generate 'action.js' file", () => {
    expect(mockTemplate).toHaveBeenCalledWith({
      template: 'redux/action.js.ejs',
      props: { functionName, type },
      target: `src/store/modules/${reducer}/actions.js`
    })
  })
})
