import { readdirSync } from 'fs'
import { resolve } from 'path'

/**
 * Find package.json up the directory tree and consider it the root of the project.
 */
export function findProjectRoot(): string {
  let projectRoot = __dirname
  dance:
  while (true) {
    for (const p of readdirSync(projectRoot)) {
      if (p === 'package.json') {
        break dance
      }
    }
    projectRoot = resolve(projectRoot, '..')
  }
  return projectRoot
}
