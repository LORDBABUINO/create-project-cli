module.exports = {
  name: 'generate:page',
  description: 'Create new component inside src/pages',
  run: async toolbox => {
    const {
      parameters,
      createComponent,
      system: { run }
    } = toolbox

    const name = parameters.first

    createComponent('src/pages', name)
    run(
      `sed -i 's/\nconst Routes/import ${name} from \\'/pages/${name}\\'/g' INPUTFILE`
    )
  }
}
