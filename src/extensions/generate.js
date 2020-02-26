import utilsGenerator from './utils'

export default toolbox => {
  utilsGenerator(toolbox)
  const {
    template,
    patch,
    utils: { isReactNative }
  } = toolbox

  const component = (folder, name, root) =>
    Promise.all([
      template.generate({
        template: 'component.js.ejs',
        target: `${folder}/${name}/index.js`,
        props: { name }
      }),
      template.generate({
        template: isReactNative(root)
          ? 'styles-rn.js.ejs'
          : 'styles-react.js.ejs',
        target: `${folder}/${name}/styles.js`
      })
    ])

  const insetNavigator = (root, name) =>
    isReactNative(root || '.')
      ? {
          insert: `${name},`,
          after: /Navigator\s*{\s*/
        }
      : {
          insert: `<Route path="/${name}" component={${name}} />\n`,
          after: /<Switch>\s*/
        }

  const page = (name, root) =>
    Promise.all([
      component(`${root || '.'}/src/pages`, name, root),
      patch(
        `${root || '.'}/src/routes.js`,
        {
          insert: `import ${name} from './pages/${name}'\n`,
          before: '\nconst Routes'
        },
        insetNavigator(root || '.', name)
      )
    ])
  toolbox.generate = { component, page }
}
