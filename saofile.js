const slugify = require('slugify')
const superb = require('superb')
const glob = require('glob')
const { join, relative } = require('path')
const inquirer = require('inquirer')
const del = require('del')

if (typeof Array.prototype.reIndexOf === 'undefined') {
  Array.prototype.reIndexOf = function (rx) {
    for (var i in this) {
      if (this[i].toString().match(rx)) {
        return i
      }
    }
    return -1;
  }
}

if (typeof Array.prototype.reIncludes === 'undefined') {
  Array.prototype.reIncludes = function (rx) {
    return this.reIndexOf(rx) !== -1;
  }
}

const rootDir = __dirname

const move = (from, to = '') => {
  const result = {}
  const options = { cwd: join(rootDir, 'template'), nodir: true, dot: true }
  for (const file of glob.sync(`${from}/**`, options)) {
    result[file] = (to ? to + '/' : '') + file.replace(`${from}/`, '')
  }
  return result
}

const filter = val => slugify(val).toLowerCase()

module.exports = {
  prompts() {
    return [
      {
        name: 'name',
        message: 'What is the name of the new project',
        default: this.outFolder,
        filter
      },
      {
        name: 'description',
        message: 'How would you describe the new project',
        default: `My ${superb()} LearnPlus project`
      },
      {
        name: 'framework',
        message: 'Select a framework',
        type: 'list',
        choices: [
          'Bootstrap'
        ],
        default: 'bootstrap',
        filter
      },
      {
        name: 'plugins',
        message: 'Select plugins',
        type: 'checkbox',
        choices: [
          'Forms / Input Spinner',
          'Forms / Date Range Picker',
          'Forms / Date Range / Flatpickr',
          'Forms / Input Mask',
          'Forms / File Upload',
          'Forms / Rich Text Editor',
          new inquirer.Separator(),
          'Charts',
          'Drag and Drop',
          'Full Calendar',
          'Tree',
          'Nestable',
          'Vector Maps',
          'Tables / Search and Sort',
          'Sweet Alert',
          new inquirer.Separator(),
          'Take Quiz / Countdown Timer'
        ],
        filter: val => val.map(filter)
      },
      {
        name: 'author',
        message: 'Author name',
        default: this.gitUser.name,
        store: true
      },
      {
        name: 'pm',
        message: 'Choose a package manager',
        choices: ['npm', 'yarn'],
        type: 'list',
        default: 'npm',
        save: true
      }
    ]
  },
  actions() {
    return [
      {
        type: 'add',
        files: [
          `${ this.answers.framework }/**`,
          '*.json',
          'gitignore',
          '*.yaml',
          '*.js'
        ]
      },
      {
        type: 'move',
        patterns: Object.assign(
          {
            gitignore: '.gitignore',
            '_package.json': 'package.json'
          },
          move(this.answers.framework)
        )
      },
      {
        type: 'remove',
        files: `${ this.answers.framework }`,
      }
    ]
  },
  async completed() {

    const outFrameworkDir = `${this.outDir}/${this.answers.framework}`
    await del(outFrameworkDir).then(() => {
      console.log(`${this.chalk.bold('removed')} ${this.chalk.cyan(outFrameworkDir)}`)
    })

    this.gitInit()
    await this.npmInstall({ packageManager: this.answers.pm })
    this.showProjectTips()

    const logCd = () => {
      if (this.outDir !== process.cwd()) {
        console.log(`${this.chalk.bold('cd')} ${this.chalk.cyan(relative(process.cwd(), this.outDir))}`)
      }
    }

    this.logger.tip(`To start dev server, run following commands:`)
    logCd()
    console.log(`${this.chalk.bold(this.npmClient)} ${this.chalk.cyan('run watch')}`)

    this.logger.tip(`To build for production, run following commands:`)
    logCd()
    console.log(`${this.chalk.bold(this.npmClient)} ${this.chalk.cyan('run production')}`)
  }
}