#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path')
const rm = require('rimraf').sync
const uuidV1 = require('uuid/v1')
const ora = require('ora')
const os = require('os')
const download = require('download-git-repo')
const shell = require('shelljs')

const log = require('../lib/log.js')
const utils = require('../lib/utils.js')
const checkRepos = require('../lib/check-repos.js')
// usage
program
  .usage('<template-name>', '[project-name]')
  .option('-c', '--clone', 'use git clone')
  .option('-o', '--origin', 'set git remote origin')

// help
program.on('--help', function() {
  log.tips('  Examples:')
  log.tips()
  log.tips(
    chalk.gray('    # create a new project with an template from github.')
  )
  log.tips('    $ nero init Copyes/rollup-library-seed my-project')
  log.tips(
    '    $ nero init Copyes/rollup-library-seed my-project -o git@github.com:xx/xxxx.git'
  )
  log.tips()
})

function help() {
  program.parse(process.argv)
  if (program.args.length < 1) {
    return program.help()
  }
}

help()

/**
 * Padding.
 */

log.tips()
process.on('exit', () => log.tips())

let template = program.args[0]
let projectDirName = program.args[1]

if (!projectDirName || /^\w:\/?$/.test(projectDirName)) {
  projectDirName = '.'
}

let origin = program.args[2]
let projectName =
  projectDirName === '.' ? path.relative('../', process.cwd()) : projectDirName
let projectDirPath = path.resolve(projectDirName || '.')
let clone = program.clone || false
let hasSlash = template.indexOf('/') > -1
let preProjectName = projectName

if (!hasSlash) {
  return program.help()
}

console.log(projectName)
console.log(projectDirName)

function setOrigin() {
  try {
    shell.cd(projectDirPath)
    shell.exec(`git init`, { async: false })
    shell.exec(`git remote add origin ${origin}`, { async: false })
    log.tips(chalk.green(`${projectName} is related to remote repo: ${origin}`))
  } catch (e) {
    log.tips(chalk.red(`set git remote origin faild: ${e.message}`))
  }
}

// 判断当前路径是不是存在
if (utils.isExist(projectDirPath)) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        message:
          projectDirName === '.'
            ? 'Generate project in current directory?'
            : 'Target directory exists. Continue?',
        name: 'ok'
      }
    ])
    .then(answers => {
      if (answers.ok) {
        log.tips()
        // log.success('成功啦～')
        runTask()
      }
    })
} else {
  let normalizeName = ''
  let index = projectName.indexOf('/')

  if (projectDirName.startsWith('/') || /^\w:/.test(projectDirName)) {
    normalizeName =
      projectName.substr(index).split('/')[0] ||
      projectName.substr(index).split('/')[1]
    normalizeName = normalizeName ? normalizeName : 'demo'
  } else if (index >= 0) {
    normalizeName = projectName.split('/')[0]
  }
  if (normalizeName && normalizeName !== projectName) {
    inquirer
      .prompt([
        {
          type: 'confirm',
          message: `Your project's name will be created as ${normalizeName}`,
          name: 'ok'
        }
      ])
      .then(answers => {
        if (answers.ok) {
          log.tips()
          projectName = normalizeName
          runTask()
        }
        return
      })
  } else {
    runTask()
  }
}

function runTask() {
  let arr = template.split(path.sep)
  if (arr.length < 2 || !arr[0] || !arr[1]) {
    return program.help()
  }
  log.tips()
  log.tips(
    chalk.red(
      `Local template ${template} not found. Will check it from github.`
    )
  )
  log.tips()

  // convert template path to xxx/xxx
  template = template
    .split(path.sep)
    .slice(0, 2)
    .join('/')
  // check repo from github.com
  checkRepos(template, function() {})
}
