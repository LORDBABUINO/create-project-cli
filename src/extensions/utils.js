import r from 'ramda'
import inquirer from 'inquirer'

export default toolbox => {
  const camelcase = r.converge(r.concat, [
    r.pipe(r.head, r.toUpper),
    r.slice(1, Infinity)
  ])
  const askName = async name =>
    r.prop(
      'name',
      await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: `What is the ${name}'s name you wanna build?`
        }
      ])
    )
  const getModuleDetails = questionValue =>
    r.pipe(r.values, r.head)(questionValue) ||
    r.pipe(r.keys, r.head, askName)(questionValue)

  toolbox.utils = { camelcase, getModuleDetails }
}
