export default toolbox => {
  const {
    patching: { update }
  } = toolbox

  function isPatternIncluded(data, findPattern) {
    if (!findPattern) return false
    return typeof findPattern === 'string'
      ? data.includes(findPattern)
      : findPattern.test(data)
  }

  function insertNextToPattern(data, opts) {
    // Insert before/after a particular string
    const findPattern = opts.before || opts.after

    // sanity check the findPattern
    const patternIsString = typeof findPattern === 'string'
    if (!(findPattern instanceof RegExp) && !patternIsString) return false

    const isPatternFound = isPatternIncluded(data, findPattern)
    if (!isPatternFound) return false

    const originalString = patternIsString
      ? findPattern
      : data.match(findPattern)[0]
    const newContents = opts.after
      ? `${originalString}${opts.insert || ''}`
      : `${opts.insert || ''}${originalString}`
    return data.replace(findPattern, newContents)
  }

  function patchString(data, opts = {}) {
    // Already includes string, and not forcing it
    if (isPatternIncluded(data, opts.insert) && !opts.force) return false

    // delete <string> is the same as replace <string> + insert ''
    const replaceString = opts.delete || opts.replace

    if (replaceString) {
      if (!isPatternIncluded(data, replaceString)) return false

      // Replace matching string with new string or nothing if nothing provided
      return data.replace(replaceString, `${opts.insert || ''}`)
    }
    return insertNextToPattern(data, opts)
  }

  const patch = async (file, ...opts) => {
    await update(file, data =>
      opts.reduce(opt => (opt ? patchString(opt) : false), data)
    )
  }

  toolbox.patch = patch
}
