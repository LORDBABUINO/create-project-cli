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
      `yarn init -ys --cwd ${folder} && yarn --cwd ${folder} -s add`
    ),
    run
  )
  const exists = r.both(r.is(String), dir(folder).exists)
  const removeUneededAttrs = r.ifElse(
    r.both(r.propSatisfies(exists, 'target'), r.propOr(true, 'keep')),
    r.pipe(r.dissoc('template'), r.dissoc('props')),
    r.dissoc('opts')
  )
  const makeGitCommand = r.concat(
    `git --git-dir ${folder}/.git --work-tree ${folder} `
  )
  const joinGitCommands = r.reduce(
    (acc, current) => (acc ? `${acc} && ` : '') + makeGitCommand(current),
    false
  )
  const joinFiles = r.pipe(
    r.concat(['package.json', 'yarn.lock']),
    r.map(r.concat(`${folder}/`)),
    r.join(' ')
  )
  const gitCommit = r.curry((commit, files) =>
    r.pipe(
      joinGitCommands,
      run
    )(['init', `add ${joinFiles(files)}`, `commit -m "${commit}"`])
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
    [r.has('command'), ({ command }) => cli(`${command} --dir ${folder}`)],
    [r.T, async () => {}],
  ])

  const buildMainFunction = r.curry((commit, configs) =>
    r.pipe(
      r.converge(r.append, [
        r.thunkify(
          r.pipe(
            r.flatten,
            r.reduce(
              (acc, { target }) => [...acc, ...(target ? [target] : [])],
              []
            ),
            gitCommit(commit)
          )
        ),
        r.map((x) => () =>
          Promise.all(r.map(r.pipe(removeUneededAttrs, writeFiles), x))
        ),
      ]),
      r.reduce((a, b) => a.then(b), Promise.resolve())
    )(configs)
  )

  toolbox.builder = {
    writeFiles,
    removeUneededAttrs,
    exists,
    gitCommit,
    buildMainFunction,
  }
}
