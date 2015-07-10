describe('unit', function() {
    invokerTestInstance = null;

    beforeEach(function() {
        invokerTestInstance = invoker.clone();
    });

    function injectRawSequence(invoker, namePrefix, valuePrefix, count) {
        for (var i = 0; i < count; i++) {
            invoker.inject(namePrefix + i, valuePrefix + i);
        }
    }

    function injectFactorySequence(invoker, namePrefix, valuePrefix, count, callback) {
        function createCallaback(i) {
            return function () {
                callback();
                return valuePrefix + i;
            };
        };
        for (var i = 0; i < count; i++) {
            invoker.injectFactory(namePrefix + i, createCallaback(i));
        }
    }

    it('create', function() {
        var invokerTestInstance = invoker.create();
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });

    it('return value', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; return 'done'; };

        invokerTestInstance(test).done(function (result) {
            expect(callCount).toBe(1);
            expect(result).toBe('done');
        });
    });

    it('injected invoker', function() {
        var callCount = 0;
        var test = function($invoker) { callCount++; return $invoker == invokerTestInstance; };

        invokerTestInstance(test).done(function (result) {
            expect(callCount).toBe(1);
            expect(result).toBe(true);
        });
    });

    it('clone', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'valueBeforeOverride', 6);
        var $clonedInvokeTestInstance = invokerTestInstance.clone();

        injectRawSequence($clonedInvokeTestInstance, 'name', 'valueAfterOverride', 6);

        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('valueBeforeOverride0');
        expect(args[1]).toBe('valueBeforeOverride4');
        expect(args[2]).toBe('valueBeforeOverride2');

        $clonedInvokeTestInstance(test);
        expect(callCount).toBe(2);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('valueAfterOverride0');
        expect(args[1]).toBe('valueAfterOverride4');
        expect(args[2]).toBe('valueAfterOverride2');
    });

    it('clear injection', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance.clearInject('name4');
        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe(undefined);
        expect(args[2]).toBe('value2');
    });

    it('inject parent', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2, nameOverride0, nameOverride4, nameOverride2) { callCount++; args = arguments; };
        var $inheritedInvokeTestInstance = invokerTestInstance.inherit();

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        injectRawSequence(invokerTestInstance, 'nameOverride', 'valueBeforeOverride', 6);
        injectRawSequence($inheritedInvokeTestInstance, 'nameOverride', 'valueAfterOverride', 6);

        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(6);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
        expect(args[3]).toBe('valueBeforeOverride0');
        expect(args[4]).toBe('valueBeforeOverride4');
        expect(args[5]).toBe('valueBeforeOverride2');

        $inheritedInvokeTestInstance(test);
        expect(callCount).toBe(2);
        expect(args.length).toBe(6);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
        expect(args[3]).toBe('valueAfterOverride0');
        expect(args[4]).toBe('valueAfterOverride4');
        expect(args[5]).toBe('valueAfterOverride2');
    });

    it('inject raw value', function() {
        var callCount = 0;
        var args = null;
        var test = function(rawValue) { callCount++; args = arguments; return 'done'; };

        invokerTestInstance.inject('rawValue', 'trueValue');
        invokerTestInstance(test).done(function (result) {
            expect(result).toBe('done');
        });

        expect(callCount).toBe(1);
        expect(args.length).toBe(1);
        expect(args[0]).toBe('trueValue');
    });

    it('inject sync factory', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(syncFactory) { callCount++; args = arguments; return 'done'; };
        var syncFactory = function(name0, name4, name2) { factoryCallCount++; return arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance.injectFactory('syncFactory', syncFactory);
        invokerTestInstance(test).done(function (result) {
            expect(result).toBe('done');
        });

        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(1);
        expect(args.length).toBe(1);
        expect(args[0].length).toBe(3);
        expect(args[0][0]).toBe('value0');
        expect(args[0][1]).toBe('value4');
        expect(args[0][2]).toBe('value2');
    });

    it('inject async factory', function(done) {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(asyncFactory) { callCount++; args = arguments; return 'done'; };
        var asyncFactory = function(name0, name4, name2, $done) { factoryCallCount++; var args = arguments; setTimeout(function () { $done(args); }, 1); };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance.injectFactory('asyncFactory', asyncFactory);
        invokerTestInstance(test).done(function (result) {
            expect(result).toBe('done');
            expect(callCount).toBe(1);
            expect(factoryCallCount).toBe(1);
            expect(args.length).toBe(1);
            expect(args[0].length).toBe(4);
            expect(args[0][0]).toBe('value0');
            expect(args[0][1]).toBe('value4');
            expect(args[0][2]).toBe('value2');
            done();
        });
    });

    it('invoke without arguments', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; };

        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke without arguments in array', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; };

        invokerTestInstance([test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke with raw value', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });

    it('invoke with raw value in array', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; };

        injectRawSequence(invokerTestInstance, 'name', 'value', 6);
        invokerTestInstance(['name0', 'name4', 'name2', test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });

    it('invoke with factory value', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectFactorySequence(invokerTestInstance, 'name', 'value', 6, function() { factoryCallCount++; });
        invokerTestInstance(test);
        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(3);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });

    it('invoke with factory value in array', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function() { callCount++; args = arguments; };

        injectFactorySequence(invokerTestInstance, 'name', 'value', 6, function() { factoryCallCount++; });
        invokerTestInstance(['name0', 'name4', 'name2', test]);
        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(3);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });
});

