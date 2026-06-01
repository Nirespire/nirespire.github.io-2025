// scripts/install-git-hooks.js
//
// Enables the repo's shared git hooks by pointing core.hooksPath at the
// version-controlled .githooks directory. Runs automatically through the npm
// "prepare" lifecycle (i.e. after `npm install`), so every clone gets the same
// pre-push checks without any manual setup.
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
