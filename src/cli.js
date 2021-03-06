import { build } from 'gluegun'

export async function run(argv) {
  // create a CLI runtime
  const cli = build()
    // .exclude(['meta', 'strings', 'prompt', 'http'])
    .brand('omni')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'omni-*', hidden: true })
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    .create()
  // and run it
  const toolbox = await cli.run(argv)

  // send it back (for testing, mostly)
  return toolbox
}
