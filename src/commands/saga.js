import r from 'ramda'

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
          functionName: () => functionName
        })
      })
    const writeFiles = config => template.generate(config)
    const buildMainFunction = ({ reducer, action }) => {
      const type = `@${reducer}/${action.toUpperCase()}`
      const functionName = `${action}To${camelcase(reducer)}`
      return r.map(
        r.pipe(updateStrings(reducer, type, functionName), writeFiles)
      )
    }
    buildMainFunction(
      await getModuleDetails({ reducer: first, action: second })
    )([
      {
        template: 'redux/sagas.js.ejs',
        target: 'src/store/modules/reducerName/sagas.js',
        props: { type: '', functionName: '' }
      }
    ])
  }
}
