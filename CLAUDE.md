# CLAUDE.md

Guidance for Claude when working in this repository. This is the single source
of truth for agent context — keep it current. `README.md` is the human-facing
landing page and deliberately stays shallow; see [Documentation](#documentation)
for what belongs where.

## Commands

```bash
npm run dev          # build + serve + watch CSS (concurrently) — use this for development
npm run build        # production build → _site/ (build:css, then eleventy)
npm run start        # 11ty serve only (no CSS build/watch)
npm run build:css    # compile + minify Tailwind → src/assets/css/tailwind-built.css
npm run watch:css    # rebuild the stylesheet on change
npm test             # Playwright E2E tests (Chromium, Firefox, WebKit)
npm run test:ui      # Playwright with interactive UI
npm run test:debug   # Playwright in debug mode
npm run test:setup   # install Playwright browsers + system deps
npm run test:unit    # Node unit tests (node --test, tests/unit/*.test.js)
npm run verify       # full CI suite (lint, format check, unit, build, E2E) — also pre-push
npm run lint         # ESLint (lint:fix to autofix)
npm run format       # Prettier write (format:check to verify only)
```

Content / ops scripts (normally run by GitHub Actions, runnable locally):

```bash
npm run fetch-raindrop         # Sync "latest reads" from Raindrop.io → src/_data/raindrop.json
npm run send-webmentions       # Send webmentions for new posts
npm run compress-images        # Resize/recompress images to the CI size budgets (scripts/image-budgets.js)
npm run capture-previews       # Render screenshots of changed pages (PR previews)
```

## Architecture

11ty (Eleventy) static site generator with Nunjucks templates and Tailwind CSS
(v4, via the `@tailwindcss/cli`). Deployed to GitHub Pages.

- `src/` — source files (templates, content, assets)
- `src/blog/` — markdown blog posts with YAML front matter
- `src/_includes/layouts/` — Nunjucks layout templates (`base.njk`, `post.njk`)
- `src/_includes/components/` — reusable Nunjucks components
- `src/_data/` — data files: `raindrop.json`, `webmentions.json` (+ `webmentions.js`), `hallucinations.json`, `quotes.json`, `analytics.js`
- `src/assets/css/styles.css` — source CSS
- `src/assets/js/` — client-side JS: `theme-switcher.js`, `node-graph.js`, `llm-copy.js`, `scroll-to-top.js`, `dev-console.js`, `analytics.js`
- `scripts/` — Node scripts for GitHub Actions: `fetch-raindrop`, `send-webmentions`, `fetch-webmentions`, `generate-hallucinations`, `capture-previews`, `preview-routes`, `resolve-changed-routes`, `install-git-hooks`, plus `compress-images` / `image-budgets` (image size budgets shared with the unit tests)
- `tests/` — Playwright E2E specs (`*.spec.ts`) and Node unit tests (`tests/unit/*.test.js`)
- `static/` — passthrough-copied to the site root; holds the `CNAME` for the custom domain
- `archive/` — frozen legacy pages served as-is (e.g. `archive/wedding/`)
- `.eleventy.js` — 11ty config (filters, collections, passthrough copy)
- `tailwind.config.js` — Tailwind theme with CSS variable-based colors
- `_site/` — generated output (gitignored)

## Key Features

- **Interactive node-graph background** — animated canvas background in the base
  layout (`src/assets/js/node-graph.js`).
- **LLM copy / share** — `src/assets/js/llm-copy.js` adds copy-to-clipboard and
  one-click "share to Claude / ChatGPT / Gemini" with pre-filled page content.
- **Hallucinations** — generated data feature: `scripts/generate-hallucinations.js`
  produces `src/_data/hallucinations.json` (regenerated via
  `.github/workflows/generate-hallucinations.yml`).
- **Latest reads (Raindrop.io)** — `scripts/fetch-raindrop.js` syncs the 5 most
  recent bookmarks tagged `RAINDROP_SEARCH_TAG` into `src/_data/raindrop.json`,
  run daily (or on manual dispatch) by
  `.github/workflows/update-raindrop.reads.yml`. Needs `RAINDROP_TEST_TOKEN` (a
  repo *secret*) and `RAINDROP_SEARCH_TAG` (a repo *variable*). Raindrop is also
  the source of truth for per-read notes: commentary authored in the Raindrop
  app's note field syncs down as each item's `note` and renders as "My note"
  (markdown, via the `renderMarkdown` filter) on `/reads/` plus a teaser on the
  homepage.
- **Webmentions** — sent/received via `scripts/send-webmentions.js` /
  `fetch-webmentions.js` and `src/_data/webmentions.*`.
- **External links** open in a new tab globally (handled in `base.njk`).
- **Umami analytics** — privacy-first, cookieless. Gated at build time on
  `UMAMI_WEBSITE_ID` (a GitHub repo *variable*, not a secret — the ID is public):
  `src/_data/analytics.js` returns `{ enabled: false }` when it is unset, so no
  tracker tag and no CSP change appear in dev, E2E, Lighthouse, or PR preview
  builds. Only `.github/workflows/deploy.yml`'s build step receives it —
  deliberately not `npm run verify`. Optional `UMAMI_SRC` (defaults to
  `https://cloud.umami.is/script.js`; a non-`https:` value disables analytics
  rather than weakening the CSP) and `UMAMI_DOMAINS` (defaults to
  `sanjaynair.me`). The CSP in `base.njk` appends the umami origin to
  `script-src` + `connect-src` only when enabled. Custom events: declarative
  `data-umami-event` attributes for share links (`share`, with
  `data-umami-event-network`) and the footer links (`fork-on-github`,
  `sponsor-kofi`), plus a `trackEvent()` no-op-safe helper in
  `src/assets/js/analytics.js` used by `theme-switcher.js` (`theme-toggle`) and
  `llm-copy.js` (`copy-for-llm`). To exercise the analytics-on path locally, put
  the same variables in a gitignored root `.env` and run `npm run build`.

## Key Constraints

- **Do not edit** `src/assets/css/tailwind-built.css` — it is generated by the build
- **Node 22** required (see `.nvmrc`; `package.json` engines `^22.14.0`)
- Theme colors use CSS custom properties (`--color-bg-main`, `--color-accent`, etc.) mapped through `tailwind.config.js`
- Light/dark theme switching handled by `src/assets/js/theme-switcher.js`
- **Keep the repo small** — image weight budgets (`scripts/image-budgets.js`)
  cover **both** `src/assets/images` and the wedding archive `archive/wedding/img`;
  bring a violating image within budget with `npm run compress-images`. A hard
  1.5 MB cap on **any** tracked file (`tests/unit/file-size-guard.test.js`) blocks
  stray large binaries — don't commit them; use an external host or release asset.
  Both are enforced via `test:unit` → `npm run verify` → pre-push + CI. The
  history was purged once with `scripts/purge-history.sh`; do not re-introduce
  large blobs.

## Testing

- **E2E** — Playwright specs in `tests/*.spec.ts`, run against the dev server on
  localhost:8080 across Chromium, Firefox, and WebKit.
- **Accessibility** — `tests/a11y.spec.ts` uses `@axe-core/playwright` against
  every main page and fails on any `serious` or `critical` WCAG 2.1 A/AA violation.
- **Unit** — Node's built-in test runner (`node --test`) over `tests/unit/*.test.js`
  covers the scripts (e.g. `resolve-changed-routes`, `generate-hallucinations`) and
  repo-weight guards (`image-budget`, `file-size-guard`).

## CI / Automation

`npm run verify` runs the full check suite — lint, format check, unit tests,
production build, and Playwright E2E — in one command. It is the **single
source of truth** for CI: both the PR workflow and the deploy workflow run it
(via `.github/actions/setup-and-test`), and the `pre-push` hook
(`.githooks/pre-push`) runs the exact same command, so local results never
drift from CI.

```bash
npm run verify       # everything CI runs, in one go (also enforced pre-push)
```

The hook is enabled automatically on `npm install` (via the `prepare` script,
which sets `git config core.hooksPath .githooks`). Individual checks:

1. `npm run lint` — ESLint passes with no errors
2. `npm run format:check` — Prettier format check passes
3. `npm run test:unit` — Node unit tests pass
4. `npm run build` — clean build with no errors
5. `npm test` — all Playwright tests pass

Hook behaviour (details in `.githooks/README.md`): it runs with `CI=true` so
Playwright applies the same settings as CI (a committed `test.only` fails
locally exactly as it would on GitHub); it is a no-op inside GitHub Actions, so
automated content-update pushes are never blocked; and it verifies whatever is
checked out once per `git push` invocation, not once per pushed ref. Bypass for
a single push with `--no-verify` (discouraged).

Workflows:

- `.github/workflows/deploy.yml` — on push to `main`: runs `verify` via
  `setup-and-test`, rebuilds with the analytics variables, deploys to GitHub
  Pages (custom domain from `static/CNAME`).
- `.github/workflows/pr-test.yml` — runs `verify` on every PR via the same
  composite action.
- `.github/workflows/lighthouse.yml` — Lighthouse CI on every PR.
- `.github/workflows/pr-previews.yml` — renders screenshots of changed pages
  (`scripts/capture-previews.js` + `resolve-changed-routes.js`), uploads them as
  assets on a dedicated `pr-previews` GitHub Release (kept out of the git object
  store so they don't bloat the repo), and posts a sticky comment embedding them.
- `.github/workflows/update-raindrop.reads.yml` — daily Raindrop sync.
- `.github/workflows/update-webmentions.yml` — daily webmention fetch.
- `.github/workflows/generate-hallucinations.yml` — regenerates `hallucinations.json`.
- `.github/workflows/dependabot-automerge.yml` — approves minor/patch Dependabot
  PRs and queues them to auto-merge once the checks pass. Auto-merge needs repo
  settings only a human can flip (see [README](./README.md#dependabot-auto-merge));
  without them the job warns rather than failing every Dependabot PR.

The PR workflows carry **no `branches:` filter**, deliberately — every level of a
stacked PR runs the same gates, not just the one based on `main`.

## Git Workflow

- **Never commit directly to `main`** — always create a feature or bug branch first
- Branch naming: `feature/description` or `bug/description`
- Use conventional commit format
- Check current branch with `git branch` before committing
- **Split independent work into independent PRs.** When a proposed plan
  addresses multiple distinct, self-contained issues, open a separate branch
  and pull request for each one rather than bundling them into a single PR —
  do this by default, without the user needing to ask. Prefer the smallest
  reasonable unit of change per PR, and group related changes by category
  (e.g. bug fixes, new features, content changes, chores/tooling) rather than
  mixing categories in one PR. This applies automatically once a plan is
  approved.

### Stacked pull requests

The rule above is about **independent** work and is unchanged. Stacking is for
**dependent** work: a change that cannot stand on its own because it builds on
another change that has not merged yet. Stack it rather than bundling it into
one oversized PR or blocking on the parent.

- **Only stack when there is a genuine dependency.** If the second change would
  make sense against `main` on its own, it is independent work — give it its own
  branch off `main` and its own PR.
- **Branch off the parent, not `main`.** Level 2 is created with
  `git checkout -b feature/b` while `feature/a` is checked out. Normal branch
  naming applies at every level.
- **Set each PR's base to its parent branch.** Only the bottom PR targets
  `main`. Getting this wrong makes the PR's diff include its parent's commits.
- **Restack from the tip.** `rebase.updateRefs` is enabled repo-locally by
  `scripts/install-git-hooks.js`, so a single `git rebase` from the topmost
  branch moves every intermediate branch ref. Never rebase the levels one by
  one. Push the result with `--force-with-lease`.
- **Merge bottom-up, never out of order.** After the bottom PR merges, rebase
  the remainder onto `main` and force-push — the resulting `synchronize` event
  is what re-runs CI against the new base.
- **Never squash-merge a PR that has children.** Squashing rewrites the parent's
  commits and orphans every branch above it.

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

**After the bottom PR merges** — rebase the remainder onto `main` and
force-push. The force-push fires a `synchronize` event, which re-runs CI against
the new base; a bare base retarget only fires `edited`, which the workflows do
not listen for:

```bash
git fetch origin
git checkout feature/b
git rebase origin/main
git push --force-with-lease origin feature/b
```

Two repository settings keep this working, both under **Settings → General →
Pull Requests**: **"Allow squash merging" off** and **"Automatically delete head
branches" on** (so GitHub auto-retargets a child PR's base when its parent
merges).

## Documentation

`CLAUDE.md` and `README.md` divide deliberately. Preserve that split in every
change to either file.

- **`CLAUDE.md` owns the mechanics** — architecture, features, commands,
  conventions, workflows, constraints. New technical detail goes here.
- **`README.md` is the human landing page** — what the project is, how to install
  and run it, the GitHub-UI configuration only a person can do, and the
  repository settings a person must hold in place. Standalone, but shallow.
- **Never document the same fact in both.** When a change touches something
  already described in the other file, update that file and cross-link — do not
  restate it.
- A new feature, integration, script, or workflow goes in `CLAUDE.md`. It earns a
  `README.md` mention only when a human must act outside the codebase (add a
  secret or variable, flip a repo setting, install a prerequisite), and then only
  the minimum needed to perform that action.
- **Keep `CLAUDE.md` dense.** It is loaded into every agent's context, so extend
  it by compressing and folding into an existing section rather than appending
  prose.

## Content Audit Guidance

When running content audits, weekly content reviews, or any link/spelling/placeholder
scans of this repo, **do not flag** the contact email `email@sanjaynair.dev` that
appears in `src/about.njk` ("Get in Touch") and `src/feed.xml.njk` (Atom feed
`<author><email>`). It is the intentional published address; the `.dev` vs
`.me` domain mismatch with the site URL is deliberate and not a bug.

When running repository audits, best-practice reviews, or open-source health
checks, **do not flag** the absence of community health files —
`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
`.github/ISSUE_TEMPLATE/`, and `.github/PULL_REQUEST_TEMPLATE.md`. This is a
personal website, not a community-driven project; the owner has deliberately
decided these files are unnecessary for the level of outside contribution
expected here (a PR adding them was proposed and intentionally closed —
see #263). Do not propose adding them again.
