/*
 * @Author: lip
 * @Date: 2018-06-03 19:41:56
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 16:44:31
 */

'use strict'

const async = require('async')
const inquirer = require('inquirer')
const chalk = require('chalk')

// Support types from prompt-for which was used before
let promptMapping = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

module.exports = function(prompts, data, done) {
  // https://github.com/metalsmith/metalsmith/blob/master/examples/project-scaffolder/build.js#L26
  async.eachSeries(
    Object.keys(prompts),
    function(key, done) {
      promptWraper(data, key, prompts[key], done)
    },
    done
  )
}

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function promptWraper(data, key, prompt, done) {
  let msg = prompt.message || prompt.label || key
  let promptType = promptMapping[prompt.type] || prompt.type

  // when condition is not met, skip it
  if (prompt.when && !data[prompt.when]) {
    return done()
  }

  let promptDefault = prompt.default
  if (typeof prompt.default === 'function') {
    promptDefault = function() {
      return prompt.default.bind(this)(data)
    }
  }

  inquirer
    .prompt([
      {
        type: promptType,
        name: key,
        message: `${msg}:`,
        choices: prompt.choices || [],
        filter:
          prompt.filter ||
          function(val) {
            return val
          },
        default: promptDefault,
        validate:
          prompt.validate ||
          function() {
            return true
          }
      }
    ])
    .then(anwsers => {
      if (Array.isArray(anwsers[key])) {
        data[key] = []
        anwsers[key].forEach(choice => {
          data[key].push(choice)
        })
      } else {
        data[key] = anwsers[key]
      }
      done()
    })
}
