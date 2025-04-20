---
layout: layouts/post.njk
title: "How to Open Source Your Code"
subtitle: "In 6 steps"
date: 2019-04-01
tags: ["open source", "software engineering", "github", "documentation"]
---

![Photo by Alex Holyoake on Unsplash](https://cdn-images-1.medium.com/max/1200/0*H-wqTe7TLuy5KQgB)

In my [last post](https://sanjaynair.me/blog/2019-02-26-getting-started-with-opensource/), I outlined what open source is and presented some steps for how to get involved. Every open source project available today, even those with many thousands of contributors, all started with at least one person who had the drive to make what they were creating available for other to freely use and contribute to.

If you fall into this category of people but don't have a good idea of how to get started, then this is hopefully a good place for you to start. We will cover some of the high level concepts and steps you can take to get your project ready for the world of open source.

> While these are my top picks for how to properly prepare a project to be open sourced, this list is by no means exhaustive. The best source for open source is always the community at large. Everything said here is based on my experience participating in open source as well as learning from others maintaining their own projects. After reading, I encourage you to go find one of the many amazing open source projects out there and follow their examples. There are some links at the end to help you get started!

### Step 0: Identify the Opportunity

This is more of an optional step **_but_**, in my opinion, since open source is all about adding value through collaboration, your first step might be to consider some things about your code.

* Is this something that you got value out of?
* Is this something that you think others would get value out of?
* Do you think more people contributing would improve the quality of what is being provided by the code?

Big disclaimer: these are not questions that necessarily need a "yes" answer to move forward. The answers will mean more or less to your situation. Whether you're open sourcing your code to get a lot of contributors involved quickly, or just as an exercise to become more proficient in the relevant skills. Just consider how the answers might affect your results.

### Step 1: Prep the Code

The baseline requirement for a project to be viable in the open source landscape comes down to the thing that makes open source a concept in the first place: enabling other people to be productive using, modifying, and improving its code. With that obvious requirement, you need to ask yourself a simple question:

> If I handed someone this project right now, how hard would it be for them to read the code, run the code, and change the code?

You could follow up on that with:

* Are there any tools that the contributor should install or be familiar with before getting started?
* Does it matter what platform the person is working on (Windows vs Mac vs Linux)?
* How can the person be confident that making a change in one place won't break something else in the code, i.e are there any tests?
* Is the code well organized and easy to follow?

All of these points are really to say that if you're going to be putting something out there with the intention of others picking it up and working on it, you should take the necessary steps to set them up with a quality product. There are many books out there that outline some of the best practices for writing good code ([Clean Code](https://www.oreilly.com/library/view/clean-code/9780136083238/) comes to mind). You might consider handing off your project to someone with technical knowledge but who's not familiar with it and get their feedback for how easy some basic development task was to complete.

### Step 2: README

The **README** might be the most important document included with a project when it comes to providing a newcomer with the summary of what your project is all about. In addition to a brief summary of what the the code is trying to accomplish, the README is the first place you can answer some of the questions listed above. Someone stumbling on your code should be able to start by going through the README and end by at least being able to understand what the code can do, download it to their machine, and run it.

Try to find some examples of cool README documents from some of the prominent open source projects on Github. As flashy as they are with badges and logos, remember that they all answer the basic questions listed above in some way.

### Step 3: The License

The open source **license** is probably the second most important document you want to include in your project before releasing it out into the wild. In short, since you're putting your code out there for anyone to see, you probably want to have some control over what people can and can't do with it once they have it. For example:

* Are you OK with someone using it to run their business?
* Are you OK with someone modifying it and selling it as their own, new product?
* Does the entity using your code need to explicitly give your credit when using any original or modified version of your code?

The good news is, so much of the heavy legal work has already been done by other smart folks on the internet. Github does an amazing job with their [helpful documentation](https://help.github.com/en/articles/licensing-a-repository) as well as reminders when you create a public repo without a license to make sure you include the right one for your needs.

![You can drop in a license right when you create the repo on Github!](https://cdn-images-1.medium.com/max/800/1*6N_arUB-mpf6Hgd1SjChcQ.png)

### **Step 4: How to Contribute**

A set of contributing guidelines is the next important piece of documentation you should include, usually in the form of a **CONTRIBUTING** document much like the README. The CONTRIBUTING document or set of documents serve to inform the prospective newcomer to your code on how you as a maintainer want them to go about making contributions.

A CONTRIBUTING doc serves to answers some questions like:

* What are some ways I can contribute in the first place? Are you, the maintainer, just looking for bug fixes or new features?
* What's the first thing I should so when I want to make a change to this code?
* Should I create an issue or just fork and pull request?
* Are there any branching conventions I should follow?
* Should I write my commit messages in a certain way?
* Who are the maintainers aka. who's in charge here?
* Do you follow any coding styleguides?

Here's an example of a basic CONTRIBUTING document I came up with:

```
Hello! Thanks for contributing to <Insert Awesome Project Here>

# How to Contribute
Step 1. Please open an Issue with a description of what you're trying to add/fix/change

Step 2. Fork and create a feature branch in the format <some-description>/<your issue number>

Step 3. Please squash all your commits into one with a good commit message before opening a pull request

Step 4. Open a pull request, reference your original issue, and provide a concise description of how your changes fixed the issue

Step 5. Your PR requires 2 approvals from maintainers before it can be merged.
```

You can go as wild as you want with it. Just like the code, all the documentation is also open source, so it can also evolve and improve along with your project! Check out Github's [documentation](https://help.github.com/en/articles/setting-guidelines-for-repository-contributors) for some **_amazing_** examples of contributing documents in the wild. I particularly like the short and sweet [Open Government Contributing guidelines document](https://github.com/opengovernment/opengovernment/blob/master/CONTRIBUTING.md).

### Step 5: Community

Open source is at its best when you have a strong community behind it. Whether is just you and a couple of maintainers, or a project that you foresee spanning hundreds of contributors, it's important to set a precedent for the spirit of collaboration you want to establish around your projects.

While documentation like the README and CONTRIBUTING guidelines could also touch on this subject in some ways, the **CODE OF CONDUCT** is where you should be most direct about how you expect people to behave and interact with each other.

People might not be explicitly asking the questions that the code of conduct document seeks to answer, but it can always be there to set a baseline standard of conduct if issues were to ever arise. Some of these implicit questions might be:

* Are contributors expected to converse with each other as if they were in a professional setting like an office, or is the tone more informal?
* What are some of the core values someone should adhere to when approaching interpersonal interactions within the community?
* What should someone do if they notice someone behaving inappropriately within the community?
* What, if any action, would be taken if someone were to break the etiquette rules?

Here's an example of the simplest code of conduct document I thought up.

```
Code of Conduct

- Be kind
- Be welcoming
- Don't be a jerk
```

Feel free to copy if you find it helpful!

But in all seriousness, there are lots of great examples available to reference just like all the other documents. One example is Facebook's [Open Source Code of Conduct](https://code.fb.com/codeofconduct/) which they link to in all of their open source project repos.

### Step 6: Consistency

Making sure your open source project is successful and productive depends, just like any other project, on you giving it the appropriate amount of time it needs to succeed. This could include simple actions like regularly updating dependencies on major releases, or going through all the open Issues and Pull Requests at least once a week. It's always better to have someone come across your repo and see commits and merged PR's that are a few days old rather than a few weeks or months old.

For larger projects with many users and contributors, it might mean making sure you're being responsive to emails or messages. A common practice among larger open source projects is to have a public instant messaging platform like Slack available for anyone with questions or suggestions to join the community discussion about the project.

### Further Reading

I highly recommend [Github's entire knowledge base](https://help.github.com/en#dotcom) for how to do open source right, specifically their section on [Setting up your project for healthy contributions](https://help.github.com/en/articles/setting-up-your-project-for-healthy-contributions) which I think is most relevant to the content in this piece.

Below are some of my favorite example open source projects which have great, real-world examples of everything I mentioned above and more:

* [React](https://github.com/facebook/react)
* [Prometheus](https://github.com/prometheus/prometheus)
* [Tensorflow](https://github.com/tensorflow/tensorflow)
* [VS Code](https://github.com/Microsoft/vscode)
* [Concourse CI](https://github.com/concourse/concourse)

The [trending page on Github](https://github.com/trending) is also a great go-to for fresh, quality, open source content.

I really hope this helps you get started with open sourcing your own projects. Let me know about your experiences on [Twitter](https://twitter.com/Nirespire).

Good luck and have fun!