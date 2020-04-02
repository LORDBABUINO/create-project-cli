import r from 'ramda'

module.exports = {
  name: 'saga',
  description: 'Adds saga to project',
  run: async ({
    parameters: { first, second, options },
    utils: { camelcase, pascalcase, getModuleDetails },
    builder: { writeFiles },
  }) => {
    const { reducer, action } = await getModuleDetails({
      reducer: first,
      action: second,
    })
    const type = `@${reducer}/${action.toUpperCase()}`
    const functionName = `${camelcase(action)}${pascalcase(reducer)}`
    const buildMainFunction = r.pipe(
      r.map((y) => () => Promise.all(r.map(writeFiles)(y))),
      r.reduce((a, b) => a.then(b), Promise.resolve())
    )
    return buildMainFunction([
      [
        {
          template: 'redux/sagas.js.ejs',
          target: `src/store/modules/${reducer}/sagas.js`,
          props: { type, functionName },
        },
        {
          template: 'redux/rootSaga.js.ejs',
          target: 'src/store/modules/rootSaga.js',
          props: { reducer },
        },
        {
          command: `redux ${reducer} ${action}-success --dir ${
            options.dir || '.'
          }`,
        },
      ],
      [
        {
          target: `src/store/modules/${reducer}/actions.js`,
          opts: [
            {
              insert: `\nexport const ${functionName}Request = () => ({type: '${type}_REQUEST'})`,
              before: /$(?![\r\n])/gm, // EOF
            },
          ],
        },
        {
          target: `src/store/index.js`,
          template: 'saga/index.js',
        },
        { install: ['redux-saga', 'reactotron-redux-saga'] },
      ],
    ])
  },
}
