/*
 * @Author: lip
 * @Date: 2018-06-06 15:42:59
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 16:44:03
 */

const chalk = require('chalk')

module.exports = {
  error(msg) {
    console.log(chalk.red(msg))
    process.exit(1)
  },
  success(msg) {
    console.log(chalk.green(msg))
  },
  tips(msg = '') {
    console.log(msg)
  }
}
