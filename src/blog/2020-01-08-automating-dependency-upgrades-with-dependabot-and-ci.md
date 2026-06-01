---
layout: layouts/post.njk
title: "Automating Dependency Upgrades with Dependabot and CI"
date: 2020-01-08
coverImage: /assets/images/githubdependabot.jpg
coverImageAlt: "GitHub Dependabot security alerts illustration"
tags: ["github", "security", "automation", "dependabot", "continuous integration", "devops"]
---

{% from "macros/editorial-note.njk" import editorial_note %}
{% call editorial_note("June 2026") %}
<p>All of the GitHub help links in this post have been updated to their current canonical URLs. GitHub retired the <code>help.github.com</code> domain in favor of <a href="https://docs.github.com/">docs.github.com</a>, and the Dependabot security update, dependency graph, notifications, and branch protection articles have all moved to new paths under that domain.</p>
{% endcall %}

I'm a big proponent of keeping software up to date. Especially in the modern day where it feels like new critical security vulnerabilities are popping up in software every other week.

There's a whole industry, multiple academic fields, and career tracks just focused on this topic of software security. Smart people are always finding ways to make it easier for devs to implement best security practices when writing code.

One of these many best practices is always keeping your dependencies up to date and actively upgrading them when known vulnerabilities are published. In the past, this was a mostly manual process. If a new security vulnerability was published, like a CVE, software maintainers would have to:

* Be aware the CVE was published
* See if it was related to any code they owned
* Find the places where it applied
* Upgrade where necessary
* Make sure the software still works correctly

Let me show you how the above steps have been made easier for us with a tool recently acquired by Github called Dependabot and the principles of Continuous Integration.

### Dependabot and Github

[Dependabot](https://docs.github.com/en/code-security/dependabot) is a product developed to provide automated dependency upgrades to software repositories. It was originally a paid product that was acquired and integrated into Github.com in May of 2019. Since then, every public repo has had access to Dependabot's integrated features out of the box when creating repos on Github.

### The Github Security Tab

The Security tab is the main way that Dependabot and other automated security features on the Github platform are brought to users in their code repos. These features include automated reports of new security vulnerabilities in the repo's dependencies.

If you have your code hosted on Github in a repo that you have contribution rights to, head over to the Security tab and select the option to receive Automated Security Updates.

![](/assets/images/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci/1xXE6Mv5jjflMWpfiHrSDIPg.png)

Note that this feature has some restrictions as to [which types of repos](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates) it is enabled for and which programming languages / [package managers](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/dependency-graph-supported-package-ecosystems) it supports. Most of the projects I work in are public repos that include NPM and Docker as package managers, which are both compatible.

Below is an example of what an alert looks like once Dependabot receives a new CVE publication and identifies that it applies to your repo.

![](/assets/images/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci/1x_4dgK4ls18dixzyhAf8-rA.png)

Once you have this set up, you can even [set up your notifications preferences](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications) to have Github email you when a vulnerability is detected on one of your repos or provide a weekly report of findings.

As far as checking the boxes we mentioned above, for every supported repo you configure this for, here's what we've now got covered:

* Be aware the CVE was published ✅
* See if it was related to any code they owned ✅
* Find the places where it applied ✅
* Upgrade where necessary
* Make sure the software still works correctly

### Automated Dependency Upgrades

When you click on the Security Alert, you get information about the relevant CVE publication as well as an option to have Dependabot automatically generate a Pull Request with the appropriate dependency upgrade.

![](/assets/images/blog/2020-01-08-automating-dependency-upgrades-with-dependabot-and-ci/1xa8o-fT0m47cQxfO_Usjbyg.png)

This option will not always be there and you might have to make the fix manually yourself, but consider yourself being 90% of the way there by knowing the vulnerability is there and being handed the steps to fix it.

That's another item done on our checklist:

* Be aware the CVE was published ☑️
* See if it was related to any code they owned ☑️
* Find the places where it applied ☑️
* Upgrade where necessary ✅
* Make sure the software still works correctly

#### Custom Configurations

Dependabot is [highly configurable](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) if you would like finer control over how it behaves. You can set things like what package management systems to cover, how frequently it should scan your repo, and even assign specific users to address any security issues with dependencies that are identified.

Below is an example `.dependabot/config.yaml` file I included in the repo for my [personal website](https://sanjaynair.me/).

<script src="https://gist.github.com/Nirespire/04838f40753f691feb73a26452ce86d4.js"></script>

### Automated Testing and Continuous Integration

The last item on our automated dependency upgrade checklist is a way to make sure that upgrading our dependencies doesn't break our software. There's always some inherent risk with making upgrades since changing code could imply an unexpected change in functionality. However, this risk is well worth it compared to leaving security vulnerabilities in your dependencies. Moreover, this risk can be mitigated with a few extra best practices and automation steps.

Firstly, if your software and codebase is complex enough, you should always include automated testing. If you're interested in what to include, check out my [article on the different kinds of software testing](https://sanjaynair.me/blog/2018-10-01-the-wide-world-of-software-testing/). If you've written good tests, then a passing test suite should be enough to say the dependency upgrade didn't break anything.

Furthermore, you can adopt some principles of Continuous Integration ([which I also describe in more detail in another article](https://sanjaynair.me/blog/2018-05-06-what-is-cicd/)) and have your tests run automatically when a Pull Request is opened. That way, when Dependabot automatically opens a PR or you do it manually, your CI can run your test suite and the PR is only merged when it passes.

[Github Actions](https://github.com/features/actions) is a way to implement CI, also directly integrated into Github. There's a hole slew of ways you could implement running tests through Actions or even another CI tool, but here's a suggest list of high-level steps to implement in your CI pipeline:

* Trigger your CI when a PR is opened on your repo
* Run tests on branch the PR is for
* Publish the results of the tests to the PR on Github
* (Optional) [Configure branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) to block merging the PR until the CI check has passed

If your codebase or app is just not that complex and manually testing it suffices, the above steps might not even be necessary when making dependency upgrades. For example, my personal website is just a single page static site with basically zero complex functionality. If it builds and renders, I consider my testing complete.

With the above steps in place, we have now checked off our last item:

* Be aware the CVE was published ☑️
* See if it was related to any code they owned ☑️
* Find the places where it applied ☑️
* Upgrade where necessary ☑️
* Make sure the software still works correctly ✅

Keeping your software dependencies is easier now than I think it has ever been. I believe it is every developer's responsibility to be aware of best-practices and take advantage of the constantly improving tools we have freely available at our disposal.

If you have any thoughts about this topic, please leave a comment or reach out on X [@Nirespire](https://x.com/Nirespire).