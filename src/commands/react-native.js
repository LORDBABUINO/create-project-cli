import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import * as cli from '../cli'

export default {
  name: 'react-native',
  description: 'Create new React Native project',
  run: async toolbox => {
    const {
      parameters,
      template,
      filesystem,
      print: { info, success },
      patching: { replace },
      system: { run }
    } = toolbox

    const askName = {
      type: 'input',
      name: 'name',
      message: 'What will be the name of your project?'
    }

    const name = parameters.first
      ? parameters.first
      : (await inquirer.prompt([askName])).name

    const createPackageJson = async () => {
      const aFilesystem = filesystem.dir(name)
      info('Generating package.json')
      const { dependencies, devDependencies } = JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            '..',
            'templates',
            'react-native',
            'package.json'
          ),
          'utf8'
        )
      )
      const nativePackageJson = aFilesystem.read(`./package.json`, 'json')
      const newPackageJson = {
        ...nativePackageJson,
        devDependencies: {
          ...nativePackageJson.devDependencies,
          ...devDependencies
        },
        dependencies: { ...nativePackageJson.dependencies, ...dependencies }
      }
      aFilesystem.remove('./package.json')
      aFilesystem.write('./package.json', newPackageJson)
      success('package.json generated')
    }

    const installDependencies = async () => {
      await createPackageJson()
      info('Installing dependencies')
      await run(`yarn --cwd ${name} && yarn upgrade -L --cwd ${name}`)
      success('Dependencies installed')
    }

    info(`Creating new React Native app: ${name}`)

    await run(`react-native init ${name}`)
    await Promise.all([
      template.generate({
        template: 'react-native/routes.js',
        target: `${name}/src/routes.js`
      }),
      template.generate({
        template: 'react-native/index.js',
        target: `${name}/src/index.js`
      }),
      template.generate({
        template: 'editorconfig',
        target: `${name}/.editorconfig`
      }),
      template.generate({
        template: 'react-native/reactotron.js',
        target: `${name}/src/config/Reactotron.js`
      }),
      template.generate({
        template: 'react-native/prettierrc',
        target: `${name}/.prettierrc`
      }),
      template.generate({
        template: 'react-native/eslintrc.js',
        target: `${name}/.eslintrc.js`
      }),
      installDependencies(),
      filesystem.removeAsync(`${name}/App.js`),
      filesystem.removeAsync(`${name}/.prettierrc.js`),
      replace(`${name}/index.js`, './App', './src'),
      cli.run(`generate:page Home --dir ${name}`)
    ])

    info('Making first commit')
    run(
      `git --git-dir ${name}/.git --work-tree ${name} init && git --git-dir ${name}/.git --work-tree ${name} add . && git --git-dir ${name}/.git --work-tree ${name} commit -m 'Project initialized'`
    )
  }
}
