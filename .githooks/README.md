# Git hooks

Version-controlled git hooks for this repo. Enabled automatically via the npm
`prepare` script (`scripts/install-git-hooks.js`), which points
`core.hooksPath` at this directory after `npm install`.

## `pre-commit`

Runs `npm run verify` before every commit — the **same** checks CI runs on pull
requests and on a merge to `main` before deployment:

| Check            | Command               | Runs in CI?                          |
| ---------------- | --------------------- | ------------------------------------ |
| Lint             | `npm run lint`        | PR + deploy (via `verify`)           |
| Format           | `npm run format:check`| PR + deploy (via `verify`)           |
| Unit tests       | `npm run test:unit`   | PR + deploy (via `verify`)           |
| Production build | `npm run build`       | PR + deploy (via `verify`)           |
| E2E (Playwright) | `npm run test`        | PR + deploy (via `verify`)           |

### Why there is no drift

There is exactly **one** definition of "the checks": the `verify` script in
`package.json`. Both this hook and the CI composite action
(`.github/actions/setup-and-test`, used by `pr-test.yml` **and** `deploy.yml`)
invoke `npm run verify`. Change the checks in one place and every entry point
updates together — the local and CI verdicts stay deterministically aligned.

The hook also runs with `CI=true`, so Playwright applies the same settings as CI
(`forbidOnly`, retries, workers, a fresh web server). A committed `test.only`,
for example, fails locally exactly as it would on GitHub.

### Notes

- The hook is a no-op inside GitHub Actions, so automated content-update commits
  are never blocked.
- Requires dependencies to be installed (`npm install`). The first run also
  installs Playwright browsers if needed (`npm run test:setup`).
- Bypass for a single commit (discouraged): `git commit --no-verify`.
