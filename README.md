Seed project for web applications built using TypeScript. The goal is to allow building runnable web applications from TypeScript sources having fine-grained control of the proccess and using the least amount of runtime and compile-time dependencies. This is achieved by having some custom (and customizable) pieces, most notably:
- A build process that completes TypeScript AMD output with an AMD loader in a single file.
- A minimal AMD loader tailored for the use case.
- A test runner.

### Running
0. Install dependencies with `npm install`.
1. Compile scripts with `./node_modules/.bin/tsc --project tsconfig.scripts.json`.
2. Run desired script, e.g. `node ./out/scripts/test.js`.
