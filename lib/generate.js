const Handlebars = require('handlebars')
const Metalsmith = require('metalsmith')
const ora = require('ora')
const async = require('async')
const render = require('consolidate').handlebars.render
const path = require('path')
const chalk = require('chalk')

const log = require('../lib/log')
