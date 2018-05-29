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
console.log(origin)

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
