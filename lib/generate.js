/*
 * @Author: lip
 * @Date: 2018-06-06 15:43:37
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-08 11:50:10
 */

'use strict'

const Handlebars = require('handlebars')
const Metalsmith = require('metalsmith')
const ora = require('ora')
const async = require('async')
const render = require('consolidate').handlebars.render
const path = require('path')
const chalk = require('chalk')

const log = require('./log')
const getSetting = require('./settings')
const ask = require('./ask')
const filesFilter = require('./files-filter')
const utils = require('./utils')

// support for vuejs template
Handlebars.registerHelper('if_eq', function(a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function(a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this)
})

/**
 * Generate a template given a `tmpDir` and `dest`.
 *
 * @param {String} projectName
 * @param {String} tmpDir
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function(projectName, tmpDir, dest, done) {
  let metalsmith

  let setting = getSetting(projectName, tmpDir)
  let tplPath = path.join(tmpDir, 'template')

  // register handlebars helpers
  setting.helpers &&
    Object.keys(setting.helpers).map(function(key) {
      Handlebars.registerHelper(key, setting.helpers[key])
    })

  if (utils.isExist(tplPath)) {
    metalsmith = Metalsmith(tplPath)
  } else {
    metalsmith = Metalsmith(tmpDir)
  }

  let data = Object.assign(metalsmith.metadata(), {
    destDirName: projectName,
    isCwd: dest === process.cwd(),
    noEscape: true
  })

  ora({
    text: `generating project ${projectName}...`
  }).stopAndPersist(chalk.blue('**'))

  log.tips()

  metalsmith
    .use(askQuestions(setting))
    .use(filter(setting))
    .use(template)
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build(function(err) {
      log.tips()

      if (err) {
        return done(err)
      }
      // Generated success
      ora({
        text: chalk.green(`${projectName} generated  success`)
      }).succeed()

      log.tips()

      done(null, setting.completeMessage)
    })

  return data
}

// ask user for input info
function askQuestions(setting) {
  return (files, metalsmith, done) => {
    ask(setting.prompts, metalsmith.metadata(), done)
  }
}

// files filter
function filter(setting) {
  return (files, metalsmith, done) => {
    filesFilter(setting.filters, files, metalsmith.metadata(), done)
  }
}

// generate template
function template(files, metalsmith, done) {
  let keys = Object.keys(files)
  let metadata = metalsmith.metadata()

  async.each(
    keys,
    (file, next) => {
      // judge file is in node_modules directory
      let inNodeModules = /node_modules/.test(file)
      let str = inNodeModules ? '' : files[file].contents.toString()

      // do not attempt to render files that do not have mustaches and is in node_modules directory
      if (inNodeModules || !/{{([^{}]+)}}/g.test(str)) {
        return next()
      }

      render(str, metadata, (err, res) => {
        if (err) {
          return next(err)
        }
        files[file].contents = Buffer.alloc(res.length, res)
        next()
      })
    },
    done
  )
}
