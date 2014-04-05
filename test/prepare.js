var traits  = require('../'),
    test    = require('tape');

test('callbacks registered with def.prepare() are called after all traits are registered, and in correct order', function(a) {

    var out = [];

    traits.register('t1', {
        prepare: function(def) {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            def.get('t2').setOpt('z', 2);
            out.push(1);
        },
        apply: function(def, opts) {
            a.ok(opts.z === 1);
        }
    });

    traits.register('t2', {
        prepare: function(def) {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            def.get('t3').setOpt('z', 3);
            out.push(2);
        },
        apply: function(def, opts) {
            a.ok(opts.z === 2);
        }
    });

    traits.register('t3', {
        prepare: function(def) {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            def.get('t4').setOpt('z', 4);
            out.push(3);
        },
        apply: function(def, opts) {
            a.ok(opts.z === 3);
        }
    });

    traits.register('t4', {
        prepare: function(def) {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            def.get('t5').setOpt('z', 5);
            out.push(4);
        },
        apply: function(def, opts) {
            a.ok(opts.z === 4);
        }
    });

    traits.register('t5', {
        prepare: function(def) {
            a.ok(def.has('t1'));
            a.ok(def.has('t2'));
            a.ok(def.has('t3'));
            a.ok(def.has('t4'));
            a.ok(def.has('t5'));
            def.get('t1').setOpt('z', 1);
            out.push(5);
        },
        apply: function(def, opts) {
            a.ok(opts.z === 5);
        }
    });

    traits.register('t2-t4', ['t2', 't3', 't4']);

    var ctor = traits.make(['t1', 't2-t4', 't5']);

    a.deepEqual(out, [1, 2, 3, 4, 5]);
    a.end();

});