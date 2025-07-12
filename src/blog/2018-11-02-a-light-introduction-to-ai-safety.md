---
title: A Light Introduction to AI Safety
date: 2018-11-02
layout: layouts/post.njk
tags: ["ai", "ai safety", "technology"]
---

I was recently listening to an episode of the podcast [This Week in Machine Learning and AI](https://twimlai.com/twiml-talk-181-anticipating-superintelligence-with-nick-bostrom/), featuring professor Nick Bostrom. He is the author of a book I recently read called [Superintelligence](https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies), which explores the potential consequences of artificial intelligence that surpasses the capabilities of human beings by orders of magnitude. Bostrom is also a member of the [Future of Life Institute](https://futureoflife.org/) which seeks to steer humanity through a safe course into the future along with the rapid pace of technological advancement.

On the podcast, Bostrom highlights the relatively brand new academic area of **AI Safety**. It is a really fascinating topic which I feel is becoming increasingly relevant in the modern age, and I figured it was a topic that might not be familiar to many. So here is the beginners crash course of what AI safety is and why you should probably care about it.

## A (Very) Brief History of AI

Contrary to what news media might make you think, the concept and implementation of AI is not a brand new, modern concept. It has existed since the 1950s, with academics like Marvin Minsky laying some of its foundational concepts. While mostly mathematical, these early concepts led to the creation of specialized areas of AI research including but not limited to:

**Knowledge Representation**: Also known as "expert systems," this area sought to collect and represent "ontologies" or absolute truths in various areas of human knowledge

**Natural Language Processing**: How to build abstractions and algorithms for computers to consume, process, and interpret language

**Computer Vision**: How to take raw visual information and translate it into "features" or add meaningful interpretations to it

And many, many more…

Digital implementations in these areas through various techniques resulted in systems that were significantly superior to humans in their specialized areas of expertise. Some famous examples include IBM's [Deep Blue](https://en.wikipedia.org/wiki/Deep_Blue_%28chess_computer%29), which beat world champion chess player Gary Kasparov at his own game. While Deep Blue was more of a brute force implementation which computed many thousands of moves ahead and picked the statically best move, more recent achievements such as DeepMind's [Alpha Go](https://deepmind.com/research/alphago/) overcame much greater statistical complexity of playing a game of Go through reinforcement learning techniques.

A relatively recent product delivered directly to customers that implements concepts from computer vision and reinforcement learning is car manufacturer [Tesla's autopilot system](https://www.tesla.com/autopilot), which can provide basic automated driving capabilities to their line of electric vehicles. Look at [Google's Duplex](https://ai.googleblog.com/2018/05/duplex-ai-system-for-natural-conversation.html) system for smartphones that, through the use of natural language processing and deep neural nets, can effectively mimic a basic phone conversation.

There's no question that with today's technology and techniques, it's possible to develop a specialized system that could learn to perform a narrow set of tasks, sometimes even better than a human.

## The Possibility of Artificial General Intelligence

The technological achievements of AI are incredible, considering the pace at which the theory translated into implementations are delivering real world value. There literally are multi-million dollar businesses built on these technologies. However, these solutions could still be considered too specialized to pose any real threat. A chess playing robot is probably not posing any threat to humanity. Something that has still not been achieved (at least not publicly), is the concept of an Artificial General Intelligence or **AGI**. Also known as "Strong AI", I defer to the [Wikipedia definition](https://en.wikipedia.org/wiki/Artificial_general_intelligence) to summarize the idea:

> **Artificial general intelligence** (**AGI**) is the intelligence of a machine that could successfully perform any intellectual task that a human being can.

This is the AI of science fiction: the kind that might be indistinguishable from a human in their intellectual capabilities. This is an AI system that might cross the boundaries of specialization and could perform functions in multiple intellectual domains. These systems might even be able to learn from a random set of unstructured data such as what's freely available on the internet.

## The Fast Track to Superintelligence

Enter the concept of a **superintelligence**. For the full explanation of the concept of superintelligence, consider reading Bostrom's previously mentioned [book](https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies) on the topic.

The short version goes something like this: the progress of AI research and development is moving forward so rapidly to the point where nothing is slowing it down. Soon, we will cross a threshold of complexity and capability where AGI is a reality. This could be seen as a point of no return, much like previous scientific discoveries such as nuclear fission, which will change the course of human history. Once AGI is achieved, the exponential pace of advancement will result in what Bostrom calls a Superintelligence, or an artificial entity with general capabilities many orders of magnitude beyond what a human could possess, interpret, or control.

Consider the depictions of AI in science fiction that plays the role of antagonist against humans due to their conflicting judgement of a situation and superior abilities over humans to act on that judgement. HAL from 2001; A Space Odyssey. The Terminators developed by Skynet. The colony ship AI, AUTO from Pixar's Wall-E. A superintelligent system in theory could easily fill the role of any of these characters and prove to be a concrete threat to the human race.

## The Need for AI Safety

Elon Musk is one of the more famous personalities that has consistently spoken out about the dangers of unbounded AI research. You only need scroll through some of his tweets on the subject to see that a man who is pushing innovative boundaries daily thinks very strongly about the dangers of AI and superintelligence posing a threat to humanity.

The future of life institute provides [extensive details](https://futureoflife.org/background/benefits-risks-of-artificial-intelligence/) on the subject of AI being a threat to human wellness and even provides a plethora of reference reading to support their points. Some of the main dangers they outline include:

- The development of an AI who's interests do not align with those of humanity. Consider the sci-fi trope of a machine that considers humanity a threat to the Earth and decides to wipe it out
- The AI is intentionally designed to do something destructive. It's not hard to imagine the conflicts of world politics driving a nation to develop a superintelligent AI with the sole purpose of destroying political enemies.
- The AI reaches the point where humans can't reason how or why it does what it does. Do some reading on deep neural networks and you might realize we're already at the point where we really don't know why some algorithms actually work so well.

## What Can be Done?

Just as we can turn to fiction to feed our fears about the inevitable threat of AI and the machines taking over, we can also look to it for some answers on how to prevent such a future. Author Isaac Asimov outlined a rather short and elegant set of laws he saw as the fundamental building blocks to ensure robots would never come in conflict with humans. The [Three Laws of Robots](https://www.auburn.edu/~vestmon/robotics.html) according to Asimov go as follows:

> A robot may not injure a human being or, through inaction, allow a human being to come to harm.

> A robot must obey orders given it by human beings except where such orders would conflict with the First Law.

> A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.

Besides the potential harm a highly advanced AI might pose to humans, there's also the risk of humanity developing a system it cannot understand or reason about. Even with the sometimes unfathomable complexity of technology we see all around us today, most of it can be completely understood by a human. However, once we trade interpretability for capability, we enter a scenario where our systems are "black boxes" where we can validate the accuracy of its results but cannot reason as to how the result was derived.

So a solution might be that AI systems must be required to explain how they arrived to a solution. While some might see this as a hindrance to progress now, in the future it might be the only way we can feel assured that systems beyond our human capabilities are making decisions in our best interest.

## Conclusions

If any of this peaks of interest, I encourage you to do more reading on the subject. Some interesting places to start include:

- The [TWIML AI podcast episode](https://twimlai.com/twiml-talk-181-anticipating-superintelligence-with-nick-bostrom/) on the topic
- The book [Superintelligence](https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies) by Nick Bostrom
- Dr. [Michal Kosinski's study](https://www.nytimes.com/2017/11/21/magazine/can-ai-be-taught-to-explain-itself.html) on facial recognition and encountering the "black box" problem
- The loads of content on the [Future of Life website](https://futureoflife.org/background/existential-risk/)
- Elon Musk's [twitter feed](https://twitter.com/elonmusk/status/495759307346952192?lang=en)

Enjoy! 🤖