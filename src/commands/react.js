const inquirer = require('inquirer')

module.exports = {
  name: 'react',
  description: 'Create new React project',
  run: async toolbox => {
    const {
      parameters,
      template,
      createComponent,
      system: { run },
      print: { info, success }
    } = toolbox

    const askName = {
      type: 'input',
      name: 'name',
      message: 'What will be the name of your project?'
    }

    const name = parameters.first
      ? parameters.first
      : (await inquirer.prompt([askName])).name

    info(`Creating new React SPA: ${name}`)

    const installDependencies = async () => {
      await template.generate({
        template: 'react/package.json.ejs',
        target: `${name}/package.json`,
        props: { name }
      })
      info('Installing dependencies')
      await run(`yarn --cwd ${name} && yarn upgrade -L --cwd ${name}`)
      success('Dependencies installed')
    }

    await Promise.all([
      template.generate({
        template: 'react/App.js',
        target: `${name}/src/App.js`
      }),
      template.generate({
        template: 'react/global.js',
        target: `${name}/src/styles/global.js`
      }),
      template.generate({
        template: 'react/index.js',
        target: `${name}/src/index.js`
      }),
      template.generate({
        template: 'react/routes.js',
        target: `${name}/src/routes.js`
      }),
      template.generate({
        template: 'react/index.html.ejs',
        target: `${name}/public/index.html`,
        props: { name }
      }),
      template.generate({
        template: 'editorconfig',
        target: `${name}/.editorconfig`
      }),
      template.generate({
        template: 'react/eslintrc.js',
        target: `${name}/.eslintrc.js`
      }),
      template.generate({
        template: 'react/prettierrc',
        target: `${name}/.prettierrc`
      }),
      template.generate({
        template: 'react/gitignore',
        target: `${name}/.gitignore`
      }),
      installDependencies(),
      createComponent(`${name}/src/pages`, 'Home', name)
    ])

    info('Making first commit')
    run(
      `git --git-dir ${name}/.git --work-tree ${name} init && git --git-dir ${name}/.git --work-tree ${name} add . && git --git-dir ${name}/.git --work-tree ${name} commit -m 'Project initialized'`
    )
  }
}
