const inquirer = require('inquirer')
const cli = require('../cli')

module.exports = {
  name: 'omni',
  description: 'Create new project',
  run: async () => {
    const choices = { 'Node.js API': 'node', React: 'react', 'React Native': 'react-native' }
    const askProject = {
      type: 'list',
      name: 'projectType',
      message: 'What kind of project you wanna build?',
      choices: Object.keys(choices),
      filter: (choice) => choices[choice],
    }

    const { projectType } = await inquirer.prompt([askProject])
    cli.run(projectType)
  },
}
