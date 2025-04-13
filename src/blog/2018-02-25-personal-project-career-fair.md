---
layout: layouts/post.njk
title: "The Personal Project to Win Your Next Career Fair"
subtitle: "Disclaimer: This article is aimed at beginners to software development or those looking to enhance their personal project experience"
date: 2018-02-25
tags: ["career", "software-development", "projects", "students"]
---

*Disclaimer: This article is aimed at **beginners** to software development or those looking to enhance their personal project experience*.*

I do a lot of recruiting for my job, mainly for entry level or interns for software engineering. A common question I always get asked about this from prospective new hires is: "How do I stand out?" The answer for me is simple. Have experience building software and be able to confidently and intelligently talk about it.

I think personal projects are a great way that any beginner with a computer and an internet connection can get relevant software experience while building something cool in the process. I always say that all the necessary knowledge to qualify for an entry level developer position is freely available online. I see far too many people I interview who flat out tell me they have no project experience to speak to or they have a hard time coming up with ideas for personal projects to work on.

So instead of repeating my advice to every second person, I thought I would get it down in writing. Here's my go-to, straightforward, biggest bang for your buck personal project that you can put on your resume, show off the recruiters, and build your software engineering skill-sets. If you have a free weekend before your next career fair, I guarantee this exercise will give you a step up over everyone else. 🔑

### Two words: Personal Website

Yes! Seems a bit cliche, but building yourself a personal website is a simple and effective way to get real experience in the following areas:

1. Front-end web development
2. Continuous integration
3. Deployment to a public cloud-based platform as a service

Let's see how. 🚀

#### 1. Build the Website and Show off the Code!

Start small. Decide on the content of your website. You can go as simple as a single page with your resume/CV information, or go nuts and add a blog, photo gallery, etc.

Once you're ready to build, pick what you're going to use to build it. Ideally pick something you're not so familiar with so that as you build, you learn.

Keep it basic with just HTML/CSS/JS (Here's a [tutorial](https://medium.com/codingthesmartway-com-blog/build-a-real-world-html5-css3-responsive-website-from-scratch-afc079f8bb6b) you can follow for that). Or take it a step further and build it using a popular web framework. Here are a few examples:

* [VueJS](https://vuejs.org/v2/guide/): great for small projects, has a lot of similar concepts to other frameworks.
* [React](https://github.com/facebook/create-react-app): One of the most popular frameworks out there right now.
* [Angular](https://angular.io/guide/quickstart): Still plenty popular in enterprise.

As you build, push everything to a public repo on [Github](https://github.com) (get familiar with Git and version control if you need to because **you need to**). Write a nice README into the repo, outline your development process and giving some simple instructions on how to pull down and run your code.

Next time your talk to a recruiter, you have a new talking point to add to your pitch.

> "Here's my personal website I built using ________ . Here's the code in my public Github repo"

Check that box off ✅

#### 2. Create a Automated CI Pipeline

This is a skill some professional developers don't even have a grasp on and a lot of companies are still trying to figure out how to implement. The basic idea is this: create an automated process to build, test, analyze, and publish results about your code every time you update it in Github. This is what's called a *continuous integration pipeline* ✨*.

What this pipeline can do is pretty endless, but here are a few free tools to easily get started:

* [Travis CI](https://travis-ci.com/getting_started): Easily integrate with your Github repos and have jobs trigger every time you push code. Useful if you need to build or test you code and extensible for when you need to deploy it (read about that further down).
* [CircleCI](https://circleci.com/docs/2.0/hello-world/): Another free CI tool that lets you run automated tasks every time your code updates.
* [SonarCloud](https://about.sonarcloud.io/get-started/): Have your code scanned and analyzed for quality.

> "Here's the continuous integration pipeline that builds, tests, and quality scans my code automatically every time I make update to it in Github."

At this point, the recruiter is already going to remember you.

#### 3. Deploy Your Website to a Public PaaS

So often the last but more crucial step to really finishing a project is skipped. If you don't deploy your website somewhere, then how do you expect to show it off to anyone outside of your localhost?

[Github pages](https://pages.github.com/) is an easy and free way to host a static website through a free, public Github repo. It's where I host [my website](https://nirespire.github.io/)! If you took the HTML/CSS/JS route in step 1, this might be a good choice.

But if you really want to take it to the next level, using one of the many free cloud service provides to host a site is a great way to get the same cool effect while gaining an extra skill under your belt. It can the final punch that really knocks the recruiter's socks off.

Sign up for a free account on [Heroku](https://devcenter.heroku.com/start). They provide support for deploying apps written in all kinds of languages. Go through the steps to manually deploy your app to their platform and enjoy your website, now publicly available for everyone to see!

> "My site is deployed to Heroku. I have it running on one of their free-tier dynos. The site deploys automatically every time I push new code to the repo."

If you've knocked all that out, here are some extra credit steps to try out:

* Hook up your CI pipeline to Heroku so that when you push new code to Github, it will not only run through a build and code scans, but it can then automatically be deployed live without you having to do anything else!
* Buy a custom domain name through [Namecheap](https://www.namecheap.com/) or another domain provider and set it up to route to your hosted website. Now you have a personalized and simple URL to get to your site while learning about setting up DNS entries.

As you go through this process, you will struggle through a lot of new and unfamiliar concepts. But if you really take the time to dive deep into something with a goal in mind, you will come out learning a whole lot and with a pretty cool product to show for it.

I didn't go into detail about how to do any of the steps I mentioned on purpose. Click through some of the links I included. Go through the getting started guides. Make some mistakes and spend a lot of time banging your head against your desk in frustration. At the end of it all, you should feel confident in the skills you executed to make it happen.

My hope is that no up-and-coming developer should ever feel lost when trying to find ways to expand their experience and skill sets. Hope this helps you get started. Good luck.