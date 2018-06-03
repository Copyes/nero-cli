/*
 * @Author: lip
 * @Date: 2018-06-03 15:01:18
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-03 15:01:18
 */
'use strict'

let match = require('minimatch')
let evaluate = require('./eval')

module.exports = function(filters, files, data, done) {
  if (!filters) {
    return done()
  }

  let filePaths = Object.keys(files)

  if (!filePaths.length) {
    return done()
  }

  Object.keys(filters).forEach(function(regexp) {
    filePaths.forEach(function(path) {
      if (match(path, regexp, { dot: true })) {
        let matchedVal = filters[regexp]

        if (!evaluate(matchedVal, data)) {
          delete files[path]
        }
      }
    })
  })

  done()
}
