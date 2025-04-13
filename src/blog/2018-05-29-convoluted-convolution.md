---
title: "Convoluted Convolution"
date: 2018-05-29
layout: layouts/post.njk
tags:
  - machine-learning
  - deep-learning
  - neural-networks
  - computer-vision
---

> This post was originally published when I was in college in 2014. I was enrolled in a digital design class that dealt with designing and implementing digital circuits through software. It was one of the first posts I shared publicly where I tried to write about something I learned about and work on.

This past semester, I had the opportunity work on a couple of pretty interesting class projects. Normally, I would say my classes are not usually the prime source of creative projects, and therefore would avoid writing about them altogether. However, a couple of them stood out to me as valuable learning experiences. Each gave me insight into an aspect of technology that I was worth discussing in detail. The first project I would like to discuss was working with the VHDL programing language and FPGA hardware to implement a one-dimensional time domain convolution application. The project gave me some intriguing insight into the differences between working with hardware vs. software platforms. On the surface, the project was easy. Implement a custom circuit to perform one-dimensional convolution with a constant kernel size of 96, 16 bit elements. If none of this is making sense, read this to get familiar with what convolution is all about.

An implementation of this application in software could be condensed down to these short lines of code:


```
// 1D convolution
int y[outputSize];
for (i=0; i < outputSize; i++) { 
	y[i] = 0;
	for (j=0; j < kernelSize; j++) { 
		y[i] += x[i - j] * h[j]; 
	}
}
```


In one dimension, the kernel is represented as a constant array of values that are repeatedly multiplied over an input array in the same manner as a sliding window. The output can be described as a signal that has been “convoluted” by the kernel.

At a high level, our hardware implementation would have three parts:

- An input SRAM that would hold the input signal to be fed into the convolution routine
- The application datapath, which in this case would hold a 96 element wide multiply-accumulate tree to perform the convolution in parallel
- An output SRAM that would store the results returned from the datapath

# How this would go in software

Designing this application in software, even for higher dimensional inputs, seems trivial. A few lines of code and a user-friendly interface (which might end up taking more time to build) and you’re done. You have a vast library of languages, function libraries, data structures, and tools by which to develop, debug, and publish the application swiftly and cleanly. What you write is purely deterministic and would never act randomly unless you explicitly wrote such a feature in. If something isn’t working right, then it was your fault. Simply copy the code I provided above into your language of choice, debug, test, and you’re off.
Welcome to the world of hardware

The previous description had been my experience for the past 3 years when building applications in general. This is not to make it seem easy (it is certainly NOT easy), but rather to contrast it with my experience developing the same application in hardware. Software always works the way you have specified. Whether or not you made a mistake is your problem. Hardware sometimes works the way you specified. However, it will always be victim to the laws of physics over which we sometimes have no power.

First, a bit of background on the development process. This application was to be first designed in software with VHDL. My group members and I could thoroughly test every single circuit we designed using hardware simulation software (ModelSim) to provide some assurance that our digital design made sense before we put it onto a physical circuit. The design would then be synthesized onto a Xilinx Vertex4 FPGA housed on a Nallatech PCI Express card housed in a server room somewhere on the University campus. If that last part sounded a bit weird, it was meant to. We had not physical access to the hardware the application would run on. Our design was synthesized into a “bitfile” that had to be remotely uploaded to the server. Then, through software, we would configure the FPGA with the bitfile and run the circuit with some input. The only feedback we could get was from the software output on the console we were interacting with. The process was basically design, test, synthesize, run, and pray everything worked on the board. You might say, “That was the point of all that testing you did before you ran it on the FPGA, right? To make sure execution on the board worked perfectly!” Well, partially. Unlike software where, if all variabilities are known then a piece of code should always run as tested, hardware can be victim to the randomness of the physical world.

# Metastability — how physics beat us

Without boring you with the fine details, certain aspects of our circuit had the potential inherent randomness built into them. Connected sequential circuit elements always expect each other to only change on a rising (or falling) clock edge. When connected elements like registers are running off different clock frequencies, this guarantee disappears and some really weird stuff can happen. Output signals can resolve to incorrect values and flood your circuit with errors. This phenomenon can be attributed to metastability, or the unpredicatable “third” state of digital signals. Anyone who has worked with even the simplest digital logic (even just in theory) knows that a single bit out of place could destroy the logical soundness of a system.

Without the proper precautions and countermeasures, running a circuit on the board would result in perfectly non-deterministic results. And the worst part, there was basically no way for us to debug the problem. First, because the problem itself could be changing on each execution. Second, the physical hardware was physically inaccessible to us. Third and most importantly, the software simulation we used could not simulate metastability. Even if our simulation worked perfectly, it was no guarantee the circuit would work on the board.

# Our Project Results

When the project was finally completed, it had been thoroughly tested and run on the board with no errors. After the files had been submitted and when the due date came around, we ran the project again…but there were quite a few errors this time. Not a single line of code had been changed. The simulation still showed 100% on all tests. Yet the circuit consistently passed only 96% of the tests on the board. We still have no idea why this happened, and we never might. So I learned how unpredictable and mysterious hardware design can be sometimes.


# Conclusions

Metastability is nothing new to hardware design. Plenty of solutions have been created to overcome this issue in circuits with multiple clocks to ensure they perform deterministically (at least with a significantly high probability). Yet, these ideas really got me thinking about the primitive building blocks of computing as a whole. Our physical world is said to be deterministic and governed by the laws of physics (don’t mention quantum uncertainty because I still need to do more research before tackling that topic properly). We build digital circuits with the assurance that a 1 would be a 1 and a 0 would be a 0 exactly when we want. But no matter how tightly we constrain the physics, when even the slightest element of variability enters the scenario, everything falls apart. If a single bit on the input to a flip-flop changes a nanosecond too early, our deterministic assumptions disappear. We may build our circuits around this random possibility, but that is exactly the point I found to be important: when we design in hardware, we must overcome physics itself.

Software is deterministic because it runs on hardware that was designed to function perfectly 99.999% of the time. It is designing directly with hardware that has made me acknowledge this fact and come to appreciate how different software design is as its core.