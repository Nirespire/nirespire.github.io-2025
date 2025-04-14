---
title: The Wide World of Software Testing
date: 2018-10-01
layout: layouts/post.njk
tags:
  - testing
  - software engineering
  - software development
---

![aerial photo of world by Richard Gatley on Unsplash](https://cdn-images-1.medium.com/max/1200/0*X2G8UkOxSTYmADa3)

In a [previous post](https://medium.com/@nirespire/what-is-cicd-concepts-in-continuous-integration-and-deployment-4fe3f6625007) about continuous integration and deployment, I alluded to the practice of constantly putting code through various tests and making the results visible, whether within a software team or to the public for an opensource project. In this post, I want to dive a little deeper into what "testing" *actually* is in the context of writing quality software. Specifically, I'd like to shed some light on the different types of testing and how they can help you write better software.

### Unit Testing

> Absolute unit

Unit testing is the lowest level of testing. It's about as simple as you can get when testing software, but don't discount its value. A few simple unit tests can go a long way to keep your codebase robust, bug-free, and maintainable over time.

A good way to explain unit testing is by example. Say we have a function written in pseudocode like so:

```
function addNumbers(a, b) {
    // Makes a network call to validate inputs
    validateInputs(a, b)
    
    return a + b
}
```

The unit test might look something like this:

```
test("addNumbers adds two numbers correctly") {
    // Mock the network call
    mock(validateInputs).toReturn(true)
    
    result = addNumbers(1, 2)
    assert(result equals 3)
}
```

Notice how we're only testing for what this function does and nothing else. Any dependent operations, like a network call, are "mocked" or functionally faked to resolve to a predetermined result. If your application runs inside a framework of some kind, it will usually be ignored in favor of just running the unit of code in question. In general, we'd like a test only the unit. In this case: the function and it's expected behavior.

As a result:

- Unit tests should be pretty lightweight and run fast since they don't depend on anything external to the unit of code being tested
- The only way they can fail is by changing the unit of code they are testing
- It is usually necessary to augment unit tests with more comprehensive testing methods to ensure complete confidence in your code working as expected

### Integration Testing

> The whole kit and kaboodle

While it's great if the different pieces of our codebase work correctly alone, it's also essential that they work properly together as a complete package. This is where integration tests come into play. Unlike unit tests, integration tests will typically bring surrounding frameworks and multiple internal components together to ensure they are working as expected. While this still might not include interactions with external resources outside the codebase being tested (like networked resources), integration tests typically give a more complete picture of how your whole application will actually run.

Below is a piece of an integration test written with the MockMVC framework for a web application API written in Java.

```java
@Test
public void integrationTest_getMyResource() {
    this.mockMvc.perform(get("/myResource/123")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("value"));
}
```

The test spins up the web application, the various internal application components, simulates one of its API endpoints being requested, and asserts that the expected output is produced. In this case, we assert that when requesting the `myResource` endpoint with an id, we get a JSON payload back with that same id.

Some resulting features of integration tests:

- They are a bit more heavyweight and typically run slower compared to unit tests since they depend on multiple software components running together
- They give a better view of the "correctness" of your software beyond the code you write, but also for things like how libraries and frameworks affect how your application runs
- It's about as good as you're going to get with confidence that your software will run correctly without actually running it and testing it manually

I want to disclaimer a bit here before continuing. In most cases, unit and integration testing will probably get the quality of your software to where it needs to be. Beyond that, more complex types of testing will deliver value only if your software exhibits a certain level of complexity or demands a high degree of scale. As a result, you will find the below flavors of testing mainly in enterprise or other professional settings. However, there's plenty of value to have awareness and know when they might be effective to introduce into a project's development.

### End to End Testing

> From the front to the back

End to end (or E2E) testing comes into play when the software solution you are delivering has multiple, independent parts that may not be able to be represented in a single codebase. As a result, it is necessary to run tests with real instances of the applications to ensure that input on one end results in the expected output on the other end.

Since, by nature, E2E tests typically involve multiple codebases and applications, an example of an E2E test case can't really be represented by a simple code snippit. Rather, we could present an example software architecture and provide some examples of E2E tests scenarios we might like to execute, manually or through automation.

Consider the following architecture:

![Example Application Architecture](https://cdn-images-1.medium.com/max/800/1*Fcwphc6GDAEC6UEJObjHWQ.png)

Some E2E test cases might include:

- When a button is clicked on the UI, a request is routed from the first app server to the second server, processed, and returned to the UI
- When a form is submitted on the UI, a corresponding entry is created in the database
- When a button is clicked on the UI, and the second app server encounters an error, the first app server can gracefully handle it without disruption to the user

The same principles can be applied to any level of complex architecture.

As a result of this open ended bound of complexity:

- There really isn't a right or wrong way to do E2E tests, as long as validations are being made on appropriate inputs
- E2E tests are commonly performed manually since the value of automation can be nullified from the sheer number of changing parts of the system without tight integration with a codebase

### Performance Testing

> "Run like the wind Bullseye!"

Some applications are built with a very high volume workload in mind. For that reason, it would be necessary to validate that software can handle the demanding workloads by simulating them and analyzing the results.

For example, a web application could be expected to handle hundreds of requests per second while performing complex data transformations. A performance test might spin up an instance of the application and simulate high volume conditions while monitoring various application metrics like resource utilization and response time. The passing criteria for a performance test might be that every request is fulfilled within a defined time at peak load and computational resources are not exceeded.

### Load Testing

> "I'm givin' her all she's got Captain!"

There's a subtle distinction that needs to be made between load testing and performance testing. In a sense, load testing might be considered a subset of performance testing. Load testing is a method which evaluates the performance of a system under high load. You might want to understand the characteristics of the system, like CPU usage or memory, while it is being constantly hammered by a massive amount of requests or computations.

While performance testing might look directly at metrics like response time, load testing is more like a litmus test to ensure your application can hold up under stress. Think of it like a stress test for your application to make sure it doesn't fall over under a demanding workload. That way, you can have some confidence that when your application is under a high load in production, it will hum right along without crashing.

### User Acceptance Testing

> If we want users to like our software, we should design it to behave like a likeable person. -Alan Cooper

The user acceptance test or UAT might just be the ultimate of all tests mentioned here. It throws automated validations and calculated metrics out the door and instead puts the final judgement of the "correctness" of your software in the hands of its user. A UAT usually happens right after or before the delivery of an application to production. An end user is presented with the application and is encouraged to use it as they would normally. The acceptance criteria is pretty simple: does the software do what it's supposed to do for the user according to the user?

You could think of all the other types of testing we discussed here as servant to this final type. Ultimately, everything we do to make quality software is some way in service to the users of that software. We might have the most robust unit tests, ran our app through the battery of the hardest performance and load tests, and executed every E2E scenario imaginable. But in the end if the user doesn't get what they need, it's all pointless. However, we should still hold ourselves to a high standard of software quality. Eventually, that benefit should reach your users through less bugs, faster and more frequent delivery to production, and more flexibility to add features.

I hope you are more informed about the varied options when it comes to testing your software. If you haven't already, I encourage you to check out my post on [Continuous Integration and Deployment](https://medium.com/@nirespire/what-is-cicd-concepts-in-continuous-integration-and-deployment-4fe3f6625007) where software testing plays a central role.