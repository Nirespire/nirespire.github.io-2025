# Webring host (Cloudflare Worker)

A tiny [Cloudflare Worker](https://developers.cloudflare.com/workers/) that powers a
[webring](https://en.wikipedia.org/wiki/Webring). It holds the member list in
[`ring.json`](./ring.json) and exposes redirect routes so every member site can link
"prev / next / random" without hard-coding each other's URLs.

This directory is **self-contained** and deployed separately from the main site (which
is a static GitHub Pages build). It has its own `package.json`; the site's `npm run verify`
does not touch it.

## Routes

| Route                     | Behavior                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `/next?from=<your-site>`  | 302 to the member after `from` (wraps around).                 |
| `/prev?from=<your-site>`  | 302 to the member before `from` (wraps around).                |
| `/random`                 | 302 to a random member.                                        |
| `/members`                | JSON array of members.                                         |
| `/`                       | Plain-text summary of the routes.                              |

Hosts are matched loosely: scheme, path, and a leading `www.` are ignored, so
`from=https://www.Example.com/blog` matches a member listed as `example.com`. If `from`
is missing or unknown, `/next` sends you to the first member and `/prev` to the last, so
the links never 404.

## Local development

```bash
npm install
npm run dev            # wrangler dev on http://localhost:8787

curl -sI "http://localhost:8787/next?from=https://sanjaynair.me"
curl -s   http://localhost:8787/members
```

## Deploy

Requires a free Cloudflare account.

```bash
npm install
npx wrangler login     # one time
npm run deploy         # publishes to https://sanjaynair-webring.workers.dev
```

To use a custom domain (`webring.sanjaynair.me`) instead of `*.workers.dev`, uncomment the
`routes` line in [`wrangler.toml`](./wrangler.toml) once the domain's DNS is on Cloudflare.

## Managing membership

1. Edit [`ring.json`](./ring.json) — add/remove `{ "name": "...", "url": "https://..." }`.
2. `npm run deploy`.

### Inviting others to join

A new member adds three links to their own site's footer, pointing at this Worker with
their own site as `from`:

```html
<a rel="prev" href="https://sanjaynair-webring.workers.dev/prev?from=https://their-site.com">‹ Prev</a>
<a href="https://sanjaynair-webring.workers.dev/random">Random</a>
<a rel="next" href="https://sanjaynair-webring.workers.dev/next?from=https://their-site.com">Next ›</a>
```

Then add their site to `ring.json` and redeploy.
