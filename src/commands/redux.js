module.exports = {
  name: 'redux',
  description: 'Add redux to current project',
  run: async ({
    parameters: { first, second, options },
    utils: {
      camelcase,
      snakecase,
      pascalcase,
      getModuleDetails,
      isReactNative,
    },
    builder: { buildMainFunction },
  }) => {
    const { reducer, action } = await getModuleDetails({
      reducer: first,
      action: second,
    })
    const type = `@${reducer}/${snakecase(action)}`
    const functionName = `${camelcase(reducer)}${pascalcase(action)}`
    const folder = options.dir || '.'
    const reactNative = isReactNative(folder)

    return buildMainFunction(
      `Adds redux action '${action}' to redux reducer '${reducer}'`,
      [
        [
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
          { template: 'redux/index.js', target: 'src/store/index.js' },
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
          { command: 'react' },
        ],
        [
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
              { insert: '<Provider store={store}>', replace: '<>' },
              { insert: '</Provider>', replace: '</>' },
            ],
            target: reactNative ? 'src/App.js' : 'src/index.js',
          },
          {
            install: {
              packages: [
                'redux',
                'react-redux',
                'reactotron-react-js',
                'reactotron-redux',
                'immer',
              ],
            },
          },
        ],
      ]
    )
  },
}
