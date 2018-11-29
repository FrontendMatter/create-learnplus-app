#!/usr/bin/env node
const path = require('path')
const sao = require('sao')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))
const outDir = path.resolve(argv._[0] || '.')

console.log(`> Generating LearnPlus Bootstrap project in ${outDir}`)

sao({
  generator: __dirname,
  outDir
})
.run()
.catch(err => {
  sao.handleError(err)
})