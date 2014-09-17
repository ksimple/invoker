describe('unit', function() {
    it('create', function() {
        var $invoker = new invoker();

        expect(typeof $invoker).toBe('object');
    });

    it('invoke without arguments', function() {
        var $invoker = new invoker();
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoker.invoke(test);
        expect(called).toBe(true);
    });

    it('invoke without arguments in array', function() {
        var $invoker = new invoker();
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoker.invoke([test]);
        expect(called).toBe(true);
    });

    it('invoke with raw value', function() {
        var $invoker = new invoker();
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoker.declare('test', 1);
        $invoker.invoke('test', test);
        expect(called).toBe(true);
        expect(args[0]).toBe(1);
    });

    it('invoke with raw value in array', function() {
        var $invoker = new invoker();
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoker.declare('test', 1);
        $invoker.invoke(['test', test]);
        expect(called).toBe(true);
        expect(args[0]).toBe(1);
    });
});

