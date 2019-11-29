module.exports = {
  name: 'generate:component',
  description: 'Create new component inside src/components',
  run: async toolbox => {
    const {
      parameters,
      generate: { component }
    } = toolbox

    const name = parameters.first

    await component('src/components', name)
  }
}
