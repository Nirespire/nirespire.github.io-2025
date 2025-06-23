---
layout: layouts/post.njk
title: "Minecraft DevOps - Foundational Cloud Skills With a Fun Payoff"
subtitle: "Yes, DevOps CAN be fun"
date: 2025-06-23
tags: ["software engineering", "devops", "video-games"]
---


I have been self-hosting a fleet of Minecraft servers on and off since around 2022. Through the process, I've been able to build and maintain a broad array of Cloud DevOps skillsets. Although I have been leading a portfolio of Cloud Platform Engineering teams for the better part of 3 years, the position of leader didn't afford me much, if any, time to be hands-on with the core technologies that my team of highly skilled and specialized engineers leverages daily to get their work done. Minecraft and its built-in offering to self-host multiplayer servers provided the perfect excuse for me to dump some time and a few bucks into a public Cloud service to host my own multiplayer server for my friends. Through the process of methodically working through each point of friction and novel opportunity to automate hosting my own Minecraft server, I was able to not only build competence in DevOps skillsets, but also get back to some of the core software engineering and web development skills to support this gaming hobby for me and my friends.
 
I have been playing Minecraft since college. I purchased the game back around 2011, past when the original fanbase had established itself, but well into when it was locked into its mainstream phase. I spent many hours playing with my friends and classmates on the shared server hosted by the university's Minecraft club without really thinking twice about where or how the server was running. Over a decade later, with a computer science degree and multiple years of working on enterprise technology, I gained the knowledge and experience to tackle the subject right when it was something I was interested in doing outside of work. At the time, I was playing with a few friends on a free, private Minecraft multiplayer server hosted on a website that seemed to be primarily funded via ads. It was clear that the instance we were playing on was running in a shared environment with very few resources allocated per instance. My friends and I eventually got fed up with the limitations of the service and one of my friends, who happened to get their hands on a retired datacenter server rack, decided to be the first to take the plunge and self-host a server for us. 
 
Unfortunately, this setup started to show its limitations pretty early. My friend didn't have the greatest internet connection and we constantly suffered from connectivity issues during our play sessions. He also did not keep the server running continuously due to how loud it was and not having a place to tuck it away at his house. That meant if he wasn't able to physically access the machine to turn it back on, we were out of luck on being able to play together on our Minecraft world.

I decided to take it upon myself to create the new and improved iteration of the Minecraft server for us.

The initial requirements, if you want to call them that, were simple:
- A private Minecraft server accessible by only our friend group
- Enough resources allocated to the server where we could all play on together and grow the world map significantly without causing server performance issues

I hadn't had a chance to apply my DevOps skills on AWS up to then, so I decided to select it as my Cloud provider for the project.

I spun up a modest t2-micro instance and got to work getting the server spun up. After some initial tinkering to figure out how to get the Minecraft server process working on the VM, a little more time spent understanding how to create firewall rules that only allowed our specific IPs to access the server, and finally doing some simple systemd configuration to autostart the Minecraft server on boot: I had an MVP Minecraft server up and running on AWS.

I then created a couple of Lambda functions to handle starting and stopping the instances and exposed them via HTTP GET API Gateway endpoints and provided those to my friends.

With just this MVP setup, I was surprised at the amount of general knowledge I acquired through the process. That, alongside the satisfaction of seeing the direct results of my efforts and being able to enjoy it alongside my friends, was a very fulfilling experience. I was by no means an expert or even moderately proficient at DevOps on AWS, however down the critical path of getting the MVP up and running, I was able to gain basic practical knowledge about
- EC2 machine types and VM provisioning process
- EC2 Security Groups and firewall configuration
- systemd services
- S3 bucket configuration and integration with EC2
- IAM roles and policy

As we continued to use the hosted server process, I was able to iterate over the offering via ideas I had for how I wanted to improve the experience and requests for new features that my friends asked for. Some of these included:

- Adding a custom server domain with dynamic DNS that updated the CNAME on boot since, without a reserved IP, the server would have a new IP on each boot. This way, instead of having to connect to a new IP each time, we could set the domain once and let the dynamic DNS handle reconfiguring where it pointed each time we booted the server via a crontab configuration.
- Adding a Cloudwatch alarm that automatically shut the server off if it was running for over a certain number of hours per day to prevent unnecessary cost in the case someone forgot to shut it off after a session
- Adding a Lambda function that would initiate a Minecraft world backup, upload to S3, and make it available to download

I was even able to branch out into my core software engineering and web development skills by building a simple web portal where server status (running or stopped) could be displayed and controls to start and stop the server were available in a UI interface instead of directing having to hit an API endpoint. I was able to host the site for free using one of many hosting services for which their free tier was most than sufficient for my needs.

You can see a diagram of what I have working today below:

![Minecraft DevOps Architecture Diagram](/assets/images/minecraftdevops.jpg)

I initially considered going down the Kubernetes path for the infrastructure, but in retrospect I'm glad I didn't. One of the key objectives of the project that I didn't know then but I can articulate now is that I didn't want the required maintenance and upkeep of the infrastructure to outweigh the amount of time I could spend actually using it and enjoying it playing Minecraft on the infrastructure. Raw Kubernetes has a high cost of entry and requires decently large efforts to upkeep. More managed solutions weren't cost effective for my usecase where I was only interested in spending a maximum of a few dozen dollars a month.