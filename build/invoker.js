var invoker = (function () {
    function resultSender() {
        var result;
        var resultReceived = false;
        var callback;
        var doneCalled = false;

        this.done = function (func) {
            if (doneCalled) {
                throw "Done can't be call twice";
            }

            doneCalled = true;

            if (resultReceived) {
                func(result);
            } else {
                callback = func;
            }
        };

        this.setResult = function (newResult) {
            if (resultReceived) {
                throw "setResult can't be call twice";
            }

            if (doneCalled) {
                if (callback) {
                    callback(newResult);
                }
                resultReceived = true;
            } else {
                result = newResult;
                resultReceived = true;
            }
        };
    }

    function createInvoke(parent) {
        if (typeof parent === "undefined") { parent = null; }
        var injection = {};
        var config = {};
        var factoryInvoker = null;

        var invoker = function invoker() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args.length == 0) {
                return;
            }

            args = Array.prototype.slice.apply(arguments);
            var func = args.pop();

            if (typeof func === 'function' && args.length === 0) {
                args = getArgNames(func);
            } else if (typeof func === 'object' && func instanceof Array) {
                args = func;
                func = args.pop();
            }

            var result = new resultSender();

            invokeInternal(args, func, result);
            return result;
        };

        function getArgNames(func) {
            var functionDefiniation = /^\s*function.*?\((.*?)\)/.exec(func.toString());

            if (functionDefiniation) {
                var args = functionDefiniation[1].replace(/\s*/g, '');

                if (args.length > 0) {
                    return args.replace(/\s*/g, '').split(',');
                } else {
                    return [];
                }
            }

            return [];
        }

        function createFacotryInvokerCallback(setArgs, index) {
            return function (result) {
                return setArgs(index, result);
            };
        }

        function invokeInternal(args, func, resultSender) {
            if (args.length === 0) {
                resultSender.setResult(func.apply(null, []));
            } else {
                var resolvedCount = 0;
                var resolvedArgs = [];
                var async = false;

                function setArgs(index, value) {
                    resolvedArgs[index] = value;
                    resolvedCount++;

                    if (resolvedCount >= args.length) {
                        if (async) {
                            func.apply(null, resolvedArgs);
                        } else {
                            resultSender.setResult(func.apply(null, resolvedArgs));
                        }
                    }
                }

                for (var index = 0; index < args.length; index++) {
                    var name = args[index];

                    resolve(name).done(createFacotryInvokerCallback(setArgs, index));
                }
            }
        }

        function resolve(name) {
            var oneInjection = injection[name];
            var result = new resultSender();

            if (name == '$invoker') {
                result.setResult(invoker);
            } else if (typeof oneInjection === 'undefined') {
                if (parent) {
                    parent([name, function (r) {
                            return result.setResult(r);
                        }]);
                } else {
                    // should throw exception here
                    result.setResult(undefined);
                }
            } else if (oneInjection.type === 'raw') {
                result.setResult(oneInjection.rawValue);
            } else if (oneInjection.type === 'factory') {
                if (!factoryInvoker) {
                    factoryInvoker = invoker.inherit();
                }

                factoryInvoker.inject('$done', function (r) {
                    return result.setResult(r);
                });

                if (oneInjection.isAsync) {
                    factoryInvoker(oneInjection.factory);
                } else {
                    factoryInvoker(oneInjection.factory).done(function (r) {
                        return result.setResult(r);
                    });
                }
            } else {
                throw "Not recongnized injection type";
            }

            return result;
        }

        invoker.injectFactory = function $invoke$injectFactory(name, value) {
            var factory, isAsync;

            if (typeof value === 'function') {
                factory = getArgNames(value);

                factory.push(value);
            } else if (typeof value === 'object' && value instanceof Array) {
                factory = value;
            }

            isAsync = factory.indexOf('$done') > 0;

            injection[name] = {
                type: 'factory',
                isAsync: factory.indexOf('$done') >= 0,
                factory: factory
            };
        };

        invoker.inject = function $invoke$inject(name, value) {
            injection[name] = {
                type: 'raw',
                rawValue: value
            };
        };

        invoker.clearInject = function $invoke$clearInject(name) {
            delete injection[name];
        };

        invoker.config = function $invoke$config(newConfig) {
            for (var i in newConfig) {
                config[i] = newConfig[i];
            }
        };

        invoker.inherit = function $invoke$inherit() {
            var instance = createInvoke(this);

            return instance;
        };

        invoker.clone = function $invoke$clone() {
            var instance = createInvoke(parent);

            for (var i in injection) {
                if (injection[i].type === 'raw') {
                    instance.inject(injection[i], injection[i].rawValue);
                } else if (injection[i].type === 'factory') {
                    instance.injectFactory(injection[i], injection[i].factory);
                }
            }

            instance.config(config);
            return instance;
        };

        invoker.create = function $invoke$inherit() {
            var instance = createInvoke();

            return instance;
        };

        return invoker;
    }

    return createInvoke();
})();
//# sourceMappingURL=invoker.js.map
