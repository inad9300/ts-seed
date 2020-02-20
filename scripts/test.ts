import { AssertionError } from 'assert'
import { filesEndingWith } from './helpers/filesEndingWith'
import { findProjectRoot } from './helpers/findProjectRoot'
import { compilerOptions } from '../tsconfig.json'
import { tsc } from './helpers/tsc'
import { resolve } from 'path'

process.chdir(findProjectRoot())

const outDir = './out/test'
const sourceTestFiles = filesEndingWith(resolve('./test'), '.test.ts')

tsc(sourceTestFiles, {
  ...compilerOptions,
  outDir,
  lib: ['es2019']
})

const absOutDir = resolve(outDir)
const compiledTestFiles = filesEndingWith(absOutDir, '.test.js')

type TestError = AssertionError & {
  _file: string
  _testName: string
}

const errors: TestError[] = []
const timing: [string, string, number][] = []

function registerError(file: string, testName: string, err: any) {
  if (err instanceof AssertionError) {
    ;(err as TestError)._file = file.substr(absOutDir.length + 1)
    ;(err as TestError)._testName = testName
    errors.push(err as TestError)
  } else {
    console.error('Unexpected error while running tests.', err)
    process.exit(-1)
  }
}

function registerTime(file: string, testName: string, t: [number, number]) {
  timing.push([file.substr(absOutDir.length + 1), testName, t[0] * 1000 + t[1] / 1_000_000])
}

type TestFunction = () => void | Promise<any>
type TestModule = {
  [title: string]: TestFunction
}

const testPromises = compiledTestFiles
.map(file => {
  const testObject = require(file).default as TestModule
  if (
    !testObject ||
    typeof testObject !== 'object' ||
    Object.keys(testObject).length === 0 ||
    Object.values(testObject).some(p => typeof p !== 'function')
  ) {
    console.error(
      'Test files are expected to default-export non-empty objects from test titles (strings)'
        + ' to possibly-asynchronous functions. Given:',
      testObject
    )
    process.exit(-1)
  }

  return Object.entries<TestFunction>(testObject).map(([title, fn]) => {
    let t = process.hrtime()
    try {
      const out = fn()
      if (!(out instanceof Promise)) {
        registerTime(file, title, process.hrtime(t))
        return Promise.resolve()
      }
      return out
        .then(() => registerTime(file, title, process.hrtime(t)))
        .catch(err => {
          registerTime(file, title, process.hrtime(t))
          registerError(file, title, err)
        })
    } catch (err) {
      registerTime(file, title, process.hrtime(t))
      registerError(file, title, err)
      return Promise.resolve()
    }
  })
})
.flat()

Promise.all(testPromises).finally(() => {
  if (errors.length === 0) {
    console.error('\n No errors!') // TODO Log in green.
  } else {
    console.error('\n Errors') // TODO Log in red.
    console.table(
      errors.map(err => ({
        file: err._file,
        test: err._testName,
        message: err.message.replace(/\n+/g, ' '),
        expected: err.expected,
        operator: err.operator,
        actual: err.actual
      }))
    )
  }

  const decimalPlaces = 2
  const filePadSize = Math.max(...timing.map(([file]) => file.length))
  const testNamePadSize = Math.max(...timing.map(([_file, testName]) => testName.length))
  const timePadSize = Math.max(...timing.map(([_file, _testName, t]) => t.toFixed(0).length)) + 1 + decimalPlaces

  console.info('\n Timing') // TODO Display total.
  console.table(
    timing
      .sort((a, b) => (a[2] > b[2] ? -1 : 1))
      .map(([file, testName, t]) => [
        file.padStart(filePadSize),
        testName.padStart(testNamePadSize),
        t.toFixed(decimalPlaces).padStart(timePadSize) + ' ms'
      ])
  )

  // TODO console.info('\n Coverage')

  process.exit(errors.length === 0 ? 0 : -1)
})
