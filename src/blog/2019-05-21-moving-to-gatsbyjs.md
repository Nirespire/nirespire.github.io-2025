---
layout: layouts/post.njk
title: "Moving to GatsbyJS"
subtitle: "What I learned moving my personal website to GatsbyJS"
date: 2019-05-21
tags: ["web development", "gatsbyjs", "react", "javascript", "static sites"]
---

![](https://cdn-images-1.medium.com/max/800/1*7eVuVKQFGc0-DBr0VqRXEw.png)

There are lots of tools to build websites freely available to download and use online. You might want to go at it with just plain HTML, CSS, and some JavaScript. This is how I built my first personal website and unless you're trying to get fancy with frontend features or content, this might have worked well for you.

Overtime, I got the itch to move my website development to something a little more robust in terms of tooling. Not so much because the content there was complex enough to merit a full-fledged frontend framework, but more so I could have a place to practice my web development skills with some modern frameworks, tools, and abstractions. The web development landscape moves so fast, I wanted to make sure I had my own sandbox to experiment and learn easily.

### Static Site Generators

Since my site was basically just a static web page with some CSS and JS for responsiveness and styling, I didn't feel like I should reach for a full-featured framework like Angular or Ember. I wanted my site to be driven by simple content while I would host more specific content like videos and long-form publications on managed platforms like YouTube and Medium.

I found that [static site generators](https://www.staticgen.com/) fit my use-case perfectly. In short, I would be able to take advantage of the modern features of a frontend framework during development and publish plain HTML, CSS, and JS to serve to clients. Since I didn't expect to have any dynamic content on my site, there would be no restriction on what I could build. Moreover, hosting a static site is a lot simpler, as platforms like [Github Pages](https://pages.github.com/) provide easy ways to serve static content for free.

### NuxtJS : Moving Beyond HTML/CSS/JS

While React was already dominating the web development landscape by this time, I was dabbling more in one of its mainstream competitors: VueJS. I have more or less come around to liking and even preferring React today, but back then I was initially attracted to Vue by its similarities to AngularJS. I had a lot of experience with Angular at that point and I wasn't quite ready to make the jump to the new hotness that was React.

While researching some popular static site generation tools, I came across NextJS. It is developed and maintained by the Zeit team and provided a full featured static site generation solution. Just what I was looking for. The one tiny issue was that it leveraged React.

After some more stubborn digging, I came across [NuxtJS](https://nuxtjs.org/), which unashamedly advertised itself as NextJS with a fronted by Vue instead of React. I happily picked it up and was on my way to modern web development land.

Once I was happy with an initial version, I generated my static assets and pushed it up to my [Github repo](https://github.com/Nirespire/nirespire.github.io). Like I mentioned before, Github has excellent support for hosting static sites. Their [documentation about Github pages](https://help.github.com/en/articles/configuring-a-publishing-source-for-github-pages), tight integration with repos, and the [`gh-pages`](https://www.npmjs.com/package/gh-pages) tool makes it effortless to develop and host static sites.

Website V2 DONE. As I expected, it was a LOT nicer to build having modern tools and features like hot-reloading and bundling available to me. I had the modern web sandbox I was looking for.

### GatsbyJS : The New and Shiny

I first heard about GatsbyJS on the [SyntaxFM](https://syntax.fm/) podcast (which is great by the way, go subscribe). It was discussed in comparison to NextJS which I was already familiar with from my previous research. There were a lot of good things I heard about Gatsby, but nothing that had me wanting to switch my site over. Sure, it was a static site generator with modern web development tooling and features, but that's what I already had with Nuxt!

Fast forward a few weeks and I'm hearing some more buzz about Gatsby around the web and among other devs. There was a full-day Gatsby workshop for beginners happening at my workplace that I was interested in signing up. Normally I preferred diving into new frameworks on my own time, but I figured this was an easy jumpstart to something that was clearly picking up steam in the community. There had to be something there I was missing out on, right? After getting a quick intro to the framework, we did some hands on development with Gatsby, and that's when I finally saw what all the hype was about.

#### Plugins

What really made Gatsby stand out to me in terms of developer experience was the plugin system. At its core, you can build a complete Gatsby static site with plain-old React and CSS styles. To add to this, plugins are easy, plug and play node_modules you can import during development to make building your site far more efficient and manageable.

Like I said before, the site I built was really quite simple, nothing more than a landing page with links to external sites with my other content. However, Gatsby plugins sparked some cool ideas for enhancements to what I already had. For example, instead of just providing a link to my profile on Medium, I could drop in the [gatsby-source-medium](https://www.gatsbyjs.org/packages/gatsby-source-medium/) plugin with some minimal configuration and I could now have my site automatically display previews of my latest published content.

Similarly, I never thought about how I didn't integrate Google Analytics into my site to track user traffic. While integrating Analytics is already easy enough, it doesn't get easier than `npm install`ing [gatsby-plugin-google-analytics](https://www.gatsbyjs.org/docs/adding-analytics/) and dropping a tracking id into your Gatsby config. The framework takes care of the rest during site generation.

Finally, the user experience of browsing through their plugin repository is top notch. Every one links to an info page with easy access to the relevant Github repos in case you need to dive some code or submit an issue.

#### Progressive Web App Features

[Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/) or PWA's are a class of web applications that adhere to certain standards or performance and accessibility. In general, if you build your websites to the PWA standards, you will make it easier for everyone to use your website, regardless of their network or hardware capabilities.

Faster load times and more responsive behavior are the main claims to fame in my opinion. Dan Abramov from the React team called this out about the ReactJS site and its freaky fast performance.

<blockquote class="twitter-tweet">
<a href="https://twitter.com/dan_abramov/status/1083502444024340481"></a>
</blockquote>

#### Conversion: The Developer Experience

Although Vue and React have pretty different paradigms in terms of how they expect applications to be structured, the simplicity of my website allowed me to basically just copy paste over what I had. I started with a barebones [gatsby-starter-hello-world](https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-blog/) and started moving things over. The biggest manual work I had to do was convert my HTML markup into JSX, which was a step forward since it helped me modularize the markup quite a bit.

Routing between pages is handled implicitly. If you drop a `home.jsx` file into your `src/pages` directory, Gatsby will build it into the `/home` route automatically. CSS and other static assets like images and build in automatically from the `static` directory, and Gatsby does a great job bundling and minifying everything behind the scenes for efficient delivery to the client. I only had one page to worry about, and this model was just like Nuxt, so there was no major things to learn here.

Switching my site over to Gatsby basically out of the box provided me with a pretty significant boost in web performance as measured by Google's [Lighthouse](https://developers.google.com/web/tools/lighthouse/) analyzer. I tweeted by experience as such.

<blockquote class="twitter-tweet">
<a href="https://twitter.com/Nirespire/status/1117481391527272454"></a>
</blockquote>

#### More and more

Some things I'm still exploring but know are pretty unique to Gatsby include:

* **GraphQL support**: Basically anything data-related in your application can be accessed through a full GraphQL server running in your development environment. The Medium plugin I mentioned earlier is driven off this.
* **CMS Integration**: I'd like to eventually move my site to a BYOF or Bring Your Own Frontend system where a managed platform could host and serve all my data and API needs while my Gatsby site could continue to run statically. [Netlify](https://www.netlify.com/) and [Drupal](https://www.drupal.org/) and a couple of these on my radar.

Suffice it to say, I have no regrets converting to Gatsby. I'm pretty convinced the hype was real. Gatsby is here to stay as a remarkably solid choice for modern static and progressive web app construction.

I'm looking forward to improving my site with the suite of tools and plugins offered by Gatsby and well as the fresh developer experience of working with it as my static site framework.

If you have any thoughts or suggestions, please let me know on [Twitter](https://twitter.com/Nirespire). Also keep an eye on my [website](https://sanjaynair.me/) for upcoming additions!