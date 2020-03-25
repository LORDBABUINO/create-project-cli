import { run as cli } from '../src/cli'
import builder from '../src/extensions/builder'

describe('builder extension', () => {
  const mockTemplate = jest.fn()
  const mockPatch = jest.fn()
  const mockRun = jest.fn()
  cli = jest.fn()

  const toolbox = {
    template: { generate: mockTemplate },
    patching: { patch: mockPatch },
    system: { run: mockRun },
  }

  beforeAll(() => {
    builder(toolbox)
  })

  afterEach(() => {
    mockTemplate.mockClear()
  })

  it('writeFiles should run template.generate when receive { template }', () => {
    const template = {
      template: 'template',
    }
    toolbox.builder.writeFiles(template)
    expect(mockTemplate).toHaveBeenCalledWith(template)
  })

  it('writeFiles should run "run" when receive { install }', () => {
    const install = { install: 'install' }
    toolbox.builder.writeFiles(install)
    expect(mockRun).toHaveBeenCalledWith(install.install)
  })

  it('writeFiles should run patch when receive { opts }', () => {
    const opts = { target: 'target', opts: ['opt1', 'opt2'] }
    toolbox.builder.writeFiles(opts)
    expect(mockPatch).toHaveBeenCalledWith(opts.target, ...opts.opts)
  })

  it('writeFiles should run cli when receive { command }', () => {
    const command = { command: 'command' }
    toolbox.builder.writeFiles(command)
    expect(cli).toHaveBeenCalledWith(command.command)
  })
})
