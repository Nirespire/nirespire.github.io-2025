# Sanjay Nair - Personal Website

[![Build and Deploy](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%5E22.14.0-brightgreen)](https://nodejs.org)
[![Playwright Tests](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![Built with 11ty](https://img.shields.io/badge/Built%20with-11ty-black)](https://11ty.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## Overview

This project is my personal website/blog built using modern web development tools and practices:

- **Static Site Generator**: [11ty (Eleventy)](https://www.11ty.dev/) for fast and flexible static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Build Tools**: PostCSS, cssnano, and autoprefixer for CSS optimization
- **Hosting**: GitHub Pages with custom domain configuration
- **Latest Reads**: Integration with Raindrop.io API to display recently read articles
- **AI Assistance**: Developed with the help of AI coding tools, including
  GitHub Copilot and Anthropic's Claude (via Claude Code) for development
  assistance and content generation

## Setup

1. **Prerequisites**
   - Node.js v22.14.0 or higher within the v22 line (see `engines` in
     `package.json` and `.nvmrc`)
   - npm (comes with Node.js)

2. **Install dependencies**  
   ```bash
   npm install
   ```

## Development

- **Start development server**
  ```bash
  npm run dev
  ```
  This will:
  - Build the initial CSS
  - Start the 11ty development server
  - Watch for CSS changes
  - Enable hot reloading

- **Build for production**
  ```bash
  npm run build
  ```
  This creates the production build in the `_site` directory.

- **Other available commands**:
  - `npm run start` - Start 11ty server only
  - `npm run build:css` - Build CSS only
  - `npm run watch:css` - Watch for CSS changes
  - `npm test` - Run the Playwright E2E suite, including the `a11y.spec.ts`
    accessibility scan that runs [axe-core](https://github.com/dequelabs/axe-core)
    against every main page. The accessibility check fails on any `serious` or
    `critical` WCAG 2.1 A/AA violation.
  - `npm run test:unit` - Run Node's built-in test runner over
    `tests/unit/*.test.js` (covers the Node scripts in `scripts/`).
  - `npm run lint` / `npm run lint:fix` - Run ESLint (autofix with `:fix`).
  - `npm run format` / `npm run format:check` - Run Prettier (write / verify).
  - `npm run verify` - The **canonical CI suite**: lint, format check, unit
    tests, production build, and Playwright E2E — all in one command. Both the
    PR and deploy workflows run this same command via
    `.github/actions/setup-and-test`, and so does the `pre-push` git hook
    ([`.githooks/pre-push`](./.githooks/README.md)), so local and CI results
    stay in lock-step.

## Testing & quality gates

- **End-to-end** — Playwright specs in `tests/*.spec.ts` run against the dev
  server on `localhost:8080` across Chromium, Firefox, and WebKit.
- **Accessibility** — `tests/a11y.spec.ts` uses
  [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright)
  and fails on any `serious` or `critical` WCAG 2.1 A/AA violation.
- **Unit** — `tests/unit/*.test.js` covers the Node scripts under `scripts/`
  with Node's built-in test runner.
- **Pre-push hook** — installed automatically by `npm install` (via the
  `prepare` script). Runs `npm run verify` before every push so a green local
  run guarantees a green CI run on the same code.

## Stacked pull requests

When a change depends on another change that hasn't merged yet, stack it: branch
level 2 off level 1 and open its PR against level 1's branch, so each PR's diff
shows only its own increment. Independent changes still get their own branch off
`main` — stacking is only for genuine dependencies.

No extra tooling is needed. `npm install` sets `rebase.updateRefs=true`
repo-locally (via `scripts/install-git-hooks.js`), which makes a single
`git rebase` move **every** branch ref in the stack instead of just the
checked-out one. Every PR workflow runs on stacked PRs too — the `pull_request`
triggers deliberately carry no `branches:` filter.

**Create a stack**

```bash
git checkout main && git pull
git checkout -b feature/a          # level 1
# ...commit...
git checkout -b feature/b          # level 2 — branched off feature/a
# ...commit...
git push -u origin feature/a feature/b
```

Then open PR 1 (`feature/a` → `main`) and PR 2 (`feature/b` → `feature/a`).

**Amend a lower level** — check out the **tip** and rebase from there; every
descendant branch ref moves with it:

```bash
git checkout feature/b             # the tip, not the branch being edited
git rebase -i main                 # mark the target commit `edit`, amend, --continue
git push --force-with-lease origin feature/a feature/b
```

**Sync the whole stack onto an updated `main`** — again from the tip:

```bash
git fetch origin
git checkout feature/b
git rebase origin/main             # rebase.updateRefs moves feature/a too
git push --force-with-lease origin feature/a feature/b
```

**After the bottom PR merges** — merge bottom-up, then rebase the remainder onto
`main` and force-push. The force-push fires a `synchronize` event, which re-runs
CI against the new base; a bare base retarget only fires `edited`, which the
workflows do not listen for:

```bash
git fetch origin
git checkout feature/b
git rebase origin/main
git push --force-with-lease origin feature/b
```

Two repository settings keep this working, both under **Settings → General →
Pull Requests**: **"Allow squash merging" off** (squashing a parent rewrites its
commits and orphans every branch above it) and **"Automatically delete head
branches" on** (so GitHub auto-retargets a child PR's base when its parent
merges).

## Integrations

### Raindrop.io Latest Reads
The site automatically fetches and displays my latest read articles from Raindrop.io:

1. **Setup required environment variables and secrets**:
   - `RAINDROP_TEST_TOKEN` (GitHub Secret): Your Raindrop.io API test token.
   - `RAINDROP_SEARCH_TAG` (GitHub Variable): The tag to filter articles by (e.g., "to-share").

2. **How it works**:
   - GitHub Actions runs daily to fetch the 5 latest articles tagged with `RAINDROP_SEARCH_TAG`.
   - Articles are stored in `src/_data/raindrop.json`
   - Latest reads are displayed on the homepage.
   - Notes authored in Raindrop's note field sync down with each bookmark and render
     as "My note" commentary (markdown supported) on `/reads/`, with a teaser on the
     homepage.
   - The fetch can also be triggered manually via GitHub Actions.
   - The script `scripts/fetch-raindrop.js` handles the fetching.
   - The workflow is defined in `.github/workflows/update-raindrop.reads.yml`.

### Umami Analytics

Privacy-first, cookieless analytics via [umami.is](https://umami.is). The integration is
**scaffolded and switched off**: with no configuration the build emits no tracker tag, no
network calls, and an unchanged Content-Security-Policy — so local dev, Playwright runs,
Lighthouse and PR previews are never counted.

1. **Turn it on** (no code change required):
   - Create a umami account (or stand up a self-hosted instance) and add `sanjaynair.me`
     as a website.
   - Copy the generated **Website ID**.
   - In GitHub → Settings → Secrets and variables → Actions → **Variables**, add
     `UMAMI_WEBSITE_ID` with that value. It is a variable rather than a secret because
     the ID is public by design — it ships in the page HTML.
   - The next deploy renders the tracker.

2. **Optional variables**:
   - `UMAMI_SRC` — full URL of the tracker script. Defaults to
     `https://cloud.umami.is/script.js`; set it to
     `https://your-instance.example.com/script.js` when self-hosting. Must be `https:`;
     anything else disables analytics rather than weakening the CSP.
   - `UMAMI_DOMAINS` — comma-separated hostnames the tracker is allowed to record.
     Defaults to `sanjaynair.me`.

3. **Testing locally**: put the same variables in a root `.env` (gitignored) and run
   `npm run build`. Note that `npm run verify` intentionally does *not* receive them, so
   the test suite always exercises the analytics-off path.

4. **How it works**:
   - `src/_data/analytics.js` reads the environment and is the single source of truth for
     whether analytics is enabled; it also derives the origin appended to the `script-src`
     and `connect-src` CSP directives in `src/_includes/layouts/base.njk`.
   - `.github/workflows/deploy.yml` passes the variables to the deployed build only.
   - Pageviews are tracked automatically. Custom events: share-link clicks
     (`share`, with the network as a property) and the footer GitHub/Ko-fi links use
     umami's declarative `data-umami-event` attributes; the theme toggle
     (`theme-toggle`) and successful "Copy for LLM" copies (`copy-for-llm`) go through
     the `trackEvent()` helper in `src/assets/js/analytics.js`, which is a no-op whenever
     the tracker is absent or blocked.

## Project Structure

- `/src` - Source files
  - `/_includes` - Layout templates
  - `/assets` - CSS and images
  - `/blog` - Markdown blog posts
- `/_site` - Generated static site (not committed)
- `/postcss.config.js` - PostCSS configuration
- `/tailwind.config.js` - Tailwind CSS configuration
