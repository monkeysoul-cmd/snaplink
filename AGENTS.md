# Repository Guidelines & Agent Rules

## Automated Git Workflow
- **Auto-Push Rule**: After completing and verifying any code modifications (typechecks, builds, tests), always automatically stage, commit with a descriptive message, and push the changes to GitHub (`origin <current-branch>`).
- **Commit Messages**: Follow standard conventional commits format (e.g., `feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`).
- **Verification First**: Always run `npm run lint` and `npm run build` before committing and pushing to ensure no regressions are introduced.
