---
layout: layouts/post.njk
title: "A Light Introduction to Cloud Services"
subtitle: "What are the types of tools that cloud platforms provide and what software problems can they solve for you"
date: 2019-01-10
tags: ["cloud", "software engineering", "aws", "gcp", "azure", "infrastructure"]
---

![Photo by Samuel Ferrara on Unsplash](https://cdn-images-1.medium.com/max/800/0*jm2Jig9_0kdvDf9Z)

As software engineers, there are lots of tools available for us to use. We might start simple with a programming language or two. From there, we might explore software libraries that help us be more productive when solving problems, or tools to help with collaboration. If our use-case requires it, we could reach for advanced monitoring tools to alert us when our software is doing something it shouldn't.

At some point in this process, many of us might have crossed paths with the new hotness in software development: ***The Cloud***.

If you're reading this, then you might have at least heard about "cloud technologies". You might want to learn more about what ***The Cloud*** is and how it can enable us to build better software.

In short, ***The Cloud*** can be seen as just another set of tools for those that want to be more productive when developing software. Most cloud providers offer many of the same types of tools, albeit with slight variations of advertised functionality or developer experience when using them. However, understanding these types of tools and what problems they solve is a key category of information I found very helpful when navigating the cloud technology landscape and implementing my own software solutions.

This will hopefully serve as a high level introduction to the main types of tools available and what problems they can solve. Once you have a handle on them, you should have good context to confidently explore different service offerings by cloud providers.

### Compute — Virtual Machines

Virtual machines could be thought of as a foundational service offered in the cloud. In short, you can provision a virtual computer with specified operating system, resources like RAM, CPU and storage, and use it to run whatever software you like. You are charged based on the amount of VM's you provision, as well as the amount of resources they are utilizing. More VM's with more power = more money. You would also most likely have an option to pick where, geographically in the world your VM is deployed. This could help enable faster response times to customers in certain areas or redundancy if a data center experiences downtime.

You can use these services as a platform to host your application for yourself or make it available to the public. They typically don't include any extra features outside of basic autoscaling; so installing, running, and making your app accessible will take some extra time and effort.

**Examples of Virtual Machine services:**

* [Google Compute Engine (GCE)](https://cloud.google.com/compute/)
* [Amazon Elastic Compute Cloud (EC2)](https://aws.amazon.com/ec2/)
* [Azure Virtual Machines](https://azure.microsoft.com/en-us/services/virtual-machines/)
* [Digital Ocean Droplets](https://www.digitalocean.com/products/droplets/)

### Object Storage

Storage is another cloud service that is probably pretty easy to wrap your head around. It's a place to store your data that's not on your computer for some money. The complexity comes in the different ways you can structure and access that data, which serves themselves to solving very different problems.

One flavor of cloud storage is file storage, or generically described as "object storage." Object storage is usually a highly configurable place to store data assets based on your development needs. Are you trying to build the backend for a file archive where the data volume is very high but the access rate is very infrequent? Are you handing photo uploads from users at 1000 times per second and photo downloads at ten times that? What kind of transfer protocols are you using to move the data? If these are relevant questions for your software, then object storage services will probably have the configurations and pricing details to solve your data storage and access needs. You are typically charged based on how much data you want to store, how fast you want to access it, where in the world you need it to be accessible, and how much of it is going in and out of the cloud.

Another cool feature of object storage is the ability to host static websites from them. Most object storage solutions offer some type of simple web frontend to serve static assets like a web server ([my website](http://sanjaynair.me) is hosted like this!). So if your website doesn't have any interactive elements and can be expressed in plain HTML/JS/CSS, static web hosting through object storage is plenty cheaper than most other application platforms to deploy a website.

**Examples of Object Storage services:**

* [Amazon S3](https://aws.amazon.com/s3/)
* [Google Cloud Storage](https://cloud.google.com/storage/)
* [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)
* [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage)

### Databases

When the data structures you need to persist are a bit more complex than simply storing individual files or objects, but you don't want to have to install and run a database on your hardware or even a VM in the cloud, you might reach for a managed database offering.

Cloud providers have simple and easy ways to get a database up and running with a few clicks. Along with that simplicity, you get a lot of the other strengths of having the service running on a cloud provider's infrastructure like regional availability, built-in monitoring, automatic backups, and automatically expandable capacity. Of course, like most things in the cloud, all these features are fully configurable. But the more you ask for, the more you're probably going to be paying. If the primary business objectives are not managing databases, incurring extra operational cost versus having to hire and manage someone to administer databases is a valid tradeoff.

Most opensource databases like Postgres and MongoDB can be found as a preconfigured, managed services on most cloud platforms with some proprietary offerings available as well. For example, Google Cloud offers the ubiquitous [Big Query](https://cloud.google.com/bigquery/) tool for efficient and affordable storage and access of very large data sets. Similarly, [Spanner](https://cloud.google.com/spanner/) is Google Cloud's managed, high availability and high performance relational database service. AWS has similar proprietary offerings in the form of [Amazon Redshift](https://aws.amazon.com/redshift/) relational databases and [DynamoDB](https://aws.amazon.com/dynamodb/) key-value stores.

With managed database services, the main tradeoff for convenience and speed to market is potential vendor lock in to a specific set of tooling and cost depending on the amount of features you require.

**Examples of Managed Database Services:**

* [Databases on AWS](https://aws.amazon.com/products/databases/)
* [GCP Cloud Storage Options](https://cloud.google.com/products/storage/)
* [Azure Databases](https://azure.microsoft.com/en-us/product-categories/databases/)

### Application Platforms as a Service

When you don't want to worry about systems management of a VM and simply want to deploy your application and manage it at a high level, you might consider a Platform as a Service or PaaS offering.

When working with a PaaS, you can typically get an application written and deployed with only some small configuration in the middle. Assuming you are following the principles of [12 factor](https://12factor.net/) application development, getting your app from coded to deployed should only include some small amount of extra configuration. You don't have to worry about VM's or systems administration and can focus more on writing code. You typically pay a premium for this convenience, but for many this is well worth it.

Cloud platforms vary a bit here as far as how approachable they made the developer experience when it comes to directly running apps in the cloud. Some of the first PaaS offerings, like the ever popular [Heroku](https://www.heroku.com/), make deploying as easy as pushing to a git repo and managing your app painless through their web-based tooling. On the flip side, offerings on AWS like Elastic Beanstalk are targeted more at enterprise customers, and therefore trade off convenience for flexibility, customization, and scalability.

**Examples of Platforms as a Service:**

* [Heroku Dynos](https://www.heroku.com/dynos)
* [Zeit Now](https://zeit.co/now)
* [Netlify](https://www.netlify.com/)
* [Google App Engine](https://cloud.google.com/appengine/)
* [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)

### Serverless Platforms

The paradigm of *serverless computing* is relatively new in the mainstream discussions of software development. To some degree, the serverless model could be throught of as a direct result of the rise in ubiquitousness of cloud platforms.

The basic idea behind serverless platforms boils down to this: cloud platforms make their money based on the amount of resources their customers use. That could be every CPU or GB of RAM you add to a VM times how long that VM is running. However, the simple fact is sometimes you don't need an application running 24/7 on a VM that's costing you money every minute its up and running. Sometimes you just need something to run a very small percentage of time, maybe to handle a few requests an hour. You could think of it like a shipping company sending out a tractor trailer to ship a few shoes. Why not just send a bike?

Serverless offers an alternative for these unique compute workloads. Instead of deploying a full app, you only deploy a "function" that does the unit of work you want it to and nothing more. The cloud platform then charges you for when the function runs but none of the time it is sitting idle. For example, check out the pricing model for the [Cloud Functions](https://cloud.google.com/functions/pricing) offering on Google Cloud Platform. They literally give you the first 2 million times your functions runs FOR FREE. And even after that, its only 40 cents per 20 MILLION INVOCATIONS. (*Disclaimer: These costs are accurate as of writing this)

The clear advantage of this model is obviously the lower cost and opportunity to write less code to get simple jobs done. However a cloud function (today) still takes some time to get "warmed up" and will probably not be as responsive as a continuously running app on the first invocation. Consider this for processes that are pretty simple functionally and don't need to run super fast from the get go.

**Examples of Serverless platforms:**

* [AWS Lambda](https://aws.amazon.com/lambda/)
* [Google Cloud Functions](https://cloud.google.com/functions/)
* [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)
* [Oracle Fn Project](https://fnproject.io/)

### Streaming and Data Processing

Similar to my [previous article](https://sanjaynair.me/blog/2018-10-01-the-wide-world-of-software-testing/) on software testing, it's around here where we get into some of the more specialized tooling offered in the cloud. While specific in their intended use cases, this category of cloud services still spans their own significant portion of most platforms out there and is worth understanding at a high level.

![An example of a Dataflow pipeline](https://cdn-images-1.medium.com/max/800/0*pfuE1pNi3eMbGJ5K.png)
*An example of a Dataflow pipeline (https://cloud.google.com/solutions/processing-logs-at-scale-using-dataflow)*

Most cloud platforms will offer some kind of scalable, high throughput, data pipeline processing tool. These might be useful when you're trying to build a high volume or throughput system that requires a lot of computing power. A managed data streaming service would give you abstractions around the hardware where your algorithms are running, how to separate and link different steps, and the ways to configure how it scales with incoming data volume. Like other managed service offerings specific to cloud platforms, these data streaming services typically integrate very easily with other managed services like databases and object storage.

Examples of data streaming services:

* [GCP Dataflow](https://cloud.google.com/dataflow/)
* [Amazon Kinesis](https://aws.amazon.com/kinesis/)

Another common streaming tool is the Publish-Subscribe or "pubsub" service. These services provide a publish-subscribe messaging system with no worries about infrastructure and minimal configuration and the guarantees of fast delivery of messages. You are charged based on the volume of ingress and egress from the system with the prices typically designed for very high throughput situations. Reach for these if you're building a distributed system, perhaps between multiple, decoupled microservices that need to communicate a decoupled fashion.

Examples of managed pubsub services:

* [Google Pubsub](https://cloud.google.com/pubsub/docs/overview)
* [Amazon Simple Notification Service](http://Simple%20Notification%20Service)

### AI and Machine Learning

With the mainstream rise of Machine Learning and AI as an area of software specialization, cloud providers are more than ready to provide managed solutions to some of the main problems posed by this up-and-coming area.

![Example of face detection through Google Vision API](https://cdn-images-1.medium.com/max/800/0*EYsVULBoHbKVcc0M)
*Example of face detection through Google Vision API (https://developers.google.com/vision/)*

Most modern cloud providers (especially the ones that already developed high fidelity ML and AI tools for the other business ventures - I'm looking at you Google) offer managed solutions to overcome the barriers to entry into the space. For example, they might provide image recognition tools to provide high quality image recognition without the need to write implementations from scratch or worry about collecting training data sets. They effectively take care of all the implementation and training while letting you, the customer, reap the benefits through a friendly API.

These implementations extend into other areas such as neural networks, natural language processing, with the list growing larger by the day.

> As a sidenote, these are **excellent** tools to grab for a weekend hackathon to take your project to that next level

Examples of managed ML and AI cloud solutions:

* [Google Dialogflow](https://cloud.google.com/dataflow/)
* [Google Vision API](https://cloud.google.com/vision/)
* [IBM Watson](https://www.ibm.com/cloud/ai) (Yes, Watson from Jeopardy is now a product you can use)
* [Clarifai](https://clarifai.com/)
* [AWS Rekognition](https://aws.amazon.com/rekognition/)

### Configuration and Administration

The last and probably most boring but still important to understand items in the cloud toolbelt are the interfaces to manage everything I just talked about, aka administration and configuration tools. To keep the boring section short, I'll break it down into the main components as per my experience:

* **Identity Access Management**: Since projects are often accessed by dozens to thousands of different people, this is a way to keep track of them all are and what permissions they have. *Don't give the intern admin access to the production database.*
* **Networking**: Just like you can manage all the resources on your cloud platform project, so can you control how they connect to each other through Virtual Private Networks and how the outside world connects to them through Load Balancers and Content Delivery Networks.
* **Logging**: Your software is probably writing a lot of logs that you would like to browse and filter through. Most cloud platforms will have a central way to access and manage those logs for debugging purposes or metrics collection.
* **Monitoring and Alerting**: You might want to know when stuff breaks so you can go fix it before your customer or boss finds out. Cloud providers have options for monitoring mostly everything running on their platform (including the platform itself like [Google's Cloud Platform Status page](https://status.cloud.google.com/)).
* **Billing**: Ah yes, the item at the top of every managers mind (and maybe yours if you are running it for yourself), how much are all these toys going to cost? Considering how this is how these Cloud Providers make their money, they make very well designed and convenient ways to tell you how much of your money they are taking. But hey, for what you're getting, it's not that bad of a deal.

So in (not so) short, that's what ***The Cloud*** is all about. If I missed something you think is important (which I probably did), whether a section or link I didn't include, please let me know. And if you're new to this whole cloud platform thing, let me know if this gave you a better idea of what all the hoopla is about.

With that, go and making something awesome.