# Content Audit — May 2026

Audit scope: all blog posts under `src/blog/` and the top-level pages
(`src/about.njk`, `src/index.njk`, `src/uses.njk`, `src/hallucination.njk`,
`src/webmentions.md`, `src/404.njk`, `src/reads/index.njk`, `src/blog/index.njk`).

Method: built `_site/` with `npm run build`, ran `lychee 0.24.1` over the
generated HTML with both strict (`--accept 200,204,206,301,302,303,307,308`)
and tolerant (`--accept ...,403`) configurations, plus targeted `grep` passes
for TODO/FIXME/placeholder markers and dated language.

---

## 1. Broken external links (must-fix)

| File | Line | Issue |
|---|---|---|
| `src/blog/2019-01-10-a-light-introduction-to-cloud-services.md` | 117 | `[Amazon Simple Notification Service](http://Simple%20Notification%20Service)` — placeholder URL was never replaced. lychee error: `invalid international domain name`. Should be `https://aws.amazon.com/sns/`. |
| `src/blog/2019-01-10-a-light-introduction-to-cloud-services.md` | 134 | `[Google Dialogflow](https://cloud.google.com/dataflow/)` — link text is Dialogflow but the URL points at Dataflow. Should be `https://cloud.google.com/dialogflow`. |
| `src/blog/2018-02-25-personal-project-career-fair.md` | 285 (rendered) | `https://about.sonarcloud.io/get-started/` — connection failed. SonarCloud was rebranded; the equivalent landing page is now under `https://www.sonarsource.com/products/sonarcloud/` (or `https://sonarcloud.io/`). |
| `src/blog/2020-12-28-dont-always-use-a-database.md` | 47 | `https://github.com/massif-press/compcon/blob/master/src/io/apis/gist.ts` — returns **404**. Verified against the live `master` branch: `src/io/apis/` no longer contains `gist.ts` (only `account.ts`, `apiErrors.ts`, `idempotency.ts`). The file was removed/renamed upstream. |

## 2. Outdated references / link rot (recommend updating)

These all still resolve (often via redirect) but point at deprecated brands,
old domains, or paths that have moved. The post text is largely unaffected;
just the URL targets.

| File | Old URL | Current canonical |
|---|---|---|
| `src/blog/2019-05-21-moving-to-gatsbyjs.md` | `https://nuxtjs.org/` | `https://nuxt.com/` |
| `src/blog/2019-05-21-moving-to-gatsbyjs.md` | `https://www.gatsbyjs.org/...` (3 links) | `https://www.gatsbyjs.com/...` |
| `src/blog/2019-02-26-getting-started-with-opensource.md` | `https://reactjs.org/docs/how-to-contribute.html...` | `https://react.dev/community/contributor-covenant-code-of-conduct` (or the current contribution guide) |
| `src/blog/2019-02-26-getting-started-with-opensource.md` | `https://yourfirstpr.github.io/` | Project archived; `https://www.firsttimersonly.com/` is the spiritual successor. |
| `src/blog/2018-02-25-personal-project-career-fair.md`, `src/blog/2018-05-06-what-is-cicd.md` | `https://travis-ci.com/...` | Travis CI is largely abandoned; consider linking GitHub Actions or another current CI example. |
| `src/blog/2019-01-10-a-light-introduction-to-cloud-services.md` | `https://zeit.co/now` | Zeit rebranded to Vercel — `https://vercel.com/`. |
| `src/blog/2019-05-21-moving-to-gatsbyjs.md` | `https://www.staticgen.com/` | Site is no longer maintained by Netlify; consider `https://jamstack.org/generators/` or removing the link. |
| `src/blog/2019-04-01-how-to-open-source-your-code.md` | `https://code.fb.com/codeofconduct/` | Now `https://engineering.fb.com/`; the code-of-conduct doc lives in individual GitHub repos. |
| `src/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci.md` | `https://dependabot.com/`, `https://dependabot.com/blog/hello-github/`, `https://dependabot.com/docs/config-file/` | Dependabot was absorbed into GitHub; canonical docs are at `https://docs.github.com/en/code-security/dependabot`. |
| `src/blog/2020-02-25-tracing-and-observability.md` | `https://opentracing.io/`, `https://opentracing.io/specification/` | OpenTracing was merged into OpenTelemetry — `https://opentelemetry.io/`. |
| `src/blog/2018-08-27-the-wide-world-of-databases.md` | `http://www-03.ibm.com/ibm/history/ibm100/us/en/icons/reldb/` | IBM retired the `www-03` host. Equivalent content: `https://www.ibm.com/history/relational-database` (or remove). |
| `src/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci.md` (front matter `coverImageAlt`) | `https://scotch.io/...` | Scotch.io was acquired and shut down by DigitalOcean. The asset attribution is now dangling — consider replacing the cover image or removing the source URL. |

