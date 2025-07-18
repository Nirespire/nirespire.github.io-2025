---
layout: layouts/post.njk
title: "Coding with Copilot - Rewriting My Personal Site Using Generative AI"
subtitle: "My 'ah-hah!' moment with GenAI and how I'm never building the same way again"
date: 2025-05-09
coverImage: /assets/images/coding-with-copilot.png
coverImageAlt: "Generated by ChatGPT o4"
tags: ["software engineering", "gen-ai", "ai"]
---

This year, with the buzz of GenAI's burgeoning capabilities as a pair programmer looming large over my industry, I took the opportunity to find out whether the hype was real. I rebuilt my personal website from start to finish with GenAI and augmented coding assistance at the forefront of my approach. You can see the results for yourself (you might be reading this very post on the new site!), but the whole experience was nothing short of eye-opening. I can firmly say I’ve had my "ah-hah" moment with this new category of technology and came out of the experience a believer. I now know Generative AI–assisted software development is the future. Let me explain.

## Why Rebuild?

I've had a personal website for many years (again, you might be reading this post on it!). I use it for a few main purposes:

- Satisfying my need to have a space on the internet that's mine
- Having a sandbox for tinkering with new tech
- Having a purposeful outlet for keeping my technical skills sharp

Up until the beginning of 2025, the previous version served the first purpose well, but the remaining two were woefully unaddressed. Specifically related to the third point: due to the increasingly administrative nature of my day job, I hadn't been able to exercise my web development skills in years. So I used the task of a full rewrite as a way to get back to fulfilling all three goals again.

As the new year rolled in, I had a few concrete goals for the site:

- Move off Gatsby as the frontend framework, since it had started to feel too heavyweight in terms of maintenance for a relatively simple site.
- Migrate my blog posts from Medium, which had previously been my go-to publishing platform—and use this as motivation to revive my writing habit, which had stalled after a decent hot streak about four years ago.
	- I also wanted an RSS feed for the blog that interested readers could subscribe to.
- Refresh the layout and styling. Tailwind CSS had been on my radar as a solid and mature option—so I decided to finally give it a go.

I had been meaning to do this for months. But every time I sat down to make progress, I’d get bogged down with errors and obscure issues that killed my momentum and motivation.

## Setting the Stage: Tools and Stack

