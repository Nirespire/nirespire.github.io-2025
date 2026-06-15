# Contributing

Thanks for taking the time to look at this repo. It's a personal site, so most
contributions will be small fixes (typos, broken links, accessibility
improvements, dependency bumps), but the workflow below applies to anything you
send.

## Prerequisites

- Node.js **22.x** (see [`.nvmrc`](./.nvmrc); `package.json` engines is
  `^22.14.0`).
- `npm` (ships with Node).

```bash
npm install
```

`npm install` also wires up the version-controlled git hooks via the
`prepare` script — see [.githooks/README.md](./.githooks/README.md) for what
that gives you.

## Development workflow

1. **Branch from `main`** — never commit directly to `main`.
   - Branch naming: `feature/<short-description>` or `bug/<short-description>`.
2. **Develop**: `npm run dev` starts the 11ty dev server on
   <http://localhost:8080> with CSS watching and hot reload.
3. **Test as you go**:
   - `npm run test:unit` — fast Node unit tests for `scripts/`.
   - `npm test` — full Playwright E2E suite (Chromium + Firefox + WebKit,
     including the `axe-core` accessibility scan).
   - `npm run test:ui` — Playwright's interactive UI mode for debugging.
4. **Before you push** — run the canonical check suite:

   ```bash
   npm run verify
   ```

   This is the exact same command CI runs (lint, format check, unit tests,
   production build, E2E). The pre-push git hook runs it automatically, so a
   green local push guarantees a green CI run on the same code.

## Commit messages

Use [conventional commits](https://www.conventionalcommits.org/):

```
feat: add latest-reads carousel
fix(uses): correct SSD spec
docs: clarify pre-push hook behaviour
chore(deps): bump eslint to 10.5.0
```

The repo's commit history is the source of truth for the style — `git log
--oneline -20` will show recent examples.

## Pull requests

- Keep PRs focused — one concern per PR makes review (and revert) easy.
- The PR workflow runs `npm run verify` and the
  [`pr-previews.yml`](./.github/workflows/pr-previews.yml) workflow renders
  screenshots of any pages your branch changed. Both must be green to merge.
- Dependabot patch/minor updates are auto-approved and auto-merged via
  [`dependabot-automerge.yml`](./.github/workflows/dependabot-automerge.yml).

## Project layout

See [CLAUDE.md](./CLAUDE.md) for an architecture-level tour of the repo —
template hierarchy, data files, scripts, key features, and the Tailwind/CSS
variable theming system. It's the single source of truth for "where does X
live?" questions.

## Security

If you find a security issue, please follow the process in
[SECURITY.md](./SECURITY.md) rather than opening a public issue.
