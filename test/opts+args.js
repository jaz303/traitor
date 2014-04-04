var traits  = require('../'),
    test    = require('tape');

test('args are passed to trait callback when supplied as array', function(a) {

    traits.register('t1', function(def, x, y, z) {
        a.ok(x === 1);
        a.ok(y === 2);
        a.ok(z === 3);
    });

    var ctor = traits.make([
        ['t1', 1, 2, 3]
    ]);

    a.end();

});

test('args are passed to trait callback when supplied as object', function(a) {

    traits.register('t2', function(def, opts) {
        a.ok(opts.x === 1);
        a.ok(opts.y === 2);
        a.ok(opts.z === 3);
    });

    var ctor = traits.make([
        {   trait: 't2',
            x: 1, y: 2, z: 3
        }
    ]);

    a.end();

});

test('presence of trait option can be checked with instance.hasOpt', function(a) {

    traits.register('t3', function(def, opts) {});

    traits.register('t4', function(def) {
        var instance = def.get('t3');
        a.ok(instance.hasOpt('a'));
        a.notOk(instance.hasOpt('b'));
    });

    var ctor = traits.make([ ['t3', {a: true}], 't4' ]);

    a.end();

});

test('trait option can be set in one trait and picked up by other trait in prepare callback', function(a) {

    traits.register('t5', function(def, opts) {

        a.notOk('a' in opts);

        def.prepare(function() {
            a.ok('a' in opts);
        });

    });

    traits.register('t6', function(def) {
        var t5 = def.get('t5');
        t5.setOpt('a', true);
    });

    var ctor = traits.make(['t5', 't6']);

    a.end();

})