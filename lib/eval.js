/*
 * @Author: lip
 * @Date: 2018-06-06 15:44:13
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 15:44:13
 */

const log = require('./log')

module.exports = function evaluate(exp, data) {
  let fn = new Function('data', 'with (data) { return ' + exp + '}')
  try {
    return fn(data)
  } catch (e) {
    log.error(`Error when evaluating filter condition: ${exp}`)
  }
}
