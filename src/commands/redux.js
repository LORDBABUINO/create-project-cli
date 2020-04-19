// import util from 'util'
import r from 'ramda'

module.exports = {
  name: 'redux',
  description: 'Add redux to current project',
  run: async ({
    parameters: { first, second, options },
    system: { run },
    utils: {
      camelcase,
      snakecase,
      pascalcase,
      getModuleDetails,
      isReactNative,
    },
    builder: { writeFiles, removeUneededAttrs, exists },
  }) => {
    const { reducer, action } = await getModuleDetails({
      reducer: first,
      action: second,
    })
    const type = `@${reducer}/${snakecase(action)}`
    const functionName = `${camelcase(reducer)}${pascalcase(action)}`
    const folder = options.dir || '.'
    const reactNative = isReactNative(folder)
    const removeReactotronConfigs = r.when(
      r.propSatisfies(r.test(/src\/App/), 'target'),
      r.evolve({
        opts: r.reject(r.propEq('insert', "import './config/Reactotron'\n")),
      })
    )
    const removeReduxConfigs = (hasRedux) =>
      r.pipe(
        r.test,
        r.propSatisfies(r.__, 'target'),
        r.either(r.has('install')),
        r.both(() => hasRedux),
        r.reject
      )(/src\/index/)
    const removeUneededTemplates = r.pipe(
      r.propSatisfies(exists),
      r.both(r.complement(r.has('opts'))),
      r.reject
    )('target')
    const commitMessage = (hasRedux) =>
      r.pipe(
        r.concat('-Adds action '),
        r.when(() => !hasRedux, r.concat('-Configs Redux\n'))
      )
    const makeGitCommand = r.concat(
      `git --git-dir ${folder}/.git --work-tree ${folder} `
    )
    const mergeGitCommands = r.reduce(
      (acc, current) =>
        acc ? `${acc} && ${makeGitCommand(current)}` : makeGitCommand(current),
      ''
    )
    const gitCommit = (commit) => () =>
      r.pipe(mergeGitCommands, run)(['init', 'add .', `commit -m '${commit}'`])

    const buildMainFunction = (hasRedux) =>
      r.pipe(
        removeUneededTemplates(),
        removeReduxConfigs(hasRedux),
        r.map(r.pipe(removeUneededAttrs, removeReactotronConfigs, writeFiles)),
        (opts) => Promise.all(opts),
        r.andThen(gitCommit(folder, commitMessage(hasRedux)(type)))
        // a => console.log(util.inspect(a, { depth: null }))
      )

    buildMainFunction(exists('src/store'))([
      {
        template: 'reactotron.js.ejs',
        target: 'src/config/Reactotron.js',
        props: { reactNative: false },
      },
      {
        opts: [
          {
            insert: `import ${reducer} from './${reducer}/reducer'\n`,
            before: '\nexport default combineReducers({',
          },
          {
            insert: `${reducer},\n`,
            after: /export default combineReducers\({[^}]+/,
          },
        ],
        template: 'redux/rootReducer.js.ejs',
        props: { reducer },
        target: 'src/store/modules/rootReducer.js',
      },
      {
        opts: [
          {
            insert: `case '${type}': return produce(state, draft => console.tron.log('${type} not implemented'))\n`,
            after: 'switch (action.type) {\n',
          },
        ],
        template: 'redux/reducer.js.ejs',
        props: { reducer, type },
        target: `src/store/modules/${reducer}/reducer.js`,
      },
      {
        template: 'redux/index.js',
        target: 'src/store/index.js',
      },
      {
        opts: [
          {
            insert: `\n\nexport const ${functionName} = () => ({type: '${type}'})`,
            before: /$(?![\r\n])/gm, // EOF
          },
        ],
        template: 'redux/action.js.ejs',
        props: { functionName, type },
        target: `src/store/modules/${reducer}/actions.js`,
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
        target: reactNative ? 'src/App.js' : 'src/index.js',
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
