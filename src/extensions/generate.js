export default toolbox => {
  const {
    template,
    filesystem: aFilesystem,
    parameters: { options },
    patching: { patch },
    print: { success, error }
  } = toolbox

  const filesystem = options.dir ? aFilesystem.dir(options.dir) : aFilesystem

  function isReactNative(root) {
    const packageJson = filesystem.read(`${root || '.'}/package.json`, 'json')
    if (!packageJson)
      throw new Error(
        `${root || '.'}/package.json not found\ncwd: ${filesystem.cwd()}`
      )
    return !!packageJson.dependencies['react-native']
  }

  async function component(folder, name, root) {
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

  async function page(name) {
    const pathRoutes = `${options.dir || '.'}/src/routes.js`

    component(`${options.dir || '.'}/src/pages`, name)

    await patch(pathRoutes, {
      insert: `import ${name} from './pages/${name}'\n`,
      before: '\nconst Routes'
    })
    patch(
      pathRoutes,
      isReactNative()
        ? {
            insert: `\n      ${name},`,
            after: 'Navigator(\n    {'
          }
        : {
            insert: `\n      <Route path="/${name}" component={${name}} />`,
            before: '\n    <Switch>'
          }
    )
  }
  toolbox.generate = { component, page }
}
