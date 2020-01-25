import r from 'ramda'
import { run as cli } from '../cli'

module.exports = {
  name: 'saga',
  description: 'Adds saga to project',
  run: async ({
    template,
    parameters: { first, second },
    utils: { camelcase, getModuleDetails }
  }) => {
    const updateStrings = (reducer, type, functionName) =>
      r.evolve({
        target: r.replace('reducerName', reducer),
        props: r.evolve({
          type: () => type,
          reducer: () => reducer,
          functionName: () => functionName
        })
      })

    const writeFile = r.cond([
      [r.has('template'), template.generate],
      [r.has('command'), ({ command }) => cli(command)]
    ])

    const buildMainFunction = ({ reducer, action }) => {
      const type = `@${reducer}/${action.toUpperCase()}`
      const functionName = `${action}To${camelcase(reducer)}`
      return r.map(
        r.pipe(updateStrings(reducer, type, functionName), writeFile)
      )
    }
    return buildMainFunction(
      await getModuleDetails({ reducer: first, action: second })
    )([
      {
        template: 'redux/sagas.js.ejs',
        target: 'src/store/modules/reducerName/sagas.js',
        props: { type: '', functionName: '' }
      },
      {
        template: 'redux/rootSaga.js.ejs',
        target: 'src/store/modules/rootSaga.js',
        props: { reducer: '' }
      },
      {
        command: 'redux batata nervosa-success'
      }
    ])
  }
}
