const inquirer = require('inquirer')

module.exports = {
  name: 'react-native',
  description: 'Create new React Native project',
  run: async (toolbox) => {
    const {
      parameters,
      print: { info },
    } = toolbox

    const askName = {
      type: 'input',
      name: 'name',
      message: 'What will be the name of your project?',
    }

    const name = parameters.first ? parameters.first : (await inquirer.prompt([askName])).name

    info(`Creating new React Native app: ${name}`)
  },
}
