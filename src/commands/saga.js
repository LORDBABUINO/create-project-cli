import r from 'ramda'

module.exports = {
  name: 'saga',
  description: 'Adds saga to project',
  run: async ({
    parameters: { first, second },
    utils: { camelcase, getModuleDetails },
    builder: { writeFiles, updateStrings },
  }) => {
    const buildMainFunction = ({ reducer, action }) => {
      const type = `@${reducer}/${action.toUpperCase()}`
      const functionName = `${action}To${camelcase(reducer)}`
      return r.pipe(
        r.map((y) => () =>
          Promise.all(
            r.map(
              r.pipe(
                updateStrings(reducer, action, type, functionName, false),
                writeFiles
              )
            )(y)
          )
        ),
        r.reduce((a, b) => a.then(b), Promise.resolve())
      )
    }
    return buildMainFunction(
      await getModuleDetails({ reducer: first, action: second })
    )([
      [
        {
          template: 'redux/sagas.js.ejs',
          target: 'src/store/modules/reducerName/sagas.js',
          props: { type: '', functionName: '' },
        },
        {
          template: 'redux/rootSaga.js.ejs',
          target: 'src/store/modules/rootSaga.js',
          props: { reducer: '' },
        },
        { command: 'redux reducerName actionName-success' },
      ],
      [
        {
          target: 'src/store/modules/reducerName/actions.js',
          opts: [
            {
              insert: `\nexport const functionNameRequest = () => ({type: 'typeName_REQUEST}')`,
              before: /$(?![\r\n])/gm, // EOF
            },
          ],
        },
      ],
    ])
  },
}
