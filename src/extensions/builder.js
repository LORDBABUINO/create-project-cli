import r from 'ramda'
import { run as cli } from '../cli'

export default (toolbox) => {
  const {
    template: { generate },
    patching: { patch },
    system: { run },
    parameters: { options },
    filesystem: { dir },
  } = toolbox

  const folder = options.dir || '.'
  const installFiles = r.pipe(
    r.reduce(
      (a, b) => `${a} ${b}`,
      `yarn init -y --cwd ${folder} && yarn --cwd ${folder} add`
    ),
    run
  )
  const exists = r.both(r.is(String), dir(folder).exists)
  const removeUneededAttrs = r.ifElse(
    r.both(r.propSatisfies(exists, 'target'), r.propOr(true, 'keep')),
    r.pipe(r.dissoc('template'), r.dissoc('props')),
    r.dissoc('opts')
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
    removeUneededAttrs,
    exists,
  }
}
