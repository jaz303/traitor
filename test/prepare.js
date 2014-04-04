var traits  = require('../'),
    test    = require('tape');

test('callbacks registered with def.prepare() are called after all traits are installed, and in correct order', function(a) {

    var out = [];

    traits.register('t1', function(def) {
        def.prepare(function() {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            out.push(1);
        });
    });

    traits.register('t2', function(def) {
        def.prepare(function() {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            out.push(2);
        });
    });

    traits.register('t3', function(def) {
        def.prepare(function() {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            out.push(3);
        });
    });

    traits.register('t4', function(def) {
        def.prepare(function() {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            out.push(4);
        });
    });

    traits.register('t5', function(def) {
        def.prepare(function() {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            out.push(5);
        });
    });

    traits.register('t2-t4', ['t2', 't3', 't4']);

    var ctor = traits.make(['t1', 't2-t4', 't5']);

    a.deepEqual(out, [1, 2, 3, 4, 5]);
    a.end();

});