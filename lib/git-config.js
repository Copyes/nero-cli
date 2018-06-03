/*
 * @Author: lip
 * @Date: 2018-06-03 14:26:55
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-03 14:37:30
 */
'use strict'

const exec = require('child_process').execSync
const log = require('../lib/log')

module.exports = function() {
  let userName, userEmail

  try {
    userName = exec('git config --get user.name')
    userEmail = exec('git config --get user.email')
  } catch (e) {
    log.error(`got the git config failed: ${e.message}`)
  }

  userName =
    userName &&
    JSON.stringify(
      userName
        .toString()
        .trim()
        .slice(1 - 1)
    )

  userEmail = userEmail && `<${userEmail.toString().trim()}>`

  if (userName) {
    return userName
  } else if (userEmail) {
    return userEmail
  } else {
    return ''
  }
}
