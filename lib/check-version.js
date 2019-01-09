'use strict'
const semver = require('semver')
const chalk = require('chalk')
const axios = require('axios')
const ora = require('ora')

const pkg = require('../package.json')
const log = require('./log')

log.tips('start checking ..')

module.exports = function (done) {
  let spinner = ora({
    text: 'checking the nero-cli version',
    color: 'blue'
  }).start()

  if (!semver.satisfies(process.version, pkg.engines.node)) {
    spinner.text = chalk.white('nero-cli: checking nero-cli version failed, the error message as follows:')
    spinner.fail()

    log.tips()
    log.error(`  You must upgrade your node to ${pkg.engines.node} to use the nero-cli.`)
  }

  axios({
      url: 'https://registry.npmjs.org/nero-cli',
      method: 'get',
      timeout: 1000
    })
    .then(res => {
      if (res.status === 200) {
        spinner.text = chalk.green('nero-cli: checking nero-cli version succeed')
        spinner.succeed()

        let localVer = pkg.version
        let latestVer = res.data['dist-tags'].latest

        if (semver.lt(localVer, latestVer)) {
          log.tips()
          log.tips(chalk.blue('  A newer version of nero-cli is available.'))
          log.tips()
          log.tips(`  latest:    ${chalk.green(latestVer)}`)
          log.tips(`  installed:    ${chalk.red(localVer)}`)
          log.tips('  update nero-cli latest: npm update -g nero-cli')
          log.tips()
        }
        done()
      }
    })
    .catch(err => {
      if (err) {
        let res = err.response

        spinner.text = chalk.white('nero-cli:checking nero-cli version failed, error message as follows:')
        spinner.fail()

        log.tips()

        if (res) {
          log.tips(chalk.red(`     ${res.statusText}: ${res.headers.status}`))
        } else {
          log.tips(chalk.red(`     ${err.message}`))
        }
        log.tips()
        done()
      }
    })
}
