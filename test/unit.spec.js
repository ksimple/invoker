describe('unit', function() {
    $invokeTestInstance = null;

    beforeEach(function() {
        $invokeTestInstance = $invoke.clone();
    });

    it('create', function() {
        expect(typeof $invoke).toBe('function');
    });

    it('return value', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; return 'done'; };

        $invokeTestInstance(test).done(function (result) {
            expect(callCount).toBe(1);
            expect(result).toBe('done');
        });
    });

    it('clone', function() {
        var callCount = 0;
        var args = null;
        var test = function(test0) { callCount++; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        var $clonedInvokeTestInstance = $invokeTestInstance.clone();

        $clonedInvokeTestInstance.inject('test0', 1);

        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(1);
        expect(args[0]).toBe(0);

        $clonedInvokeTestInstance(test);
        expect(callCount).toBe(2);
        expect(args.length).toBe(1);
        expect(args[0]).toBe(1);
    });

    it('clear injection', function() {
        var callCount = 0;
        var args = null;
        var test = function(test0, test1) { callCount++; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        $invokeTestInstance.inject('test1', 1);
        $invokeTestInstance.inject('test2', 2);
        $invokeTestInstance.clearInject('test0');
        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(undefined);
        expect(args[1]).toBe(1);
    });

    it('inject parent', function() {
        var callCount = 0;
        var args = null;
        var test = function(test0, test1) { callCount++; args = arguments; };
        var $inheritedInvokeTestInstance = $invokeTestInstance.inherit();

        $invokeTestInstance.inject('test0', 0);
        $inheritedInvokeTestInstance.inject('test1', 1);

        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(undefined);

        $inheritedInvokeTestInstance(test);
        expect(callCount).toBe(2);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke without arguments', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; };

        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke without arguments in array', function() {
        var callCount = 0;
        var args = null;
        var test = function() { callCount++; args = arguments; };

        $invokeTestInstance([test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(0);
    });

    it('invoke with raw value', function() {
        var callCount = 0;
        var args = null;
        var test = function(test0, test1) { callCount++; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        $invokeTestInstance.inject('test1', 1);
        $invokeTestInstance.inject('test2', 2);
        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with raw value in array', function() {
        var callCount = 0;
        var args = null;
        var test = function(test0, test1) { callCount++; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        $invokeTestInstance.inject('test1', 1);
        $invokeTestInstance.inject('test2', 2);
        $invokeTestInstance.inject('test', 1);
        $invokeTestInstance(['test0', 'test1', test]);
        expect(callCount).toBe(1);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with facotry value', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(test0, test1) { callCount++; args = arguments; };
        var factory0 = function() { factoryCallCount++; return 0; };
        var factory1 = function() { factoryCallCount++; return 1; };
        var factory2 = function() { factoryCallCount++; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(test);
        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(2);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with facotry value in array', function() {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(test0, test1) { callCount++; args = arguments; };
        var factory0 = function() { factoryCallCount++; return 0; };
        var factory1 = function() { factoryCallCount++; return 1; };
        var factory2 = function() { factoryCallCount++; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(['test0', 'test1', test]);
        expect(callCount).toBe(1);
        expect(factoryCallCount).toBe(2);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with async facotry value', function(done) {
        var callCount = 0;
        var args = null;
        var factoryCallCount = 0;
        var test = function(test0, test1) { callCount++; args = arguments; };
        var factory0 = function($done) { factoryCallCount = true; setTimeout(function () { $done(0); }, 1); };
        var factory1 = function() { factoryCallCount++; return 1; };
        var factory2 = function() { factoryCallCount++; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(test).done(function () {
            expect(callCount).toBe(1);
            expect(factoryCallCount).toBe(2);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(0);
            expect(args[1]).toBe(1);
            done();
        });
    });
});

