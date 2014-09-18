Dependency injection - Invoker
===
1. Inject a constant value  
```
$inovke.inject('test', 'Hello, world');
var func = function(test) {
  console.log(test);
};
$inovke(func);
```
2. Inject a constant value in async mode  
```
$inovke.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
$inovke(func);
```
3. Inject a factory
```
$inovke.injectFactory('test', function() { return 'Hello, world'; });
var func = function(test) {
  console.log(test);
};
$inovke(func);
```
4. Inject an async factory
```
$inovke.injectFactory(
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
$inovke(func);
```
5. Do something after the method is invoked
```
$inovke.inject('test', 'Hello, world');
var func = function(test, $done) {
  console.log(test);
  setTimeout(
    function () {
      $done('done');
    },
    1000);
};
$inovke(func)
  .done(function () {
    console.log('done');
  });
```
