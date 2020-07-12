module.exports = {
  name: 'react',
  description: 'Create new React project',
  run: async (toolbox) => {
    const {
      parameters: { options },
      template,
      generate: { component },
      system: { run },
    } = toolbox

    const name = options.dir ?? '.'

    const installDependencies = async () => {
      await template.generate({
        template: 'react/package.json',
        target: `${name}/package.json`,
      })
      await run(`yarn -s --cwd ${name} && yarn upgrade -sL --cwd ${name}`)
    }

    await Promise.all([
      template.generate({
        template: 'react/App.js',
        target: `${name}/src/App.js`,
      }),
      template.generate({
        template: 'react/global.js',
        target: `${name}/src/styles/global.js`,
      }),
      template.generate({
        template: 'react/index.js',
        target: `${name}/src/index.js`,
      }),
      template.generate({
        template: 'react/routes.js',
        target: `${name}/src/routes.js`,
      }),
      template.generate({
        template: 'react/index.html.ejs',
        target: `${name}/public/index.html`,
        props: { name },
      }),
      template.generate({
        template: 'editorconfig',
        target: `${name}/.editorconfig`,
      }),
      template.generate({
        template: 'react/eslintrc.js',
        target: `${name}/.eslintrc.js`,
      }),
      template.generate({
        template: 'react/prettierrc',
        target: `${name}/.prettierrc`,
      }),
      template.generate({
        template: 'react/gitignore',
        target: `${name}/.gitignore`,
      }),
      installDependencies(),
      component(`${name}/src/pages`, 'Home', name),
    ])

    return run(
      `git --git-dir ${name}/.git --work-tree ${name} init && git --git-dir ${name}/.git --work-tree ${name} add . && git --git-dir ${name}/.git --work-tree ${name} commit -m 'Project initialized'`
    )
  },
}
