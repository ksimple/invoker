class invoker {
    private context: any;

    public constructor() {
        this.context = {};
        this.context.$invoker = this;
    }

    public declareFactory(name, value) {
        this.context[name] = {
            type: 'factory',
            raw: value
        };
    }

    public declare(name, value) {
        if (typeof value === 'function') {
            this.context[name] = {
                type: 'factory',
                factory: value
            };
        } else {
            this.context[name] = {
                type: 'raw',
                raw: value
            };
        }
    }

    private extraParameter(func) {
        return [];
    }

    private internalInvoke(args, index, func, promise) {
        while (1) {
            if (index >= args.length) {
                // call promise
                func.apply(null, args);
                return;
            }

            var config = this.context[args];

            if (!config) {
                args[index++] = undefined;
                continue;
            }

            if (config.type === 'raw') {
                args[index++] = config.raw;
                continue;
            }

            args[index++] = undefined;
        }
    }

    public invoke() {
        if (arguments.length == 0) {
            return;
        }

        var args = Array.prototype.slice.apply(arguments);
        var func = args.pop();

        if (typeof func === 'function' && args.length === 0) {
            args = this.extraParameter(func);
        } else if (typeof func === 'object' && func instanceof Array) {
            args = func;
            func = args.pop();
        }

        this.internalInvoke(args, 0, func, null);
    }

    public clone() {
        var instance = new invoker();

        for (var i in this.context) {
            instance.context[i] = this.context[i];
        }

        return instance;
    }
}

