/* eslint import/first: 0 */ // --> OFF
jest.mock('inquirer')
import { prompt } from 'inquirer'
import utils from '../src/extensions/utils'

describe('utils', () => {
  const toolbox = {}
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
    utils(toolbox)
  })

  afterEach(() => {
    prompt.mockClear()
  })

  it("should return 'Batata' when call \"camelcase('batata')\"", () => {
    expect(toolbox.utils.camelcase('batata')).toBe('Batata')
  })

  it("should return 'nervosaSuccess' when call \"camelcase('nervosa-success')\"", () => {
    expect(toolbox.utils.camelcase('nervosa-success')).toBe('NervosaSuccess')
  })

  it("should return 'BATATA_NERVOSA' when call \"snakecase('batata-nervosa')\"", () => {
    expect(toolbox.utils.snakecase('batata-nervosa')).toBe('BATATA_NERVOSA')
  })

  it("should return {1: 'batata'} when call \"getModuleDetails({1: 'batata'})\"", () => {
    return expect(
      toolbox.utils.getModuleDetails({ 1: 'batata' })
    ).resolves.toMatchObject({
      1: 'batata'
    })
  })

  it("should call inquirer when call 'getModuleDetails({reducer: false})'", async () => {
    await expect(
      toolbox.utils.getModuleDetails({ reducer: false })
    ).resolves.toMatchObject({
      reducer: 'batata'
    })
    expect(prompt).toHaveBeenCalled()
  })

  it('should be able to receive multiple options getModuleDetails function', async () => {
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
