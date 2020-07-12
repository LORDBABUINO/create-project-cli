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
    parameters: { options: { dir: '.' } },
    filesystem: { dir: () => ({ exists: () => false }) },
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
      target: 'target',
      props: 'props',
    }
    toolbox.builder.writeFiles(template)
    expect(mockTemplate).toHaveBeenCalledWith({
      ...template,
      target: `./${template.target}`,
    })
  })

  it('writeFiles should run "run" with yarn command when receive { install }', () => {
    const install = { install: ['angular', 'vue', 'react'] }
    toolbox.builder.writeFiles(install)
    expect(mockRun).toHaveBeenCalledWith(
      'yarn init -y --cwd . && yarn --cwd . add angular vue react'
    )
  })

  it('writeFiles should run patch when receive { opts }', () => {
    const opts = { target: 'target', opts: ['opt1', 'opt2'] }
    toolbox.builder.writeFiles(opts)
    expect(mockPatch).toHaveBeenCalledWith('./target', ...opts.opts)
  })

  it('writeFiles should run cli when receive { command }', () => {
    const command = { command: 'command' }
    toolbox.builder.writeFiles(command)
    expect(cli).toHaveBeenCalledWith(command.command)
  })

  it('writeFiles should return a promise when receive {}', () => {
    const result = toolbox.builder.writeFiles({})
    expect(result instanceof Promise).toBeTruthy()
  })

  it('exists should return false when filesystem.dir().exists() return false', async () => {
    builder(toolbox)
    expect(toolbox.builder.exists('batata')).toBeFalsy()
  })

  it('gitCommit should run "run" with commit git init, add and commit commands', () => {
    toolbox.builder.gitCommit('test', ['test-file.js'])
    expect(mockRun).toHaveBeenCalledWith(
      'git --git-dir ./.git --work-tree . init && ' +
        'git --git-dir ./.git --work-tree . add ./test-file.js && ' +
        'git --git-dir ./.git --work-tree . commit -m "test"'
    )
  })
})
