var traits  = require('../'),
    test    = require('tape');

test('init 1', function(a) {

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

test('init 2', function(a) {

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
