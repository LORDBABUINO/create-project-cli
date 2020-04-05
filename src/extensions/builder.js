import r from 'ramda'
import { run as cli } from '../cli'

export default (toolbox) => {
  const {
    template: { generate },
    patching: { patch },
    system: { run },
    parameters: { options },
  } = toolbox

  const folder = options.dir || '.'
  const installFiles = r.pipe(
    r.reduce(
      (a, b) => `${a} ${b}`,
      `yarn init -y --cwd ${folder} && yarn --cwd ${folder} add`
    ),
    run
  )

  const writeFiles = r.cond([
    [
      r.has('template'),
      (template) =>
        generate({
          ...template,
          target: `${folder}/${template.target}`,
        }),
    ],
    [r.has('install'), ({ install }) => installFiles(install)],
    [
      r.has('opts'),
      ({ opts, target }) => patch(`${folder}/${target}`, ...opts),
    ],
    [r.has('command'), ({ command }) => cli(command)],
    [r.T, async () => {}],
  ])

  toolbox.builder = {
    writeFiles,
  }
}
