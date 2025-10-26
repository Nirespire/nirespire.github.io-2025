---
layout: layouts/post.njk
title: "Why I Think Software Should be Rewritten Every Three Years"
subtitle: "Fighting the inevitable pains of legacy code"
date: 2019-06-11
coverImage: https://cdn-images-1.medium.com/max/1200/0*7YYtfxLllj4Bz1B4
coverImageAlt: "Photo by Leanna Cushman on Unsplash"
tags: ["software engineering", "architecture", "legacy code", "technical debt"]
---

One of the most common tropes of working as a software engineer I've noticed is the constant lambasting of **old code**. Anything older than a few years was never described by my peers as anything close to elegant, easy to read, maintainable, or generally pleasurable to work with.

There are many existing posts out there (at least [one I've read](https://medium.com/@way/rage-against-the-codebase-programmers-and-negativity-d7d6b968e5f3)) that outline how to emotionally deal with the inevitable headaches of old code. It came off as something to be coped with, not something that could be solved.

This got me thinking about a few things:

* Is the reduction of maintainability of a codebase over time inevitable?
* What causes this kind of code to rot in the real world?
* How do we fight it?

### Codebase Maintainability Over Time

I recently read a [post by Martin Fowler](https://martinfowler.com/articles/is-quality-worth-cost.html) where writes about the tradeoff between the cost to produce and resulting quality of software being developed. He refers to a phenomenon where, over time, a codebase gets populated with increasing levels of **cruft**, which he defined as: "the difference between the current code and how it would ideally be." When you dive into a codebase, you probably want as little as possible getting in your way of understanding what that code is doing. Cruft is what you're seeing when you open up that 2000 line file, written by 10 people you've never met, over a period of 5 years.

Fowler argues that it's in the best interest of the engineers as well as business partners that code quality and minimization of cruft be at the forefront of thought when making changes to software. He states that taking the extra time to write quality code in the present has compound benefits for the future. Internal quality means it's easier to modify software, which means faster delivery of features.

Your users don't care about software quality, they only care about the velocity of new features being delivered and their quality. Taking extra time now to deliver a feature with quality code now only helps deliver the next feature in less time. Conversely, taking less time to deliver a feature faster with less quality only hurts your ability to deliver the next feature faster due to the addition of more cruft.

Yet the point he was making was somewhat softened when he noted:

> …even the finest teams will inevitably create some cruft as they work.

So maybe it's fair to say software quality is doomed to decline over time? Perhaps that decline might be slower or faster depending on the level of effort put into minimizing it. But it will happen.

### Code Isn't the Only Thing That's Changing

When we think about the reasons why changing software becomes harder over time, we might only consider the increasing number of lines of code or bad code practices slowly creeping their way in. But there is a lot more changing, not only in the code, but *all around* it. This only adds to the struggles holding teams back from keeping the software running and maintained.

#### Business requirements

It's the common trope you might be familiar with: "The requirements have changed…again!" As much as we'd like to think we can either properly spec a piece of software's requirements ahead of time, or work with "agile" methods to keep your requirements at pace with changing feedback and expectations, ultimately the needs your software serves typically changes more with each passing iteration of development.

I'm no structural engineer or architect, but I consider the reasons why builders or city planners would decide to demolish and rebuild a building rather than continuously enhance it. Obviously, physical materials will degrade overtime unlike code. But what if the requirements of a building changed like the requirements of software? Suddenly the location of the structure could change between weeks, like the deployment environment of software. The patrons of the building could start to expect different things from it, like the changing expectations of software users. Where the building was designed to withstand blizzards, suddenly earthquakes are what's happening day to day. At what point do we say it's time to demolish and start over?

This is probably a massive generalization when discussing software depending on the type of business or industry your software is serving. However, I still feel it valuable to acknowledge the correlation of how quickly your requirements change to how fundamentally irrelevant your codebase becomes over time.

#### Software dependencies

Most software is built with other software that's just as prone to change as anything else we're discussing here. Libraries, frameworks, design paradigms, and certainly entire programming languages come and go with the rapid pace of the software engineering landscape. The longer that a single piece of software stays stagnant in this landscape, the more likely it is to become fundamentally detached with it.

This could mean that your software harbors critical security vulnerabilities patched in more modern iterations of its included frameworks or libraries (Apache Struts comes to mind). The developer experience might suffer from working with these dependencies due to waning support for tools. Solving the software problem becomes an issue of keeping the solution in bounds with the dependencies and tools at hand rather than considering all the possibilities for solving the problem most effectively and efficiently.

#### Team members and maintainers

It's increasingly common to see folks in the software engineering world to not stick around the same job for more than a couple of years. Employers are increasingly acknowledging the value of technical problem solvers with a wide breadth of experience and even encourage them to be flexible in their career paths with respect to their place of employment. This is clearly a positive for the individual, who has the increased agency to jump between companies and teams and contribute their widening breadth of knowledge to solving hard problems.

What this trend results in is teams with increased turnover, meaning more pains to get people up to speed with existing systems. Conversely, this also leads to teams staffed with problem solvers that can pull from their previous experience and look at solving problems from diverse lenses. Why not allow these fresh minds to lay the foundation differently with a fresh set of eyes? We should not discount the clear win of having a fluid set of minds working the problem just because something that "works" is already in production.

What happens when the codebase you're working with was started and worked on by people you have never met? What about when every person on the team inherited the code and had no say in its initial creation? This to me is another inevitable and difficult inflection point where teams need to take a hard look at why they shouldn't have the freedom to just start over.

### A Clean Start

![Let your code be reborn from the ashes anew](https://cdn-images-1.medium.com/max/800/1*pp9ITHW9tW79mxsqk3BOCw.gif)

Given all of my previous points, here's what I'm proposing: Software, given enough time, will reach an inflection point where the cost to maintain the existing solution far exceeds the cost to rewrite it. Here are some potential reasons why:

* Business requirements the software was originally built for have moved far enough away from the original requirements.
* The external dependencies of the software have changed beyond the point of simply upgrading or retrofitting.
* The people working on the software had no skin in the game when it was originally being created.
* The design or architecture does not directly cater to the current problem being solved.

If you see any one of these factors becoming increasingly apparent over time, you need to make a decision as to when it's appropriate to start over.

I picked the three year timeframe in the title of this piece as a rule-of-thumb based on my experience. It's around this point where someone working on a project of this age starts to encounter friction in one of the above categories. This could vary wildly between problem domains, but that's the number I thought was right for what I know.

### Reaching a Steady State

After considering this you might say, "if you're rewriting everything every three years, then at some point you going to be doing nothing but rewriting stuff!"

Certainly, the tradeoff between doing a rewrite and just continuing to change the existing codebase will cross at some point. As you see the variables around your software declining, like new feature requests, so should you see the need for a rewrite of the software becoming less necessary.

As another general rule-of-thumb: **Stop rewriting when external variability has declined to the point where the following are more or less at a steady state between periods where a rewrite is considered**. Some factors to consider after a three year time period might include:

* The same people/team are still working on the software.
* No new requirements are coming in that fit the profile of the existing software. If the requirements are different enough, you're probably going to write something new anyway.
* Any refactor or update to software libraries or frameworks provide no additional internal value to the developers or external value to the users or business.
* Rewriting your software it is direct conflict with the best interest of your users (I can't see anyone clambering for a full rewrite of airplane autopilot or nuclear reactor control system software every year).

I'm sure these are plenty of projects that are totally outside the realm of ever needing a complete rewrite. But be careful not to lump them in with other projects that don't meet these criteria simply because they "work in production now."

### Conclusions

> "Change is the only constant in life"

> -Heraclitus

Just as time inevitably passes, so do the factors around what ultimately made your software what it is. Requirements, tools, and people are in constant flux over time which inevitably leads to cruft in not only lines of code, but also in the relationships between your software, its users, and its maintainers.

I want us to critically question the apparent inevitability of legacy code being a negative experience. Once we come to terms with the cause of this problem, I want us to confidently say we know how to combat it. We should not be afraid to start with a clean slate more often than staying safe in the status quo.

---

This is my first crack at an opinion piece, so I'd love to hear any feedback including counterarguments or supporting experiences. Everything said here was my own opinion and not reflective of any person or entity I've worked with. Please bring your own thoughts to this discussion here or on Twitter [@Nirespire](https://twitter.com/Nirespire).