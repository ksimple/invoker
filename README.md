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
- invoke(...)  
Invoke a function with injections. This is an invoke object.

- invoke.inject(name, value)  
Inject a named constant value

- invoke.injectFactory(name, value)  
Inject a named factory, value should be an function

- invoke.get(name)  
Get a named inject value, this method will throw if the result is returned in async mode

- invoke.clearInject(name)  
Clear a named injection

- invoke.inherit()  
Create a child invoke object which inherit from invoke. Child invoke can resolve inject from parent one and override the injection with the same name.

- invoke.clone()  
Clone invoke

- invoke.create  
Create a new invoke object which has null parent

Examples
---
- Inject a constant value  
```
invoke.inject('test', 'Hello, world');
var func = function(test) {
  console.log(test);
};
// or invoke(['test', func]);
// or invoke('test', func);
invoke(func);
```
- Inject a constant value in async mode  
```
invoke.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
invoke(func);
```
- Inject a factory
```
invoke.inject('factoryDependency', 'depend');
invoke.injectFactory(
  'test',
  // or ['factoryDependency', function (dep) { console.log(dep); }]
  function(factoryDependency) {
    console.log(factoryDependency)
    return 'Hello, world';
  });
var func = function(test) {
  console.log(test);
};
invoke(func);
```
- Inject an async factory
```
invoke.injectFactory(
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
invoke(func);
```
- Do something after the method is invoked
```
var func = function(test) {
  return test;
};
invoke.injectFactory(
  'test',
  function($done) {
    setTimeout(function() {
      $done('done');
    },
    1000);
  }
);
invoke(func)
  .done(function (result) {
    // result is 'done'
    console.log(result);
  });
```
