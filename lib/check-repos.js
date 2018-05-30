const axios = require('axios')
const ora = require('ora')
const chalk = require('chalk')

const utils = require('../lib/utils.js')
const log = require('../lib/log.js')

module.exports = function(repos, done) {
  let oraer = ora({
    text: 'checking the template from github.com...',
    color: 'blue'
  }).start()
  const URL = `https://github.com/${repos}`
  axios(utils.getAuthInfo(URL))
    .then(res => {
      log.tips()
      if (res.status === 200) {
        oraer.text = chalk.green('Template checked success from github.com.')
        oraer.succeed()
        log.tips()
        done(repos)
      } else {
        oraer.stop()
        log.tips()
        log.tips(
          chalk.red(`Template checked fail: ${repos} not found on github.com.`)
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
          `nero-cli:checking template ${repos} failed from github.com, error message as follows:`
        )
        oraer.fail()
        log.tips()

        if (res && res.status === 403) {
          //api rate limit:https://developer.github.com/v3/#rate-limiting
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
              'chare token'
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
