var traits  = require('../'),
    test    = require('tape');

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

test('init multi, eval', function(a) {

    traits.register('init-evala', function(def) {
        def.init(function(opts) {
            this.foo = 'hello';
        })
    });

    traits.register('init-evalb', function(def) {
        def.init(function(opts) {
            this.foo += 'goodbye';
        })
    });

    var ctor = traits.make(['init-2a', 'init-2b'], {
        initializer: 'eval'
    });

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

    a.deepEqual(obj.traits, ['trait-list-1', 'trait-list-2', 'trait-list-3']);
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

test('extend', function(a) {

    traits.register('x-1', function(){});
    traits.register('x-2', function(){});
    traits.register('x-3', function(){});
    traits.register('x-4', function(){});

    var c1 = traits.make(['x-1', 'x-2']);
    var c2 = traits.extend(c1, ['x-3', 'x-4']);

    a.deepEqual(c2.prototype.traits, ['x-1', 'x-2', 'x-3', 'x-4']);
    a.end();

});

//
// emitter

test('on, emit and cancel', function(a) {

    var ctor = traits.make(['emitter']),
        obj = new ctor(),
        tally = 0;

    var cancel = obj.on('foo', function() {
        tally++;
    });

    obj.emit('foo');
    obj.emit('foo');
    obj.emit('bar');

    cancel();

    obj.emit('foo');

    a.equal(tally, 2);
    a.end();

});

test('once', function(a) {

    var ctor = traits.make(['emitter']),
        obj = new ctor(),
        tally = 0;

    obj.once('foo', function() {
        tally++;
    });

    obj.emit('foo');
    obj.emit('foo');
    obj.emit('foo');

    a.equal(tally, 1);
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