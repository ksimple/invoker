describe('unit', function() {
    $invokeTestInstance = null;

    beforeEach(function() {
        $invokeTestInstance = $invoke.clone();
    });

    it('create', function() {
        expect(typeof $invoke).toBe('function');
    });

    it('invoke without arguments', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invokeTestInstance(test);
        expect(called).toBe(true);
        expect(args.length).toBe(0);
    });

    it('invoke without arguments in array', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invokeTestInstance([test]);
        expect(called).toBe(true);
        expect(args.length).toBe(0);
    });

    it('invoke with raw value', function() {
        var called = false;
        var args = null;
        var test = function(test0, test1) { called = true; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        $invokeTestInstance.inject('test1', 1);
        $invokeTestInstance.inject('test2', 2);
        $invokeTestInstance(test);
        expect(called).toBe(true);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with raw value in array', function() {
        var called = false;
        var args = null;
        var test = function(test0, test1) { called = true; args = arguments; };

        $invokeTestInstance.inject('test0', 0);
        $invokeTestInstance.inject('test1', 1);
        $invokeTestInstance.inject('test2', 2);
        $invokeTestInstance.inject('test', 1);
        $invokeTestInstance(['test0', 'test1', test]);
        expect(called).toBe(true);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with facotry value', function() {
        var called = false;
        var args = null;
        var facotoryCalled = false;
        var test = function(test0, test1) { called = true; args = arguments; };
        var factory0 = function() { facotoryCalled = true; return 0; };
        var factory1 = function() { facotoryCalled = true; return 1; };
        var factory2 = function() { facotoryCalled = true; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(test);
        expect(called).toBe(true);
        expect(facotoryCalled).toBe(true);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with facotry value in array', function() {
        var called = false;
        var args = null;
        var facotoryCalled = false;
        var test = function(test0, test1) { called = true; args = arguments; };
        var factory0 = function() { facotoryCalled = true; return 0; };
        var factory1 = function() { facotoryCalled = true; return 1; };
        var factory2 = function() { facotoryCalled = true; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(['test0', 'test1', test]);
        expect(called).toBe(true);
        expect(facotoryCalled).toBe(true);
        expect(args.length).toBe(2);
        expect(args[0]).toBe(0);
        expect(args[1]).toBe(1);
    });

    it('invoke with async facotry value', function(done) {
        var called = false;
        var args = null;
        var facotoryCalled = false;
        var test = function(test0, test1) { called = true; args = arguments; };
        var factory0 = function($done) { facotoryCalled = true; setTimeout(function () { $done(0); }, 2000); };
        var factory1 = function() { facotoryCalled = true; return 1; };
        var factory2 = function() { facotoryCalled = true; return 2; };

        $invokeTestInstance.injectFactory('test0', factory0);
        $invokeTestInstance.injectFactory('test1', factory1);
        $invokeTestInstance.injectFactory('test2', factory2);
        $invokeTestInstance(test).done(function () {
            expect(called).toBe(true);
            expect(facotoryCalled).toBe(true);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(0);
            expect(args[1]).toBe(1);
            done();
        });
    });
});