I discovered the [11ty](https://www.11ty.dev/) static site generator after stumbling on another beautifully crafted personal website and blog via [Hacker News](https://news.ycombinator.com/) in late 2024. I was immediately impressed by its out-of-the-box simplicity and minimalism—combined with powerful extensibility via plugins and configuration.

I paired 11ty with [Tailwind CSS](https://tailwindcss.com/) as the styling framework and continued hosting via [GitHub Pages](https://pages.github.com/) on my custom domain.

Then, of course, there was the question of AI assistance. Like many, I first experimented with ChatGPT in late 2023 when the GenAI boom was just taking off. While it had improved significantly a year later, I quickly grew tired of copy-pasting between my editor and the chat interface.

Luckily, right as I started the project, GitHub released [Copilot Agent Mode](https://github.blog/news-insights/product-news/github-copilot-agent-mode-activated/), which was already integrated into my long-time IDE of choice: VSCode. With 50 chats included in the free tier, the decision was easy—and I was ready to get started.

## Laying the Foundation: AI by my side

> **TL;DR:** Zero to...something, VERY fast

I was (and still am) building my prompt-writing skills, so I started with something simple that I figured a mature-enough LLM could handle: a scaffolding task. I knew that LLMs generally perform better with upfront context, so I carefully detailed my objectives:

```

I'm building a personal website. I'd like to build it using the 11ty static site generation framework and TailwindCSS for styling. It will be statically hosted on GitHub and served via GitHub Pages on a custom domain. The site will mainly be comprised of a homepage with a profile picture, title header, and small mission statement. Under that will be a short list of links. The site will also include a personal blog of posts authored in markdown format. Each post should include tags and a reading time estimate. The style of the site should be minimal, with dark greys and blues as primary colors and orange as the accent color. The font used should be Nebula Sans. Please generate all the necessary files and folders as a starting point for this project based on the specification, along with a list of next steps to build on the starter code, including how to deploy the website.

```

The response gave me this structure:

```

my-website/  
├── package.json  
├── .eleventy.js  
├── tailwind.config.js  
├── postcss.config.js  
├── src/  
│ ├── index.njk  
│ ├── blog/  
│ │ └── sample-post.md  
│ └── assets/  
│ ├── css/  
│ │ └── styles.css  
│ └── images/  
│ └── profile.jpg (add your profile picture here)  
└── README.md

```

That was the first big "ah-hah" moment. I had a functional starting point in under five minutes. I had previously struggled to get even this basic scaffold set up on my own—mostly due to Tailwind’s finicky integration with 11ty. The model opted for a prior major version of Tailwind, which made the setup smoother—something I hadn't figured out despite all my Googling and GitHub spelunking. Being able to finally focus on features instead of debugging boilerplate was thrilling.

I could’ve stopped there and continued coding as usual, but I was determined to see how far the Copilot Agent could go.

I worked through changing the layout, navigation, and styling, and added features like the [RSS feed](https://sanjaynair.me/feed.xml). From idea to prompt to working code, I saw a surprisingly high success rate. While not perfect, the model was usually able to fix its own errors when I fed it logs or observed behavior.

Eventually, I had it generate a basic GitHub Actions workflow to deploy to GitHub Pages—and just like that, the new site was live.

## Where AI Fell Short

> **TL;DR:** Clear requirements = smooth results. Ambiguity = chaos.

Sometimes, the LLM went completely off the rails and broke the codebase so badly I had to stop and roll back everything. The common pattern? **Ambiguous requirements.**

If I provided a vague prompt, the model didn’t take the MVP path—it tried to do *everything* all at once.

Examples:

- I asked it to “improve the SEO for the site.” The agent went on a spree: rebuilding metadata, changing layouts, making 35+ file edits—none of which I asked for. I had to stop it and revise the prompt with constraints like "only add meta tags" or "do not change layout."
- I prompted it to add basic functional testing but didn’t specify pages or scenarios. It chose [Playwright](https://playwright.dev/)—a great tool—but scaffolded a broken setup and couldn’t fix the errors it caused. I had to guide it through corrections and eventually forced it to stick to the basics.

## Unexpected Wins

> **TL;DR:** Bridging the gap from "this is a cool idea" to "I know it can be coded but I don't know how"

One of my goals was migrating blog posts from Medium. I started by exporting them as HTML files using Medium’s built-in tool. Then I asked the agent to convert them into Markdown and add them to my new blog.

The conversion quality dropped as the number of files increased, but unexpectedly, the LLM **generated relevant tags** for each post—something that didn’t exist in the Medium versions.

This led to another big win: my site now has a [tag cloud](https://sanjaynair.me/tags/). It visualizes all post tags with sizing based on frequency, and clicking one filters to relevant posts. I was able to clearly articulate the concept and desired templating, and the model generated working code **in a single iteration**. What would’ve taken hours manually took minutes with GenAI. Easily my second-biggest "ah-hah" moment.

## Lessons Learned

To keep it short and sweet:

- You can’t move faster from nothing to MVP than with GenAI by your side.
- Be specific. Add constraints. Ambiguity leads to hallucination and runaway iterations.
- The biggest value is when the LLM bridges your mental gap from idea to implementation—**especially when you know what’s possible but not how to code it.**

## Final Thoughts

My experience with GenAI pair programming was transformative. I can’t imagine going back to coding without it. The ability to turn an idea into a working feature in minutes feels like a superpower.

My to-do list is now full of ideas I’m excited to tackle, because I’m no longer intimidated by how hard something might be to implement.

To anyone still skeptical: jump in. Start with a problem you care about and give GenAI a chance to amaze you. You might just have your own "ah-hah" moment.

> “Enjoyed this write-up? Share it with a friend who’s curious about AI tools.”