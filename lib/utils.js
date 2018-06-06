/*
 * @Author: lip
 * @Date: 2018-06-03 19:45:48
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 16:43:50
 */

'use strict'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').execSync

const log = require('./log')

module.exports = {
  isExist(tplPath) {
    let p = path.normalize(tplPath)
    try {
      fs.accessSync(p, fs.R_OK & fs.W_OK, err => {
        if (err) {
          log.tips()
          log.error(`Permission Denied to access ${p}`)
        }
      })
      return true
    } catch (e) {
      return false
    }
  },

  isLocalTemplate(tpl) {
    let isLocal = tpl.startsWith('.') || tpl.startsWith('/') || /^\w:/.test(tpl)

    if (isLocal) {
      return isLocal
    } else {
      return this.isExist(path.normalize(path.join(process.cwd(), tpl)))
    }
  },

  neroBinPath() {
    try {
      let binPath = exec('which nero')
      return binPath.toString()
    } catch (e) {
      log.error(`exec which nero error: ${e.message}`)
    }
  },

  getAuthInfo(url) {
    let config = {
      url: url,
      method: 'get',
      headers: {
        'User-Agent': 'nero-cli'
      },
      timeout: 10000,
      auth: {}
    }

    let binPath = this.neroBinPath()
    let tokenPath = path.normalize(
      path.join(binPath, '../../', 'lib/node_modules/nero/lib/token.json')
    )
    console.log(tokenPath)
    if (this.isExist(tokenPath)) {
      let authInfo = require(tokenPath)
      config.auth = authInfo
    } else {
      delete config['auth']
    }

    return config
  }
}
