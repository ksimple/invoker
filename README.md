Dependency injection - Invoker
===
Build
---
```
npm install
grunt debug
grunt test
```
APIs
---
- invoker(...)  
Invoke a function with injections. This is an invoke object.

- invoker.inject(name, value)  
Inject a named constant value

- invoker.injectFactory(name, value)  
Inject a named factory, value should be an function

- invoker.clearInject(name)  
Clear a named injection

- invoker.inherit()  
Create a child invoke object which inherit from invoker. Child invoke can resolve inject from parent one and override the injection with the same name.

- invoker.clone()  
Clone invoker

- invoker.create  
Create a new invoke object which has null parent

Examples
---
- Inject a constant value  
```
invoker.inject('test', 'Hello, world');
var func = function(test) {
  console.log(test);
};
// or invoker(['test', func]);
// or invoker('test', func);
invoker(func);
```
- Inject a constant value in async mode  
```
invoker.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
invoker(func);
```
- Inject a factory
```
invoker.inject('factoryDependency', 'depend');
invoker.injectFactory(
  'test',
  // or ['factoryDependency', function (dep) { console.log(dep); }]
  function(factoryDependency) {
    console.log(factoryDependency)
    return 'Hello, world';
  });
var func = function(test) {
  console.log(test);
};
invoker(func);
```
- Inject an async factory
```
invoker.injectFactory(
  'test',
  function($done) {
    setTimeout(function() {
      $done('Hello, world');
    },
    1000);
  }
);
var func = function(test) {
  console.log(test);
};
invoker(func);
```
- Do something after the method is invoked
```
var func = function(test) {
  return test;
};
invoker.injectFactory(
  'test',
  function($done) {
    setTimeout(function() {
      $done('done');
    },
    1000);
  }
);
invoker(func)
  .done(function (result) {
    // result is 'done'
    console.log(result);
  });
```
