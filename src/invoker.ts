var $invoke = (function() {
    function createInvoke() {
        var injection = {};
        var config = {};

        function extraParameter(func) {
            return [];
        }

        function invokeInternal(args, index, func, promise) {
            while (1) {
                if (index >= args.length) {
                    // call promise
                    func.apply(null, args);
                    return;
                }

                var oneInjection = injection[args];

                if (!oneInjection) {
                    args[index++] = undefined;
                    continue;
                }

                if (oneInjection.type === 'raw') {
                    args[index++] = oneInjection.raw;
                    continue;
                }

                args[index++] = undefined;
            }
        }

        $invoke = function $invoke(...args) {
            if (args.length == 0) {
                return;
            }

            args = Array.prototype.slice.apply(arguments);
            var func = args.pop();

            if (typeof func === 'function' && args.length === 0) {
                args = extraParameter(func);
            } else if (typeof func === 'object' && func instanceof Array) {
                args = func;
                func = args.pop();
            }

            invokeInternal(args, 0, func, null);
        };

        $invoke.inject = function $invoke$inject(name, value) {
            if (!this.injection) {
                this.injection = {};
            }
            if (typeof value === 'function') {
                injection[name] = {
                    type: 'factory',
                    factory: value
                };
            } else {
                injection[name] = {
                    type: 'raw',
                    raw: value
                };
            }
        };

        $invoke.config = function $invoke$config(newConfig) {
            for (var i in newConfig) {
                config[i] = newConfig[i];
            }
        };

        $invoke.clone = function $invoke$clone() {
            var instance = createInvoke();

            for (var i in injection) {
                instance.inject(injection[i], injection[i]);
            }

            instance.config(config);
            return instance;
        };

        return $invoke;
    }

    return createInvoke();
})();

