---
layout: layouts/post.njk
title: "Getting Started With Open Source"
subtitle: "A beginner's guide to participating in open source"
date: 2019-02-26
coverImage: https://cdn-images-1.medium.com/max/1200/0*bsb4aUtPqQ_6ugFB
coverImageAlt: "Photo by Alina Grubnyak on Unsplash"
tags: ["open source", "github", "software engineering", "contributing"]
---

Did you know that a large part of the software you use everyday was probably built with tools and technologies that are freely available for anyone to download, install, study, and modify?

The operating system running the server that's delivering this webpage to you. The library securing your network traffic to this website. The framework used to build this website. All of these thing were build on or with the help of open source technology.

Software being open source means that not only is all of its source code available to download and view publicly, but its also available for anyone to modify and contribute back to. In fact, a lot of the success of open source software by definition is dependent on volunteers contributing changes and collaboratively making the software better.

Contributing to someone else's codebase might seem like a daunting proposition, but all you really need is a computer connected to the internet and a desire to dive into the deep end of an interesting problem you want to contribute your time to.

In this piece, I hope to shed some light on the specifics of how to approach getting started with participating in open source.

### Step 1: Go to the Source (Code)

There's no "official" platform or methodology used by the open source community to get their work done. That being said, today most of it is done on [Github](https://github.com). There are other git-based alternatives like Gitlab and Bitbucket and even some that are not git-based at all. The Linux Kernel is one of the largest and most active open source projects to date and it is entirely managed through emails of code patches! However, Github is currently the most popular open source platform and is very easy for beginners to get started with.

Github is a place for people to upload their code and have it viewable by the public or privately. Public code repositories or "repos" have many features that make it easy for anyone with some basic knowledge of the software in question to contribute their efforts to making the product better in some way. Not every contribution even needs to be technical in nature. Lots of contributors spend their time moderating dialogs or creating and managing documentation.

A good first step would be to create an account there, if you haven't already, and get familiar with navigating around the site. Check out the [trending](https://github.com/trending) page for a list of public code repos getting a lot of attention on any given day. Click through some of the different tabs on each repo and explore around. Check out the Issues tab to see what sorts of discussions people are having about the problems they are encountering with the software and how the community has responded in discussion threads. The Pull Requests tab typically has examples of how people have contributed to fixing outstanding issues or added new features.

Most of the remaining steps in this piece will deal with navigating around Github, so make sure you're comfortable with it!

### Step 2: Find Something to Contribute To

> "Necessity is the mother of invention"

Sometimes the hardest part about getting into open source is finding a project or initiative that you can connect with or are inspired to contribute to. Sometimes you need to go out and find it, and other times it falls right into your lap as a problem you need to overcome. If you work with code and software a decent amount, chances are you ran into some feature you wished was there or a bug you really wish wasn't there.

