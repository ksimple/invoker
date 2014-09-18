describe('unit', function() {
    it('create', function() {
        expect(typeof $invoke).toBe('function');
    });

    it('invoke without arguments', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoke(test);
        expect(called).toBe(true);
    });

    it('invoke without arguments in array', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoke([test]);
        expect(called).toBe(true);
    });

    it('invoke with raw value', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoke.inject('test', 1);
        $invoke('test', test);
        expect(called).toBe(true);
        expect(args[0]).toBe(1);
    });

    it('invoke with raw value in array', function() {
        var called = false;
        var args = null;
        var test = function() { called = true; args = arguments; };

        $invoke.inject('test', 1);
        $invoke(['test', test]);
        expect(called).toBe(true);
        expect(args[0]).toBe(1);
    });
});

