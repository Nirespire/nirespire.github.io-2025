# Contributing

Thanks for your interest in improving this site! This is a personal
website/blog, so most changes land via small, focused pull requests —
typo fixes, accessibility improvements, tooling upgrades, and bug fixes
are all welcome. Content (blog posts, opinions) is generally not open to
outside contribution.

## Getting set up

1. Fork and clone the repository.
2. Use Node.js `^22.14.0` (see `.nvmrc` — `nvm use` picks it up).
3. Install dependencies:

   ```bash
   npm install
   ```

   This also installs the git hooks (via the `prepare` script).

4. Install the Playwright browsers once, before running E2E tests:

   ```bash
   npm run test:setup
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   The site serves at `http://localhost:8080` with hot reloading.

## Making changes

- **Never commit directly to `main`.** Branch from `main` using
  `feature/short-description` or `bug/short-description`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for
  commit messages (`fix:`, `feat:`, `docs:`, `chore:`, `test:`, `ci:`).
- Keep PRs focused — one logical change per PR.
- Do not edit generated files (notably
  `src/assets/css/tailwind-built.css`).
- See `CLAUDE.md` for an architecture overview and key constraints.

## Before you push

Run the canonical check suite:

```bash
npm run verify
```

This runs ESLint, the Prettier format check, unit tests, a production
build, and the Playwright E2E suite — exactly what CI runs. The
`pre-push` hook runs the same command automatically, so a green local
run means a green CI run.

Individual checks, if you want faster iteration:

```bash
npm run lint         # ESLint (lint:fix to autofix)
npm run format:check # Prettier (format to write)
npm run test:unit    # Node unit tests
npm test             # Playwright E2E
```

## Opening a pull request

- Fill in the PR template.
- CI (`pr-test.yml`) must pass; a previews workflow will comment on your
  PR with before/after screenshots of any pages you changed.
- PRs from forks can't push preview screenshots — that job degrades
  gracefully and won't block your PR.

## Reporting issues

Use the issue templates. For security problems, please follow
[SECURITY.md](SECURITY.md) instead of opening a public issue.