One example of this comes from an issue my team ran into at work: We had multiple code repos on Github with many team members all making changes and submitting requests to have those changes be reviewed before they were deployed. We needed a way to concisely display all the open changes that needed review for our code repos. After some googling, I found the [Github PR Dashboard](https://github.com/joeattardi/github-pr-dashboard), which quickly solved our problem. After using it with the team and getting great value from it, we eventually contributed back some features and enhancements for others to use. Check out my [past contributions](https://github.com/joeattardi/github-pr-dashboard/pulls?q=is%3Apr+is%3Aclosed+author%3ANirespire)!

If you don't have an existing desire to fix or improve something already, there are some great resources available to get you pointed in the right direction. [Your First PR](https://yourfirstpr.github.io/) is a project specifically aimed at highlighting opportunities for beginners to contribute to open source projects. There's a [great talk](https://www.youtube.com/watch?v=GWCcZ6fnpn4) from the React NYC conference on how someone used this resource to contribute code to the React JS codebase which is currently one of the most popular web development tools used today.

[Hacktoberfest](https://hacktoberfest.digitalocean.com/) is another great initiative around getting folks into open source. Every year during the month of October, companies who maintain open source projects encourage new contributors to submit changes for the opportunity to win real-world prizes like T-Shirts and stickers. Any organization is open to participate in this event and each has their own guidelines for how to contribute and win prizes. When October rolls around, be sure to keep an eye out for Hacktober opportunities popping up!

### Step 3: Do Your Homework!

Now you have something you want to contribute to, what's next? Well the answer is: it depends. Your open source search might have landed you in a small and simple codebase like some student's side project, or something way more complex and far-reaching like a multi-faceted project backed by hundreds of other contributors and used by multi-billion dollar companies. Both types of repos will have different levels of quality and guidelines on how to contribute.

The best place to start to figure out where to start is the **README**. Any good open source project should have a good README. Good might mean different things to different people, but you can judge that for yourself. Here are some basic things to look for:

* Does it have a concise and informative description of what the project is at a high level and what problem it is trying to solve?
* Does it have instructions on how to set up the project on your machine for development?
* Does it link to any additional documentation that would be helpful to someone trying to make changes to it?

You can find great examples of READMEs in some of the larger open source projects like [React](https://github.com/facebook/react), [VSCode](https://github.com/Microsoft/vscode), [Tensorflow](https://github.com/tensorflow/tensorflow), and more. Use the details in this document to get more familiar with what the repo is all about. Try to follow the getting started steps to clone the code locally and get it up and running.

Next thing to look for is a CONTRIBUTING document. Where the README might include the *what* and *why*, the CONTRIBUTING document tells you the *how*.

> Sometimes these details might be included in a README section, so don't worry if you don't find this specific document.

What are the guidelines that the repo maintainers have put forward for how they want you to make changes to the code? Sometimes it's as simple as opening a pull request and having someone approve and merge it. Larger projects might have stricter protocols that include opening an issue, validating the issue is not a duplicate, opening a pull request, having the pull request pass automated test suites or CI process, and finally being approved by a maintainer. Different projects operate in different ways, so be sure to know how the one you want to contribute to does.

The VSCode project has a great [CONTRIBUTING](https://github.com/facebook/react) document that I've always been directed to as a reference.

Last but certainly not least is the CODE OF CONDUCT document. This document provides the guidelines by which contributors are expected to conduct themselves when collaborating online with the community. Some can be short and sweet and simple say "Don't be a jerk." Others can get into more details about what kind of interactions and behavior are considered inappropriate.

The [Angular project](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md) has a short and sweet code of conduct that get's right to the point very effectively.

### Step 4: Fork and Code

> Disclaimer: These next two sections assume you know the basics of Git including common operations like how to clone, branch, commit, merge, and push.

Now you've found some code you want to contribute to and you're familiar with the process put in place by the maintainers to do so. Next we're going to get into the nitty-gritty details about how to make your changes and actually submit them.

Github has a feature called "forking" that essentially means: take this repo owned by someone else and create a linked copy in my personal Github profile.

![The github-pr-dashboard owned by joeattardi that I forked to my profile](https://cdn-images-1.medium.com/max/800/1*dFemDPFGQUPsWic7W4rdjA.png)

This allows you to create a branch and push code to your forked copy without having write access to the main repo.

So now you should do exactly that. Clone the forked repo to your machine, make whatever changes you planned, and commit to a branch on your forked repo. If applicable, follow any branching, code style, and testing requirements outlined in the contributing guidelines.

### Step 5: Open a Pull Request

Once you're happy with the changes, you can open a Pull Request.

![One way you can open a PR is clicking this button on the Pull requests tab of your forked repo](https://cdn-images-1.medium.com/max/800/1*S-fn57AUwFdoYLNWUezQFw.png)

Make sure that the base branch you are proposing to merge your branch into is the appropriate branch of the *original* repo. That way the maintainers will see your open PR in their list of pull requests.

![](https://cdn-images-1.medium.com/max/800/1*dgmEMn3FuYyrqscJwmRJ5Q.png)

Again, follow the contributing guidelines to decide which is the correct default branch the maintainers want you to merge into and what details are expected in the Pull Request description. Some repos on Github are set up with [Pull Request templates](https://help.github.com/en/articles/creating-a-pull-request-template-for-your-repository) that will pre-fill the description with a basic scaffold you can add details too.

Now just wait to get some feedback from the code owners to see if they think your changes are ready to be merged. Sometimes its a quick thumbs up and other times there might be some back and forth where additional changes might be requested. Remember that this whole process is about teamwork and communication. You the contributor and the maintainer are on the same team, so be sure to respect the **code of conduct** for contributing and don't get discouraged if you don't get it right the first time!

Once that's done, you did it! You have officially contributed to open source!

---

I hope this guide provided some insight into how to get your foot in the door to contributing to open source. I'd love to hear your feedback in the comments or on [Twitter](https://twitter.com/Nirespire).

I'm planning on making a follow up to this piece about how to open source your own projects, so be on the lookout for that.

If you're looking for some other great resources:

* I'm going to plug the [great talk](https://www.youtube.com/watch?v=GWCcZ6fnpn4) I mentioned above again because it has some great examples of PR's being rejected how it was dealt with properly
* [First Timers Only](https://www.firsttimersonly.com/): A resource dedicated to those contributing to Open Source for the first time
* [Your First PR](https://yourfirstpr.github.io/): see above
* The [ReactJS Contributing docs](https://reactjs.org/docs/how-to-contribute.html#your-first-pull-request) have guidelines specifically for directing beginners to appropriate Issues to contribute changes to
* [Kent C Dodds](https://twitter.com/kentcdodds) has a great [video](https://www.youtube.com/watch?v=k6KcaMffxac) on the topic of contributing to open source for beginners