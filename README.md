Dependency injection - Invoker
===
Build
---
```
npm install
grunt debug
grunt test
```
Examples
---
- Inject a constant value  
```
$invoke.inject('test', 'Hello, world');
var func = function(test) {
  console.log(test);
};
// or $invoke(['test', func]);
// or $invoke('test', func);
$invoke(func);
```
- Inject a constant value in async mode  
```
$invoke.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
$invoke(func);
```
- Inject a factory
```
$invoke.inject('factoryDependency', 'depend');
$invoke.injectFactory(
  'test',
  // or ['factoryDependency', function (dep) { console.log(dep); }]
  function(factoryDependency) {
    console.log(factoryDependency)
    return 'Hello, world';
  });
var func = function(test) {
  console.log(test);
};
$invoke(func);
```
- Inject an async factory
```
$invoke.injectFactory(
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
$invoke(func);
```
- Do something after the method is invoked
```
$invoke.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
$invoke(func)
  .done(function (result) {
    // result is 'done'
    console.log(result);
  });
```
