import r from 'ramda'

module.exports = {
  name: 'saga',
  description: 'Adds saga to project',
  run: async ({
    parameters: { first, second, options },
    utils: { camelcase, pascalcase, getModuleDetails, snakecase },
    builder: { writeFiles, removeUneededAttrs, gitCommit },
  }) => {
    const { reducer, action } = await getModuleDetails({
      reducer: first,
      action: second,
    })
    const type = `@${reducer}/${snakecase(action)}`
    const functionName = `${camelcase(reducer)}${pascalcase(action)}`

    const buildMainFunction = r.pipe(
      r.converge(r.append, [
        r.thunkify(
          r.pipe(
            r.flatten,
            r.reduce(
              (acc, { target }) => [...acc, ...(target ? [target] : [])],
              []
            ),
            gitCommit(
              `Adds saga action '${action}' to saga reducer '${reducer}'`
            )
          )
        ),
        r.map((x) => () =>
          Promise.all(r.map(r.pipe(removeUneededAttrs, writeFiles), x))
        ),
      ]),
      r.reduce((a, b) => a.then(b), Promise.resolve())
    )
    return buildMainFunction([
      [
        {
          opts: [
            {
              insert: `, ${functionName}Success`,
              before: /\s\} from '\.\/actions'/,
            },
            {
              insert:
                `\nfunction* ${functionName}() {\n` +
                `  yield put(${functionName}Success())\n` +
                '}\n',
              before: /\sexport/,
            },
            {
              insert: `  takeEvery('${type}', ${functionName}),\n`,
              after: /export[^\]]+/,
            },
          ],
          template: 'saga/sagas.js.ejs',
          target: `src/store/modules/${reducer}/sagas.js`,
          props: { type, functionName },
        },
        {
          opts: [
            {
              insert: `import ${reducer} from './${reducer}/sagas'\n`,
              before: /\nexport/,
            },
            {
              insert: `,\n    ${reducer}`,
              before: /\s+\]\)/,
            },
          ],
          template: 'saga/rootSaga.js.ejs',
          target: 'src/store/modules/rootSaga.js',
          props: { reducer },
        },
        {
          command: `redux ${reducer} ${action}-success --dir ${
            options.dir ?? '.'
          }`,
        },
      ],
      [
        {
          target: `src/store/modules/${reducer}/actions.js`,
          opts: [
            {
              insert: `\nexport const ${functionName}Request = () => ({ type: '${type}_REQUEST' })`,
              before: /$(?![\r\n])/gm, // EOF
            },
          ],
        },
        {
          target: 'src/store/index.js',
          template: 'saga/index.js',
          keep: false,
        },
        { install: ['redux-saga', 'reactotron-redux-saga'] },
      ],
    ])
  },
}
