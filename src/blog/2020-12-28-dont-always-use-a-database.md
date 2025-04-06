---
layout: layouts/base.njk
title: "Don't (always) use a Database"
subtitle: "A software storage solution might be less obvious than you think"
date: 2020-12-28
tags: ["software engineering", "databases", "architecture"]
---

# Don't (always) use a Database

I was recently having a design conversation with some engineers on my product team. We were discussing the implementation of a feature that dealt with saving user settings on a web app. When thinking about the concept of persistent storage, my brain automatically tended to go straight to the obvious tool that provided programmatic persistent storage: a database.

Databases generally provide a flexible paradigm for storing different formats of data and standard APIs to read and write that data programmatically.

However, the more we discussed and the more I thought about it, this was a case where storage locally on the browser was more than enough. We didn't care if the user could access their settings from multiple sessions or devices. It was just a few toggles that would typically be used within the same browser and specific to a single user. Why bother having to setup and maintain a database, adding complexity to the architecture and more cost of ownership?

So problem solved, right? Well, yes, but the next question I asked myself after the fact was: what other places had I been defaulting to using a database where it really wasn't the best option?

"Best" is very subjective and could mean a lot of things. My main consideration here is how cost effective (from a time and money perspective) is it to implement your desired feature using the given storage solution?

Here are the two basic criteria I could infer when asking myself, could this service provide the same functionality as a database?

1. There is a freely available method to store and retrieve some amount of data to and from the service
2. There is a public API that can perform those functions

The following is my basic list of services that don't present themselves as databases, but with a little imagination, can totally be used as a database.

> Disclaimer: none of the below options are going to scale anywhere beyond demos or personal projects. Temper your expectations when you're basically repurposing the free-tier of popular online services for your custom storage usecase.

### Google Sheets

If you have spent any amount of time browsing the Show section on Hacker news, you've probably seen many versions of this one: using Google Sheets as your database backend. In case you didn't know, Google Sheets is Google's online spreadsheet tool you can use to author, share, and distribute Excel-like spreadsheets for various purposes. Whatever storage space your sheets take up gets added into your Google online storage total (which is an aggregation of various google storage services like Gmail, Drive, Photos, etc), of which you get a chuck of storage totally for free (15GB as of me writing this).

Combine that with the available [Sheets API](https://developers.google.com/sheets/api), and you can basically have yourself a free database backend. Rows on a spreadsheet basically equate to rows in your database.

### Imgur

Storing media assets like images can be a resource-intensive task. You could get fancy and try to encode and compress your images into a traditional database, however many of the disadvantages of having to process raw bytes of data might outweigh the benefits.

Imgur is a massive image hosting service that also provides a simple [developer API](https://apidocs.imgur.com/) to upload and retrieve images. There is a rate limit (50 images per hour as of me writing this) so don't expect this to scale up to real production workloads. But this, combined with a way to keep track of the IDs of your uploaded images, just might get you through your requirement.

### Github

Now this one was interesting because it was a project I found that leveraged the "backend storage" potential of Github that inspired me to write this post in the first place. Github's obvious main draw is their freely available services to version control your source code repositories. While that is promising, I believe the real value might actually more so be residing in the various auxiliary services around your source code repos.

For example:

- You can create Issues on a repo that would typically indicate a feature request or bug report, but someone took it and turned it into a backend for a URL shortener!
- You can create Gists or small, miscellaneous code snippets that are simple enough to not merit an entire Git repo. Someone took that and turned it into persistent storage for [serialized tabletop RPG character data](https://github.com/massif-press/compcon/blob/master/src/io/apis/gist.ts)!

Beyond that, you have Wiki pages that provide document storage. You can create a Project board on a repo that can hold bucketed text data.

All of this is of course backed by [Github's ever-improving developer APIs](https://developer.github.com/).

### And Beyond…

I found all of these hacked "database" solutions while browsing people's random side projects on Github and reading articles on Hacker News. It helped me appreciate the opportunities we have to build on all the freely available services around the internet.