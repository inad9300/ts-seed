// Minimal AMD loader tailored for TypeScript single-file AMD output.

type Exports = { [memberName: string]: any }
type FactoryFn = (require: typeof requireFn, exports: Exports, ...deps: Exports[]) => void

const modDefs: { [modName: string]: [string[], FactoryFn] } = {}

function define(modName: string, depNames: string[], factoryFn: FactoryFn) {
  modDefs[modName] = [
    depNames.slice(2), // Skip `"require"` and `"exports"`.
    factoryFn
  ]
}

function requireFn(_dep: string): never {
  throw new Error('dynamic "require"s are not supported')
}

if (!modDefs['main']) {
  throw new Error('"main" module not found')
}

const modsToResolve = ['main']
const modExports: { [modName: string]: Exports } = {}

while (modsToResolve.length > 0) {
  const modName = modsToResolve.pop()!
  const modDef = modDefs[modName]

  // `import 'x'` will make `'x'` appear as a dependency, but there won't be a
  // `define('x', ...)` call.
  if (!modDef) {
    modExports[modName] = {}
    continue
  }

  const depNames = modDef[0]
  const unresolvedDepNames = depNames.filter(depName => !modExports[depName])

  if (unresolvedDepNames.length === 0) {
    const factoryFn = modDef[1]
    factoryFn(
      requireFn,
      modExports[modName] = {},
      ...depNames.map(depName => modExports[depName])
    )
  } else {
    modsToResolve.push(modName, ...unresolvedDepNames)
  }
}
