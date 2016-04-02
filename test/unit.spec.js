describe('unit', function() {
    invokeTestInstance = null;

    beforeEach(function() {
        invokeTestInstance = invoke.clone();
    });

    function injectRawSequence(invoke, namePrefix, valuePrefix, count) {
        for (var i = 0; i < count; i++) {
            invoke.inject(namePrefix + i, valuePrefix + i);
        }
    }

    function injectFactorySequence(invoke, namePrefix, valuePrefix, count, callback) {
        function createCallaback(i) {
            return function () {
                callback();
                return valuePrefix + i;
            };
        };
        for (var i = 0; i < count; i++) {
            invoke.injectFactory(namePrefix + i, createCallaback(i));
        }
    }

    it('create', function() {
        var invokeTestInstance = invoke.create();
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });

    it('inherit', function() {
        var root = invoke;
        var child = root.inherit();
        var grandChild = child.inherit();

        child.inject('child', true);

        var test = function(child, $invoke) { return arguments; };

        grandChild(test).done(function (result) {
            expect(result[0]).toBe(true);
            expect(result[1]).toBe(grandChild);
        });
    });

    it('return value', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; return 'done'; };

        invokeTestInstance(test).done(function (result) {
            expect(callCount).toBe(1);
            expect(result).toBe('done');
        });
    });

    it('get raw value', function() {
        var callCount = 0;
        var args = null;

        invokeTestInstance.inject('rawValue', 'trueValue');
        expect(invokeTestInstance.get('rawValue')).toBe('trueValue');
    });

    it('get async value and fail', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var asyncFactory = function($done) { factoryCallCount++; var args = arguments; setTimeout(function () { $done(args); }, 1); };

        invokeTestInstance.injectFactory('asyncFactory', asyncFactory);
        expect(function () { invokeTestInstance.get('asyncFactory'); }).toThrowError(/async/);
        expect(factoryCallCount).toBe(1);
    });

    it('injected invoke', function() {
        var callCount = 0;
        var test = function($invoke) { callCount++; return $invoke == invokeTestInstance; };

        invokeTestInstance(test).done(function (result) {
            expect(callCount).toBe(1);
            expect(result).toBe(true);
        });
    });

    it('clone', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokeTestInstance, 'name', 'valueBeforeOverride', 6);
        var $clonedInvokeTestInstance = invokeTestInstance.clone();

        injectRawSequence($clonedInvokeTestInstance, 'name', 'valueAfterOverride', 6);

        invokeTestInstance(test);
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

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance.clearInject('name4');
        invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe(undefined);
        expect(args[2]).toBe('value2');
    });

    it('inject createInstance', function() {
        var callCount = 0;
        var args = null;
        var test = function(rawValue) { callCount++; args = arguments; };

        invokeTestInstance.inject('rawValue', 'trueValue');
        invokeTestInstance.createInstance(test).done(function (result) {
            expect(result).toEqual(jasmine.any(test));
        });

        expect(callCount).toBe(1);
        expect(args.length).toBe(1);
        expect(args[0]).toBe('trueValue');
    });

    it('inject parent', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2, nameOverride0, nameOverride4, nameOverride2) { callCount++; args = arguments; };
        var $inheritedInvokeTestInstance = invokeTestInstance.inherit();

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        injectRawSequence(invokeTestInstance, 'nameOverride', 'valueBeforeOverride', 6);
        injectRawSequence($inheritedInvokeTestInstance, 'nameOverride', 'valueAfterOverride', 6);

        invokeTestInstance(test);
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

        invokeTestInstance.inject('rawValue', 'trueValue');
        invokeTestInstance(test).done(function (result) {
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

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance.injectFactory('syncFactory', syncFactory);
        invokeTestInstance(test).done(function (result) {
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

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance.injectFactory('asyncFactory', asyncFactory);
        invokeTestInstance(test).done(function (result) {
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

        invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke without arguments in array', function() {
        var callCount = 0;
        var args = null;
        var test = function(dontResolve) { callCount++; args = arguments; };

        invokeTestInstance.inject('dontResolve', true);
        invokeTestInstance([test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke with this without arguments', function() {
        var callCount = 0;
        var args = null;
        var _this = {};
        var calledThis = null;
        var test = function() { callCount++; args = arguments; calledThis = this; };

        invokeTestInstance.withThis(_this, test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
        expect(calledThis).toBe(_this);
    });

    it('invoke with this without arguments in array', function() {
        var callCount = 0;
        var args = null;
        var _this = {};
        var calledThis = null;
        var test = function(dontResolve) { callCount++; args = arguments; calledThis = this };

        invokeTestInstance.inject('dontResolve', true);
        invokeTestInstance.withThis([_this, test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
        expect(calledThis).toBe(_this);
    });

    it('invoke with raw value', function() {
        var callCount = 0;
        var args = null;
        var test = function(name0, name4, name2) { callCount++; args = arguments; };

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance(test);
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

        injectRawSequence(invokeTestInstance, 'name', 'value', 6);
        invokeTestInstance(['name0', 'name4', 'name2', test]);
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

        injectFactorySequence(invokeTestInstance, 'name', 'value', 6, function() { factoryCallCount++; });
        invokeTestInstance(test);
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

        injectFactorySequence(invokeTestInstance, 'name', 'value', 6, function() { factoryCallCount++; });
        invokeTestInstance(['name0', 'name4', 'name2', test]);
        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(3);
        expect(args.length).toBe(3);
        expect(args[0]).toBe('value0');
        expect(args[1]).toBe('value4');
        expect(args[2]).toBe('value2');
    });
});

