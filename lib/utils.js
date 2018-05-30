const fs = require('fs')
const path = require('path')
const exec = require('child_process').execSync

const log = require('./log.js')
module.exports = {
  isExist(tplPath) {
    let p = path.normalize(tplPath)
    console.log(p)
    try {
      fs.accessSync(p, fs.constants.R_OK | fs.constants.W_OK, err => {
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
  isLocalTemplate(tplPath) {
    let isLocal =
      tplPath.startWith('.') || tplPath.startWith('/') || /^\w:/.test(tplPath)
    if (isLocal) {
      return isLocal
    } else {
      return this.isExist(path.normalize(path.join(process.cwd(), tplPath)))
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
    console.log(url)
    let config = {
      url: url,
      method: 'get',
      headers: {
        'User-Agent': 'nero-cli'
      },
      timeout: 10000,
      auth: {}
    }

    // let binPath = this.neroBinPath()
    // let tokenPath = path.normalize(
    //   path.join(binPath, '../../', 'lib/node_modules/nero/lib/token.json')
    // )

    if (false && this.isExist(tokenPath)) {
      let authInfo = require(tokenPath)
      config.auth = authInfo
    } else {
      delete config['auth']
    }
    return config
  }
}
