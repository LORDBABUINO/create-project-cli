import r from 'ramda'
import { run as cli } from '../cli'

export default toolbox => {
  const {
    template,
    patching: { patch },
    system: { run }
  } = toolbox

  const writeFiles = r.cond([
    [r.has('template'), template.generate],
    [r.has('install'), ({ install }) => run(install)],
    [r.has('opts'), ({ opts, target }) => patch(target, ...opts)],
    [r.has('command'), ({ command }) => cli(command)]
  ])

  toolbox.builder = {
    writeFiles
  }
}
