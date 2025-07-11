---
layout: layouts/post.njk
title: "Getting to Know Terraform"
subtitle: "A retrospective of my learning experiences while exploring the Terraform infrastructure provisioning tool."
date: 2018-03-16
coverImage: https://cdn-images-1.medium.com/max/2560/0*owN7rzmi1XaNTQan.
coverImageAlt: "Photo by Wojciech Szaturski on Unsplash"
tags: ["infrastructure", "devops", "terraform", "cloud"]
---

Every few weeks or so, I try to spend some quality time getting to know a concept or technology outside my core proficiency of web application development. About half a year ago, I had the chance to dabble in some cloud infrastructure management. It was, to some degree, restricted to a lot of repetitive, manual tasks on a tiny corner of the platform. With the rise of the big cloud providers like Google Cloud Platform, AWS, and Azure, it seemed like being comfortable with the fundamentals of moving through those systems was becoming an ever increasingly necessary skill to have. However, with my limited experience, I didn't feel like I could confidently say I had good experience in "cloud infrastructure management."

Fast forward to today, and an article on the front page of Hacker News caught my eye. It was called [Terraforming 1Password](https://blog.agilebits.com/2018/01/25/terraforming-1password/), written by the founder of Agile Bits, the company behind the popular password manager: 1Password. It outlined the process that the company went through to convert their system of "Infrastructure as code," moving from the AWS proprietary provisioning tool called Cloudformation, to Terraform: an open source solution built by Hashicorp. You might be familiar with some of their other products: like [Vagrant](https://www.vagrantup.com/) and [Vault](https://www.vaultproject.io/). Give the article a read when you get a chance, it's a good one.

I thought back to experiences manually provisioning and deploying cloud infrastructure. I thought Terraform seemed to make all those past pains go away. I figured learning something about it would move me in the right direction of getting properly familiar with some cloud infrastructure fundamentals. And it did! But in some ways I didn't initially expect.

![A little kid splashing in the water in wellies in Rīgas pilsēta by Daiga Ellaby on Unsplash](https://cdn-images-1.medium.com/max/800/0*WLrJSGVGb-wRTExG.)

#### Getting My Feet Wet

Before I started, the cloud service provider I was most familiar with was Google Cloud Platform, at least from the basics of how to work with the tools and what suite of services it offered. However, I figured to get the full understanding of what Terraform had to offer, I needed to spend some time getting familiar with some other cloud service providers. So I signed up for a free tier of all three cloud services.

GCP seemed to have one of the better trial offerings (at least at the time of writing this piece) with a year long trial including $300 of free credit to apply to various services. AWS follows a slightly different model where each month, you can remain in a free tier by staying below a threshold of usage for each of their services (which is set at a plenty generous level for a hobbyist). Azure has a mix of both models where you get $200 in credit monthly, a selection of services free for a year, and the rest billed at a free usage tier.

With that, I had a multi-cloud, basically free, playground to start automating some infrastructure.

#### Getting My Hands Dirty

With my cloud playground up and running, I started following along with some guides and the Terraform documentation offered by Hashicorp. The [Terraform: Getting Started](https://www.pluralsight.com/courses/terraform-getting-started) course offered by Pluralsight was also a good place to start, since it was based mainly on Amazon Web Services with a sprinkling of Microsoft Azure. Soon enough I was up and running, or more specifically, spinning up and immediately tearing down infrastructure between GCP and AWS.

Terraform follows a modular design principle with a well-defined set of abstract components to play with, each with different flavors based on what concrete cloud environment it corresponds to. All the specifications are done in the Hashicorp configuration language, which itself is easy enough to pick up. One struggle I faced was the open endedness of how Terraform files come together. It seemed the best way to go about it was to simply copy and paste existing examples from documentation and modify it to your needs.

I started by copying some of the basic examples I found online for each of the cloud providers. Spinning up a nano instance on EC2 or GCE, putting it behind a simple load balancer, maybe provisioning a database service, making sure it all worked together properly, and promptly tearing it down.

Then I ventured into the wild west of making these provisioned components work *between clouds*. I thought this was actually pretty cool. With Terraform, I could break down the barrier the industry thrives on: getting customers tightly integrated within their ecosystem of products and making it pretty hard to break away from them. It was one of the reasons I was so isolated to GCP before I started this whole exercise. I do have to say though, even with that extra utility, it was still enough of a struggle to get an AWS lambda function to publish messages to Google Pubsub. I didn't try much after that, opting to spending my time writing this instead :). I'd be interested in what other examples could be thought up, that could take advantage of the best parts of each cloud and bring them together.

Additionally, it was a different experience to run code that had an external impact, that if I messed up, could potentially cost me a good chunk of money. Every time I ran `terraform apply` and got an error, there was a small part of me that feared some rogue process was left unattended, eating through my free tier of usage and piling on some uncapped cost onto my credit card. Or some malicious agent stole my access key and was provisioning compute instances to mine Bitcoin. So is the nature of working with cloud providers: having the potential to scale your app fast means having the risk of having to pay for it…fast. Luckily, I was very liberal about running `terraform destroy` and keeping my environments clean. My costs never went above a few bucks a month. Keep those secret keys out of Github!

#### Moving the Needle Forward

After spending a few good days with Terraform, here are my takeaways.

What I learned:

* Terraform is a very powerful tool that is highly customizable, interoperable with your platform of choice, and easy enough to pick up and run with. It may be overkill for your hobby projects, but certainly a fun way to get a better handle on cloud infrastructure management.
* On the surface, most cloud providers offer similar services. However, the actual experience of working with them can be drastically different form a developer and operations perspective. Some examples include authorization and IAM, API offerings to access platform features, and customizability of offered components.
* There a **_lot_** you can do in the cloud for free or with a few bucks a month. Consider taking your personal projects to the next level by taking advantage of what's offered for free.
* I gained a lot more familiarity of with the plethora of services offered by cloud providers. [Every](https://aws.amazon.com/products/), [single](https://cloud.google.com/products/), [cloud](https://azure.microsoft.com/en-us/services/) has that that one marketing page with a hellacious number of services. Going through and getting using some of them actually made the whole collection as a whole less intimidating.

And some questions I pose:

* My definition of what a "Full Stack Developer" seems to be expanding further and further out. Does it still mean "I am proficient from the backend to the frontend of the application stack," or should it include the scope of *devops* where you not only own the application but also the infrastructure it runs on?
* Are cloud service offering going to continue to diversity with different service providers, consolidate into fewer into the few and big, or will we mix and match them as we need like programming languages today? If tools like Terraform are any indication of what's possible, I'd wager on the last option.

As you can probably tell, my journey into learning this one tool expanded out into an unexpectedly broader study of navigating cloud service providers and getting to know their pros and cons. However, this exploration might not have happened without a unique, open-source tool like Terraform available to tinker with and learn from.

So for that, go sign up for some trials of AWS or GCP or Azure or whatever you fancy today. Play around with some Terraform scripts, and learn something new while having some fun.