// scripts/install-git-hooks.js
//
// Applies this repo's local git config. Runs automatically through the npm
// "prepare" lifecycle (i.e. after `npm install`), so every clone gets the same
// setup without any manual steps:
//
//   core.hooksPath    -> .githooks, enabling the shared pre-push checks.
//   rebase.updateRefs -> true, so `git rebase` moves every intermediate branch
//                        ref in a stack rather than only the checked-out one.
//                        This is what makes stacked pull requests workable with
//                        plain git — see "Stacked pull requests" in CLAUDE.md.
//
// Both settings are repo-local (`git config` without --global), so they never
// leak into the user's other repositories.
//
// No-op inside GitHub Actions: CI performs automated commits and pushes (the content-update
// workflows) that must not trigger the local check suite, and CI quality gates
// already run through .github/actions/setup-and-test.

const { execFileSync } = require('child_process');

function inGitHubActions() {
  return process.env.GITHUB_ACTIONS === 'true';
}

function inGitWorkTree() {
  try {
    const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return result.toString().trim() === 'true';
  } catch {
    return false;
  }
}

if (inGitHubActions() || !inGitWorkTree()) {
  process.exit(0);
}

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
  console.log('Git hooks enabled: core.hooksPath -> .githooks');
} catch {
  // Hook setup is best-effort; never fail `npm install` because of it.
}

try {
  execFileSync('git', ['config', 'rebase.updateRefs', 'true'], { stdio: 'ignore' });
  console.log('Stacked-branch rebases enabled: rebase.updateRefs -> true');
} catch {
  // Also best-effort; requires git >= 2.38 but an older git simply stores the
  // key and ignores it, so there is nothing to detect or warn about.
}
