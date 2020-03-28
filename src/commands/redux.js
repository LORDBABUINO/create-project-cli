// import util from 'util'
import r from 'ramda'

module.exports = {
  name: 'redux',
  description: 'Add redux to current project',
  run: async ({
    filesystem: { dir },
    parameters: { first, second, options },
    system: { run },
    utils: {
      camelcase,
      snakecase,
      pascalcase,
      getModuleDetails,
      isReactNative,
    },
    builder: { writeFiles, updateStrings },
  }) => {
    const getFolder = r.propOr('.', 'dir')
    const removeReactotronConfigs = r.when(
      r.propSatisfies(r.test(/src\/App/), 'target'),
      r.evolve({
        opts: r.reject(r.propEq('insert', "import './config/Reactotron'\n")),
      })
    )
    const exists = (folder) => r.both(r.is(String), dir(folder).exists)
    const removeReduxConfigs = (hasRedux) =>
      r.pipe(
        r.test,
        r.propSatisfies(r.__, 'target'),
        r.either(r.has('install')),
        r.both(() => hasRedux),
        r.reject
      )(/src\/index/)
    const removeUneededTemplates = r.pipe(
      exists,
      r.propSatisfies(r.__, 'target'),
      r.both(r.complement(r.has('opts'))),
      r.reject
    )
    const removeUneededAttrs = (folder) =>
      r.ifElse(
        r.propSatisfies(exists(folder), 'target'),
        r.pipe(r.dissoc('template'), r.dissoc('props')),
        r.dissoc('opts')
      )
    const commitMessage = (hasRedux) =>
      r.pipe(
        r.concat('-Adds action '),
        r.when(() => !hasRedux, r.concat('-Configs Redux\n'))
      )
    const makeGitCommand = (folder) =>
      r.concat(`git --git-dir ${folder}/.git --work-tree ${folder} `)
    const mergeGitCommands = (folder) =>
      r.reduce(
        (acc, current) =>
          acc
            ? `${acc} && ${makeGitCommand(folder)(current)}`
            : makeGitCommand(folder)(current),
        ''
      )
    const gitCommit = (folder, commit) => () =>
      r.pipe(
        mergeGitCommands(folder),
        run
      )(['init', 'add .', `commit -m '${commit}'`])

    const buildMainFunction = (folder, { reducer, action }) => {
      const type = `@${reducer}/${snakecase(action)}`
      const hasRedux = exists(folder)('src/store')
      return r.pipe(
        removeUneededTemplates(folder),
        removeReduxConfigs(hasRedux),
        r.map(
          r.pipe(
            updateStrings(
              folder,
              isReactNative(folder),
              reducer,
              action,
              type,
              `${camelcase(action)}${pascalcase(reducer)}`
            ),
            removeUneededAttrs(folder),
            removeReactotronConfigs,
            writeFiles
          )
        ),
        (opts) => Promise.all(opts),
        r.andThen(gitCommit(folder, commitMessage(hasRedux)(type)))
        // a => console.log(util.inspect(a, { depth: null }))
      )
    }

    buildMainFunction(
      getFolder(options),
      await getModuleDetails({ reducer: first, action: second })
    )([
      {
        template: 'reactotron.js.ejs',
        target: 'src/config/Reactotron.js',
        props: { reactNative: false },
      },
      {
        opts: [
          {
            insert: `import reducerName from './reducerName/reducer'\n`,
            before: 'export default combineReducers({',
          },
          {
            insert: `reducerName,`,
            after: 'export default combineReducers({',
          },
        ],
        template: 'redux/rootReducer.js.ejs',
        props: { reducer: '' },
        target: 'src/store/modules/rootReducer.js',
      },
      {
        opts: [
          {
            insert: `case 'typeName': return produce(state, draft => console.tron.log('typeName not implemented'))\n`,
            after: 'switch (action.type) {\n',
          },
        ],
        template: 'redux/reducer.js.ejs',
        props: { reducer: '', type: '' },
        target: 'src/store/modules/reducerName/reducer.js',
      },
      {
        template: 'redux/index.js',
        target: 'src/store/index.js',
      },
      {
        opts: [
          {
            insert: `\n\nexport const actionNameToReducerName = () => ({type: 'typeName'})`,
            before: /$(?![\r\n])/gm, // EOF
          },
        ],
        template: 'redux/action.js.ejs',
        props: { functionName: '', type: '' },
        target: 'src/store/modules/reducerName/actions.js',
      },
      {
        opts: [
          {
            insert: "import { Provider } from 'react-redux'\n",
            after: "import React from 'react'\n",
          },
          {
            insert: "import './config/Reactotron'\n",
            before: "import Routes from './routes'",
          },
          {
            insert: "import store from './store'\n",
            after: "import './config/Reactotron'\n",
          },
          {
            insert: '<Provider store={store}>',
            replace: '<>',
          },
          {
            insert: '</Provider>',
            replace: '</>',
          },
        ],
        target: 'src/index.js',
      },
      {
        install: [
          'redux',
          'react-redux',
          'reactotron-react-js',
          'reactotron-redux',
          'immer',
        ],
      },
    ])
  },
}
