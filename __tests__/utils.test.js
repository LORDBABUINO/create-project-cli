/* eslint import/first: 0 */ // --> OFF
jest.mock('inquirer')
import { prompt } from 'inquirer'
import utils from '../src/extensions/utils'

describe('utils', () => {
  beforeAll(async () => {
    prompt.mockImplementation(async obj =>
      Object.keys(obj).length < 2
        ? {
            reducer: 'batata'
          }
        : {
            reducer: 'batata',
            action: 'nervosa'
          }
    )
  })

  afterEach(() => {
    prompt.mockClear()
  })

  it("should return 'Batata' when call 'camelcase('batata')'", () => {
    const toolbox = {}
    utils(toolbox)
    expect(toolbox.utils.camelcase('batata')).toBe('Batata')
  })

  it("should return {1: 'batata'} when call 'getModuleDetails({1: 'batata'})'", () => {
    const toolbox = {}
    utils(toolbox)
    return expect(
      toolbox.utils.getModuleDetails({ 1: 'batata' })
    ).resolves.toMatchObject({
      1: 'batata'
    })
  })

  it("should call inquirer when call 'getModuleDetails({reducer: false})'", async () => {
    const toolbox = {}
    utils(toolbox)
    await expect(
      toolbox.utils.getModuleDetails({ reducer: false })
    ).resolves.toMatchObject({
      reducer: 'batata'
    })
    expect(prompt).toHaveBeenCalled()
  })

  it('should be able to receive multiple options', async () => {
    const toolbox = {}
    utils(toolbox)
    await expect(
      toolbox.utils.getModuleDetails({
        reducer: false,
        action: undefined
      })
    ).resolves.toMatchObject({
      reducer: 'batata',
      action: 'nervosa'
    })
    expect(prompt).toHaveBeenCalled()
  })
})
