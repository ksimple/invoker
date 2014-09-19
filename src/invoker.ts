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

    function createInvoke(parent = null) {
        var injection = {};
        var config = {};
        var factoryInvoker = null;

        var $invoke: any = function $invoke(...args) {
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

                    resolve(name).done(createFacotryInvokerCallback(setArgs, index));
                }
            }
        }

        function resolve(name) {
            var oneInjection = injection[name];
            var result = new resultSender();

            if (typeof oneInjection === 'undefined') {
                if (parent) {
                    parent([name, (r) => result.setResult(r)]);
                } else {
                    result.setResult(undefined);
                }
            } else if (oneInjection.type === 'raw') {
                result.setResult(oneInjection.rawValue);
            } else if (oneInjection.type === 'factory') {
                $invoke(oneInjection.factory).done((r) => result.setResult(r));
            } else {
                throw "Not recongnized injection type";
            }

            return result;
        }

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

        $invoke.clearInject = function $invoke$clearInject(name) {
            delete injection[name];
        };

        $invoke.config = function $invoke$config(newConfig) {
            for (var i in newConfig) {
                config[i] = newConfig[i];
            }
        };

        $invoke.inherit = function $invoke$inherit() {
            var instance = createInvoke(this);

            return instance;
        };

        $invoke.clone = function $invoke$clone() {
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

        $invoke.create = function $invoke$inherit() {
            var instance = createInvoke();

            return instance;
        };


        return $invoke;
    }

    return createInvoke();
})();

