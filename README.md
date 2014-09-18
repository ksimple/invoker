Dependency injection - Invoker
===
- Inject a constant value  
```
$inovke.inject('test', 'Hello, world');
var func = function(test) {
  console.log(test);
};
$inovke(func);
```
- Inject a constant value in async mode  
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
- Inject a factory
```
$inovke.injectFactory('test', function() { return 'Hello, world'; });
var func = function(test) {
  console.log(test);
};
$inovke(func);
```
- Inject an async factory
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
- Do something after the method is invoked
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
  .done(function (result) {
    // result is 'done'
    console.log(result);
  });
```
