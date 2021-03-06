/*
 * @Author: lip
 * @Date: 2018-06-03 19:42:18
 * @Last Modified by: lip.fan
 * @Last Modified time: 2019-01-09 20:53:27
 */

'use strict'

const axios = require('axios')
const ora = require('ora')
const chalk = require('chalk')

const utils = require('./utils')
const log = require('./log')

module.exports = function (repo, done) {
  let oraer = ora({
    text: 'checking template from github.com...',
    color: 'blue'
  }).start()

  // const REQUEST_URL = `https://api.github.com/users/${repoInfo[0]}/repos`;
  const URL = `https://github.com/${repo}`

  axios(utils.getAuthInfo(URL))
    .then(res => {
      log.tips()
      if (res.status === 200) {
        oraer.text = chalk.green('Template checked success from github.com.')
        oraer.succeed()
        log.tips()
        done(repo)
      } else {
        oraer.stop()

        log.tips()
        log.tips(
          chalk.red(`Template checked fail: ${repo} not found on github.com.`)
        )
        log.tips()
        log.tips(
          `Please check the repo's url(${chalk.blue(URL)}) is available.`
        )
        process.exit(1)
      }
    })
    .catch(err => {
      if (err) {
        let res = err.response

        oraer.text = chalk.white(
          `nero cli:checking template ${repo} failed from github.com, error message as follows:`
        )
        oraer.fail()
        log.tips()

        if (res && res.status === 403) {
          // api rate limit:https://developer.github.com/v3/#rate-limiting
          log.tips(
            chalk.red(
              `     ${res.statusText}: ${res.data.message}\n\ndocumentation: ${
                res.data.documentation_url
              }`
            )
          )
          log.tips()
          log.tips(
            `     Please set auth token to get a higher rate limit by ${chalk.blue(
              'nero token'
            )}. Check out the documentation for more details.`
          )
          log.tips()
          log.tips(
            '     documentation: https://developer.github.com/v3/auth/#basic-authentication'
          )
        } else {
          if (res) {
            log.tips(chalk.red(`     ${res.statusText}: ${res.headers.status}`))
            log.tips()
            log.tips(
              `Please check the repo's url(${chalk.blue(URL)}) is available.`
            )
          } else {
            log.error(`     ${err.message}`)
          }
        }

        process.exit(1)
      }
    })
}
