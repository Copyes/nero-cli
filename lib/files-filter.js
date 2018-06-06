/*
 * @Author: lip
 * @Date: 2018-06-06 15:43:54
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 15:43:54
 */

'use strict'

const match = require('minimatch')
const evaluate = require('./eval')

module.exports = function(filters, files, data, done) {
  if (!filters) {
    return done()
  }

  const filePaths = Object.keys(files)

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
