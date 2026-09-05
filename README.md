# Sanjay Nair - Personal Website

[![Build and Deploy](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%5E22.14.0-brightgreen)](https://nodejs.org)
[![Playwright Tests](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![Built with 11ty](https://img.shields.io/badge/Built%20with-11ty-black)](https://11ty.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## Overview

My personal website and blog, built with:

- **Static Site Generator**: [11ty (Eleventy)](https://www.11ty.dev/) for fast and flexible static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4, compiled and minified by the `@tailwindcss/cli`
- **Hosting**: GitHub Pages with custom domain configuration
- **Latest Reads**: Integration with Raindrop.io to display recently read articles
- **AI Assistance**: Developed with the help of AI coding tools, including
  GitHub Copilot and Anthropic's Claude (via Claude Code) for development
  assistance and content generation

## Setup

Node.js within the v22 line, v22.14.0 or higher (see `.nvmrc` and `engines` in
`package.json`), then:

```bash
npm install
```

Beyond dependencies, `npm install` also installs the version-controlled git hooks
and enables `rebase.updateRefs` for this repo (via `scripts/install-git-hooks.js`).

## Development

| Command          | What it does                                                 |
| ---------------- | ------------------------------------------------------------ |
| `npm run dev`    | Build CSS, serve on `localhost:8080`, watch and hot-reload    |
| `npm run build`  | Production build into `_site/`                                |
| `npm test`       | Playwright E2E suite (Chromium, Firefox, WebKit)              |
| `npm run verify` | Everything CI runs, in one command                            |

The full script reference — including the CSS, lint, format, unit-test and
content-sync scripts — is in [`CLAUDE.md`](./CLAUDE.md).

## Quality gates

There is exactly one definition of "the checks": the `verify` script. It runs
lint, format check, unit tests, a production build, and the Playwright E2E suite
(which includes an [axe-core](https://github.com/dequelabs/axe-core)
accessibility scan). The PR and deploy workflows both invoke it through
`.github/actions/setup-and-test`, and the `pre-push` hook runs the same command
locally — so a green local run means a green CI run on the same code. See
[`.githooks/README.md`](./.githooks/README.md) for hook details.

## Configuration

Everything below is set in GitHub → Settings → Secrets and variables → Actions.
Nothing here is required to build or run the site locally; unset values simply
switch the corresponding feature off.

| Name                  | Kind     | Purpose                                                                 |
| --------------------- | -------- | ----------------------------------------------------------------------- |
| `RAINDROP_TEST_TOKEN` | Secret   | Raindrop.io API token used by the daily "latest reads" sync              |
| `RAINDROP_SEARCH_TAG` | Variable | Raindrop tag to pull articles from (e.g. `to-share`)                     |
| `UMAMI_WEBSITE_ID`    | Variable | Turns on analytics. A variable, not a secret — the ID ships in page HTML |
| `UMAMI_SRC`           | Variable | Optional. Tracker script URL when self-hosting; must be `https:`         |
| `UMAMI_DOMAINS`       | Variable | Optional. Comma-separated hostnames the tracker may record               |

Analytics ([umami](https://umami.is), privacy-first and cookieless) is scaffolded
but **switched off by default**: with `UMAMI_WEBSITE_ID` unset the build emits no
tracker tag, no network calls, and an unchanged Content-Security-Policy. Only the
deploy build receives these variables, so local dev, Playwright, Lighthouse and PR
previews are never counted.

## Stacked pull requests

When a change depends on another change that hasn't merged yet, stack it: branch
level 2 off level 1 and open its PR against level 1's branch, so each PR's diff
shows only its own increment. Independent changes still get their own branch off
`main` — stacking is only for genuine dependencies. No extra tooling is needed;
`npm install` enables `rebase.updateRefs` so one rebase moves every branch in the
stack. The commands are in [`CLAUDE.md`](./CLAUDE.md#stacked-pull-requests).

Two repository settings keep this working, both under **Settings → General → Pull
Requests**: **"Allow squash merging" off** (squashing a parent rewrites its commits
and orphans every branch above it) and **"Automatically delete head branches" on**
(so GitHub auto-retargets a child PR's base when its parent merges).

## Dependabot auto-merge

Minor and patch Dependabot PRs are approved automatically and queued to merge
once the checks pass (`.github/workflows/dependabot-automerge.yml`). Queuing them
needs **Settings → General → Pull Requests → "Allow auto-merge"** on, plus a
branch protection rule on `main` requiring the PR checks — GitHub rejects
auto-merge without both. With either missing the workflow logs a warning instead
of failing, and the PRs wait for a manual merge.

## Working in this repo

[`CLAUDE.md`](./CLAUDE.md) is the detailed reference — architecture, features,
conventions, and workflows — and is kept current for coding agents. The two files
divide deliberately: mechanics live in `CLAUDE.md`, orientation and human-only
setup live here. When you add something, document it in one file, not both.
