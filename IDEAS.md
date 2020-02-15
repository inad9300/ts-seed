## Workflows

- Install
  - Dependencies
  - Type system
  - Git hooks
  - Code generation?
  - Debugger? (Source maps.)
  - Code editor settings?

- Source change
  - Compile  - Run related tests  - Coverage
             - Linting
             - Format             (- Deploy)
             - Reload

- Test change
  - Compile  - Run        - Coverage
             - Linting
             - Format

- Pre-commit
  - Linting (different configuration, e.g. "no console")
  - Run all tests

- Post-push
  - Optimize  - Deploy

- Release
