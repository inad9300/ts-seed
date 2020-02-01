import { findProjectRoot } from './helpers/findProjectRoot'
import { compilerOptions } from '../tsconfig.json'
import { tsc } from './helpers/tsc'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

process.chdir(findProjectRoot())

const defineJsPath = './out/resources/define.js'

tsc(['./resources/define.ts'], {
  ...compilerOptions,
  lib: ['dom', 'es6'],
  module: 'amd',
  outFile: defineJsPath,
  alwaysStrict: false,
  removeComments: false
})

const [defineJsStart, defineJsEnd] = readFileSync(resolve(defineJsPath))
  .toString()
  .split('// ---')

const mainJsPath = './out/src/main.js'

tsc(['./src/main.ts'], {
  ...compilerOptions,
  lib: ['dom', 'es6'],
  module: 'amd',
  outFile: mainJsPath
})

writeFileSync(
  resolve(mainJsPath),
  defineJsStart + '\n' + readFileSync(mainJsPath) + defineJsEnd
)

// replaceVar(
//   './resources/index.html',
//   'HTML_BODY',
//   `<script src="${-0}"></script>`
// )

// function replaceVar(file: string, placeholder: string, content: string) {
//   readFileSync(file)
//     .toString()
//     .replace(new RegExp(placeholder, 'g'), content)
// }
