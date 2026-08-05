# Git hooks

Version-controlled git hooks for this repo. Enabled automatically via the npm
`prepare` script (`scripts/install-git-hooks.js`), which points
`core.hooksPath` at this directory after `npm install`.

## `pre-push`

Runs `npm run verify` before every push — the **same** checks CI runs on pull
requests and on a merge to `main` before deployment:

| Check            | Command                | Runs in CI?                |
| ---------------- | ---------------------- | -------------------------- |
| Lint             | `npm run lint`         | PR + deploy (via `verify`) |
| Format           | `npm run format:check` | PR + deploy (via `verify`) |
| Unit tests       | `npm run test:unit`    | PR + deploy (via `verify`) |
| Production build | `npm run build`        | PR + deploy (via `verify`) |
| E2E (Playwright) | `npm run test`         | PR + deploy (via `verify`) |

### Why there is no drift

There is exactly **one** definition of "the checks": the `verify` script in
`package.json`. Both this hook and the CI composite action
(`.github/actions/setup-and-test`, used by `pr-test.yml` **and** `deploy.yml`)
invoke `npm run verify`. Change the checks in one place and every entry point
updates together — the local and CI verdicts stay deterministically aligned.

The hook also runs with `CI=true`, so Playwright applies the same settings as CI
(`forbidOnly`, retries, workers, a fresh web server). A committed `test.only`,
for example, fails locally exactly as it would on GitHub.

### Stacked pushes verify the tip only

The hook runs once per `git push` **invocation**, against whatever is checked
out — not once per pushed ref. Pushing a whole stack in one command
(`git push --force-with-lease origin feature/a feature/b`) therefore runs
`npm run verify` against the tip, and the intermediate levels are not verified
locally.

That is acceptable because CI covers each level independently: the PR workflows
carry no `branches:` filter, so every PR in a stack — not just the one based on
`main` — runs the same `npm run verify` through
`.github/actions/setup-and-test`. Checking out and verifying each ref locally
instead would mean a full Playwright run across three browsers per level.

### Notes

- The hook is a no-op inside GitHub Actions, so automated content-update pushes
  are never blocked.
- Requires dependencies to be installed (`npm install`). The first run also
  installs Playwright browsers if needed (`npm run test:setup`).
- Bypass for a single push (discouraged): `git push --no-verify`.
