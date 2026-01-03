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

### 2. Add Discovery Links to Your Site

In your base layout (e.g., `_includes/layouts/base.njk`), add the following links to the `<head>` section, replacing `your-domain.com` with your actual domain:

```html
<link rel="webmention" href="https://webmention.io/your-domain.com/webmention" />
<link rel="pingback" href="https://webmention.io/your-domain.com/xmlrpc" />
```

### 3. Fetch Webmentions at Build Time

- Go to [**webmention.io/settings**](https://webmention.io/settings) to find your API key (token).
- Set this token as an environment variable named `WEBMENTION_IO_TOKEN` in your build environment (e.g., in a `.env` file or your hosting provider's settings).
- The data file at `src/_data/webmentions.js` will automatically fetch all approved webmentions from the API during the site build.

Now, any time someone links to your posts, their webmention will be sent to webmention.io. When you rebuild your site, the new interactions will be fetched and displayed.
