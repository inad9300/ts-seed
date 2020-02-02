import { resolve } from 'path'
import { execSync } from 'child_process'
import { CompilerOptions } from 'typescript'

export function tsc(files: string[], compilerOptions: CompilerOptions) {
  execSync(`${
    resolve('./node_modules/.bin/tsc')
  } ${
    cliArgs(compilerOptions)
  } ${
    files.map(f => `"${resolve(f)}"`).join(' ')
  }`, {
    stdio: 'inherit'
  })
}

const pathOptions = ['outDir', 'outFile']

function cliArgs(obj: CompilerOptions): string {
  return Object
    .entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        value = value.join(',')
      } else if (typeof value === 'string' && pathOptions.includes(key)) {
        value = resolve(value)
      }
      return `--${key} "${value}"`
    })
    .join(' ')
}