### Links that redirect (low priority cleanup)

`lychee` flagged 19 redirects, mostly trailing-slash normalisation on
`cloud.google.com/<product>/` → `cloud.google.com/<product>`. One is
substantive enough to call out:

- `src/blog/2019-01-10-a-light-introduction-to-cloud-services.md` →
  `https://cloud.google.com/solutions/processing-logs-at-scale-using-dataflow`
  now redirects through to `https://cloud.google.com/logging/docs/log-analytics`,
  which is a different topic. The original article is gone; remove or replace
  the link.
- `src/blog/2019-05-21-moving-to-gatsbyjs.md` references
  `https://github.com/Nirespire/nirespire.github.io`, which 301s to
  `nirespire.github.io-2024`. Worth pinning to a stable revision now that the
  current repo is `nirespire.github.io-2025`.

## 3. TODOs / placeholders / draft markers in content

A `grep -niE 'todo|fixme|xxx|hack:|tbd|placeholder|lorem ipsum'` sweep over the
content directories returned **no actual development markers**. Every "TODO"
hit is the noun "todo list" used as subject matter in the productivity posts
(`2025-08-14-professional-productivity-system.md`,
`2025-10-28-coding-with-copilot-pt2.md`). The single `placeholder=` hit is the
search-input attribute in `src/blog/index.njk`, which is intentional.

The malformed `http://Simple%20Notification%20Service` URL in §1 is
effectively a placeholder that survived publication, but it's already covered
above.

## 4. Outdated factual references on top-level pages

| File | Line | Note |
|---|---|---|
| `src/uses.njk` | 16 | `GPU: Nvidia RTX 770` — there is no such SKU. Likely meant **GTX 770** (older card) or an RTX-series card (e.g., RTX 3070/4070). Worth verifying with the actual hardware. |
| `src/uses.njk` | 20 | `1x Samsung 850 500GB NVME SSD` — the Samsung 850 EVO/PRO line is **SATA**, not NVMe. Likely meant Samsung 950/960/970/980 (NVMe) or it's a SATA SSD mislabelled. |
| `src/about.njk` | 11–17 | Bio is generic ("Software Engineering Leader"). The post `2025-06-23-minecraft-devops.md` ("leading a portfolio of Cloud Platform Engineering teams for the better part of 3 years") is more specific — consider whether the about page should reflect that current role or stay deliberately generic. |
| `src/blog/2025-04-20-working-with-sanjay.md` | 57 | Typo: `I currently work fully fully remote.` — duplicate "fully". |

## 5. Domain consistency

The site author email is `email@sanjaynair.dev` (`src/about.njk:29`,
`src/_includes/layouts/base.njk:186`) but every canonical/feed/og:url and
every self-link from older blog posts uses `https://sanjaynair.me/`:

- `src/feed.xml.njk` (lines 9, 10, 12, 18)
- `src/sitemap.xml.njk:8`
- `src/robots.txt:3`
- `src/_includes/layouts/base.njk` (lines 18, 21, 28, 34, 42, 54, 61, 64)
- `src/_includes/layouts/post.njk` (lines 10, 96, 104, 111)
- 8 blog posts containing `https://sanjaynair.me/...` self-references

If `sanjaynair.dev` is now the production domain, the canonical host in
`feed.xml.njk`, `sitemap.xml.njk`, `robots.txt`, the base/post layouts, and
the webmention endpoint (`https://webmention.io/sanjaynair.me/webmention`)
all need updating, and the historical blog posts should either be
migrated to `sanjaynair.dev` URLs or left as-is intentionally. If both
domains are live and `sanjaynair.me` is canonical, no change needed — but
this inconsistency is worth confirming.

## 6. Test environment notes

- `npm run check-links` requires `lychee`. The repo's
  `scripts/check-links.js` tries `sudo mv` on Linux, which fails in
  rootless/CI environments. A non-`sudo` install path would make it more
  portable.
- The `.lycheeignore` excludes LinkedIn, Twitter/X, and any `*staging.*` /
  `*dev.*` / `*test.*` host patterns — the latter would mask issues with
  `cloud.google.com/dev/...` or similar legitimate URLs if any ever
  appear. Worth tightening if false negatives become a concern.

---

## Summary

- **4 hard-broken links** in 3 posts (§1).
- **~12 link-rot updates** worth doing as a batch (§2).
- **No leftover dev TODOs** in content (§3).
- **~4 factual / typographic items** on top-level pages (§4).
- **1 domain-consistency question** (`sanjaynair.me` vs `sanjaynair.dev`, §5)
  that's tooling- and SEO-relevant.

This PR contains the audit only; it does not modify any post content. Fixes
should be split into smaller PRs grouped by theme so each can be reviewed in
isolation.
