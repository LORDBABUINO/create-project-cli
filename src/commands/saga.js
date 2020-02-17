import r from 'ramda'
import { run as cli } from '../cli'

module.exports = {
  name: 'saga',
  description: 'Adds saga to project',
  run: async ({
    template,
    parameters: { first, second },
    utils: { camelcase, getModuleDetails },
    patch
  }) => {
    const updateStrings = (reducer, type, functionName) =>
      r.evolve({
        target: r.replace('reducerName', reducer),
        props: r.evolve({
          type: () => type,
          reducer: () => reducer,
          functionName: () => functionName
        }),
        opts: r.pipe(
          r.when(r.is(String)),
          r.map,
          r.map
        )(
          r.pipe(
            r.replace('functionName', functionName),
            r.replace('typeName', type)
          )
        )
      })

    const writeFile = r.cond([
      [r.has('template'), template.generate],
      [r.has('opts'), ({ opts, target }) => patch(target, ...opts)],
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
        target: 'src/store/modules/reducerName/actions.js',
        opts: [
          {
            insert: `\n\nexport const functionNameRequest = () => ({type: typeName_REQUEST})`,
            before: /$(?![\r\n])/gm // EOF
          }
        ]
      },
      {
        command: 'redux batata nervosa-success'
      }
    ])
  }
}
