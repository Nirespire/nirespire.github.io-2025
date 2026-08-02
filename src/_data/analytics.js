// Build-time configuration for umami analytics (https://umami.is).
//
// Analytics is OFF unless UMAMI_WEBSITE_ID is set, which is what keeps the
// tracker out of local dev, Playwright E2E runs, Lighthouse runs and PR preview
// screenshots without any dev/prod branching in the build. Production turns it
// on by setting the GitHub repository variable of the same name (see
// .github/workflows/deploy.yml and the README "Umami Analytics" section).
//
// A umami website ID is public by design — it ships in the page HTML — so it is
// a repository *variable*, not a secret.

// dotenv is a devDependency and only exists to load a local .env; a production
// install without it must not break the build.
try {
  require('dotenv').config();
} catch (_err) {
  // No dotenv available — env vars come from the environment itself.
}

// Umami Cloud. Override with UMAMI_SRC to point at a self-hosted instance.
const DEFAULT_SRC = 'https://cloud.umami.is/script.js';

// Only record traffic served from the real site. This is belt-and-braces on top
// of the build-time gate above: even if a build with the ID set ends up served
// from somewhere else, umami's tracker drops the events client-side.
const DEFAULT_DOMAINS = 'sanjaynair.me';

// Frozen because the same object is handed back on every disabled build.
const DISABLED = Object.freeze({ enabled: false });

function buildUmamiConfig(env = process.env) {
  const websiteId = (env.UMAMI_WEBSITE_ID || '').trim();
  if (!websiteId) return DISABLED;

  const src = (env.UMAMI_SRC || DEFAULT_SRC).trim();

  // The origin is what gets added to the CSP, so a src we cannot parse — or one
  // that would force an insecure source into script-src — disables analytics
  // rather than shipping a broken or weakened policy.
  let origin;
  try {
    const parsed = new URL(src);
    if (parsed.protocol !== 'https:') return DISABLED;
    origin = parsed.origin;
  } catch (_err) {
    return DISABLED;
  }

  return {
    enabled: true,
    src,
    websiteId,
    origin,
    domains: (env.UMAMI_DOMAINS || DEFAULT_DOMAINS).trim(),
  };
}

module.exports = function () {
  return { umami: buildUmamiConfig() };
};

module.exports.buildUmamiConfig = buildUmamiConfig;
module.exports.DEFAULT_SRC = DEFAULT_SRC;
module.exports.DEFAULT_DOMAINS = DEFAULT_DOMAINS;
