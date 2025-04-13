---
layout: layouts/post.njk
title: "Asynchronous JavaScript"
subtitle: "Callbacks vs Promises vs Async/Await"
date: 2018-04-01
tags: ["javascript", "programming", "web-development"]
---

> Callbacks vs Promises vs Async/Await

JavaScript and many other programming languages support an abstraction known as asynchronous execution. What this means is when you want to execute some task that might return some data in an unknown amount of time, JavaScript lets you predefine what to do once that data does show up while continuing to run the rest of your program.

An example of this might be calling an HTTP service which might take 500 milliseconds to return a value with a good network connection or 5 seconds if the network connection is poor. Instead of locking up your program for up to 5 seconds, JavaScript just lets you say what to do when the value does come back, continues on its merry way, and only handles the response when it has to.

As of the date I am writing this article and the current ECMAScript8 specification JavaScript follows, there are 3 main ways to write these asynchronous abstractions. Here's a brief overview of each.

> Each abstraction presented below will achieving the same result: call a function that does an asynchronous task like calling an external service over a network that returns some data and prints that data to the console.

### Callbacks

Callbacks are the original and usually simplest abstraction to first learn about asynchronous programming. Basically, when you have a function that you want to run asynchronously, you include a "callback function" as one of the input parameters. When the function finishes what it's doing, it will "call back" that function with some data if its successful. You can extend this by passing more than one callback function, usually one to handle when the function succeeds, and one for when there is an error.

Example in JavaScript:

```javascript
console.log("Start of my code")
const myCallbackFunction = function(dataReturned) {
    console.log("Got the data!")
}

// Simulating a service call that takes 50ms to return data
// Then calls the callback function
setTimeout(myCallbackFunction, 50);

console.log("End of my code")
```

Should result in the following output:
```
Start of my code
End of my code
Here's the data returned
```

[Run it here!](https://codepen.io/Nirespire/pen/QmrxgZ)

**What's good**: A pretty simple abstraction for beginners to learn and easy to debug.

**What's not so good**: So-called "callback hell" when you have to chain together multiple asynchronous operations, your code can get messy and unreadable fast.

### Promises

Promises are a step up from callbacks in that instead of having to predefine how you want to handle the result of your asynchronous operation up front in the same context, you use what's called a Promise object to represent your request and handle it when and where you want.

When you call an asynchronous function that supports Promises, it will immediately return a Promise object. This object can be in 1 of 3 states: *pending*, *resolved*, or *rejected*. Each of these states means the request is still being worked on, the request has been completed with a result, or the request has failed with an error respectively.

You can pass the promise object around, and when you are ready, you can use the built in `.then` function to handle the result or the `.catch` function to handle an error.

Example in JavaScript:

```javascript
console.log("Start of my code");

function getMyData() {
  return new Promise(function(resolve, reject) {
    // Simulate getting the data successfully
    resolve("Some data");
  });
}

getMyData()
  .then(myData => {
    console.log("Got the data!");
  })
  .catch(error => {
    console.log("something went wrong");
  });

console.log("End of my code");
```

Should result in the following output:
```
"Start of my code"
"End of my code"
"Got the data!"
```

[Run it here!](https://codepen.io/Nirespire/pen/dmeppB)

**What's good**: Give's you a lot more flexibility to organize your code. You can chain together multiple asynchronous operations with `.then` functions easily. Good library support to handle parallel groups of asynchronous operations.

**What's not so good**: Doesn't provide any runtime advantages like better performance compared to callbacks. Really just cleaner code.

### Async/Await

The async/await abstraction is the new and shiny for developers looking to be on the cutting edge of JavaScript development. It is only recently getting standard support in browsers but has been available to use through transpilers like Babel. This is due mainly to the fact that async/await is really just syntactic sugar over the existing Promise abstraction.

What async/await lets us do is write asynchronous code in a more linear fashion than callbacks or Promises. If a function is going to do an async operation, you just slap an `async` keyword in front of it. Then when you call the async function, just provide the `await` keyword before it, and your code will run as if it is waiting for the function to return before running the next line of code.

This should be nothing new for anyone programming in a language that is written with the expectation of synchronous execution like Java or C++.

Example in JavaScript:

```javascript
function getMyData() {
  return new Promise(function(resolve, reject) {
    // Simulate getting the data successfully
    resolve("Some data");
  })
    .then(function(data){return data});
}

async function getMyAsyncData(){
  console.log("Start of my code");
  
  const myData = await getMyData();
  console.log("Got my Data! ", myData);
  
  console.log("End of my code");
}

getMyAsyncData();
```

Should result in the following output:
```
"Start of my code"
"Got my Data! " "Some data"
"End of my code"
```

[Run it here!](https://codepen.io/Nirespire/pen/aYGmBQ)

**What's good**: Let's your write asynchronous code linearly with no new constructs like callback functions or Promise object syntax. Since it's just Promises under the hood however, it's easy to debug and is by far the cleanest way to keep your code concise.

**What's not so good**: As of writing this article, support for async/await is still picking up speed, both in tooling and with developers. It's supported by all the major browsers and Node, however backwards compatibility still requires polyfills. Check on its current support [here](https://caniuse.com/#feat=async-functions).

### Final Thoughts

If you're working with JavaScript, you're going to encounter one of these abstractions at some point. More likely, you're going to have to write some asynchronous code yourself. A good rule of thumb is if you are writing new code, start by using Promises, as they lend themselves to future maintainability the best. As the codebase grows, your code should stay cleaner comparatively than if you used callbacks. If you see places where the Promise syntax might be a bit too verbose, try to swap it out for async/await. Keep in mind what browsers/platforms you are building for and add transpilers or polyfills as necessary.

### Further Reading

* Documentation on the Mozilla Developer Network:
* [Callbacks](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
* [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) and [Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
* [CanIUse.com](https://caniuse.com): to see what language features are supported by which browsers