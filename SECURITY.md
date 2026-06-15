# Security Policy

## Supported versions

This is a personal website with a single live deployment (the `main` branch ⇒
<https://sanjaynair.me>). There are no released versions to back-port to —
fixes land on `main` and ship to production via the
[`deploy.yml`](./.github/workflows/deploy.yml) workflow.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems. Instead:

1. Use GitHub's [private vulnerability reporting](https://github.com/Nirespire/nirespire.github.io-2025/security/advisories/new)
   to file a confidential advisory, **or**
2. Email <email@sanjaynair.dev> with the details.

In your report, include:

- A description of the issue and the impact you believe it has.
- Steps to reproduce, or a proof-of-concept if you have one.
- Any suggested remediation.

I'll acknowledge the report within a few days and keep you posted on the fix.
Coordinated disclosure timelines are case-by-case — for most issues on a
static site, a public fix on `main` is the disclosure.

## Scope

In scope:

- This repository's source (Eleventy templates, client-side JS, Node scripts,
  GitHub Actions workflows).
- The live site at <https://sanjaynair.me>.

Out of scope:

- Third-party services this site links to or embeds (Raindrop.io,
  webmention.io, giscus, Ko-fi, GitHub Pages itself, etc.).
- Findings that rely on user-controlled browser configuration or
  social-engineering of the maintainer.
- Volumetric attacks against the live site.

Thanks for helping keep this site safe.
