export default {
  name: 'generate:page',
  description: 'Create new component inside src/pages',
  run: async ({ parameters, generate }) => {
    const name = parameters.first
    generate.page(name)
  }
}
