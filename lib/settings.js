/*
 * @Author: lip
 * @Date: 2018-06-06 15:43:21
 * @Last Modified by: lip.fan
 * @Last Modified time: 2018-06-06 16:43:59
 */

'use strict'

const path = require('path')
const metadata = require('read-metadata')
const getGithubConfig = require('./git-config')
const validateName = require('validate-npm-package-name')

const utils = require('./utils')

/**
 * Read metadata of template
 *
 * @param {String} dir
 * @return {Object}
 */

function getMetadata(dir) {
  let json = path.join(dir, 'meta.json')
  let js = path.join(dir, 'meta.js')
  let setting = {}

  if (utils.isExist(json)) {
    setting = metadata.sync(json)
  } else if (utils.isExist(js)) {
    let req = require(path.resolve(js))
    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object')
    }
    setting = req
  } else {
    return {
      prompts: {},
      filters: {}
    }
  }

  return setting
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} setting
 * @param {String} key
 * @param {String} val
 */

function setDefault(setting, key, val) {
  let prompts = setting.prompts || (setting.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      default: val
    }
  } else {
    prompts[key]['default'] = val
  }
}

/**
 * check the projectName is valid for npm publish
 *
 * @param setting
 */

function setValidateName(setting) {
  let name = setting.prompts.name
  let customValidate = name.validate

  name.validate = function(name) {
    let res = validateName(name)
    if (!res.validForNewPackages) {
      let errors = (res.errors || []).concat(res.warnings || [])
      return 'Sorry, ' + errors.join(' and ') + '.'
    }
    if (typeof customValidate === 'function') {
      return customValidate(name)
    }

    return true
  }
}

/**
 * Read prompts metadata from template.
 *
 * @param {String} projectName
 * @param {String} tmpDir
 * @return {Object}
 */

module.exports = function(projectName, tmpDir) {
  let setting = getMetadata(tmpDir)

  setDefault(setting, 'name', projectName)
  setValidateName(setting)

  let authorInfo = getGithubConfig()
  if (authorInfo) {
    setDefault(setting, 'author', authorInfo)
  }

  return setting
}
