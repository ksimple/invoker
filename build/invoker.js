var invoke = (function () {
    var globalInovkeId = 0;

    function resultSender() {
        var result;
        var resultReceived = false;
        var callback;
        var doneCalled = false;

        this.done = function (func) {
            if (doneCalled) {
                throw new Error("Done can't be call twice.");
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
                throw new Error("setResult can't be call twice.");
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
        var factoryInvoke = null;

        var invoke = function invoke() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var result;

            call.call(this, args, false).done(function (r) {
                result = r;
            });

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

        function invokeInternal(_this, func, args, locals, isCreateInstance, allowAsyncResolve, resultSender) {
            var resolvedCount = 0;
            var resolvedArgs = [];

            if (isCreateInstance) {
                function F() {
                    func.apply(this, resolvedArgs);
                }

                F.prototype = func.prototype;
            }

            if (args.length === 0) {
                if (!isCreateInstance) {
                    resultSender.setResult(func.apply(_this, resolvedArgs));
                } else {
                    resultSender.setResult(new F());
                }
            } else {
                function setArgs(index, value) {
                    resolvedArgs[index] = value;
                    resolvedCount++;

                    if (resolvedCount >= args.length) {
                        if (!isCreateInstance) {
                            resultSender.setResult(func.apply(_this, resolvedArgs));
                        } else {
                            resultSender.setResult(new F());
                        }
                    }
                }

                function resolveCallback(setArgs, index) {
                    return function (result) {
                        return setArgs(index, result);
                    };
                }

                for (var index = 0; index < args.length; index++) {
                    var name = args[index];

                    if (locals && locals[name]) {
                        resolveCallback(setArgs, index)(locals[name]);
                    } else {
                        resolve(name, allowAsyncResolve).done(resolveCallback(setArgs, index));
                    }
                }
            }
        }

        function resolve(name, allowAsyncResolve) {
            var oneInjection = injection[name];
            var result = new resultSender();

            if (name == '$invoke') {
                result.setResult(invoke);
            } else if (typeof oneInjection === 'undefined') {
                if (parent) {
                    if (allowAsyncResolve) {
                        parent.resolveAsync(name).done(function (r) {
                            return result.setResult(r);
                        });
                    } else {
                        result.setResult(parent.resolve(name));
                    }
                } else {
                    // should throw exception here
                    result.setResult(undefined);
                }
            } else if (oneInjection.type === 'raw') {
                result.setResult(oneInjection.rawValue);
            } else if (oneInjection.type === 'factory') {
                if (oneInjection.isAsync && !allowAsyncResolve) {
                    throw new Error("Resolve async dependency is not allowed.");
                }

                if (!factoryInvoke) {
                    factoryInvoke = invoke.inherit();
                }

                factoryInvoke.inject('$done', function (r) {
                    return result.setResult(r);
                });

                if (oneInjection.isAsync) {
                    factoryInvoke.callAsync(oneInjection.factory);
                } else {
                    result.setResult(factoryInvoke(oneInjection.factory));
                }
            } else {
                throw new Error("Not recongnized injection type.");
            }

            return result;
        }

        function getFuncAndArgs(args) {
            var func, locals;

            if (args.length != 1 && args.length != 2) {
                throw new Error("Bad arguments format to invoke method");
            }

            if (args.length == 2) {
                locals = args.pop();
            }

            if (args[0] instanceof Array) {
                args = args[0];

                if (args.length == 0 || typeof args[args.length - 1] !== 'function') {
                    throw new Error("Bad arguments format to invoke method");
                }

                func = args.pop();
            } else if (typeof args[0] === 'function') {
                func = args[0];
                args = getArgNames(func);
            }

            return [func, args, locals];
        }

        function call(args, allowAsyncResolve) {
            var func, locals;

            var _ = getFuncAndArgs(args);
            func = _[0];
            args = _[1];
            locals = _[2];

            var result = new resultSender();

            invokeInternal(this, func, args, locals, false, allowAsyncResolve, result);
            return result;
        }
        ;

        invoke.callAsync = function $invoke$callAsync() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return call.call(this, args, true);
        };

        invoke.createInstance = function $invoke$createInstance() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var func, locals;

            var _ = getFuncAndArgs(args);
            func = _[0];
            args = _[1];
            locals = _[2];

            var result = new resultSender();
            var instance;

            invokeInternal(null, func, args, locals, true, false, result);
            result.done(function (result) {
                instance = result;
            });

            return instance;
        };

        invoke.createInstanceAsync = function $invoke$createInstance() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var func, locals;

            var _ = getFuncAndArgs(args);
            func = _[0];
            args = _[1];
            locals = _[2];

            var result = new resultSender();

            invokeInternal(null, func, args, locals, true, true, result);
            return result;
        };

        invoke.resolve = function $invoke$resolve(name) {
            var result;

            resolve(name, false).done(function (r) {
                result = r;
            });

            return result;
        };

        invoke.resolveAsync = function $invoke$get(name) {
            return resolve(name, true);
        };

        invoke.injectFactory = function $invoke$injectFactory(name, value) {
            var factory, isAsync;

            if (typeof value === 'function') {
                factory = getArgNames(value);

                factory.push(value);
            } else if (typeof value === 'object' && value instanceof Array) {
                factory = value;
            }

            isAsync = factory[0] == '$done';

            injection[name] = {
                type: 'factory',
                isAsync: isAsync,
                factory: factory
            };
        };

        invoke.inject = function $invoke$inject(name, value) {
            injection[name] = {
                type: 'raw',
                rawValue: value
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
//# sourceMappingURL=invoker.js.map
