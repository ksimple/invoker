var invoke = (function() {
    var globalInovkeId = 0;

    function resultSender() {
        var result;
        var resultReceived = false;
        var callback;
        var doneCalled = false

        this.done = function (func) {
            if (doneCalled) {
                throw new Error("Done can't be call twice");
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
                throw new Error("setResult can't be call twice");
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

    function createInvoke(parent = null) {
        var injection = {};
        var config = {};
        var factoryInvoke = null;

        var invoke: any = function invoke(...args) {
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

            invokeInternal(args, null, func, result);
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

        function invokeInternal(args, _this, func, resultSender) {
            if (args.length === 0) {
                resultSender.setResult(func.apply(_this, []));
            } else {
                var resolvedCount = 0;
                var resolvedArgs = [];
                var async = false;

                function setArgs(index, value) {
                    resolvedArgs[index] = value;
                    resolvedCount++;

                    if (resolvedCount >= args.length) {
                        if (async) {
                            func.apply(_this, resolvedArgs);
                        } else {
                            resultSender.setResult(func.apply(_this, resolvedArgs));
                        }
                    }
                }

                function resolveCallback(setArgs, index) {
                    return (result) => setArgs(index, result);
                }

                for (var index = 0; index < args.length; index++) {
                    var name = args[index];

                    resolve(name).done(resolveCallback(setArgs, index));
                }
            }
        }

        function resolve(name) {
            var oneInjection = injection[name];
            var result = new resultSender();

            if (name == '$invoke') {
                result.setResult(invoke);
            } else if (typeof oneInjection === 'undefined') {
                if (parent) {
                    parent([name, (r) => result.setResult(r)]);
                } else {
                    // should throw exception here
                    result.setResult(undefined);
                }
            } else if (oneInjection.type === 'raw') {
                result.setResult(oneInjection.rawValue);
            } else if (oneInjection.type === 'factory') {
                if (!factoryInvoke) {
                    factoryInvoke = invoke.inherit();
                }

                factoryInvoke.inject('$done', (r) => result.setResult(r));

                if (oneInjection.isAsync) {
                    factoryInvoke(oneInjection.factory);
                } else {
                    factoryInvoke(oneInjection.factory).done((r) => result.setResult(r));
                }
            } else {
                throw new Error("Not recongnized injection type");
            }

            return result;
        }

        invoke.resolve = function $invoke$get(name) {
            return resolve(name);
        }

        invoke.get = function $invoke$get(name) {
            var result;
            var doneCalled = false;

            resolve(name).done((r) => {
                result = r;
                doneCalled = true;
            });

            if (!doneCalled) {
                throw new Error("Can't get result of async injected");
            }

            return result;
        }

        invoke.withThis = function $invoke$withThis(...args) {
            if (args.length == 0) {
                return;
            }

            var _this, func, arrayPassed;

            if (args.length == 1) {
                if (!(args[0] instanceof Array)) {
                    return;
                }

                args = args[0];

                if (args.length < 2) {
                    return;
                }

                func = args.pop();
                _this = args.pop();
            } else {
                args = Array.prototype.slice.apply(arguments);

                if (args.length < 2) {
                    return;
                }

                func = args.pop();
                _this = args.pop();

                if (args.length == 0) {
                    args = getArgNames(func);
                }
            }

            var result = new resultSender();

            invokeInternal(args, _this, func, result);
            return result;
        };

        invoke.injectFactory = function $invoke$injectFactory(name, value) {
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
                factory: factory,
            };
        };

        invoke.inject = function $invoke$inject(name, value) {
            injection[name] = {
                type: 'raw',
                rawValue: value,
            };
        };

        invoke.clearInject = function $invoke$clearInject(name) {
            delete injection[name];
        };

        invoke.config = function $invoke$config(newConfig) {
            for (var i in newConfig) {
                config[i] = newConfig[i];
            }
        };

        invoke.inherit = function $invoke$inherit() {
            var instance = createInvoke(this);

            return instance;
        };

        invoke.clone = function $invoke$clone() {
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

        invoke.create = function $invoke$inherit() {
            var instance = createInvoke();

            return instance;
        };

        invoke.id = globalInovkeId++;

        return invoke;
    }

    return createInvoke();
})();

