import r from 'ramda'
import { prompt } from 'inquirer'

export default toolbox => {
  const camelcase = r.replace(/(^\w|-\w)/g, r.pipe(r.last, r.toUpper))
  const makeQuestion = name => ({
    type: 'input',
    name,
    message: `What is the ${name}'s name you wanna build?`
  })

  const makeQuestions = r.pipe(
    r.reject(r.is(String)),
    r.keys,
    r.map(makeQuestion),
    prompt
  )

  const getModuleDetails = obj => r.then(r.mergeRight(obj), makeQuestions(obj))
  // const getModuleDetails = r.converge(r.then, [r.mergeRight, makeQuestions])

  toolbox.utils = { camelcase, getModuleDetails }
}
