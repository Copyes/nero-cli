/*
 * @Author: lip
 * @Date: 2018-06-03 14:39:50
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-03 15:00:06
 */
'use strict'

const async = require('async')
const inquirer = require('inquirer')
const chalk = require('chalk')

let promptMap = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Inquirer prompt wrapper.
 * @param {*} data
 * @param {*} key
 * @param {*} prompt
 * @param {*} done
 */
const promptWrapper = (data, key, prompt, done) => {
  let msg = prompt.message || prompt.label || key
  let promptType = promptMap[prompt.type] || prompt.type

  if (prompt.when && !data[prompt.when]) {
    return done()
  }
  let promptDefault = prompt.default
  if (typeof promptDefault === 'function') {
    promptDefault = function() {
      return prompt.default.bind(this)(data)
    }
  }
  inquirer
    .prompt([
      {
        type: promptType,
        name: key,
        message: `${msg}`,
        choices: prompt.choices,
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
    .then(answers => {
      if (Array.isArray(answers[key])) {
        data[key] = []
        answers[key].forEach(choice => {
          data[key].push(choice)
        })
      } else {
        data[key] = answers[key]
      }
    })
}
/**
 * ask questions ,return results
 * @param {*} prompts
 * @param {*} data
 * @param {*} done
 */
module.exports = function(prompts, data, done) {
  async.eachSeries(Object.keys(prompts), (data, done) => {
    promptWrapper(data, key, prompts[key], done)
  })
}
