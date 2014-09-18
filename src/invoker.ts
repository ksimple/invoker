var $invoke = (function() {
    function resultSender() {
        var result;
        var resultReceived = false;
        var callback;
        var doneCalled = false

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
            if (callback) {
                callback(newResult);
            } else {
                result = newResult;
                resultReceived = true;
            }
        };
    }

    function createInvoke() {
        var injection = {};
        var config = {};
        var factoryInvoker = null;

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
            return (result) => setArgs(index, result);
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

                    if (name === '$done') {
                        if (async) {
                            throw "Can't set two $done in arguments";
                        }

                        async = true;
                        setArgs(index, (result) => resultSender.setResult(result));
                        continue;
                    }

                    var oneInjection = injection[name];

                    if (!oneInjection) {
                        setArgs(index, undefined);
                    } else if (oneInjection.type === 'raw') {
                        setArgs(index, oneInjection.rawValue);
                        continue;
                    } else if (oneInjection.type === 'factory') {
                        if (!factoryInvoker) {
                            factoryInvoker = createInvoke();

                            factoryInvoker.inject('$invoke', $invoke);
                        }

                        factoryInvoker(oneInjection.factory).done(createFacotryInvokerCallback(setArgs, index));
                    } else {
                        throw "Not recongnized injection type";
                    }
                }
            }
        }

        $invoke = function $invoke(...args) {
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

        $invoke.injectFactory = function $invoke$injectFactory(name, value) {
            if (typeof value === 'function') {
                var factory = getArgNames(value);

                factory.push(value);

                injection[name] = {
                    type: 'factory',
                    factory: factory,
                };
            } else if (typeof value === 'object' && value instanceof Array) {
                injection[name] = {
                    type: 'factory',
                    factory: value,
                };
            }
        };

        $invoke.inject = function $invoke$inject(name, value) {
            injection[name] = {
                type: 'raw',
                rawValue: value,
            };
        };

        $invoke.config = function $invoke$config(newConfig) {
            for (var i in newConfig) {
                config[i] = newConfig[i];
            }
        };

        $invoke.clone = function $invoke$clone() {
            var instance = createInvoke();

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

        return $invoke;
    }

    return createInvoke();
})();

