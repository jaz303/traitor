var traits  = require('../'),
    test    = require('tape');

test('anonymous traits', function(a) {

    var ctor = traits.make([
        function(def) { def.method('a', function() { return 'a'; }); },
        function(def) { def.method('b', function() { return 'b'; }); }
    ]);

    var obj = new ctor();

    a.equal(obj.a(), 'a');
    a.equal(obj.b(), 'b');
    a.end();

});

test('init one', function(a) {

    traits.register('init-1', function(def) {
        def.init(function(opts) {
            this.foo = opts.foo + 10;
        })
    });

    var ctor = traits.make(['init-1']);

    var obj = new ctor({foo: 20});

    a.equal(obj.foo, 30);
    a.end();

});

test('init multi', function(a) {

    traits.register('init-2a', function(def) {
        def.init(function(opts) {
            this.foo = 'hello';
        })
    });

    traits.register('init-2b', function(def) {
        def.init(function(opts) {
            this.foo += 'goodbye';
        })
    });

    var ctor = traits.make(['init-2a', 'init-2b']);

    var obj = new ctor();

    a.equal(obj.foo, 'hellogoodbye');
    a.end();

});

test('trait list', function(a) {

    traits.register('trait-list-1', function(){});
    traits.register('trait-list-2', function(){});
    traits.register('trait-list-3', function(){});

    var ctor = traits.make(['trait-list-1', 'trait-list-2', 'trait-list-3']);

    var obj = new ctor;

    a.deepEqual(obj._traits, ['trait-list-1', 'trait-list-2', 'trait-list-3']);
    a.end();

});

test('meta - hasTrait', function(a) {

    traits.register('meta-ht-1', function(){});
    traits.register('meta-ht-2', function(){});
    traits.register('meta-ht-3', function(){});
    
    var ctor = traits.make(['meta', 'meta-ht-1', 'meta-ht-2']);

    var obj = new ctor;

    a.ok(obj.hasTrait('meta'));
    a.ok(obj.hasTrait('meta-ht-1'));
    a.ok(obj.hasTrait('meta-ht-2'));
    a.ok(!obj.hasTrait('meta-ht-3'));
    a.end();

});

test('method', function(a) {

    traits.register('method-1', function(def) {
        def.method('boing', function() {
            return "bounce!";
        });
    });

    var ctor = traits.make(['method-1']);

    var obj = new ctor;

    a.equal(obj.boing(), 'bounce!');
    a.end();

});

test('property', function(a) {

    traits.register('property-1', function(def) {
        def.init(function() {
            this._cake = 'custard';
        });
        def.property('cake', {
            get: function() { return this._cake; }
        });
    });

    var ctor = traits.make(['property-1']);

    var obj = new ctor;

    a.equal(obj.cake, 'custard');
    a.end();

});

test('chain', function(a) {

    traits.register('chain-1', function(def) {
        def.chain('foo', function(v) {
            this.test += 'b' + v;
        });
    });

    traits.register('chain-2', function(def) {
        def.chain('foo', function(v) {
            this.test = 'a' + v;
        }, true);
    });

    traits.register('chain-3', function(def) {
        def.chain('foo', function(v) {
            this.test += 'c' + v;
        });
    });

    var ctor = traits.make(['chain-1', 'chain-2', 'chain-3']);

    var obj = new ctor;

    obj.foo(5);

    a.equal(obj.test, 'a5b5c5');
    a.end();

});

test('extend', function(a) {

    traits.register('x-1', function(){});
    traits.register('x-2', function(){});
    traits.register('x-3', function(){});
    traits.register('x-4', function(){});

    var c1 = traits.make(['x-1', 'x-2']);
    var c2 = traits.extend(c1, ['x-3', 'x-4']);

    a.deepEqual(c2.prototype._traits, ['x-1', 'x-2', 'x-3', 'x-4']);
    a.end();

});

test('expand', function(a) {

    traits.register('exp-1', function() {});
    traits.register('exp-2', function() {});
    traits.register('exp-3', function() {});
    traits.register('exp-4', function() {});
    traits.register('exp-5', function() {});

    traits.register('@exp-a', ['exp-2', 'exp-3']);
    traits.register('@exp-b', ['exp-4']);

    var ctor = traits.make(['exp-1', '@exp-a', '@exp-b', 'exp-5']);

    a.deepEqual(ctor.prototype._traits, ['exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5']);
    a.end();

});

test('traits should only be applied once, no matter how many times they are specified', function(a) {

    var i = 0;

    traits.register('dup-1', function() {
        i++;
    });

    var ctor = traits.make(['dup-1', 'dup-1', 'dup-1']);

    a.ok(i === 1);
    a.end();

});

test('bound method', function(a) {

    var ctor = traits.make(['methods']),
        obj = new ctor(),
        called = null;

    obj.foo = function() { called = 'a'; }

    var method = obj.boundMethod('foo');

    obj.foo = function() { called = 'b'; }

    method();

    a.equal(called, 'a');
    a.end();

});

test('lazy method', function(a) {

    var ctor = traits.make(['methods']),
        obj = new ctor(),
        called = null;

    obj.foo = function() { called = 'a'; }

    var method = obj.lazyMethod('foo');

    obj.foo = function() { called = 'b'; }

    method();

    a.equal(called, 'b');
    a.end();

});