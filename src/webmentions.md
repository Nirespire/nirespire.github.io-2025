---
layout: layouts/base.njk
title: Webmentions
permalink: /webmentions/
---

## What are Webmentions?

Webmentions are a modern standard for conversations and interactions on the web. When you link to a post on this site from your own website, you can send a notification to let me know. This notification is called a **webmention**.

Depending on the type of link, it can appear as a "like", "repost", or "reply" at the bottom of the post.

## How It Works Here

This site uses [**webmention.io**](https://webmention.io/), a free, open-source service, to receive and manage webmentions. Here’s how you can set it up for your own Eleventy site:

### 1. Sign Up on webmention.io

- Go to [webmention.io](https://webmention.io/) and sign in using your domain.
- The service will ask you to verify ownership by adding `<a>` or `<link>` tags with `rel="me"` to your site, pointing to your profiles on platforms like GitHub or Twitter.

### 2. Add a Discovery Link to Your Site

In your base layout (e.g., `_includes/layouts/base.njk`), add the following link to the `<head>` section, replacing `your-domain.com` with your actual domain:

```html
<link rel="webmention" href="https://webmention.io/your-domain.com/webmention" />
```

webmention.io also supports a legacy `rel="pingback"` discovery link
(`https://webmention.io/your-domain.com/xmlrpc`) for pingback-only senders.
This site doesn't serve one — the `webmention` link alone is enough for
webmention.io to receive mentions — but you can add it too if you want
broader compatibility.

### 3. Fetch Webmentions on a Schedule, Not at Build Time

Fetching from an API on every build would make every deploy depend on a
third-party service. Instead, fetch on a schedule and commit the result as
static data that the build simply reads:

- Go to [**webmention.io/settings**](https://webmention.io/settings) to find your API key (token).
- Store this token as a **secret** in your CI provider (e.g. a GitHub Actions
  repository secret named `WEBMENTION_IO_TOKEN`) — it's consumed by a
  scheduled job, not by the site build itself.
- Write a small script (this site's is `scripts/fetch-webmentions.js`) that
  calls the webmention.io API and writes the approved mentions to a JSON file
  in your data directory (here, `src/_data/webmentions.json`). Run it on a
  schedule (this site uses a daily GitHub Actions workflow,
  `.github/workflows/update-webmentions.yml`) and have it commit the file back
  to the repo when it changes.
- Your Eleventy data file (`src/_data/webmentions.js` here) then just reads
  that committed JSON file off disk at build time — no network call, no token
  needed at build time, and the build never fails because an API was slow or
  down.

Now, any time someone links to your posts, their webmention will be sent to
webmention.io. The next scheduled run picks up the new mention, commits it,
and your next deploy displays it.
