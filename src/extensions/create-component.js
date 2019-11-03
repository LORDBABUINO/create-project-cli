module.exports = toolbox => {
  const {
    filesystem,
    template,
    print: { success, error }
  } = toolbox

  async function isReactNative(root) {
    const packageJson = await filesystem.read(
      `${root || '.'}/package.json`,
      'json'
    )
    return !!packageJson.dependencies['react-native']
  }
  async function createComponent(folder, name, root) {
    if (!name) {
      error('Component name must be specified')
      return
    }
    const styleTemplate = (await isReactNative(root))
      ? 'styles-rn.js.ejs'
      : 'styles-react.js.ejs'
    await Promise.all([
      template.generate({
        template: 'component.js.ejs',
        target: `${folder}/${name}/index.js`,
        props: { name }
      }),
      template.generate({
        template: styleTemplate,
        target: `${folder}/${name}/styles.js`
      })
    ])
    success(`Generated ${folder}/${name}.`)
  }
  toolbox.createComponent = createComponent
}
