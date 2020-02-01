import { resolve } from 'path'
import { execSync } from 'child_process'

type CompilerOptions = {
  alwaysStrict?: boolean
  forceConsistentCasingInFileNames?: boolean
  lib?: string[]
  module?: string
  moduleResolution?: string
  noFallthroughCasesInSwitch?: boolean
  noImplicitReturns?: boolean
  noUnusedLocals?: boolean
  noUnusedParameters?: boolean
  outDir?: string
  outFile?: string
  removeComments?: boolean
  resolveJsonModule?: boolean
  strict?: boolean
  target?: string
}

const pathOptions: (keyof CompilerOptions)[] = ['outDir', 'outFile']

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

function cliArgs(obj: CompilerOptions): string {
  return Object
    .entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        value = value.join(',')
      } else if (typeof value === 'string' && pathOptions.includes(key as any)) {
        value = resolve(value)
      }
      return `--${key} "${value}"`
    })
    .join(' ')
}
