# Content Audit — 2026-04-27

Scan of all blog posts and standalone pages under `src/` for broken external
links, outdated references, and stray TODOs. Findings below are sorted by
severity. Nothing has been auto-fixed; each item links the source location for
follow-up.

## Methodology

- **Links:** Extracted every `http(s)://` URL from `src/**/*.md` and
  `src/**/*.njk` (269 URLs, 232 after stripping XML namespaces and asset CDNs)
  and probed each with `curl -L --max-time 15`. Status codes other than 2xx/3xx
  were re-verified with a real-browser User-Agent and, where feasible, with
  `WebFetch` to filter out bot-blocking false positives (most 403s from Amazon,
  AWS, MDN, GitHub help, Wikipedia, Twitter, etc., were verified-fine in a
  browser).
- **Outdated content:** Spot-checked the standalone pages (`about.njk`,
  `index.njk`, `uses.njk`, `reads/index.njk`) and grepped for stale phrases
  ("coming soon", "TBD", placeholder emails, `master` branch URLs, `twitter.com`
  references, etc.).
- **TODOs:** Grepped for `TODO|FIXME|XXX|HACK|TBD` in source files. All matches
  are inside blog post prose where "TODO list" is the topic itself; no real
  TODO/FIXME markers remain in templates or content.

## Confirmed broken links (action required)

1. **`https://about.sonarcloud.io/get-started/`** — domain no longer resolves
   (connection refused). SonarCloud rebranded under SonarSource.
   `src/blog/2018-02-25-personal-project-career-fair.md:54`
   Suggested replacement: `https://www.sonarsource.com/products/sonarcloud/`.

2. **`https://gist.github.com/Nirespire/04838f40753f691feb73a26452ce86d4.js`**
   — 404, the gist appears to have been deleted. This is embedded as a
   `<script src="…">` so the post currently renders an empty code block.
   `src/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci.md:74`
   Suggested fix: re-publish the snippet as an inline fenced code block, or
   recreate the gist and update the URL.

3. **`https://github.com/massif-press/compcon/blob/master/src/io/apis/gist.ts`**
   — 404. The repo's default branch was renamed `master` → `main` and the file
   was relocated. The repo itself still exists.
   `src/blog/2020-12-28-dont-always-use-a-database.md:47`
   Suggested replacement: link to the repo root
   (`https://github.com/massif-press/compcon`) or to the current location of
   the gist API code on `main`.

## Outdated references

1. **`src/uses.njk:16` — "GPU: Nvidia RTX 770"** — no such product exists.
   NVIDIA's RTX line starts at the 2060; the 770 is a GTX. Likely a typo for
   "GTX 770" or a newer card.
2. **`src/uses.njk:20` — "1x Samsung 850 500GB NVME SSD"** — the Samsung 850
   Pro/EVO is a SATA drive, not NVMe. The contemporaneous NVMe product is the
   950/960/970 PRO. Either the model number or the interface is wrong.
3. **`src/about.njk:29` — `email@sanjaynair.dev`** — reads like a placeholder
   rather than a real inbox; the same string is hard-coded in
   `src/feed.xml.njk:15` as the Atom feed author email. Worth confirming this
   is intentional (forwarder/alias) and not a leftover stub.
4. **`src/blog/2019-01-10-a-light-introduction-to-cloud-services.md:40`** —
   uses bare `http://sanjaynair.me` (every other in-content reference is
   `https://`). Trivial fix.
5. **Twitter / X branding** — the author's own profile is linked as
   `https://twitter.com/Nirespire` in 7 posts; the canonical link in
   `src/_includes/layouts/base.njk:185` already uses `https://x.com/Nirespire`.
   The twitter.com URLs still 30x-redirect, so these are not broken — just
   inconsistent with the rest of the site. Old embedded tweet permalinks (e.g.
   `twitter.com/dan_abramov/status/...`) should be left alone for historical
   accuracy.

## TODOs / placeholders in content

None in templates or content. All `TODO` matches in `src/blog/**` are part of
the prose of posts whose subject is literally TODO-list workflows
(`2025-08-14-professional-productivity-system.md`,
`2025-10-28-coding-with-copilot-pt2.md`).

## Notes on false positives

The raw checker also reported 403s for ~150 URLs across Amazon, AWS docs,
GitHub help, MDN, Wikipedia, news.ycombinator.com, twitter.com, etc. Spot
checks with a real-browser User-Agent confirmed those resources still load
fine; the 403s are bot-protection responses, not dead pages.
