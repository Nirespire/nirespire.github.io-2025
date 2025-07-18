---
layout: layouts/post.njk
title: "What is CICD — Concepts in Continuous Integration and Deployment"
date: 2018-05-06
coverImage: https://cdn-images-1.medium.com/max/1200/0*KdQcn48WQsYhVIC2.
coverImageAlt: "Photo by SpaceX on Unsplash"
tags: ["devops", "continuous integration", "continuous deployment", "software engineering"]
---

Modern software moves fast and demands more from developers than ever. Tools and concepts around CICD help developers deliver value faster and more transparently.

You might have heard the term CI, Continuous Integration, CICD, or Continuous delivery. It's a concept that goes by many names but covers the same basic ideas. In short, it lays out some practices to follow in order for the code you write to more quickly and safely get to your users and ultimately generate value.

While this idea might seem best suited for software written for enterprises or some capital venture, I bet that by the end of this article you will find CICD to be a valuable practice whether you're building enterprise applications at scale or simply trying to get your personal project up and running.

### CI : Continuous Integration

The CI part of CICD can be summarized with: you want all parts of what goes into making your application go to the same place and run through the same processes with results published to an easy to access place.

The simplest example of continuous integration is something you might not have even thought of being significant: committing all your application code in a single repository! While that may seem like a no-brainer, having a single place where you "integrate" all your code is the foundation for extending other, more advanced practices.

Once you have all your code and changes going to the same place, you can run some processes on that repository every time something changes. This could include:

* Run automatic code quality scans on it and generate a report of how well your latest changes adhere to good coding practices
* Build the code and run any automated tests that you might have written to make sure your changes didn't break any functionality
* Generate and publish a test coverage report to get an idea of how thorough your automated tests are

These simple additions (made easy with tooling that will be mentioned later) allows you, the developer, to focus on writing the code. Your central repository of code is there to receive your changes while your automated processes can build, test, and scan your code while providing reports.

### CD : Continuous Deployment

Deploying code can be hard. If you've ever been jamming on building a project for a while, shifting your mindset to getting it ready to be deployed can be jarring.

One of the best things you can do to avoid this, much like other things in software, is to automate it! Make it so that your code gets automatically deployed to wherever you or your users can get to it.

There are many freely available tools to let you do this easily. One popular example is [Travis CI](https://travis-ci.com/), which integrates directly with Github. You can configure Travis to automatically run CI tasks like unit tests and push your code to a hosting platform like Heroku every time you push new changes to a branch.

### Examples of CICD in Real Projects

You can find examples of CICD being used all over the place; you just need to know what to look for. Usually, its as easy as finding some colorful badges linked at the top of a Github README.

#### ReactJS

![React CICD badges](https://cdn-images-1.medium.com/max/800/1*XphK15Zv2ANybcW288qN6A.png)

The React JavaScript framework developed and maintained by Facebook has a great example of a robust and high visible CICD pipeline. If you visit its [Github page](https://github.com/facebook/react) and click through the badges displayed at the top of their README, you can get an idea of what type of automated processes they run their codebase through. The Coverage badge links to [Coveralls](https://coveralls.io/), which is a tool to display unit test coverage reports. You can click on the [CircleCI](https://circleci.com/gh/facebook/react) badge which shows a history of all the builds automatically run against Pull Requests submitted by contributors. If you click on a build, you can even see every step in the CI process and how their pipeline is configured.

![CircleCI build steps](https://cdn-images-1.medium.com/max/800/1*efvjxrDcIsW3Vkc2UG-7Rg.png)

#### Homebrew

If you do any sort of development on MacOS, then you've probably at least heard of the popular package manager [Homebrew](https://github.com/Homebrew/brew#contributing). It uses TravisCI with coverage reporting on [codecov.io](https://codecov.io/gh/Homebrew/brew). Check out [Homebrew/brew](https://codecov.io/gh/Homebrew/brew) on Github and scroll down to the Contributing section to find those same familiar badges.

#### TensorFlow

Machine Learning and AI related projects have been rising in popularity for a while now and I think Google's TensorFlow library has had a lot to do with that. TensorFlow is an open source Python framework for building ML and AI applications. Their Github README is decorated with the same familiar badges but with an additional twist.

![TensorFlow build status](https://cdn-images-1.medium.com/max/800/1*sWXSg7ezlnPTAUAjVn2qYw.png)

Since TensorFlow is a cross-platform tool that can run on CPU and GPU hardware, the maintainers have set up multiple pipelines to build and test the tool on different operating system platforms and CPU/GPU configurations. Their pipelines are built using [Jenkins](https://jenkins.io/).

If you're looking for more examples, I would start by looking through what's [popular on Github](https://github.com/search?q=stars:%3E1&s=stars&type=Repositories). Chances are, if there are a lot of users and contributes to the project, there's probably some publicly visible CICD process in place to help the project scale with the number of developers involved with it.

Consider some open source tool or library you might be using right now. See if you can track down if it uses CICD in some way. If not, maybe that's something you could contribute back to the project!

### Next Steps

Now that you hopefully have a better idea of what CICD actually is and how it is woven into the way modern software is built, you can take those considerations into mind when working on your next project. Always give some thought to what processes could be automated when changes are introduced. How can information about the project be more transparently communicated to the team working on it? How can the project more efficiently be delivered to its users?

I encourage you to pick up a CICD tool and introduce it to one of your existing projects or use it when you're spinning up that next personal project.

#### Tools:

* [TravisCI](https://travis-ci.com/getting_started)
* [CircleCI](https://circleci.com/)
* [GoCD](https://www.gocd.org/)
* [Coveralls](https://coveralls.io/)
* [SonarQube](https://www.sonarqube.org/)