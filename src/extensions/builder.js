import r from 'ramda'
import { run as cli } from '../cli'

export default (toolbox) => {
  const {
    template,
    patching: { patch },
    system: { run },
  } = toolbox

  const writeFiles = r.cond([
    [r.has('template'), template.generate],
    [r.has('install'), ({ install }) => run(install)],
    [r.has('opts'), ({ opts, target }) => patch(target, ...opts)],
    [r.has('command'), ({ command }) => cli(command)],
  ])

  const updateStrings = (
    folder,
    reactNative,
    reducer,
    action,
    type,
    functionName
  ) =>
    r.evolve({
      command: r.pipe(
        r.replace('reducerName', reducer),
        r.replace('actionName', action)
      ),
      target: r.pipe(
        r.replace('reducerName', reducer),
        r.when(() => reactNative, r.replace(/src\/index/, 'src/App'))
      ),
      props: r.evolve({
        action: () => action,
        type: () => type,
        reducer: () => reducer,
        functionName: () => functionName,
      }),
      opts: r.pipe(
        r.when(r.is(String)),
        r.map,
        r.map
      )(
        r.pipe(
          r.replace('actionName', action),
          r.replace('reducerName', reducer),
          r.replace('functionName', functionName),
          r.replace('typeName', type)
        )
      ),
      install: r.reduce((a, b) => `${a} ${b}`, `yarn --cwd ${folder} add`),
    })

  toolbox.builder = {
    writeFiles,
    updateStrings,
  }
}
