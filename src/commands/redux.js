const inquirer = require('inquirer')

module.exports = {
  name: 'redux',
  description: 'Add redux to current project',
  run: async toolbox => {
    const {
      filesystem: { dir, append },
      parameters: { first, second, options },
      template,
      patching: { patch, replace },
      system: { run },
      print: { info, success },
      generate: { isReactNative }
    } = toolbox

    const folder = options.dir || '.'
    const filesystem = dir(folder)
    const reactNative = isReactNative(folder)
    const hasRedux = filesystem.exists('src/store')

    const addProvider = async () => {
      const file = reactNative ? 'index' : 'App'
      info('Configurating redux in index.js')
      await patch(`${folder}/src/${file}.js`, {
        insert: "import { Provider } from 'react-redux'\n",
        after: "import React from 'react'\n"
      })
      if (!reactNative)
        await patch(`${folder}/src/App.js`, {
          insert: "import './config/Reactotron'\n",
          before: "import Routes from './routes'"
        })
      await patch(`${folder}/src/${file}.js`, {
        insert: "import store from './store'\n",
        after: "import './config/Reactotron'\n"
      })
      await replace(
        `${folder}/src/${file}.js`,
        '<>',
        '<Provider store={store}>'
      )
      await replace(`${folder}/src/${file}.js`, '</>', '</Provider>')
      await run(
        `yarn --cwd ${folder} eslint --fix src/${file}.js --rule "{'import/no-extraneous-dependencies': 'off'}"`
      )
      success('File index.js configurated')
    }

    const getModuleDetails = async () => {
      const askName = async name =>
        (
          await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: `What is the ${name}'s name you wanna build?`
            }
          ])
        ).name

      return [
        first || (await askName('reducer')),
        second || (await askName('action'))
      ]
    }

    const configRootReducer = async reducer => {
      if (!hasRedux)
        await template.generate({
          template: 'redux/rootReducer.js',
          target: `${folder}/src/store/modules/rootReducer.js`
        })
      await patch(`${folder}/src/store/modules/rootReducer.js`, {
        insert: `import ${reducer} from './${reducer}/reducer'\n`,
        before: 'export default combineReducers({'
      })
      await patch(`${folder}/src/store/modules/rootReducer.js`, {
        insert: `${reducer},`,
        after: 'export default combineReducers({'
      })
      await run(
        `yarn --cwd ${folder} eslint --fix src/store/modules/rootReducer.js --rule "{'import/no-extraneous-dependencies': 'off'}"`
      )
    }

    const install = async () => {
      info('Installing Redux')
      await run(
        `yarn --cwd ${folder} add redux react-redux reactotron-react-js reactotron-redux immer`
      )
      success('Redux installed')
    }

    const configReducer = async (reducer, type) => {
      info(`Configurating Reducer ${reducer}`)
      if (!filesystem.exists(`src/store/modules/${reducer}`))
        await template.generate({
          template: 'redux/reducer.js.ejs',
          target: `${folder}/src/store/modules/${reducer}/reducer.js`,
          props: { reducer }
        })
      await patch(`${folder}/src/store/modules/${reducer}/reducer.js`, {
        insert: `case '${type}': return produce(state, draft => console.tron.log('${type} not implemented'))\n`,
        after: 'switch (action.type) {\n'
      })
      await run(
        `yarn --cwd ${folder} eslint --fix src/store/modules/${reducer}/reducer.js --rule "{ 'no-unused-vars': 'off','import/no-extraneous-dependencies': 'off'}"`
      )
      success(`Reducer ${reducer} configurated`)
    }

    const createAction = async (reducer, action, type) => {
      info(`Creating action ${action}`)
      await append(
        `${folder}/src/store/modules/${reducer}/actions.js`,
        `\n\nexport const ${action} = () => ({type: '${type}'})`
      )
      await run(
        `yarn --cwd ${folder} eslint --fix src/store/modules/${reducer}/actions.js`
      )
      success(`Action ${action} created`)
    }

    const [reducer, action] = await getModuleDetails()
    const type = `@${reducer}/${action.toUpperCase()}`

    await Promise.all([
      ...(hasRedux
        ? []
        : [
            install(),
            addProvider(),
            template.generate({
              template: 'redux/index.js',
              target: `${folder}/src/store/index.js`
            }),
            ...(reactNative
              ? []
              : [
                  template.generate({
                    template: 'reactotron.js.ejs',
                    target: `${folder}/src/config/Reactotron.js`,
                    props: { reactNative: false }
                  })
                ])
          ]),
      configRootReducer(reducer),
      configReducer(reducer, type),
      createAction(reducer, action, type)
    ])
    info('Making commit')
    await run(
      `git --git-dir ${folder}/.git --work-tree ${folder} add . && git --git-dir ${folder}/.git --work-tree ${folder} commit -m '${!hasRedux &&
        '-Configs Redux\n'}${!reactNative &&
        '-Configs Reactotron\n'}-Adds action ${type}'`
    )
  }
}
