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

  it("pascalcase should return 'Batata' when receive 'batata'", () => {
    expect(toolbox.utils.pascalcase('batata')).toBe('Batata')
  })

  it("pascalcase should return 'NervosaSuccess' when receive 'nervosa-success'", () => {
    expect(toolbox.utils.pascalcase('nervosa-success')).toBe('NervosaSuccess')
  })

  it("camelcase should return 'nervosaSuccess' when receive 'nervosa-success'", () => {
    expect(toolbox.utils.camelcase('nervosa-success')).toBe('nervosaSuccess')
  })

  it("snakecase should return 'BATATA_NERVOSA' when receive 'batata-nervosa'", () => {
    expect(toolbox.utils.snakecase('batata-nervosa')).toBe('BATATA_NERVOSA')
  })

  it("getModuleDetails should return {1: 'batata'} when receive {1: 'batata'}", () => {
    return expect(
      toolbox.utils.getModuleDetails({ 1: 'batata' })
    ).resolves.toMatchObject({
      1: 'batata'
    })
  })

  it('getModuleDetails should call inquirer when receive {reducer: false}', async () => {
    await expect(
      toolbox.utils.getModuleDetails({ reducer: false })
    ).resolves.toMatchObject({
      reducer: 'batata'
    })
    expect(prompt).toHaveBeenCalled()
  })

  it('getModuleDetails should be able to receive multiple options', async () => {
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
