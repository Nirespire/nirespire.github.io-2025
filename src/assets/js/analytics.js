// Thin wrapper around umami's custom-event API.
//
// The umami tracker is only rendered when UMAMI_WEBSITE_ID is set at build time
// (see src/_data/analytics.js), and even then it may be absent at runtime — the
// visitor sends Do Not Track, or a content blocker ate the script. Every call
// site therefore goes through this helper, which does nothing at all when
// window.umami is missing. Analytics must never break the page.
//
// Purely declarative clicks use umami's own data-umami-event attributes instead;
// this exists for the cases that need a value or a conditional (e.g. only count
// a copy that actually succeeded).
// eslint-disable-next-line no-unused-vars -- global, called from other page scripts
function trackEvent(name, data) {
  if (!window.umami || typeof window.umami.track !== 'function') return;
  try {
    window.umami.track(name, data);
  } catch {
    // Swallow: a failed analytics call is never worth a broken interaction.
  }
}
